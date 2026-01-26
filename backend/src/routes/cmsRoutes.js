const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middlewares/auth');
const validate = require('../validators');

// Page Content Routes
const pageContentController = require('../controllers/pageContentController');
const {
  createPageContentSchema,
  updatePageContentSchema,
  publishPageContentSchema
} = require('../validators/pageContentValidator');

router.post(
  '/pages',
  authenticate,
  authorize('CONTENT_CREATE'),
  validate(createPageContentSchema),
  pageContentController.createPageContent
);

router.get(
  '/pages',
  authenticate,
  authorize('CONTENT_READ'),
  pageContentController.getPageContents
);

router.get(
  '/pages/:pageId/:language',
  authenticate,
  authorize('CONTENT_READ'),
  pageContentController.getPageContent
);

router.put(
  '/pages/:pageId/:language',
  authenticate,
  authorize('CONTENT_UPDATE'),
  validate(updatePageContentSchema),
  pageContentController.updatePageContent
);

router.put(
  '/pages/:pageId/:language/publish',
  authenticate,
  authorize('CONTENT_PUBLISH'),
  validate(publishPageContentSchema),
  pageContentController.publishPageContent
);

router.delete(
  '/pages/:pageId/:language',
  authenticate,
  authorize('CONTENT_DELETE'),
  pageContentController.deletePageContent
);

router.get(
  '/pages/:pageId/:language/versions',
  authenticate,
  authorize('CONTENT_READ'),
  pageContentController.getVersionHistory
);

router.post(
  '/pages/:pageId/:language/revert',
  authenticate,
  authorize('CONTENT_UPDATE'),
  pageContentController.revertToVersion
);

// Durga Content Routes
const durgaContentController = require('../controllers/durgaContentController');
const {
  createDurgaContentSchema,
  updateDurgaContentSchema
} = require('../validators/durgaContentValidator');

router.post(
  '/durga',
  authenticate,
  authorize('CONTENT_CREATE'),
  validate(createDurgaContentSchema),
  durgaContentController.createDurgaContent
);

router.get(
  '/durga',
  authenticate,
  authorize('CONTENT_READ'),
  durgaContentController.getDurgaContents
);

router.get(
  '/durga/:durgaId',
  authenticate,
  authorize('CONTENT_READ'),
  durgaContentController.getDurgaContent
);

router.put(
  '/durga/:durgaId',
  authenticate,
  authorize('CONTENT_UPDATE'),
  validate(updateDurgaContentSchema),
  durgaContentController.updateDurgaContent
);

router.delete(
  '/durga/:durgaId',
  authenticate,
  authorize('CONTENT_DELETE'),
  durgaContentController.deleteDurgaContent
);

// Gallery Routes
const galleryController = require('../controllers/galleryController');
const {
  createGalleryItemSchema,
  updateGalleryItemSchema
} = require('../validators/galleryValidator');

router.post(
  '/gallery',
  authenticate,
  authorize('GALLERY_CREATE'),
  validate(createGalleryItemSchema),
  galleryController.createGalleryItem
);

router.get(
  '/gallery',
  authenticate,
  authorize('GALLERY_READ'),
  galleryController.getGalleryItems
);

router.get(
  '/gallery/:id',
  authenticate,
  authorize('GALLERY_READ'),
  galleryController.getGalleryItem
);

router.put(
  '/gallery/:id',
  authenticate,
  authorize('GALLERY_UPDATE'),
  validate(updateGalleryItemSchema),
  galleryController.updateGalleryItem
);

router.delete(
  '/gallery/:id',
  authenticate,
  authorize('GALLERY_DELETE'),
  galleryController.deleteGalleryItem
);

// Testimonial Routes
const testimonialController = require('../controllers/testimonialController');
const {
  createTestimonialSchema,
  updateTestimonialSchema,
  approveTestimonialSchema
} = require('../validators/testimonialValidator');

router.post(
  '/testimonials',
  authenticate,
  authorize('TESTIMONIAL_CREATE'),
  validate(createTestimonialSchema),
  testimonialController.createTestimonial
);

router.get(
  '/testimonials',
  authenticate,
  authorize('TESTIMONIAL_READ'),
  testimonialController.getTestimonials
);

router.get(
  '/testimonials/:id',
  authenticate,
  authorize('TESTIMONIAL_READ'),
  testimonialController.getTestimonial
);

