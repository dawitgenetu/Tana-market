import express from 'express';
import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import ActivityLog from '../models/ActivityLog.js';
import axios from 'axios';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/orders
// @desc    Get orders
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let query = {};
    
    // Customers can only see their own orders
    if (req.user.role === 'customer') {
      query.user = req.user._id;
    }
    // Admin and Manager can see all orders

    const orders = await Order.find(query)
      .populate('user', 'name email')
      .populate('orderItems.product', 'name image')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/orders/:id
// @desc    Get single order
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('orderItems.product', 'name image price');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user has access
    if (req.user.role === 'customer' && order.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/orders
// @desc    Create order
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { shippingAddress } = req.body;

    // Get user's cart
    const cart = await Cart.findOne({ user: req.user._id })
      .populate('items.product');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Calculate prices
    const itemsPrice = cart.totalPrice;
    const shippingPrice = 50; // Fixed shipping cost
    const taxPrice = itemsPrice * 0.15; // 15% tax
    const totalPrice = itemsPrice + shippingPrice + taxPrice;

    // Create order items
    const orderItems = cart.items.map(item => ({
      product: item.product._id,
      name: item.product.name,
      quantity: item.quantity,
      price: item.price,
      image: item.product.image || ''
    }));

    // Create order
    const order = await Order.create({
      user: req.user._id,
      orderItems,
      shippingAddress,
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice,
      status: 'pending'
    });

    // Clear cart
    cart.items = [];
    await cart.save();

    await ActivityLog.create({
      user: req.user._id,
      action: 'create',
      resource: 'order',
      resourceId: order._id
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/orders/:id/payment
// @desc    Initialize Chapa payment
// @access  Private
router.post('/:id/payment', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Initialize Chapa payment
    const chapaData = {
      amount: order.totalPrice.toString(),
      currency: 'ETB',
      email: order.user.email,
      first_name: order.user.name.split(' ')[0] || order.user.name,
      last_name: order.user.name.split(' ').slice(1).join(' ') || '',
      phone_number: order.user.phone || '0912345678',
      tx_ref: `TANA-${order._id}-${Date.now()}`,
      callback_url: `${process.env.FRONTEND_URL}/api/orders/${order._id}/verify`,
      return_url: `${process.env.FRONTEND_URL}/orders/${order._id}`,
      customization: {
        title: 'Tana Market',
        description: `Payment for Order #${order._id}`
      }
    };

    const chapaResponse = await axios.post(
      'https://api.chapa.co/v1/transaction/initialize',
      chapaData,
      {
        headers: {
          Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Update order with Chapa reference
    order.chapaReference = chapaResponse.data.data.reference;
    order.chapaTransactionId = chapaData.tx_ref;
    await order.save();

    res.json({
      checkout_url: chapaResponse.data.data.checkout_url,
      reference: chapaResponse.data.data.reference
    });
  } catch (error) {
    console.error('Chapa payment error:', error.response?.data || error.message);
    res.status(500).json({ 
      message: 'Payment initialization failed',
      error: error.response?.data || error.message 
    });
  }
});

// @route   POST /api/orders/:id/verify
// @desc    Verify Chapa payment
// @access  Private
router.post('/:id/verify', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Verify payment with Chapa
    const verifyResponse = await axios.get(
      `https://api.chapa.co/v1/transaction/verify/${order.chapaReference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`
        }
      }
    );

    if (verifyResponse.data.status === 'success') {
      order.isPaid = true;
      order.paidAt = new Date();
      order.status = 'processing';
      order.paymentResult = {
        id: verifyResponse.data.data.id,
        status: verifyResponse.data.data.status,
        update_time: verifyResponse.data.data.created_at,
        email_address: verifyResponse.data.data.customer.email
      };

      await order.save();

      await ActivityLog.create({
        user: req.user._id,
        action: 'payment_success',
        resource: 'order',
        resourceId: order._id
      });

      res.json({ message: 'Payment verified', order });
    } else {
      res.status(400).json({ message: 'Payment verification failed' });
    }
  } catch (error) {
    console.error('Payment verification error:', error.response?.data || error.message);
    res.status(500).json({ 
      message: 'Payment verification failed',
      error: error.response?.data || error.message 
    });
  }
});

// @route   PUT /api/orders/:id/approve
// @desc    Approve order
// @access  Private (Admin/Manager)
router.put('/:id/approve', protect, authorize('admin', 'manager'), async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (!order.isPaid) {
      return res.status(400).json({ message: 'Order is not paid' });
    }

    order.status = 'approved';
    await order.save();

    await ActivityLog.create({
      user: req.user._id,
      action: 'approve',
      resource: 'order',
      resourceId: order._id
    });

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/orders/:id/ship
// @desc    Ship order
// @access  Private (Admin/Manager)
router.put('/:id/ship', protect, authorize('admin', 'manager'), async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.status !== 'approved') {
      return res.status(400).json({ message: 'Order must be approved before shipping' });
    }

    // Generate tracking number
    order.trackingNumber = order.generateTrackingNumber();
    order.status = 'shipped';
    order.isDelivered = false;

    await order.save();

    await ActivityLog.create({
      user: req.user._id,
      action: 'ship',
      resource: 'order',
      resourceId: order._id,
      details: { trackingNumber: order.trackingNumber }
    });

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/orders/:id/cancel
// @desc    Cancel order
// @access  Private
router.put('/:id/cancel', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Only customer can cancel, or admin/manager
    if (req.user.role === 'customer' && order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (['delivered', 'cancelled'].includes(order.status)) {
      return res.status(400).json({ message: `Cannot cancel order with status: ${order.status}` });
    }

    order.status = 'cancelled';
    await order.save();

    await ActivityLog.create({
      user: req.user._id,
      action: 'cancel',
      resource: 'order',
      resourceId: order._id
    });

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

