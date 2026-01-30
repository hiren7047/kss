const Member = require('../models/Member');
const { generateMemberId } = require('../utils/memberIdGenerator');
const { generateRegistrationId } = require('../utils/volunteerCredentialsGenerator');
const { generatePassword } = require('../utils/passwordGenerator');
const { createAuditLog } = require('../utils/auditLogger');
const { getPagination, createPaginationResponse } = require('../utils/pagination');
const { generateRegistrationForm } = require('../utils/pdfGenerator');
const { generateIdCard } = require('../utils/idCardGenerator');
const VolunteerPoints = require('../models/VolunteerPoints');
const { notifyMemberRegistered, notifyVolunteerRegistered } = require('../utils/notificationHelper');

/**
 * Create a new member
 */
const createMember = async (memberData, userId, ipAddress) => {
  const nameParts = [memberData.firstName];
  if (memberData.middleName) nameParts.push(memberData.middleName);
  nameParts.push(memberData.lastName);
  const fullName = nameParts.join(' ').trim();

  const isDuplicateKey = (err) => err.code === 11000 || (err.name === 'MongoServerError' && err.code === 11000);
  let member;
  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
    try {
      const memberId = await generateMemberId(Member, memberData.memberType);
      
      // Generate registration ID and password for volunteers
      let registrationId = null;
      let password = null;
      if (memberData.memberType === 'volunteer') {
        registrationId = await generateRegistrationId(Member);
        password = generatePassword();
      }
      
      member = await Member.create({
        ...memberData,
        memberId,
        name: fullName,
        registrationId,
        password
      });
      
      // Create VolunteerPoints entry for volunteers
      if (memberData.memberType === 'volunteer') {
        await VolunteerPoints.create({
          volunteerId: member._id,
          points: 0,
          verifiedPoints: 0,
          pendingPoints: 0
        });
      }
      
      break;
    } catch (err) {
      if (isDuplicateKey(err) && attempts < maxAttempts - 1) {
        attempts += 1;
        continue;
      }
      throw err;
    }
  }

  // Generate registration form PDF
  try {
    // Ensure member is a Mongoose document with all fields
    const memberDoc = await Member.findById(member._id);
    if (memberDoc) {
      const registrationFormUrl = await generateRegistrationForm(memberDoc);
      memberDoc.registrationFormUrl = registrationFormUrl;
      await memberDoc.save();
      // Update the returned member object
      member.registrationFormUrl = registrationFormUrl;
    }
  } catch (error) {
    console.error('Error generating registration form:', error);
    console.error('Error details:', error.message, error.stack);
  }

  // Generate ID card
  try {
    // Ensure member is a Mongoose document with all fields
    const memberDoc = await Member.findById(member._id);
    if (memberDoc) {
      const idCardUrl = await generateIdCard(memberDoc);
      memberDoc.idCardUrl = idCardUrl;
      await memberDoc.save();
      // Update the returned member object
      member.idCardUrl = idCardUrl;
    }
  } catch (error) {
    console.error('Error generating ID card:', error);
    console.error('Error details:', error.message, error.stack);
  }

  // Create audit log
  await createAuditLog({
    userId,
    action: 'CREATE',
    module: 'MEMBER',
    newData: member.toObject(),
    ipAddress
  });

  // Create notification for admins
  try {
    if (member.memberType === 'volunteer') {
      await notifyVolunteerRegistered(member);
    } else {
      await notifyMemberRegistered(member);
    }
  } catch (error) {
    console.error('Error creating member notification:', error);
    // Don't fail member creation if notification fails
  }

  // For volunteers, include credentials in response (only on creation)
  if (memberData.memberType === 'volunteer' && password) {
    // Convert to plain object to add credentials
    const memberObj = member.toObject();
    memberObj.volunteerCredentials = {
      registrationId: registrationId,
      password: password // Include password only on creation
    };
    // Return as plain object (not mongoose document)
    return memberObj;
  }

  return member;
};

/**
 * Create a new member (public registration - no auth required)
 */
const createMemberPublic = async (memberData, ipAddress) => {
  const nameParts = [memberData.firstName];
  if (memberData.middleName) nameParts.push(memberData.middleName);
  nameParts.push(memberData.lastName);
  const fullName = nameParts.join(' ').trim();

  const isDuplicateKey = (err) => err.code === 11000 || (err.name === 'MongoServerError' && err.code === 11000);
  let member;
  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
    try {
      const memberId = await generateMemberId(Member, memberData.memberType);
      
      // Generate registration ID and password for volunteers (even if pending)
      let registrationId = null;
      let password = null;
      if (memberData.memberType === 'volunteer') {
        registrationId = await generateRegistrationId(Member);
        password = generatePassword();
      }
      
      member = await Member.create({
        ...memberData,
        memberId,
        name: fullName,
        status: 'pending',
        approvalStatus: 'pending',
        registrationId,
        password
      });
      
      // Create VolunteerPoints entry for volunteers (even if pending approval)
      if (memberData.memberType === 'volunteer') {
        await VolunteerPoints.create({
          volunteerId: member._id,
          points: 0,
          verifiedPoints: 0,
          pendingPoints: 0
        });
      }
      
      break;
    } catch (err) {
      if (isDuplicateKey(err) && attempts < maxAttempts - 1) {
        attempts += 1;
        continue;
      }
      throw err;
    }
  }

  // Don't generate registration form or ID card until approved
  // These will be generated after admin approval

  // Create audit log with system user (public registration)
  try {
    await createAuditLog({
      userId: null, // Public registration - no user
      action: 'CREATE',
      module: 'MEMBER',
      newData: member.toObject(),
      ipAddress,
      notes: 'Public registration via web form'
    });
  } catch (error) {
    console.error('Error creating audit log:', error);
    // Don't fail registration if audit log fails
  }

  return member;
};

