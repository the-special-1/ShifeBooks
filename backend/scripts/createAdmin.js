import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import User from '../models/user.model.js';

// Since we are in a sub-directory, we need to resolve the path to the root .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// We need a dynamic import for inquirer because it's a CommonJS module
let inquirer;

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected...');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

const createAdmin = async () => {
  try {
    // Dynamically import inquirer
    const inquirerModule = await import('inquirer');
    inquirer = inquirerModule.default;

    await connectDB();

    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'fullName',
        message: 'Enter the admin\'s full name:',
        validate: (input) => input ? true : 'Full name cannot be empty.',
      },
      {
        type: 'input',
        name: 'email',
        message: 'Enter the admin\'s email address:',
        validate: (input) => {
          const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
          return emailRegex.test(input) ? true : 'Please enter a valid email address.';
        },
      },
      {
        type: 'password',
        name: 'password',
        message: 'Enter a password for the admin account:',
        mask: '*',
        validate: (input) => input.length >= 6 ? true : 'Password must be at least 6 characters long.',
      },
    ]);

    const { fullName, email, password } = answers;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.error('Error: An account with this email already exists.');
      process.exit(1);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const adminUser = new User({
      fullName,
      email,
      password: hashedPassword,
      role: 'admin',
      approved: true, // Admins are approved by default
    });

    await adminUser.save();

    console.log(`✅ Admin user '${fullName}' created successfully!`);

  } catch (error) {
    console.error('An error occurred during admin creation:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected.');
    process.exit(0);
  }
};

createAdmin();
