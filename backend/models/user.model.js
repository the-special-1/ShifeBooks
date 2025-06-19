import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    isApproved: {
      type: Boolean,
      default: false, // Admin will set this to true after payment
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);

export default User;