/**
 * Get all members with pagination and filters
 */
const getMembers = async (query) => {
  const { page, limit, skip } = getPagination(query.page, query.limit);
  const filter = { softDelete: false };

  // Apply filters
  if (query.memberType) {
    filter.memberType = query.memberType;
  }
  if (query.status) {
    filter.status = query.status;
  }
  if (query.approvalStatus) {
    filter.approvalStatus = query.approvalStatus;
  }
  if (query.search) {
    filter.$or = [
      { name: { $regex: query.search, $options: 'i' } },
      { memberId: { $regex: query.search, $options: 'i' } },
      { mobile: { $regex: query.search, $options: 'i' } },
      { email: { $regex: query.search, $options: 'i' } }
    ];
  }

  const [members, total] = await Promise.all([
    Member.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Member.countDocuments(filter)
  ]);

  return createPaginationResponse(members, total, page, limit);
};

/**
 * Get member by ID
 */
const getMemberById = async (id) => {
  const member = await Member.findOne({ _id: id, softDelete: false });
  if (!member) {
    throw new Error('Member not found');
  }
  return member;
};

/**
 * Update member
 */
const updateMember = async (id, updateData, userId, ipAddress) => {
  const member = await Member.findOne({ _id: id, softDelete: false });
  if (!member) {
    throw new Error('Member not found');
  }

  const oldData = member.toObject();
  Object.assign(member, updateData);
  await member.save();

  // Create audit log
  await createAuditLog({
    userId,
    action: 'UPDATE',
    module: 'MEMBER',
    oldData,
    newData: member.toObject(),
    ipAddress
  });

  return member;
};

/**
 * Soft delete member
 */
const deleteMember = async (id, userId, ipAddress) => {
  const member = await Member.findOne({ _id: id, softDelete: false });
  if (!member) {
    throw new Error('Member not found');
  }

  const oldData = member.toObject();
  member.softDelete = true;
  await member.save();

  // Create audit log
  await createAuditLog({
    userId,
    action: 'DELETE',
    module: 'MEMBER',
    oldData,
    newData: member.toObject(),
    ipAddress
  });

  return member;
};

/**
 * Approve a pending member registration
 */
const approveMember = async (id, userId, ipAddress) => {
  const member = await Member.findOne({ _id: id, softDelete: false });
  if (!member) {
    throw new Error('Member not found');
  }

  if (member.approvalStatus !== 'pending') {
    throw new Error(`Member is already ${member.approvalStatus}`);
  }

  const oldData = member.toObject();
  
  // Update approval status
  member.approvalStatus = 'approved';
  member.status = 'active';
  member.approvedBy = userId;
  member.approvedAt = new Date();
  
  await member.save();

  // Generate registration form PDF after approval
  try {
    const memberDoc = await Member.findById(member._id);
    if (memberDoc) {
      const registrationFormUrl = await generateRegistrationForm(memberDoc);
      memberDoc.registrationFormUrl = registrationFormUrl;
      await memberDoc.save();
      member.registrationFormUrl = registrationFormUrl;
    }
  } catch (error) {
    console.error('Error generating registration form:', error);
  }

  // Generate ID card after approval
  try {
    const memberDoc = await Member.findById(member._id);
    if (memberDoc) {
      const idCardUrl = await generateIdCard(memberDoc);
      memberDoc.idCardUrl = idCardUrl;
      await memberDoc.save();
      member.idCardUrl = idCardUrl;
    }
  } catch (error) {
    console.error('Error generating ID card:', error);
  }

  // Create audit log
  await createAuditLog({
    userId,
    action: 'APPROVE',
    module: 'MEMBER',
    oldData,
    newData: member.toObject(),
    ipAddress,
    notes: 'Member registration approved'
  });

  return member;
};

/**
 * Reject a pending member registration
 */
const rejectMember = async (id, userId, rejectionReason, ipAddress) => {
  const member = await Member.findOne({ _id: id, softDelete: false });
  if (!member) {
    throw new Error('Member not found');
  }

  if (member.approvalStatus !== 'pending') {
    throw new Error(`Member is already ${member.approvalStatus}`);
  }

  const oldData = member.toObject();
  
  // Update approval status
  member.approvalStatus = 'rejected';
  member.status = 'rejected';
  member.approvedBy = userId;
  member.approvedAt = new Date();
  member.rejectionReason = rejectionReason || 'Registration rejected by admin';
  
  await member.save();

  // Create audit log
  await createAuditLog({
    userId,
    action: 'REJECT',
    module: 'MEMBER',
    oldData,
    newData: member.toObject(),
    ipAddress,
    notes: `Member registration rejected: ${rejectionReason || 'No reason provided'}`
  });

  return member;
};

module.exports = {
  createMember,
  createMemberPublic,
  getMembers,
  getMemberById,
  updateMember,
  deleteMember,
  approveMember,
  rejectMember
};


