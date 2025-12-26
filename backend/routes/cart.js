import express from 'express';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { protect } from '../middleware/auth.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// @route   GET /api/cart
// @desc    Get user's cart
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id })
      .populate('items.product', 'name price image stock');

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/cart
// @desc    Add item to cart
// @access  Private
router.post(
  '/',
  protect,
  [
    body('productId').notEmpty().withMessage('productId is required').isMongoId().withMessage('Invalid productId'),
    body('quantity').isInt({ min: 1, max: 100 }).withMessage('Quantity must be between 1 and 100')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { productId, quantity } = req.body;

      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      let cart = await Cart.findOne({ user: req.user._id });

      if (!cart) {
        cart = await Cart.create({ user: req.user._id, items: [] });
      }

      const itemIndex = cart.items.findIndex(
        item => item.product.toString() === productId
      );

      const existingQty = itemIndex > -1 ? cart.items[itemIndex].quantity : 0;
      const newQty = existingQty + quantity;

      if (product.stock < newQty) {
        return res.status(400).json({ message: 'Insufficient stock for requested quantity' });
      }

      if (itemIndex > -1) {
        cart.items[itemIndex].quantity = newQty;
      } else {
        cart.items.push({
          product: productId,
          quantity,
          price: product.price
        });
      }

      await cart.save();
      await cart.populate('items.product', 'name price image stock');

      res.json(cart);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// @route   PUT /api/cart/:itemId
// @desc    Update cart item
// @access  Private
router.put(
  '/:itemId',
  protect,
  [body('quantity').isInt({ min: 1, max: 100 }).withMessage('Quantity must be between 1 and 100')],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { quantity } = req.body;
      const cart = await Cart.findOne({ user: req.user._id });

      if (!cart) {
        return res.status(404).json({ message: 'Cart not found' });
      }

      const item = cart.items.id(req.params.itemId);
      if (!item) {
        return res.status(404).json({ message: 'Item not found' });
      }

      const product = await Product.findById(item.product);
      if (product.stock < quantity) {
        return res.status(400).json({ message: 'Insufficient stock' });
      }

      item.quantity = quantity;
      await cart.save();
      await cart.populate('items.product', 'name price image stock');

      res.json(cart);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// @route   DELETE /api/cart/:itemId
// @desc    Remove item from cart
// @access  Private
router.delete('/:itemId', protect, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items.pull(req.params.itemId);
    await cart.save();
    await cart.populate('items.product', 'name price image stock');

    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

