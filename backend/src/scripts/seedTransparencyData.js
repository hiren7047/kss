const mongoose = require('mongoose');
const Donation = require('../models/Donation');
const Expense = require('../models/Expense');
const Wallet = require('../models/Wallet');
const Event = require('../models/Event');
const { generateReceiptNumber } = require('../utils/receiptGenerator');
const { updateWalletAfterDonation, updateWalletAfterExpense } = require('../utils/walletUpdater');
require('dotenv').config();

// Connect to database
const connectDB = async () => {
  try {
    const { mongodbUri } = require('../config/env');
    await mongoose.connect(mongodbUri);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Sample donor names
const donorNames = [
  'Ramesh Patel',
  'Priya Shah',
  'Mahesh Joshi',
  'Anita Desai',
  'Vikram Mehta',
  'Sunita Kumar',
  'Rajesh Agarwal',
  'Kavita Singh',
  'Amit Trivedi',
  'Neha Patel',
  'Suresh Bhatt',
  'Deepa Shah',
  'Anonymous Donor',
];

// Sample expense categories
const expenseCategories = [
  'Food & Supplies',
  'Event Management',
  'Transportation',
  'Medical Aid',
  'Education Materials',
  'Infrastructure',
  'Administrative',
  'Marketing',
];

// Sample expense titles
const expenseTitles = [
  'Food Distribution - Annapurna Durga',
  'School Supplies - Saraswati Durga',
  'Blood Donation Camp Setup',
  'Animal Feed Purchase',
  'Event Venue Booking',
  'Medical Supplies',
  'Transportation for Volunteers',
  'Printing & Stationery',
  'Water Distribution',
  'Cleaning Supplies',
];

const purposes = ['general', 'event', 'emergency'];
const paymentModes = ['upi', 'cash', 'bank', 'razorpay'];

// Generate random date within last 6 months
const getRandomDate = (daysAgo = 180) => {
  const now = new Date();
  const randomDays = Math.floor(Math.random() * daysAgo);
  const date = new Date(now);
  date.setDate(date.getDate() - randomDays);
  return date;
};

// Seed donations
const seedDonations = async (count = 30) => {
  console.log(`\n📥 Seeding ${count} donations...`);
  
  const donations = [];
  const events = await Event.find({ softDelete: false }).limit(5);
  
  for (let i = 0; i < count; i++) {
    const donorName = donorNames[Math.floor(Math.random() * donorNames.length)];
    const amount = Math.floor(Math.random() * 50000) + 100; // 100 to 50000
    const purpose = purposes[Math.floor(Math.random() * purposes.length)];
    const paymentMode = paymentModes[Math.floor(Math.random() * paymentModes.length)];
    const isAnonymous = Math.random() > 0.7; // 30% anonymous
    const eventId = purpose === 'event' && events.length > 0 
      ? events[Math.floor(Math.random() * events.length)]._id 
      : null;
    
    const createdAt = getRandomDate(180);
    
    // Generate unique receipt number for each donation
    // Use timestamp to ensure uniqueness
    const dateStr = createdAt.toISOString().split('T')[0].replace(/-/g, '');
    const timestamp = Date.now() + i;
    const receiptNumber = `KSS-${dateStr}-${String(timestamp).slice(-5)}`;
    
    const donation = {
      donorName: isAnonymous ? 'Anonymous Donor' : donorName,
      amount,
      purpose,
      paymentMode,
      transactionId: paymentMode === 'upi' ? `UPI${timestamp}${i}` : 
                     paymentMode === 'razorpay' ? `RZP${timestamp}${i}` : null,
      receiptNumber,
      eventId,
      isAnonymous,
      status: 'completed',
      softDelete: false,
      createdAt,
      updatedAt: createdAt,
    };
    
    donations.push(donation);
  }
  
  const inserted = await Donation.insertMany(donations);
  console.log(`✅ Created ${inserted.length} donations`);
  
  // Update wallet
  const totalAmount = donations.reduce((sum, d) => sum + d.amount, 0);
  await updateWalletAfterDonation(totalAmount);
  console.log(`💰 Updated wallet with ₹${totalAmount.toLocaleString('en-IN')}`);
  
  return inserted;
};

// Seed expenses
const seedExpenses = async (count = 20) => {
  console.log(`\n📤 Seeding ${count} expenses...`);
  
  const expenses = [];
  const events = await Event.find({ softDelete: false }).limit(5);
  const wallet = await Wallet.getWallet();
  
  // Make sure we have enough balance
  if (wallet.availableBalance < 100000) {
    console.log('⚠️  Low wallet balance. Adding more donations first...');
    await seedDonations(10);
  }
  
  for (let i = 0; i < count; i++) {
    const title = expenseTitles[Math.floor(Math.random() * expenseTitles.length)];
    const category = expenseCategories[Math.floor(Math.random() * expenseCategories.length)];
    const amount = Math.floor(Math.random() * 20000) + 500; // 500 to 20000
    const eventId = Math.random() > 0.5 && events.length > 0
      ? events[Math.floor(Math.random() * events.length)]._id
      : null;
    
    // Mix of pending and approved expenses (70% approved, 30% pending)
    const approvalStatus = Math.random() > 0.3 ? 'approved' : 'pending';
    
    const createdAt = getRandomDate(180);
    
    const expense = {
      title,
      category,
      amount,
      eventId,
      approvalStatus,
      softDelete: false,
      createdAt,
      updatedAt: createdAt,
    };
    
    expenses.push(expense);
  }
  
  const inserted = await Expense.insertMany(expenses);
  console.log(`✅ Created ${inserted.length} expenses`);
  
  // Update wallet only for approved expenses
  const approvedExpenses = inserted.filter(e => e.approvalStatus === 'approved');
  for (const expense of approvedExpenses) {
    await updateWalletAfterExpense(expense.amount, 'approved');
  }
  
  const pendingCount = inserted.filter(e => e.approvalStatus === 'pending').length;
  const approvedCount = approvedExpenses.length;
  console.log(`   - Approved: ${approvedCount}, Pending: ${pendingCount}`);
  
  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
  console.log(`💰 Updated wallet with expenses totaling ₹${totalAmount.toLocaleString('en-IN')}`);
  
  return inserted;
};

// Main seed function
const seedTransparencyData = async () => {
  try {
    await connectDB();
    
    console.log('\n🌱 Starting Transparency Data Seeding...\n');
    
    // Check existing data
    const existingDonations = await Donation.countDocuments({ softDelete: false });
    const existingExpenses = await Expense.countDocuments({ softDelete: false });
    
    console.log(`📊 Current Data:`);
    console.log(`   Donations: ${existingDonations}`);
    console.log(`   Expenses: ${existingExpenses}`);
    
    if (existingDonations === 0) {
      await seedDonations(30);
    } else {
      console.log(`\n⚠️  Donations already exist. Skipping donation seeding.`);
      console.log(`   To add more, delete existing donations or modify this script.`);
    }
    
    if (existingExpenses === 0) {
      await seedExpenses(20);
    } else {
      console.log(`\n⚠️  Expenses already exist. Skipping expense seeding.`);
      console.log(`   To add more, delete existing expenses or modify this script.`);
    }
    
    // Final wallet status
    const wallet = await Wallet.getWallet();
    console.log(`\n📊 Final Wallet Status:`);
    console.log(`   Total Donations: ₹${wallet.totalDonations.toLocaleString('en-IN')}`);
    console.log(`   Total Expenses: ₹${wallet.totalExpenses.toLocaleString('en-IN')}`);
    console.log(`   Available Balance: ₹${wallet.availableBalance.toLocaleString('en-IN')}`);
    console.log(`   Restricted Funds: ₹${wallet.restrictedFunds.toLocaleString('en-IN')}`);
    
    console.log('\n✅ Transparency data seeding completed!\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding transparency data:', error);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  seedTransparencyData();
}

module.exports = { seedTransparencyData };
