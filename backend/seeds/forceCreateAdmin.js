
import dotenv from 'dotenv';
import connectDB from '../config/database.js';
import User from '../models/User.js';

dotenv.config();

const createNewAdmin = async () => {
    try {
        await connectDB();

        const email = 'superadmin@tanamarket.com';
        const password = 'Password123!';

        // Delete if exists to force fresh creation
        await User.deleteOne({ email });

        await User.create({
            name: 'Super Admin',
            email:'admin@tanamarket.com',
            password: 'admin123',
            role: 'admin',
            phone: '0911000000'
        });

        console.log(`\nSUCCESS! Created new admin user:`);
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

createNewAdmin();
