import express from 'express';
import Contact from '../models/Contact.js';
import { protect, authorize } from '../middleware/auth.js';
import ActivityLog from '../models/ActivityLog.js';

const router = express.Router();

// @route   POST /api/contact
// @desc    Create contact message
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    const contactData = {
      name,
      email,
      phone: phone || '',
      subject: subject || 'general',
      message
    };

    // If user is logged in, associate with user
    if (req.user) {
      contactData.user = req.user._id;
    }

    const contact = await Contact.create(contactData);

    res.status(201).json(contact);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/contact
// @desc    Get all contact messages
// @access  Private (Admin/Manager)
router.get('/', protect, authorize('admin', 'manager'), async (req, res) => {
  try {
    const contacts = await Contact.find()
      .populate('user', 'name email')
      .populate('reply.repliedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(contacts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/contact/:id
// @desc    Get contact message by ID
// @access  Private (Admin/Manager)
router.get('/:id', protect, authorize('admin', 'manager'), async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id)
      .populate('user', 'name email')
      .populate('reply.repliedBy', 'name email');

    if (!contact) {
      return res.status(404).json({ message: 'Contact message not found' });
    }

    // Mark as read if not already
    if (contact.status === 'new') {
      contact.status = 'read';
      await contact.save();
    }

    res.json(contact);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/contact/:id/reply
// @desc    Reply to contact message
// @access  Private (Admin/Manager)
router.post('/:id/reply', protect, authorize('admin', 'manager'), async (req, res) => {
  try {
    const { reply } = req.body;
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({ message: 'Contact message not found' });
    }

    contact.reply = {
      text: reply,
      repliedBy: req.user._id,
      repliedAt: new Date()
    };
    contact.status = 'replied';
    await contact.save();

    await ActivityLog.create({
      user: req.user._id,
      action: 'reply',
      resource: 'contact',
      resourceId: contact._id
    });

    res.json(contact);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/contact/:id
// @desc    Delete contact message
// @access  Private (Admin/Manager)
router.delete('/:id', protect, authorize('admin', 'manager'), async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({ message: 'Contact message not found' });
    }

    await contact.deleteOne();

    await ActivityLog.create({
      user: req.user._id,
      action: 'delete',
      resource: 'contact',
      resourceId: contact._id
    });

    res.json({ message: 'Contact message deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

