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

    const categories = [
      'Beverages','Kitchen','Groceries','Accessories','Electronics','Home','Garden','Toys','Books','Clothing',
      'Footwear','Beauty','Sports','Automotive','Health','Office','Pets','Baby','Jewelry','Outdoors'
    ];

    const products = [];
    // Create 10 products per category
    for (let i = 0; i < categories.length; i++) {
      for (let p = 1; p <= 10; p++) {
        products.push({
          name: `${categories[i]} Product ${p}`,
          description: `Sample product ${p} for category ${categories[i]}`,
          price: Math.floor(Math.random() * 1000) + 50,
          category: categories[i],
          stock: Math.floor(Math.random() * 200) + 10,
          image: '',
          createdBy: admin._id
        });
      }
    }

    await Product.insertMany(products);
    console.log(`Sample products created: ${products.length} across ${categories.length} categories`);

    console.log('Seeding completed');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seed();
