const mongoose = require('mongoose');
const { createAuditLog } = require('../utils/auditLogger');

// Import all models
const Member = require('../models/Member');
const Donation = require('../models/Donation');
const Expense = require('../models/Expense');
const Event = require('../models/Event');
const EventItem = require('../models/EventItem');
const EventExpensePlan = require('../models/EventExpensePlan');
const VolunteerAssignment = require('../models/VolunteerAssignment');
const VolunteerPoints = require('../models/VolunteerPoints');
const VolunteerRegistration = require('../models/VolunteerRegistration');
const VolunteerWorkSubmission = require('../models/VolunteerWorkSubmission');
const Wallet = require('../models/Wallet');
const Document = require('../models/Document');
const AuditLog = require('../models/AuditLog');
const User = require('../models/User');
const ContactSubmission = require('../models/ContactSubmission');
const ContentVersion = require('../models/ContentVersion');
const DurgaContent = require('../models/DurgaContent');
const Form = require('../models/Form');
const FormSubmission = require('../models/FormSubmission');
const GalleryItem = require('../models/GalleryItem');
const ImpactNumber = require('../models/ImpactNumber');
const PageContent = require('../models/PageContent');
const PaymentTransaction = require('../models/PaymentTransaction');
const SiteSettings = require('../models/SiteSettings');
const Testimonial = require('../models/Testimonial');
const DonationLink = require('../models/DonationLink');

/**
 * Delete all data from database (except admin users)
 * Only accessible to SUPER_ADMIN
 */
const deleteAllData = async (req, res) => {
  try {
    const userId = req.user._id;
    const ipAddress = req.ip || req.connection.remoteAddress;

    // Get counts before deletion for audit log
    const counts = {
      members: await Member.countDocuments(),
      donations: await Donation.countDocuments(),
      expenses: await Expense.countDocuments(),
      events: await Event.countDocuments(),
      eventItems: await EventItem.countDocuments(),
      eventExpensePlans: await EventExpensePlan.countDocuments(),
      volunteerAssignments: await VolunteerAssignment.countDocuments(),
      volunteerPoints: await VolunteerPoints.countDocuments(),
      volunteerRegistrations: await VolunteerRegistration.countDocuments(),
      volunteerWorkSubmissions: await VolunteerWorkSubmission.countDocuments(),
      documents: await Document.countDocuments(),
      auditLogs: await AuditLog.countDocuments(),
      contactSubmissions: await ContactSubmission.countDocuments(),
      contentVersions: await ContentVersion.countDocuments(),
      durgaContents: await DurgaContent.countDocuments(),
      forms: await Form.countDocuments(),
      formSubmissions: await FormSubmission.countDocuments(),
      galleryItems: await GalleryItem.countDocuments(),
      impactNumbers: await ImpactNumber.countDocuments(),
      pageContents: await PageContent.countDocuments(),
      paymentTransactions: await PaymentTransaction.countDocuments(),
      testimonials: await Testimonial.countDocuments(),
      donationLinks: await DonationLink.countDocuments(),
    };

    // Delete all data (using transactions for safety)
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Delete all collections (except Users - we'll handle that separately)
      await Member.deleteMany({}).session(session);
      await Donation.deleteMany({}).session(session);
      await Expense.deleteMany({}).session(session);
      await Event.deleteMany({}).session(session);
      await EventItem.deleteMany({}).session(session);
      await EventExpensePlan.deleteMany({}).session(session);
      await VolunteerAssignment.deleteMany({}).session(session);
      await VolunteerPoints.deleteMany({}).session(session);
      await VolunteerRegistration.deleteMany({}).session(session);
      await VolunteerWorkSubmission.deleteMany({}).session(session);
      await Document.deleteMany({}).session(session);
      await ContactSubmission.deleteMany({}).session(session);
      await ContentVersion.deleteMany({}).session(session);
      await DurgaContent.deleteMany({}).session(session);
      await Form.deleteMany({}).session(session);
      await FormSubmission.deleteMany({}).session(session);
      await GalleryItem.deleteMany({}).session(session);
      await ImpactNumber.deleteMany({}).session(session);
      await PageContent.deleteMany({}).session(session);
      await PaymentTransaction.deleteMany({}).session(session);
      await Testimonial.deleteMany({}).session(session);
      await DonationLink.deleteMany({}).session(session);

      // Reset Wallet to initial state
      const existingWallet = await Wallet.findOne({}).session(session);
      if (existingWallet) {
        existingWallet.availableBalance = 0;
        existingWallet.totalDonations = 0;
        existingWallet.totalExpenses = 0;
        existingWallet.restrictedFunds = 0;
        await existingWallet.save({ session });
      } else {
        await Wallet.create([{
          availableBalance: 0,
          totalDonations: 0,
          totalExpenses: 0,
          restrictedFunds: 0
        }], { session });
      }

      // Delete all users except SUPER_ADMIN users
      await User.deleteMany({ 
        role: { $ne: 'SUPER_ADMIN' } 
      }).session(session);

      // Delete all audit logs except this one (we'll create it after commit)
      await AuditLog.deleteMany({}).session(session);

      await session.commitTransaction();

      // Create audit log for this action (after commit so it's saved)
      await createAuditLog({
        userId,
        action: 'DELETE',
        module: 'DATABASE',
        oldData: counts,
        newData: { message: 'All data deleted successfully' },
        ipAddress
      });

      res.status(200).json({
        success: true,
        message: 'All data deleted successfully',
        data: {
          deletedCounts: counts,
          timestamp: new Date()
        }
      });
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  } catch (error) {
    console.error('Error deleting all data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete all data',
      error: error.message
    });
  }
};

module.exports = {
  deleteAllData
};
