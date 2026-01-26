const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const memberController = require('../controllers/memberController');
const { authenticate, authorize } = require('../middlewares/auth');
const validate = require('../validators');
const { createMemberSchema, updateMemberSchema } = require('../validators/memberValidator');
const { uploadDir, maxFileSize } = require('../config/env');
const memberService = require('../services/memberService');
const { rateLimit } = require('express-rate-limit');

// Configure multer for member photo upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'member-photo-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: maxFileSize },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images are allowed.'));
    }
  }
});

// Rate limiter for public registration (more lenient)
const publicRegistrationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 registrations per 15 minutes per IP
  message: {
    success: false,
    message: 'Too many registration attempts. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// POST /members/upload-photo (authenticated)
router.post(
  '/upload-photo',
  authenticate,
  authorize('MEMBER_CREATE'),
  upload.single('photo'),
  (req, res, next) => {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    res.json({
      success: true,
      data: {
        photoUrl: `/uploads/${req.file.filename}`,
        filename: req.file.filename
      }
    });
  }
);

// POST /members/public/upload-photo (public - no auth required)
router.post(
  '/public/upload-photo',
  upload.single('photo'),
  (req, res, next) => {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    res.json({
      success: true,
      data: {
        photoUrl: `/uploads/${req.file.filename}`,
        filename: req.file.filename
      }
    });
  }
);

// POST /members/public/register (public registration - no auth required)
router.post(
  '/public/register',
  publicRegistrationLimiter,
  validate(createMemberSchema),
  async (req, res, next) => {
    try {
      const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
      // Create member without userId (public registration)
      const member = await memberService.createMemberPublic(req.body, ipAddress);

      res.status(201).json({
        success: true,
        message: 'Registration submitted successfully! Your registration is pending admin approval.',
        data: {
          memberId: member.memberId,
          name: member.name,
          memberType: member.memberType,
          approvalStatus: member.approvalStatus,
          status: member.status
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /members
router.post(
  '/',
  authenticate,
  authorize('MEMBER_CREATE'),
  validate(createMemberSchema),
  memberController.createMember
);

// GET /members
router.get(
  '/',
  authenticate,
  authorize('MEMBER_READ'),
  memberController.getMembers
);

// GET /members/:id/registration-form (must come before /:id route)
router.get(
  '/:id/registration-form',
  authenticate,
  authorize('MEMBER_READ'),
  async (req, res, next) => {
    try {
      const Member = require('../models/Member');
      const { generateRegistrationForm } = require('../utils/pdfGenerator');
      
      // Try to find by _id first, then by memberId
      let member = await Member.findById(req.params.id);
      if (!member) {
        member = await Member.findOne({ memberId: req.params.id, softDelete: false });
      }
      if (!member) {
        return res.status(404).json({ success: false, message: 'Member not found' });
      }

      // If registration form doesn't exist, generate it
      if (!member.registrationFormUrl) {
        try {
          // Ensure member has required fields
          if (!member.firstName || !member.lastName) {
            return res.status(400).json({ 
              success: false, 
              message: 'Member data incomplete. First name and last name are required.' 
            });
          }
          
          const registrationFormUrl = await generateRegistrationForm(member);
          member.registrationFormUrl = registrationFormUrl;
          await member.save();
        } catch (error) {
          console.error('Error generating registration form:', error);
          console.error('Error stack:', error.stack);
          console.error('Member data:', {
            id: member._id,
            memberId: member.memberId,
            firstName: member.firstName,
            lastName: member.lastName
          });
          return res.status(500).json({ 
            success: false, 
            message: 'Failed to generate registration form',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
          });
        }
      }

      const filePath = path.join(uploadDir, path.basename(member.registrationFormUrl));
      if (!fs.existsSync(filePath)) {
        // Try to regenerate if file doesn't exist
        try {
          const registrationFormUrl = await generateRegistrationForm(member);
          member.registrationFormUrl = registrationFormUrl;
          await member.save();
          const newFilePath = path.join(uploadDir, path.basename(registrationFormUrl));
          if (fs.existsSync(newFilePath)) {
            return res.download(newFilePath, `registration_${member.memberId}.pdf`);
          }
        } catch (error) {
          console.error('Error regenerating registration form:', error);
        }
        return res.status(404).json({ success: false, message: 'File not found' });
      }
      res.download(filePath, `registration_${member.memberId}.pdf`);
    } catch (error) {
      next(error);
    }
  }
);

// GET /members/:id/id-card (must come before /:id route)
router.get(
  '/:id/id-card',
  authenticate,
  authorize('MEMBER_READ'),
  async (req, res, next) => {
    try {
      const Member = require('../models/Member');
      const { generateIdCard } = require('../utils/idCardGenerator');
      
      // Try to find by _id first, then by memberId
      let member = await Member.findById(req.params.id);
      if (!member) {
        member = await Member.findOne({ memberId: req.params.id, softDelete: false });
      }
      if (!member) {
        return res.status(404).json({ success: false, message: 'Member not found' });
      }

      // If ID card doesn't exist, generate it
      if (!member.idCardUrl) {
        try {
          const idCardUrl = await generateIdCard(member);
          member.idCardUrl = idCardUrl;
          await member.save();
        } catch (error) {
          console.error('Error generating ID card:', error);
          return res.status(500).json({ success: false, message: 'Failed to generate ID card' });
        }
      }

      const filePath = path.join(uploadDir, path.basename(member.idCardUrl));
      if (!fs.existsSync(filePath)) {
        // Try to regenerate if file doesn't exist
        try {
          const idCardUrl = await generateIdCard(member);
          member.idCardUrl = idCardUrl;
          await member.save();
          const newFilePath = path.join(uploadDir, path.basename(idCardUrl));
          if (fs.existsSync(newFilePath)) {
            return res.download(newFilePath, `idcard_${member.memberId}.pdf`);
          }
        } catch (error) {
          console.error('Error regenerating ID card:', error);
        }
        return res.status(404).json({ success: false, message: 'File not found' });
      }
      res.download(filePath, `idcard_${member.memberId}.pdf`);
    } catch (error) {
      next(error);
    }
  }
);

// GET /members/:id
router.get(
  '/:id',
  authenticate,
  authorize('MEMBER_READ'),
  memberController.getMemberById
);

// PUT /members/:id
router.put(
  '/:id',
  authenticate,
  authorize('MEMBER_UPDATE'),
  validate(updateMemberSchema),
  memberController.updateMember
);

// DELETE /members/:id
router.delete(
  '/:id',
  authenticate,
  authorize('MEMBER_DELETE'),
  memberController.deleteMember
);

// POST /members/:id/approve
router.post(
  '/:id/approve',
  authenticate,
  authorize('MEMBER_UPDATE'),
  memberController.approveMember
);

// POST /members/:id/reject
router.post(
  '/:id/reject',
  authenticate,
  authorize('MEMBER_UPDATE'),
  memberController.rejectMember
);

module.exports = router;


