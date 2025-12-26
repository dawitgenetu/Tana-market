import dotenv from 'dotenv';
import connectDB from '../config/database.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import mongoose from 'mongoose';

dotenv.config();

const seed = async () => {
  try {
    await connectDB();

    // Clear existing
    await User.deleteMany();
    await Product.deleteMany();

    console.log('Existing users and products removed');

    // Create users
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@tana-market.test',
      password: 'AdminPass123',
      role: 'admin'
    });

    const manager = await User.create({
      name: 'Manager User',
      email: 'manager@tana-market.test',
      password: 'ManagerPass123',
      role: 'manager'
    });

    const customer = await User.create({
      name: 'Customer User',
      email: 'customer@tana-market.test',
      password: 'CustomerPass123',
      role: 'customer'
    });

    console.log('Created admin, manager and customer');

    const products = [
      {
        name: 'Ethiopian Coffee Beans',
        description: 'Fresh roasted Ethiopian coffee beans.',
        price: 500,
        category: 'Beverages',
        stock: 120,
        image: '',
        createdBy: admin._id
      },
      {
        name: 'Handmade Ceramic Mug',
        description: 'Locally made ceramic mug, 350ml.',
        price: 150,
        category: 'Kitchen',
        stock: 80,
        image: '',
        createdBy: admin._id
      },
      {
        name: 'Organic Teff Flour',
        description: 'Whole grain teff flour for injera and baking.',
        price: 200,
        category: 'Groceries',
        stock: 200,
        image: '',
        createdBy: admin._id
      },
      {
        name: 'Leather Wallet',
        description: 'Premium genuine leather wallet.',
        price: 350,
        category: 'Accessories',
        stock: 60,
        image: '',
        createdBy: admin._id
      },
      {
        name: 'Wireless Earbuds',
        description: 'Bluetooth earbuds with charging case.',
        price: 1200,
        category: 'Electronics',
        stock: 40,
        image: '',
        createdBy: admin._id
      }
    ];

    await Product.insertMany(products);
    console.log('Sample products created');

    console.log('Seeding completed');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seed();