router.put(
  '/testimonials/:id',
  authenticate,
  authorize('TESTIMONIAL_UPDATE'),
  validate(updateTestimonialSchema),
  testimonialController.updateTestimonial
);

router.put(
  '/testimonials/:id/approve',
  authenticate,
  authorize('TESTIMONIAL_APPROVE'),
  validate(approveTestimonialSchema),
  testimonialController.approveTestimonial
);

router.delete(
  '/testimonials/:id',
  authenticate,
  authorize('TESTIMONIAL_DELETE'),
  testimonialController.deleteTestimonial
);

// Impact Numbers Routes
const impactController = require('../controllers/impactController');
const {
  updateImpactNumberSchema,
  bulkUpdateImpactSchema
} = require('../validators/impactValidator');

router.get(
  '/impact',
  authenticate,
  authorize('CONTENT_READ'),
  impactController.getImpactNumbers
);

router.put(
  '/impact/:id',
  authenticate,
  authorize('CONTENT_UPDATE'),
  validate(updateImpactNumberSchema),
  impactController.updateImpactNumber
);

router.put(
  '/impact',
  authenticate,
  authorize('CONTENT_UPDATE'),
  validate(bulkUpdateImpactSchema),
  impactController.bulkUpdateImpactNumbers
);

// Site Settings Routes
const siteSettingsController = require('../controllers/siteSettingsController');
const { updateSiteSettingsSchema } = require('../validators/siteSettingsValidator');

router.get(
  '/settings',
  authenticate,
  authorize('SETTINGS_READ'),
  siteSettingsController.getSettings
);

router.put(
  '/settings',
  authenticate,
  authorize('SETTINGS_UPDATE'),
  validate(updateSiteSettingsSchema),
  siteSettingsController.updateSettings
);

// Contact Submissions Routes
const contactSubmissionController = require('../controllers/contactSubmissionController');
const {
  createContactSubmissionSchema,
  updateContactSubmissionSchema,
  replyContactSubmissionSchema
} = require('../validators/contactSubmissionValidator');

// Public route - no auth required
router.post(
  '/contact/submissions',
  validate(createContactSubmissionSchema),
  contactSubmissionController.createContactSubmission
);

router.get(
  '/contact/submissions',
  authenticate,
  authorize('CONTACT_READ'),
  contactSubmissionController.getContactSubmissions
);

router.get(
  '/contact/submissions/:id',
  authenticate,
  authorize('CONTACT_READ'),
  contactSubmissionController.getContactSubmission
);

router.put(
  '/contact/submissions/:id/status',
  authenticate,
  authorize('CONTACT_READ'),
  validate(updateContactSubmissionSchema),
  contactSubmissionController.updateContactSubmissionStatus
);

router.post(
  '/contact/submissions/:id/reply',
  authenticate,
  authorize('CONTACT_REPLY'),
  validate(replyContactSubmissionSchema),
  contactSubmissionController.replyToSubmission
);

router.delete(
  '/contact/submissions/:id',
  authenticate,
  authorize('CONTACT_DELETE'),
  contactSubmissionController.deleteContactSubmission
);

// Volunteer Registration Routes
const volunteerRegistrationController = require('../controllers/volunteerRegistrationController');
const {
  createVolunteerRegistrationSchema,
  updateVolunteerRegistrationSchema
} = require('../validators/volunteerRegistrationValidator');

// Public route - no auth required
router.post(
  '/volunteers/registrations',
  validate(createVolunteerRegistrationSchema),
  volunteerRegistrationController.createVolunteerRegistration
);

router.get(
  '/volunteers/registrations',
  authenticate,
  authorize('VOLUNTEER_REG_READ'),
  volunteerRegistrationController.getVolunteerRegistrations
);

router.get(
  '/volunteers/registrations/:id',
  authenticate,
  authorize('VOLUNTEER_REG_READ'),
  volunteerRegistrationController.getVolunteerRegistration
);

router.put(
  '/volunteers/registrations/:id',
  authenticate,
  authorize('VOLUNTEER_REG_UPDATE'),
  validate(updateVolunteerRegistrationSchema),
  volunteerRegistrationController.updateVolunteerRegistration
);

router.delete(
  '/volunteers/registrations/:id',
  authenticate,
  authorize('VOLUNTEER_REG_DELETE'),
  volunteerRegistrationController.deleteVolunteerRegistration
);

module.exports = router;
