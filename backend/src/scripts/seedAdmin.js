/**
 * Seed script to create initial super admin user
 * Run: node src/scripts/seedAdmin.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const { ROLES } = require('../config/roles');
const { mongodbUri } = require('../config/env');

const seedAdmin = async () => {
  try {
    // Connect to database
    await mongoose.connect(mongodbUri);
    console.log('Connected to MongoDB');

    // Check if super admin already exists
    const existingAdmin = await User.findOne({ role: ROLES.SUPER_ADMIN });
    if (existingAdmin) {
      console.log('Super admin already exists. Skipping seed.');
      process.exit(0);
    }

    // Create super admin
    const admin = await User.create({
      name: 'Super Admin',
      email: 'admin@kss.org',
      mobile: '1234567890',
      password: 'Admin@123', // Change this after first login
      role: ROLES.SUPER_ADMIN,
      status: 'active'
    });

    console.log('Super admin created successfully!');
    console.log('Email:', admin.email);
    console.log('Mobile:', admin.mobile);
    console.log('Password: Admin@123 (Please change after first login)');
    console.log('Role:', admin.role);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();


