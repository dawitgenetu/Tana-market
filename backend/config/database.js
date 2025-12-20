import mongoose from 'mongoose';

const connectDB = async () => {
  if (!process.env.MONGODB_URI || typeof process.env.MONGODB_URI !== 'string') {
    console.error('MongoDB connection string is missing. Set MONGODB_URI in your .env file.');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;

