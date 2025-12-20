import express from 'express';
import Report from '../models/Report.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/reports/daily
// @desc    Get daily reports
// @access  Private (Admin)
router.get('/daily', protect, authorize('admin'), async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);

    let report = await Report.findOne({ date: targetDate });

    if (!report) {
      // Generate report if it doesn't exist
      report = await generateDailyReport(targetDate);
    }

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/reports/sales
// @desc    Get sales statistics
// @access  Private (Admin)
router.get('/sales', protect, authorize('admin'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const orders = await Order.find({
      createdAt: { $gte: start, $lte: end },
      isPaid: true
    });

    const totalSales = orders.reduce((sum, order) => sum + order.totalPrice, 0);
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

    res.json({
      totalSales,
      totalOrders,
      averageOrderValue,
      period: { start, end }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/reports/top-products
// @desc    Get top products
// @access  Private (Admin)
router.get('/top-products', protect, authorize('admin'), async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const orders = await Order.find({ isPaid: true })
      .populate('orderItems.product');

    const productStats = {};

    orders.forEach(order => {
      order.orderItems.forEach(item => {
        const productId = item.product._id.toString();
        if (!productStats[productId]) {
          productStats[productId] = {
            product: item.product,
            quantity: 0,
            revenue: 0
          };
        }
        productStats[productId].quantity += item.quantity;
        productStats[productId].revenue += item.price * item.quantity;
      });
    });

    const topProducts = Object.values(productStats)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, parseInt(limit));

    res.json(topProducts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/reports/generate-daily
// @desc    Generate daily report
// @access  Private (Admin)
router.post('/generate-daily', protect, authorize('admin'), async (req, res) => {
  try {
    const { date } = req.body;
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);

    const report = await generateDailyReport(targetDate, req.user._id);

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Helper function to generate daily report
async function generateDailyReport(date, generatedBy = null) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const orders = await Order.find({
    createdAt: { $gte: startOfDay, $lte: endOfDay },
    isPaid: true
  });

  const totalSales = orders.reduce((sum, order) => sum + order.totalPrice, 0);
  const totalOrders = orders.length;
  const totalCustomers = new Set(orders.map(o => o.user.toString())).size;
  const totalProducts = await Product.countDocuments({ isActive: true });

  // Top products
  const productStats = {};
  orders.forEach(order => {
    order.orderItems.forEach(item => {
      const productId = item.product.toString();
      if (!productStats[productId]) {
        productStats[productId] = {
          product: item.product,
          quantity: 0,
          revenue: 0
        };
      }
      productStats[productId].quantity += item.quantity;
      productStats[productId].revenue += item.price * item.quantity;
    });
  });

  const topProducts = Object.values(productStats)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10)
    .map(stat => ({
      product: stat.product,
      quantity: stat.quantity,
      revenue: stat.revenue
    }));

  // Sales by category
  const categoryStats = {};
  for (const order of orders) {
    for (const item of order.orderItems) {
      const product = await Product.findById(item.product);
      if (product) {
        if (!categoryStats[product.category]) {
          categoryStats[product.category] = { revenue: 0, orders: 0 };
        }
        categoryStats[product.category].revenue += item.price * item.quantity;
        categoryStats[product.category].orders += 1;
      }
    }
  }

  const salesByCategory = Object.entries(categoryStats).map(([category, stats]) => ({
    category,
    revenue: stats.revenue,
    orders: stats.orders
  }));

  const report = await Report.findOneAndUpdate(
    { date: startOfDay },
    {
      date: startOfDay,
      totalSales,
      totalOrders,
      totalCustomers,
      totalProducts,
      topProducts,
      salesByCategory,
      generatedBy
    },
    { upsert: true, new: true }
  );

  return report;
}

export default router;

