require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const makeAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const user = await User.findOne();
    if (!user) {
      console.log('No users found.');
      process.exit(1);
    }

    user.role = 'admin';
    await user.save({ validateBeforeSave: false });
    
    console.log(`Successfully promoted ${user.email} to Admin`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

makeAdmin();
