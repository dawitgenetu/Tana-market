import express from 'express';
import User from '../models/User.js';
import ActivityLog from '../models/ActivityLog.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/users
// @desc    Get all users
// @access  Private (Admin)
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { role } = req.query;
    const query = role ? { role } : {};
    
    const users = await User.find(query).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/users/:id/promote-manager
// @desc    Promote a user to manager (Admin only)
// @access  Private (Admin)
router.post('/:id/promote-manager', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.role = 'manager';
    await user.save();

    await ActivityLog.create({
      user: req.user._id,
      action: 'promote',
      resource: 'user',
      resourceId: user._id,
      details: { newRole: 'manager' }
    });

    res.json({ message: 'User promoted to manager', user: { _id: user._id, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/users/:id/demote-manager
// @desc    Demote a manager to customer (Admin only)
// @access  Private (Admin)
router.post('/:id/demote-manager', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.role = 'customer';
    await user.save();

    await ActivityLog.create({
      user: req.user._id,
      action: 'demote',
      resource: 'user',
      resourceId: user._id,
      details: { newRole: 'customer' }
    });

    res.json({ message: 'User demoted to customer', user: { _id: user._id, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/users/:id/data
// @desc    Admin view customer's cart and orders
// @access  Private (Admin)
router.get('/:id/data', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const Cart = (await import('../models/Cart.js')).default;
    const Order = (await import('../models/Order.js')).default;

    const cart = await Cart.findOne({ user: user._id }).populate('items.product', 'name price image stock');
    const orders = await Order.find({ user: user._id }).sort({ createdAt: -1 });

    res.json({ user, cart, orders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/users
// @desc    Create user (Admin only)
// @access  Private (Admin)
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'customer',
      phone
    });

    await ActivityLog.create({
      user: req.user._id,
      action: 'create',
      resource: 'user',
      resourceId: user._id
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/users/:id
// @desc    Update user
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    // Users can only update themselves unless they're admin
    if (req.user.role !== 'admin' && req.params.id !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updateData = { ...req.body };
    
    // Only admin can change role
    if (req.user.role !== 'admin' && updateData.role) {
      delete updateData.role;
    }

    // Don't allow password update through this route
    delete updateData.password;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await ActivityLog.create({
      user: req.user._id,
      action: 'update',
      resource: 'user',
      resourceId: user._id
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/users/:id
// @desc    Delete user
// @access  Private (Admin)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await ActivityLog.create({
      user: req.user._id,
      action: 'delete',
      resource: 'user',
      resourceId: user._id
    });

    res.json({ message: 'User deactivated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

