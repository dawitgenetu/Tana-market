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
    // Check if Chapa is configured
    if (!process.env.CHAPA_SECRET_KEY || process.env.CHAPA_SECRET_KEY.trim() === '') {
      console.error('CHAPA_SECRET_KEY is not configured');
      return res.status(500).json({ 
        message: 'Payment gateway is not configured. Please contact support.',
        error: 'CHAPA_SECRET_KEY is missing in environment variables'
      });
    }

    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Validate order total
    if (!order.totalPrice || order.totalPrice <= 0) {
      return res.status(400).json({ message: 'Invalid order total' });
    }

    // Validate user email (required by Chapa)
    if (!order.user.email) {
      return res.status(400).json({ message: 'User email is required for payment' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(order.user.email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Format phone number for Chapa (Ethiopian format: 09XXXXXXXXX or +2519XXXXXXXXX)
    let phoneNumber = order.user.phone || '0912345678';
    // Remove any spaces, dashes, or special characters
    phoneNumber = phoneNumber.replace(/[\s\-\(\)]/g, '');
    // If it starts with +251, keep it; if it starts with 0, convert to +251; otherwise add +251
    if (phoneNumber.startsWith('+251')) {
      // Already in correct format
    } else if (phoneNumber.startsWith('0')) {
      phoneNumber = '+251' + phoneNumber.substring(1);
    } else if (phoneNumber.startsWith('251')) {
      phoneNumber = '+' + phoneNumber;
    } else {
      // Default format
      phoneNumber = '+251' + phoneNumber;
    }

    // Ensure phone number is valid length (should be +251 followed by 9 digits)
    if (phoneNumber.length < 13 || phoneNumber.length > 14) {
      phoneNumber = '+251912345678'; // Default fallback
    }

    // Split name properly
    const nameParts = (order.user.name || '').trim().split(/\s+/);
    const firstName = nameParts[0] || 'Customer';
    const lastName = nameParts.slice(1).join(' ') || 'User';

    // Format amount - Chapa requires amount as a string
    // Ensure it's a valid positive number
    const amount = parseFloat(order.totalPrice);
    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({ message: 'Invalid order amount' });
    }
    
    // Chapa API typically expects amount as a string, can be decimal for ETB
    // Round to 2 decimal places to avoid floating point issues
    const roundedAmount = Math.round(amount * 100) / 100;
    const amountFormatted = roundedAmount.toString();
    
    // Ensure minimum amount (Chapa might have minimum transaction amount)
    if (roundedAmount < 1) {
      return res.status(400).json({ message: 'Order amount must be at least 1 ETB' });
    }

    // Generate unique transaction reference (Chapa requires unique tx_ref)
    const txRef = `TANA-${order._id.toString().slice(-8)}-${Date.now()}`.substring(0, 40); // Chapa limits tx_ref to 40 chars

    // Prepare callback and return URLs
    const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, ''); // Remove trailing slash
    const callbackUrl = `${frontendUrl}/api/orders/${order._id}/verify`;
    const returnUrl = `${frontendUrl}/orders/${order._id}`;

    // Initialize Chapa payment
    const chapaData = {
      amount: amountFormatted,
      currency: 'ETB',
      email: order.user.email.trim().toLowerCase(),
      first_name: firstName,
      last_name: lastName,
      phone_number: phoneNumber,
      tx_ref: txRef,
      callback_url: callbackUrl,
      return_url: returnUrl,
      customization: {
        title: 'Tana Market',
        // Chapa only allows: letters, numbers, hyphens, underscores, spaces, and dots in description
        // Remove the # character and any other special characters, keep only allowed chars
        description: `Payment for Order ${order._id.toString().slice(-6)}`
          .replace(/#/g, '') // Remove # character
          .replace(/[^a-zA-Z0-9\s\-_\.]/g, '') // Remove any other disallowed characters
          .substring(0, 100)
          .trim()
      }
    };

    // Validate all required fields before sending
    if (!chapaData.amount || !chapaData.email || !chapaData.first_name || !chapaData.phone_number || !chapaData.tx_ref) {
      console.error('Missing required Chapa fields:', {
        hasAmount: !!chapaData.amount,
        hasEmail: !!chapaData.email,
        hasFirstName: !!chapaData.first_name,
        hasPhone: !!chapaData.phone_number,
        hasTxRef: !!chapaData.tx_ref
      });
      return res.status(400).json({ 
        message: 'Invalid payment request. Missing required fields.',
        error: 'Required fields: amount, email, first_name, phone_number, tx_ref'
      });
    }

    console.log('Initializing Chapa payment for order:', order._id);
    console.log('Chapa request data:', {
      amount: chapaData.amount,
      currency: chapaData.currency,
      email: chapaData.email,
      first_name: chapaData.first_name,
      last_name: chapaData.last_name,
      phone_number: '***',
      tx_ref: chapaData.tx_ref,
      callback_url: chapaData.callback_url,
      return_url: chapaData.return_url
    });

    const chapaResponse = await axios.post(
      'https://api.chapa.co/v1/transaction/initialize',
      chapaData,
      {
        headers: {
          Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 second timeout
      }
    );

    console.log('Chapa API response status:', chapaResponse.status);
    console.log('Chapa API response:', JSON.stringify(chapaResponse.data, null, 2));

    // Check if response is successful
    if (!chapaResponse.data || !chapaResponse.data.status || chapaResponse.data.status !== 'success') {
      console.error('Chapa API returned non-success status:', chapaResponse.data);
      return res.status(500).json({ 
        message: 'Payment initialization failed',
        error: chapaResponse.data?.message || 'Chapa API returned an error'
      });
    }

    // Validate response structure
    if (!chapaResponse.data.data || !chapaResponse.data.data.checkout_url) {
      console.error('Invalid Chapa response structure:', chapaResponse.data);
      return res.status(500).json({ 
        message: 'Payment initialization failed',
        error: 'Invalid response from payment gateway'
      });
    }

    // Update order with Chapa reference
    order.chapaReference = chapaResponse.data.data.reference;
    order.chapaTransactionId = chapaData.tx_ref;
    await order.save();

    console.log('Payment initialized successfully for order:', order._id);

    res.json({
      checkout_url: chapaResponse.data.data.checkout_url,
      reference: chapaResponse.data.data.reference
    });
    } catch (error) {
      console.error('Chapa payment error:', error.response?.data || error.message);
      console.error('Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data ? JSON.stringify(error.response.data, null, 2) : 'No data',
        message: error.message,
        code: error.code
      });
      
      // Log the full error response for debugging
      if (error.response?.data) {
        console.error('Full Chapa error response:', JSON.stringify(error.response.data, null, 2));
      }
      
      // Provide more specific error messages
      let errorMessage = 'Payment initialization failed';
      let errorDetails = error.message;

      if (error.response) {
        // Chapa API returned an error response
        const chapaError = error.response.data;
        
        // Extract error message properly - ensure it's always a string
        let extractedMessage = '';
        
        // Helper function to safely convert to string
        const safeStringify = (obj) => {
          if (typeof obj === 'string') return obj;
          if (obj === null || obj === undefined) return '';
          if (typeof obj === 'object') {
            try {
              // Try to extract meaningful message first
              if (obj.message) return String(obj.message);
              if (obj.error) return safeStringify(obj.error);
              // If it's an array, join elements
              if (Array.isArray(obj)) {
                return obj.map(item => safeStringify(item)).filter(s => s).join(', ');
              }
              // Otherwise stringify
              return JSON.stringify(obj);
            } catch {
              return String(obj);
            }
          }
          return String(obj);
        };
        
        if (typeof chapaError === 'string') {
          extractedMessage = chapaError;
        } else if (chapaError && typeof chapaError === 'object') {
          // Try different common error message locations
          if (chapaError.message) {
            extractedMessage = safeStringify(chapaError.message);
          } else if (chapaError.error) {
            extractedMessage = safeStringify(chapaError.error);
          } else if (chapaError.errors) {
            // Handle errors array or object
            if (Array.isArray(chapaError.errors)) {
              extractedMessage = chapaError.errors
                .map(e => {
                  if (typeof e === 'string') return e;
                  if (e && typeof e === 'object') {
                    return e.message || e.field || safeStringify(e);
                  }
                  return String(e);
                })
                .filter(s => s)
                .join(', ');
            } else if (typeof chapaError.errors === 'object') {
              // Extract messages from error object (e.g., {email: ['invalid'], phone: ['required']})
              const errorMessages = Object.entries(chapaError.errors)
                .map(([key, value]) => {
                  const valStr = Array.isArray(value) 
                    ? value.join(', ') 
                    : safeStringify(value);
                  return `${key}: ${valStr}`;
                })
                .filter(s => s)
                .join('; ');
              extractedMessage = errorMessages || safeStringify(chapaError.errors);
            } else {
              extractedMessage = safeStringify(chapaError.errors);
            }
          } else if (chapaError.data?.message) {
            extractedMessage = safeStringify(chapaError.data.message);
          } else {
            // Last resort: stringify the whole object but try to make it readable
            extractedMessage = safeStringify(chapaError);
          }
        } else {
          extractedMessage = safeStringify(chapaError);
        }
        
        errorDetails = extractedMessage || error.message;
        
        if (error.response.status === 401) {
          errorMessage = 'Payment gateway authentication failed. Please check your API key.';
        } else if (error.response.status === 400) {
          // Parse Chapa validation errors
          if (extractedMessage && extractedMessage.trim() !== '') {
            // Ensure extractedMessage is a string, not an object
            const messageStr = typeof extractedMessage === 'string' 
              ? extractedMessage 
              : JSON.stringify(extractedMessage);
            errorMessage = `Invalid payment request: ${messageStr}`;
          } else {
            // Try to get a more detailed error from the response
            const fallbackError = chapaError?.data?.message 
              || chapaError?.message 
              || (typeof chapaError === 'object' ? 'Please check your order details and try again' : String(chapaError));
            errorMessage = `Invalid payment request: ${fallbackError}`;
          }
        } else if (error.response.status === 422) {
          errorMessage = extractedMessage 
            ? `Payment request validation failed: ${extractedMessage}`
            : 'Payment request validation failed. Please check all required fields.';
        } else {
          errorMessage = extractedMessage || 'Payment initialization failed';
        }
      } else if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
        errorMessage = 'Cannot connect to payment gateway. Please try again later.';
      } else if (error.message.includes('CHAPA_SECRET_KEY')) {
        errorMessage = 'Payment gateway is not configured. Please contact support.';
      }

      res.status(error.response?.status || 500).json({ 
        message: errorMessage,
        error: process.env.NODE_ENV === 'development' ? errorDetails : undefined
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

