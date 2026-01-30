require('dotenv').config();
const mongoose = require('mongoose');
const WhatsAppMessageTemplate = require('../models/WhatsAppMessageTemplate');
const User = require('../models/User');
const { mongodbUri } = require('../config/env');

/**
 * Seed WhatsApp message templates with test data
 */
const seedWhatsAppTemplates = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(mongodbUri);
    console.log('Connected to MongoDB');

    // Get admin user for createdBy
    const adminUser = await User.findOne({ role: 'SUPER_ADMIN' });
    if (!adminUser) {
      console.error('No admin user found. Please create an admin user first.');
      process.exit(1);
    }

    // Check if templates already exist
    const existingTemplates = await WhatsAppMessageTemplate.countDocuments({ softDelete: false });
    if (existingTemplates > 0) {
      console.log(`${existingTemplates} templates already exist. Skipping seed.`);
      console.log('To re-seed, delete existing templates first.');
      process.exit(0);
    }

    // Test templates
    const templates = [
      {
        name: 'donation_thank_you',
        title: 'Thank You for Your Donation',
        message: 'Dear {{name}},\n\nThank you for your generous donation of ₹{{amount}} to KSS - Krishna Sada Sahayate.\n\nYour contribution helps us make a positive impact in our community.\n\nReceipt Number: {{receiptNumber}}\n\nWith gratitude,\nKSS Team',
        description: 'Template for thanking donors after donation',
        status: 'active',
        variables: ['name', 'amount', 'receiptNumber'],
        createdBy: adminUser._id
      },
      {
        name: 'event_invitation',
        title: 'Event Invitation',
        message: 'Hello {{name}},\n\nYou are cordially invited to our upcoming event:\n\nEvent: {{eventName}}\nDate: {{eventDate}}\nTime: {{eventTime}}\nVenue: {{eventVenue}}\n\nWe look forward to your presence!\n\nKSS Team',
        description: 'Template for inviting members to events',
        status: 'active',
        variables: ['name', 'eventName', 'eventDate', 'eventTime', 'eventVenue'],
        createdBy: adminUser._id
      },
      {
        name: 'volunteer_appreciation',
        title: 'Volunteer Appreciation',
        message: 'Dear {{name}},\n\nWe want to express our heartfelt gratitude for your dedication and service as a volunteer.\n\nYour efforts have made a significant difference in our community.\n\nThank you for being part of KSS!\n\nWith appreciation,\nKSS Team',
        description: 'Template for appreciating volunteers',
        status: 'active',
        variables: ['name'],
        createdBy: adminUser._id
      },
      {
        name: 'member_welcome',
        title: 'Welcome New Member',
        message: 'Welcome {{name}}!\n\nThank you for joining KSS - Krishna Sada Sahayate.\n\nYour Member ID: {{memberId}}\n\nWe are excited to have you as part of our community. Together, we can make a positive impact!\n\nBest regards,\nKSS Team',
        description: 'Template for welcoming new members',
        status: 'active',
        variables: ['name', 'memberId'],
        createdBy: adminUser._id
      },
      {
        name: 'event_reminder',
        title: 'Event Reminder',
        message: 'Hello {{name}},\n\nThis is a reminder about the upcoming event:\n\nEvent: {{eventName}}\nDate: {{eventDate}}\nTime: {{eventTime}}\nVenue: {{eventVenue}}\n\nPlease confirm your attendance.\n\nSee you there!\n\nKSS Team',
        description: 'Template for reminding members about events',
        status: 'active',
        variables: ['name', 'eventName', 'eventDate', 'eventTime', 'eventVenue'],
        createdBy: adminUser._id
      },
      {
        name: 'donation_receipt',
        title: 'Donation Receipt',
        message: 'Dear {{name}},\n\nReceipt for your donation:\n\nAmount: ₹{{amount}}\nReceipt Number: {{receiptNumber}}\nDate: {{donationDate}}\nPayment Mode: {{paymentMode}}\n\nThank you for your support!\n\nKSS - Krishna Sada Sahayate',
        description: 'Template for sending donation receipts',
        status: 'active',
        variables: ['name', 'amount', 'receiptNumber', 'donationDate', 'paymentMode'],
        createdBy: adminUser._id
      },
      {
        name: 'general_announcement',
        title: 'General Announcement',
        message: 'Hello {{name}},\n\n{{announcement}}\n\nFor more information, please contact us.\n\nKSS Team',
        description: 'Template for general announcements',
        status: 'active',
        variables: ['name', 'announcement'],
        createdBy: adminUser._id
      },
      {
        name: 'volunteer_assignment',
        title: 'Volunteer Assignment',
        message: 'Hello {{name}},\n\nYou have been assigned as a volunteer for:\n\nEvent: {{eventName}}\nDate: {{eventDate}}\nRole: {{role}}\n\nPlease confirm your availability.\n\nThank you!\n\nKSS Team',
        description: 'Template for assigning volunteers to events',
        status: 'active',
        variables: ['name', 'eventName', 'eventDate', 'role'],
        createdBy: adminUser._id
      }
    ];

    // Insert templates
    const createdTemplates = await WhatsAppMessageTemplate.insertMany(templates);
    console.log(`✅ Successfully created ${createdTemplates.length} WhatsApp message templates:`);
    
    createdTemplates.forEach((template, index) => {
      console.log(`  ${index + 1}. ${template.name} - ${template.title}`);
    });

    console.log('\n✨ WhatsApp templates seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding WhatsApp templates:', error);
    process.exit(1);
  }
};

// Run seed
if (require.main === module) {
  seedWhatsAppTemplates();
}

module.exports = { seedWhatsAppTemplates };
