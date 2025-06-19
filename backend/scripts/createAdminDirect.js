import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import User from '../models/user.model.js';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected...');

    // Admin details
    const adminDetails = {
      fullName: 'shife',
      email: 'shiferawtesfaye@gmail.com',
      password: 'shife123',
      role: 'admin',
      approved: true
    };

    // Check if admin already exists
    const existingUser = await User.findOne({ email: adminDetails.email });
    if (existingUser) {
      console.log('Admin user already exists.');
      await mongoose.disconnect();
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminDetails.password, salt);

    // Create admin user
    const adminUser = new User({
      fullName: adminDetails.fullName,
      email: adminDetails.email,
      password: hashedPassword,
      role: adminDetails.role,
      approved: adminDetails.approved
    });

    await adminUser.save();
    console.log('✅ Admin user created successfully!');

  } catch (error) {
    console.error('Error creating admin user:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected.');
  }
};

createAdmin();
