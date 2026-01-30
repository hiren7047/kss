const notificationService = require('../services/notificationService');
const Wallet = require('../models/Wallet');

/**
 * Create notification for new donation
 */
const notifyDonationReceived = async (donation) => {
  const title = 'New Donation Received';
  const message = `₹${donation.amount.toLocaleString('en-IN')} received from ${donation.donorName}`;
  
  await notificationService.createNotificationForAdmins({
    type: 'DONATION_RECEIVED',
    title,
    message,
    relatedId: donation._id,
    relatedType: 'DONATION',
    priority: 'high',
    metadata: {
      amount: donation.amount,
      donorName: donation.donorName,
      paymentMode: donation.paymentMode
    }
  });
};

/**
 * Create notification for expense pending approval
 */
const notifyExpensePending = async (expense) => {
  const title = 'Expense Pending Approval';
  const message = `${expense.title} - ₹${expense.amount.toLocaleString('en-IN')} requires approval`;
  
  await notificationService.createNotificationForAdmins({
    type: 'EXPENSE_PENDING',
    title,
    message,
    relatedId: expense._id,
    relatedType: 'EXPENSE',
    priority: 'high',
    metadata: {
      amount: expense.amount,
      title: expense.title,
      category: expense.category
    }
  }, ['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT']);
};

/**
 * Create notification for expense approved/rejected
 */
const notifyExpenseStatus = async (expense, status, userId) => {
  const title = status === 'approved' 
    ? 'Expense Approved' 
    : 'Expense Rejected';
  const message = `${expense.title} has been ${status}`;
  
  // Notify the user who submitted the expense
  if (expense.submittedBy) {
    await notificationService.createNotificationForUser(expense.submittedBy, {
      type: status === 'approved' ? 'EXPENSE_APPROVED' : 'EXPENSE_REJECTED',
      title,
      message,
      relatedId: expense._id,
      relatedType: 'EXPENSE',
      priority: 'medium',
      metadata: {
        amount: expense.amount,
        title: expense.title
      }
    });
  }
};

/**
 * Create notification for new member registration
 */
const notifyMemberRegistered = async (member) => {
  const title = 'New Member Registered';
  const message = `${member.firstName} ${member.lastName} registered as ${member.memberType}`;
  
  await notificationService.createNotificationForAdmins({
    type: 'MEMBER_REGISTERED',
    title,
    message,
    relatedId: member._id,
    relatedType: 'MEMBER',
    priority: 'medium',
    metadata: {
      memberId: member.memberId,
      memberType: member.memberType,
      name: `${member.firstName} ${member.lastName}`
    }
  });
};

/**
 * Create notification for new volunteer registration
 */
const notifyVolunteerRegistered = async (volunteer) => {
  const title = 'New Volunteer Registered';
  const message = `New volunteer ${volunteer.name || volunteer.firstName} has registered`;
  
  await notificationService.createNotificationForAdmins({
    type: 'VOLUNTEER_REGISTERED',
    title,
    message,
    relatedId: volunteer._id,
    relatedType: 'VOLUNTEER',
    priority: 'medium',
    metadata: {
      name: volunteer.name || `${volunteer.firstName} ${volunteer.lastName}`
    }
  }, ['SUPER_ADMIN', 'ADMIN', 'VOLUNTEER_MANAGER']);
};

/**
 * Create notification for new event created
 */
const notifyEventCreated = async (event) => {
  const title = 'New Event Created';
  const message = `Event "${event.name}" has been created`;
  
  await notificationService.createNotificationForAdmins({
    type: 'EVENT_CREATED',
    title,
    message,
    relatedId: event._id,
    relatedType: 'EVENT',
    priority: 'medium',
    metadata: {
      eventName: event.name,
      startDate: event.startDate
    }
  });
};

/**
 * Create notification for low wallet balance
 */
const notifyLowWalletBalance = async (threshold = 10000) => {
  const wallet = await Wallet.getWallet();
  
  if (wallet.availableBalance < threshold) {
    const title = 'Low Wallet Balance Alert';
    const message = `Wallet balance is low: ₹${wallet.availableBalance.toLocaleString('en-IN')}`;
    
    await notificationService.createNotificationForAdmins({
      type: 'LOW_WALLET_BALANCE',
      title,
      message,
      relatedType: null,
      priority: 'urgent',
      metadata: {
        balance: wallet.availableBalance,
        threshold
      }
    });
  }
};

/**
 * Create notification for form submission
 */
const notifyFormSubmission = async (formSubmission, form) => {
  const title = 'New Form Submission';
  const message = `New submission received for "${form.title}"`;
  
  await notificationService.createNotificationForAdmins({
    type: 'FORM_SUBMISSION',
    title,
    message,
    relatedId: formSubmission._id,
    relatedType: 'FORM',
    priority: 'medium',
    metadata: {
      formTitle: form.title,
      formId: form._id
    }
  });
};

/**
 * Create notification for volunteer work submission
 */
const notifyVolunteerWorkSubmitted = async (workSubmission) => {
  const title = 'Volunteer Work Submitted';
  const message = `New volunteer work submission requires review`;
  
  await notificationService.createNotificationForAdmins({
    type: 'VOLUNTEER_WORK_SUBMITTED',
    title,
    message,
    relatedId: workSubmission._id,
    relatedType: 'VOLUNTEER',
    priority: 'medium',
    metadata: {
      volunteerId: workSubmission.volunteerId
    }
  }, ['SUPER_ADMIN', 'ADMIN', 'VOLUNTEER_MANAGER']);
};

/**
 * Create notification for contact submission
 */
const notifyContactSubmission = async (contactSubmission) => {
  const title = 'New Contact Form Submission';
  const message = `New message from ${contactSubmission.name || contactSubmission.email}`;
  
  await notificationService.createNotificationForAdmins({
    type: 'CONTACT_SUBMISSION',
    title,
    message,
    relatedId: contactSubmission._id,
    relatedType: 'CONTACT',
    priority: 'medium',
    metadata: {
      name: contactSubmission.name,
      email: contactSubmission.email
    }
  }, ['SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER']);
};

module.exports = {
  notifyDonationReceived,
  notifyExpensePending,
  notifyExpenseStatus,
  notifyMemberRegistered,
  notifyVolunteerRegistered,
  notifyEventCreated,
  notifyLowWalletBalance,
  notifyFormSubmission,
  notifyVolunteerWorkSubmitted,
  notifyContactSubmission
};
