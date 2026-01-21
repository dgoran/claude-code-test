const mongoose = require('mongoose');
const Owner = require('../models/Owner');
require('dotenv').config({ path: '../.env' });

const seedAdminUser = async () => {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/zoom-registration';
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');

    // Check if admin user already exists
    const existingAdmin = await Owner.findOne({ email: 'admin' });

    if (existingAdmin) {
      console.log('Admin user already exists');
      await mongoose.connection.close();
      return;
    }

    // Create admin user
    const adminUser = new Owner({
      name: 'Admin User',
      email: 'admin',
      password: 'admin',
      role: 'owner',
      isActive: true
    });

    await adminUser.save();
    console.log('Admin user created successfully!');
    console.log('Username: admin');
    console.log('Password: admin');

    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error seeding admin user:', error);
    process.exit(1);
  }
};

// Run the seed function
seedAdminUser();
