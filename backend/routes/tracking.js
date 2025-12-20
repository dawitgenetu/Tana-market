import express from 'express';
import Order from '../models/Order.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/tracking/:trackingNumber
// @desc    Get tracking information
// @access  Public
router.get('/:trackingNumber', async (req, res) => {
  try {
    const order = await Order.findOne({ trackingNumber: req.params.trackingNumber })
      .populate('user', 'name email')
      .populate('orderItems.product', 'name image');

    if (!order) {
      return res.status(404).json({ message: 'Tracking number not found' });
    }

    res.json({
      trackingNumber: order.trackingNumber,
      status: order.status,
      createdAt: order.createdAt,
      shippedAt: order.status === 'shipped' ? order.updatedAt : null,
      deliveredAt: order.deliveredAt,
      orderItems: order.orderItems,
      shippingAddress: order.shippingAddress
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/tracking/:trackingNumber
// @desc    Update tracking (mark as delivered)
// @access  Private (Admin/Manager)
router.put('/:trackingNumber', protect, authorize('admin', 'manager'), async (req, res) => {
  try {
    const order = await Order.findOne({ trackingNumber: req.params.trackingNumber });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.status !== 'shipped') {
      return res.status(400).json({ message: 'Order must be shipped before marking as delivered' });
    }

    order.status = 'delivered';
    order.isDelivered = true;
    order.deliveredAt = new Date();

    await order.save();

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

