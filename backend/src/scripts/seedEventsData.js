/**
 * Seed script to create test events with items and expense plans
 * Run: node src/scripts/seedEventsData.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Event = require('../models/Event');
const EventItem = require('../models/EventItem');
const EventExpensePlan = require('../models/EventExpensePlan');
const Donation = require('../models/Donation');
const Expense = require('../models/Expense');
const User = require('../models/User');
const { mongodbUri } = require('../config/env');

const seedEventsData = async () => {
  try {
    // Connect to database
    await mongoose.connect(mongodbUri);
    console.log('Connected to MongoDB');

    // Get or create a manager user
    let manager = await User.findOne({ email: 'admin@kss.org' });
    if (!manager) {
      // Create a test manager if admin doesn't exist
      manager = await User.create({
        name: 'Event Manager',
        email: 'manager@kss.org',
        mobile: '9876543210',
        password: 'Manager@123',
        role: 'ADMIN',
        status: 'active'
      });
      console.log('Created manager user');
    }

    const managerId = manager._id;

    // Clear existing test events (optional - comment out if you want to keep existing)
    // await Event.deleteMany({ name: { $regex: /^(Test|Sample|Medical|Food|Education|Blood|Daughter)/i } });
    // await EventItem.deleteMany({});
    // await EventExpensePlan.deleteMany({});

    console.log('\n=== Creating Test Events ===\n');

    // Event 1: Medical Health Camp (Upcoming, with target)
    const event1 = await Event.create({
      name: 'Medical Health Camp',
      description: 'Free medical checkup and medicine distribution for underprivileged families',
      location: 'Community Center, Sector 5, Delhi',
      startDate: new Date('2026-02-20'),
      endDate: new Date('2026-02-21'),
      budget: 75000,
      targetAmount: 100000,
      managerId: managerId,
      status: 'planned'
    });
    console.log('✓ Created Event: Medical Health Camp');

    // Items for Event 1
    await EventItem.create({
      eventId: event1._id,
      name: 'Medical Equipment',
      description: 'Stethoscopes, BP machines, thermometers',
      unitPrice: 2000,
      totalQuantity: 10,
      totalAmount: 20000,
      priority: 'high'
    });

    await EventItem.create({
      eventId: event1._id,
      name: 'Medicines',
      description: 'Essential medicines for distribution',
      unitPrice: 500,
      totalQuantity: 100,
      totalAmount: 50000,
      priority: 'critical'
    });

    // Expense Plans for Event 1
    await EventExpensePlan.create({
      eventId: event1._id,
      title: 'Venue Rental',
      description: 'Community center rental for 2 days',
      category: 'Venue',
      estimatedAmount: 15000,
      plannedDate: new Date('2026-02-19'),
      priority: 'high',
      status: 'planned'
    });

    await EventExpensePlan.create({
      eventId: event1._id,
      title: 'Doctor Fees',
      category: 'Personnel',
      estimatedAmount: 20000,
      plannedDate: new Date('2026-02-20'),
      priority: 'critical',
      status: 'planned'
    });

    // Add some donations for Event 1
    await Donation.create({
      donorName: 'Rajesh Kumar',
      amount: 25000,
      purpose: 'event',
      paymentMode: 'upi',
      eventId: event1._id,
      receiptNumber: `REC-${Date.now()}-1`,
      status: 'completed'
    });

    await Donation.create({
      donorName: 'Priya Sharma',
      amount: 15000,
      purpose: 'event',
      paymentMode: 'bank',
      eventId: event1._id,
      receiptNumber: `REC-${Date.now()}-2`,
      status: 'completed'
    });

    // Event 2: Food Distribution Drive (Fully Funded)
    const event2 = await Event.create({
      name: 'Food Distribution Drive',
      description: 'Monthly food distribution to 500+ families in slum areas',
      location: 'Slum Area, Block C, Mumbai',
      startDate: new Date('2026-01-25'),
      endDate: new Date('2026-01-25'),
      budget: 50000,
      targetAmount: 50000,
      managerId: managerId,
      status: 'planned'
    });
    console.log('✓ Created Event: Food Distribution Drive');

    // Items for Event 2
    await EventItem.create({
      eventId: event2._id,
      name: 'Rice Bags',
      description: '50kg rice bags',
      unitPrice: 2000,
      totalQuantity: 20,
      totalAmount: 40000,
      priority: 'critical'
    });

    await EventItem.create({
      eventId: event2._id,
      name: 'Cooking Oil',
      description: '5L cooking oil cans',
      unitPrice: 500,
      totalQuantity: 20,
      totalAmount: 10000,
      priority: 'high'
    });

    // Add donations to fully fund Event 2
    await Donation.create({
      donorName: 'Amit Patel',
      amount: 30000,
      purpose: 'event',
      paymentMode: 'cash',
      eventId: event2._id,
      receiptNumber: `REC-${Date.now()}-3`,
      status: 'completed'
    });

    await Donation.create({
      donorName: 'Sunita Devi',
      amount: 20000,
      purpose: 'event',
      paymentMode: 'upi',
      eventId: event2._id,
      receiptNumber: `REC-${Date.now()}-4`,
      status: 'completed'
    });

    // Event 3: Education Workshop (Upcoming, partial funding)
    const event3 = await Event.create({
      name: 'Education Workshop',
      description: 'Career guidance and skill development workshop for rural students',
      location: 'Government School, Village Road, Jaipur',
      startDate: new Date('2026-02-05'),
      endDate: new Date('2026-02-07'),
      budget: 35000,
      targetAmount: 50000,
      managerId: managerId,
      status: 'planned'
    });
    console.log('✓ Created Event: Education Workshop');

    // Items for Event 3
    await EventItem.create({
      eventId: event3._id,
      name: 'Study Materials',
      description: 'Books, notebooks, pens',
      unitPrice: 300,
      totalQuantity: 100,
      totalAmount: 30000,
      priority: 'high'
    });

    // Add partial donations
    await Donation.create({
      donorName: 'Vikram Singh',
      amount: 15000,
      purpose: 'event',
      paymentMode: 'bank',
      eventId: event3._id,
      receiptNumber: `REC-${Date.now()}-5`,
      status: 'completed'
    });

    await Donation.create({
      donorName: 'Anita Mehta',
      amount: 7000,
      purpose: 'event',
      paymentMode: 'upi',
      eventId: event3._id,
      receiptNumber: `REC-${Date.now()}-6`,
      status: 'completed'
    });

    // Event 4: Blood Donation Camp (Completed)
    const event4 = await Event.create({
      name: 'Blood Donation Camp',
      description: 'Quarterly blood donation camp in association with local hospital',
      location: 'City Hospital, Main Road, Chennai',
      startDate: new Date('2025-12-15'),
      endDate: new Date('2025-12-15'),
      budget: 25000,
      targetAmount: 30000,
      managerId: managerId,
      status: 'completed'
    });
    console.log('✓ Created Event: Blood Donation Camp');

    // Add donations and expenses for completed event
    await Donation.create({
      donorName: 'Ramesh Iyer',
      amount: 25000,
      purpose: 'event',
      paymentMode: 'cash',
      eventId: event4._id,
      receiptNumber: `REC-${Date.now()}-7`,
      status: 'completed'
    });

    // Event 5: Daughter's Function (Samuh Lag) - Your use case
    const event5 = await Event.create({
      name: 'Daughter\'s Function (Samuh Lag)',
      description: 'Group wedding ceremony for daughter with community support',
      location: 'Community Hall, Ahmedabad',
      startDate: new Date('2026-03-10'),
      endDate: new Date('2026-03-12'),
      budget: 150000,
      targetAmount: 200000,
      managerId: managerId,
      status: 'planned'
    });
    console.log('✓ Created Event: Daughter\'s Function (Samuh Lag)');

    // Items for Event 5 - Chairs and Tables
    const chairItem = await EventItem.create({
      eventId: event5._id,
      name: 'Chairs',
      description: '15 chairs needed for the function',
      unitPrice: 500,
      totalQuantity: 15,
      totalAmount: 7500,
      priority: 'high'
    });

    const tableItem = await EventItem.create({
      eventId: event5._id,
      name: 'Tables',
      description: '5 tables needed',
      unitPrice: 2000,
      totalQuantity: 5,
      totalAmount: 10000,
      priority: 'high'
    });

    // Add item-specific donations and update items
    const donation1 = await Donation.create({
      donorName: 'Community Member 1',
      amount: 5000,
      purpose: 'event',
      paymentMode: 'upi',
      eventId: event5._id,
      eventItemId: chairItem._id,
      donationType: 'item_specific',
      itemQuantity: 10,
      receiptNumber: `REC-${Date.now()}-8`,
      status: 'completed'
    });
    chairItem.donatedAmount = (chairItem.donatedAmount || 0) + donation1.amount;
    chairItem.donatedQuantity = (chairItem.donatedQuantity || 0) + donation1.itemQuantity;
    chairItem.updateStatus();
    await chairItem.save();

    const donation2 = await Donation.create({
      donorName: 'Community Member 2',
      amount: 2500,
      purpose: 'event',
      paymentMode: 'cash',
      eventId: event5._id,
      eventItemId: chairItem._id,
      donationType: 'item_specific',
      itemQuantity: 5,
      receiptNumber: `REC-${Date.now()}-9`,
      status: 'completed'
    });
    chairItem.donatedAmount = (chairItem.donatedAmount || 0) + donation2.amount;
    chairItem.donatedQuantity = (chairItem.donatedQuantity || 0) + donation2.itemQuantity;
    chairItem.updateStatus();
    await chairItem.save();

    const donation3 = await Donation.create({
      donorName: 'Community Member 3',
      amount: 10000,
      purpose: 'event',
      paymentMode: 'bank',
      eventId: event5._id,
      eventItemId: tableItem._id,
      donationType: 'item_specific',
      itemQuantity: 5,
      receiptNumber: `REC-${Date.now()}-10`,
      status: 'completed'
    });
    tableItem.donatedAmount = (tableItem.donatedAmount || 0) + donation3.amount;
    tableItem.donatedQuantity = (tableItem.donatedQuantity || 0) + donation3.itemQuantity;
    tableItem.updateStatus();
    await tableItem.save();

    // General donations for Event 5
    await Donation.create({
      donorName: 'Family Friend 1',
      amount: 25000,
      purpose: 'event',
      paymentMode: 'upi',
      eventId: event5._id,
      receiptNumber: `REC-${Date.now()}-11`,
      status: 'completed'
    });

    await Donation.create({
      donorName: 'Family Friend 2',
      amount: 30000,
      purpose: 'event',
      paymentMode: 'bank',
      eventId: event5._id,
      receiptNumber: `REC-${Date.now()}-12`,
      status: 'completed'
    });

    // Expense Plans for Event 5
    await EventExpensePlan.create({
      eventId: event5._id,
      title: 'Catering',
      description: 'Food and beverages for 500 guests',
      category: 'Food',
      estimatedAmount: 80000,
      plannedDate: new Date('2026-03-10'),
      priority: 'critical',
      status: 'planned'
    });

    await EventExpensePlan.create({
      eventId: event5._id,
      title: 'Venue Decoration',
      category: 'Decoration',
      estimatedAmount: 30000,
      plannedDate: new Date('2026-03-09'),
      priority: 'high',
      status: 'planned'
    });

    await EventExpensePlan.create({
      eventId: event5._id,
      title: 'Sound System',
      category: 'Equipment',
      estimatedAmount: 15000,
      plannedDate: new Date('2026-03-10'),
      priority: 'medium',
      status: 'planned'
    });

    await EventExpensePlan.create({
      eventId: event5._id,
      title: 'Photography',
      category: 'Services',
      estimatedAmount: 20000,
      plannedDate: new Date('2026-03-10'),
      priority: 'medium',
      status: 'planned'
    });

    // Event 6: Ongoing Event
    const event6 = await Event.create({
      name: 'Ongoing Community Health Program',
      description: 'Weekly health checkup program running for 3 months',
      location: 'Primary Health Center, Surat',
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-03-31'),
      budget: 200000,
      targetAmount: 250000,
      managerId: managerId,
      status: 'ongoing'
    });
    console.log('✓ Created Event: Ongoing Community Health Program');

    // Add some donations
    await Donation.create({
      donorName: 'Corporate Sponsor 1',
      amount: 100000,
      purpose: 'event',
      paymentMode: 'bank',
      eventId: event6._id,
      receiptNumber: `REC-${Date.now()}-13`,
      status: 'completed'
    });

    await Donation.create({
      donorName: 'Individual Donor',
      amount: 50000,
      purpose: 'event',
      paymentMode: 'upi',
      eventId: event6._id,
      receiptNumber: `REC-${Date.now()}-14`,
      status: 'completed'
    });

    // Add some expenses
    await Expense.create({
      title: 'Medical Supplies - January',
      category: 'Medical',
      amount: 35000,
      eventId: event6._id,
      approvalStatus: 'approved',
      approvedBy: managerId
    });

    await Expense.create({
      title: 'Staff Payment - January',
      category: 'Personnel',
      amount: 25000,
      eventId: event6._id,
      approvalStatus: 'approved',
      approvedBy: managerId
    });

    // Event 7: Cancelled Event
    const event7 = await Event.create({
      name: 'Cancelled Fundraising Event',
      description: 'Event that was cancelled due to unforeseen circumstances',
      location: 'City Center, Pune',
      startDate: new Date('2026-01-15'),
      endDate: new Date('2026-01-15'),
      budget: 50000,
      targetAmount: 60000,
      managerId: managerId,
      status: 'cancelled'
    });
    console.log('✓ Created Event: Cancelled Fundraising Event');

    // Event 8: Event with many items
    const event8 = await Event.create({
      name: 'Large Community Event',
      description: 'Annual community gathering with multiple requirements',
      location: 'Community Ground, Vadodara',
      startDate: new Date('2026-04-01'),
      endDate: new Date('2026-04-03'),
      budget: 300000,
      targetAmount: 400000,
      managerId: managerId,
      status: 'planned'
    });
    console.log('✓ Created Event: Large Community Event');

    // Multiple items
    const items = [
      { name: 'Tents', unitPrice: 5000, quantity: 10, amount: 50000 },
      { name: 'Chairs', unitPrice: 500, quantity: 100, amount: 50000 },
      { name: 'Tables', unitPrice: 2000, quantity: 20, amount: 40000 },
      { name: 'Sound System', unitPrice: 15000, quantity: 2, amount: 30000 },
      { name: 'Lighting', unitPrice: 10000, quantity: 3, amount: 30000 },
      { name: 'Food Items', unitPrice: 200, quantity: 500, amount: 100000 }
    ];

    for (const item of items) {
      await EventItem.create({
        eventId: event8._id,
        name: item.name,
        unitPrice: item.unitPrice,
        totalQuantity: item.quantity,
        totalAmount: item.amount,
        priority: item.amount > 50000 ? 'critical' : 'high'
      });
    }

    // Update item donations (simulate partial funding)
    const event8Items = await EventItem.find({ eventId: event8._id });
    for (let i = 0; i < event8Items.length; i++) {
      const item = event8Items[i];
      const donatedAmount = item.totalAmount * 0.3; // 30% funded
      const donatedQuantity = Math.floor(item.totalQuantity * 0.3);
      
      // Add donation for this item
      await Donation.create({
        donorName: `Donor for ${item.name}`,
        amount: donatedAmount,
        purpose: 'event',
        paymentMode: 'upi',
        eventId: event8._id,
        eventItemId: item._id,
        donationType: 'item_specific',
        itemQuantity: donatedQuantity,
        receiptNumber: `REC-${Date.now()}-${i + 15}`,
        status: 'completed'
      });

      // Update item with donation
      item.donatedAmount = donatedAmount;
      item.donatedQuantity = donatedQuantity;
      item.updateStatus();
      await item.save();
    }

    // Add general donations
    await Donation.create({
      donorName: 'Major Sponsor',
      amount: 100000,
      purpose: 'event',
      paymentMode: 'bank',
      eventId: event8._id,
      receiptNumber: `REC-${Date.now()}-21`,
      status: 'completed'
    });

    console.log('\n=== Seed Data Summary ===');
    console.log(`✓ Created ${await Event.countDocuments()} events`);
    console.log(`✓ Created ${await EventItem.countDocuments()} event items`);
    console.log(`✓ Created ${await EventExpensePlan.countDocuments()} expense plans`);
    console.log(`✓ Created ${await Donation.countDocuments({ purpose: 'event' })} event donations`);
    console.log('\n✅ Events seed data created successfully!');
    console.log('\nYou can now test:');
    console.log('- Events list with different statuses');
    console.log('- Target amount tracking');
    console.log('- Item-based donations');
    console.log('- Expense planning');
    console.log('- Analytics dashboard');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding events:', error);
    process.exit(1);
  }
};

seedEventsData();
