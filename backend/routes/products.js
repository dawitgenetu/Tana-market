import express from 'express';
import multer from 'multer';
import path from 'path';
import Product from '../models/Product.js';
import ActivityLog from '../models/ActivityLog.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Multer configuration for product image uploads
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, path.join(process.cwd(), 'uploads', 'products'));
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext).replace(/\s+/g, '-').toLowerCase();
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${baseName}-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith('image/')) {
    return cb(new Error('Only image files are allowed'), false);
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// @route   GET /api/products/categories
// @desc    Get distinct product categories
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    const categories = await Product.distinct('category', { isActive: true });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/products
// @desc    Get all products
// @access  Public
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
    const skip = (page - 1) * limit;

    const { category, q, minPrice, maxPrice, sort } = req.query;

    const filter = { isActive: true };
    if (category) filter.category = category;
    if (q) filter.$or = [
      { name: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } }
    ];
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // Sorting options: newest, price_asc, price_desc, rating
    let sortOption = { createdAt: -1 };
    if (sort === 'price_asc') sortOption = { price: 1 };
    else if (sort === 'price_desc') sortOption = { price: -1 };
    else if (sort === 'rating') sortOption = { rating: -1 };

    const [total, products] = await Promise.all([
      Product.countDocuments(filter),
      Product.find(filter)
        .populate('createdBy', 'name email')
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
    ]);

    res.json({
      data: products,
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

// @route   GET /api/products/:id
// @desc    Get single product
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('createdBy', 'name email');
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    // Log product view (if user present)
    try {
      const ActivityLog = (await import('../models/ActivityLog.js')).default;
      if (req.user) {
        await ActivityLog.create({
          user: req.user._id,
          action: 'view',
          resource: 'product',
          resourceId: product._id,
          ipAddress: req.ip,
          userAgent: req.get('user-agent')
        });
      }
    } catch (e) {
      // non-fatal logging error
      console.error('ActivityLog error:', e.message);
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/products
// @desc    Create product (supports JSON body or multipart/form-data with image upload)
// @access  Private (Admin/Manager)
router.post('/', protect, authorize('admin', 'manager'), upload.single('imageFile'), async (req, res) => {
  try {
    const body = req.body || {};

    // If an image file is uploaded, use its URL path; otherwise, use the provided image URL if any
    let image = body.image || '';
    if (req.file) {
      image = `/uploads/products/${req.file.filename}`;
    }

    const product = await Product.create({
      ...body,
      image,
      createdBy: req.user._id
    });

    await ActivityLog.create({
      user: req.user._id,
      action: 'create',
      resource: 'product',
      resourceId: product._id
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/products/:id
// @desc    Update product (supports JSON body or multipart/form-data with image upload)
// @access  Private (Admin/Manager)
router.put('/:id', protect, authorize('admin', 'manager'), upload.single('imageFile'), async (req, res) => {
  try {
    const body = req.body || {};

    // Build update object explicitly to avoid accidentally overwriting fields
    const updateData = { ...body };

    if (req.file) {
      updateData.image = `/uploads/products/${req.file.filename}`;
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await ActivityLog.create({
      user: req.user._id,
      action: 'update',
      resource: 'product',
      resourceId: product._id
    });

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete product
// @access  Private (Admin/Manager)
router.delete('/:id', protect, authorize('admin', 'manager'), async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await ActivityLog.create({
      user: req.user._id,
      action: 'delete',
      resource: 'product',
      resourceId: product._id
    });

    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

