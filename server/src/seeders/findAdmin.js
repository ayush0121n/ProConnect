require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const findAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const admin = await User.findOne({ role: 'admin' });
    if (admin) {
      console.log(`Admin email: ${admin.email}`);
    } else {
      console.log('No admin found.');
    }
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};
findAdmin();
