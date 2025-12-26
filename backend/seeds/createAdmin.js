import dotenv from 'dotenv';
import connectDB from '../config/database.js';
import User from '../models/User.js';

dotenv.config();

const createAdmin = async () => {
  try {
    await connectDB();

    const email = process.env.ADMIN_EMAIL || 'admin@tanamarket.com';
    const password = process.env.ADMIN_PASSWORD || 'AdminPass123!';
    const name = process.env.ADMIN_NAME || 'Admin User';

    let user = await User.findOne({ email });
    if (user) {
      user.role = 'admin';
      user.name = user.name || name;
      // Set/replace password (will be hashed by pre-save hook)
      user.password = password;
      await user.save();
      console.log(`Updated existing user to admin: ${email}`);
      process.exit(0);
    }

    await User.create({
      name,
      email,
      password,
      role: 'admin'
    });

    console.log(`Created admin user: ${email} (password: ${password})`);
    console.log('Tip: set ADMIN_PASSWORD and ADMIN_EMAIL in your .env to customize');
    process.exit(0);
  } catch (error) {
    console.error('createAdmin error:', error);
    process.exit(1);
  }
};

createAdmin();
