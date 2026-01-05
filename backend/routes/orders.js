import express from 'express';
import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import ActivityLog from '../models/ActivityLog.js';
import axios from 'axios';
import { protect, authorize } from '../middleware/auth.js';
import { body, validationResult } from 'express-validator';

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
router.post(
  '/',
  protect,
  [
    body('shippingAddress.street').notEmpty().withMessage('Street is required'),
    body('shippingAddress.city').notEmpty().withMessage('City is required'),
    body('shippingAddress.state').notEmpty().withMessage('State is required'),
    body('shippingAddress.zipCode').notEmpty().withMessage('Zip code is required'),
    body('shippingAddress.country').notEmpty().withMessage('Country is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { shippingAddress } = req.body;

      // Get user's cart
      const cart = await Cart.findOne({ user: req.user._id })
        .populate('items.product');

      if (!cart || cart.items.length === 0) {
        return res.status(400).json({ message: 'Cart is empty' });
      }

      // Ensure stock is still available for all items
      const insufficient = [];
      for (const item of cart.items) {
        const prod = await Product.findById(item.product._id || item.product);
        if (!prod) {
          insufficient.push({ product: item.product._id || item.product, reason: 'Not found' });
        } else if (prod.stock < item.quantity) {
          insufficient.push({ product: prod._id, available: prod.stock, requested: item.quantity });
        }
      }

      if (insufficient.length > 0) {
        return res.status(400).json({ message: 'Insufficient stock for some items', details: insufficient });
      }

      // Calculate prices
      const itemsPrice = cart.totalPrice;
      const shippingPrice = 50; // Fixed shipping cost
      const taxPrice = itemsPrice * 0.15; // 15% tax
      const totalPrice = itemsPrice + shippingPrice + taxPrice;

      // Create order items
      const orderItems = cart.items.map(item => ({
        product: item.product._id || item.product,
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

      // Decrement stock for all ordered items
      for (const item of orderItems) {
        await Product.findByIdAndUpdate(
          item.product,
          { $inc: { stock: -item.quantity } },
          { new: true }
        );
      }

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
  }
);

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

    // Decrement stock for each order item (ensure still available)
    for (const item of order.orderItems) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(400).json({ message: `Product ${item.product} not found` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for product ${product._id}` });
      }
      product.stock = product.stock - item.quantity;
      await product.save();
    }

    // Auto-ship approved orders
    order.status = 'shipped';
    
    // Generate tracking number if not exists
    if (!order.trackingNumber) {
      const date = new Date();
      const yyyy = String(date.getFullYear());
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}${mm}${dd}`;
      const randomNum = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
      order.trackingNumber = `TANA-${dateStr}-${randomNum}`;
    }
    
    // Set estimated arrival date (3 days to 2 months from now)
    // Admin can set custom date, otherwise random between 3 days and 2 months
    const { estimatedArrivalDays } = req.body;
    let daysToAdd;
    if (estimatedArrivalDays && estimatedArrivalDays >= 3 && estimatedArrivalDays <= 60) {
      daysToAdd = estimatedArrivalDays;
    } else {
      // Random between 3 days (0.1 months) and 60 days (2 months)
      daysToAdd = Math.floor(Math.random() * 57) + 3; // 3 to 60 days
    }
    const estimatedDate = new Date();
    estimatedDate.setDate(estimatedDate.getDate() + daysToAdd);
    order.estimatedArrivalDate = estimatedDate;
    
    await order.save();

    await ActivityLog.create({
      user: req.user._id,
      action: 'approve_and_ship',
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

// @route   POST /api/orders/:id/refund-request
// @desc    Customer requests a refund for an order
// @access  Private (Customer)
router.post('/:id/refund-request', protect, async (req, res) => {
  try {
    const { reason } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (['refunded', 'cancelled'].includes(order.status)) {
      return res.status(400).json({ message: 'Order already cancelled or refunded' });
    }

    order.refundRequested = true;
    order.refundReason = reason || 'No reason provided';
    order.refundStatus = 'pending';
    await order.save();

    await ActivityLog.create({
      user: req.user._id,
      action: 'refund_request',
      resource: 'order',
      resourceId: order._id,
      details: { reason: order.refundReason }
    });

    res.json({ message: 'Refund requested', order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/orders/:id/refund
// @desc    Admin/Manager approve or reject a refund
// @access  Private (Admin/Manager)
router.put('/:id/refund', protect, authorize('admin', 'manager'), async (req, res) => {
  try {
    const { action } = req.body; // 'approve' or 'reject'
    const order = await Order.findById(req.params.id).populate('user', 'email name');

    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (!order.refundRequested) return res.status(400).json({ message: 'No refund requested' });

    if (action === 'approve') {
      // mark refunded - Chapa refund placeholder (implementation depends on Chapa support)
      order.refundStatus = 'approved';
      order.status = 'refunded';
      order.isPaid = false;
      await order.save();

      await ActivityLog.create({
        user: req.user._id,
        action: 'refund_approve',
        resource: 'order',
        resourceId: order._id
      });

      return res.json({ message: 'Refund approved', order });
    }

    if (action === 'reject') {
      order.refundStatus = 'rejected';
      order.refundRequested = false;
      await order.save();

      await ActivityLog.create({
        user: req.user._id,
        action: 'refund_reject',
        resource: 'order',
        resourceId: order._id
      });

      return res.json({ message: 'Refund rejected', order });
    }

    res.status(400).json({ message: 'Invalid action' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

