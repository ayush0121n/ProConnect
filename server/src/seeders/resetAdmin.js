require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

const resetAdminPassword = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const admin = await User.findOne({ email: 'test@proconnect.dev' });
    if (admin) {
      admin.password = 'admin123';
      await admin.save();
      console.log('Password reset successfully to admin123');
    } else {
      console.log('Admin not found.');
    }
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};
resetAdminPassword();
