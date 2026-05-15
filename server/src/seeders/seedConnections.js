require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Connection = require('../models/Connection');
const bcrypt = require('bcryptjs');

const seedConnections = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get the first user (the main user/admin)
    const mainUser = await User.findOne({ role: 'admin' });
    if (!mainUser) {
      console.log('No admin user found. Make sure you have an account first.');
      process.exit(1);
    }

    const firstNames = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];
    const headlines = ['Software Engineer', 'Product Manager', 'UX Designer', 'Data Scientist', 'Marketing Director', 'Sales Executive', 'HR Specialist', 'Financial Analyst', 'Consultant', 'Entrepreneur'];
    const companies = ['Google', 'Microsoft', 'Amazon', 'Meta', 'Apple', 'Netflix', 'Tesla', 'Adobe', 'Salesforce', 'Startup Inc.'];

    // Create 15 new users
    const newUsers = [];
    const passwordHash = await bcrypt.hash('password123', 12);

    console.log('Creating 15 new users...');
    for (let i = 0; i < 15; i++) {
      const fn = firstNames[Math.floor(Math.random() * firstNames.length)];
      const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
      
      const user = new User({
        firstName: fn,
        lastName: ln,
        email: `${fn.toLowerCase()}.${ln.toLowerCase()}${i}@example.com`,
        password: passwordHash, // bypassing pre-save hook for speed but it's fine
        headline: headlines[Math.floor(Math.random() * headlines.length)] + ' at ' + companies[Math.floor(Math.random() * companies.length)],
        bio: `Passionate professional working in tech. Always open to new opportunities and networking.`,
        location: { city: 'San Francisco', country: 'USA' },
        isVerified: true
      });
      newUsers.push(user);
    }

    const savedUsers = await User.insertMany(newUsers);
    console.log('Successfully created 15 users.');

    console.log('Creating connections...');
    
    // 5 Accepted connections
    for (let i = 0; i < 5; i++) {
      await Connection.create({
        requester: mainUser._id,
        recipient: savedUsers[i]._id,
        status: 'accepted'
      });
      // Add to each other's connections array
      await User.findByIdAndUpdate(mainUser._id, { $addToSet: { connections: savedUsers[i]._id }, $inc: { connectionsCount: 1 } });
      await User.findByIdAndUpdate(savedUsers[i]._id, { $addToSet: { connections: mainUser._id }, $inc: { connectionsCount: 1 } });
    }

    // 5 Pending requests sent TO the main user
    for (let i = 5; i < 10; i++) {
      await Connection.create({
        requester: savedUsers[i]._id,
        recipient: mainUser._id,
        status: 'pending',
        message: 'Hi, I would like to connect with you!'
      });
    }

    // The remaining 5 users will just be suggestions (no connection established)
    
    console.log('Successfully added connections and requests.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding connections:', error);
    process.exit(1);
  }
};

seedConnections();
