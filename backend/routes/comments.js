import express from 'express';
import Comment from '../models/Comment.js';
import Product from '../models/Product.js';
import ActivityLog from '../models/ActivityLog.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/comments/product/:productId
// @desc    Get product comments
// @access  Public
router.get('/product/:productId', async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
    const skip = (page - 1) * limit;

    const filter = { product: req.params.productId, isApproved: true };

    const [total, comments] = await Promise.all([
      Comment.countDocuments(filter),
      Comment.find(filter)
        .populate('user', 'name')
        .populate('reply.repliedBy', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
    ]);

    res.json({
      data: comments,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/comments
// @desc    Create comment
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;

    // Validate rating
    const ratingNum = Number(rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({ message: 'Rating must be a number between 1 and 5' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const newComment = await Comment.create({
      product: productId,
      user: req.user._id,
      rating: ratingNum,
      comment
    });

    // Update product rating - only calculate if there are approved comments
    const approvedComments = await Comment.find({ product: productId, isApproved: true });
    if (approvedComments.length > 0) {
      const totalRating = approvedComments.reduce((acc, c) => {
        const commentRating = Number(c.rating);
        return acc + (isNaN(commentRating) ? 0 : commentRating);
      }, 0);
      const avgRating = totalRating / approvedComments.length;
      product.rating = isNaN(avgRating) ? 0 : Math.round(avgRating * 10) / 10; // Round to 1 decimal
    } else {
      product.rating = 0;
    }
    product.numReviews = approvedComments.length;
    await product.save();

    await ActivityLog.create({
      user: req.user._id,
      action: 'create',
      resource: 'comment',
      resourceId: newComment._id
    });

    res.status(201).json(newComment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/comments/:id/reply
// @desc    Reply to comment
// @access  Private (Admin/Manager)
router.post('/:id/reply', protect, authorize('admin', 'manager'), async (req, res) => {
  try {
    const { text } = req.body;
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    comment.reply = {
      text,
      repliedBy: req.user._id,
      repliedAt: new Date()
    };

    await comment.save();

    await ActivityLog.create({
      user: req.user._id,
      action: 'reply',
      resource: 'comment',
      resourceId: comment._id
    });

    res.json(comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/comments/:id/approve
// @desc    Approve comment
// @access  Private (Admin/Manager)
router.put('/:id/approve', protect, authorize('admin', 'manager'), async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    comment.isApproved = true;
    comment.approvedBy = req.user._id;
    comment.approvedAt = new Date();

    await comment.save();

    // Update product rating - only calculate if there are approved comments
    const product = await Product.findById(comment.product);
    const approvedComments = await Comment.find({ product: comment.product, isApproved: true });
    if (approvedComments.length > 0) {
      const totalRating = approvedComments.reduce((acc, c) => {
        const commentRating = Number(c.rating);
        return acc + (isNaN(commentRating) ? 0 : commentRating);
      }, 0);
      const avgRating = totalRating / approvedComments.length;
      product.rating = isNaN(avgRating) ? 0 : Math.round(avgRating * 10) / 10; // Round to 1 decimal
    } else {
      product.rating = 0;
    }
    product.numReviews = approvedComments.length;
    await product.save();

    await ActivityLog.create({
      user: req.user._id,
      action: 'approve',
      resource: 'comment',
      resourceId: comment._id
    });

    res.json(comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

