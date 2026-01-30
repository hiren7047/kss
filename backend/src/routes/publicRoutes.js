const express = require('express');
const router = express.Router();
const PageContent = require('../models/PageContent');
const DurgaContent = require('../models/DurgaContent');
const GalleryItem = require('../models/GalleryItem');
const Testimonial = require('../models/Testimonial');
const ImpactNumber = require('../models/ImpactNumber');
const Event = require('../models/Event');
const EventItem = require('../models/EventItem');
const contactSubmissionService = require('../services/contactSubmissionService');
const validate = require('../validators');
const volunteerRegistrationService = require('../services/volunteerRegistrationService');
const siteSettingsService = require('../services/siteSettingsService');
const newsletterController = require('../controllers/newsletterController');
const { subscribeNewsletterSchema } = require('../validators/newsletterValidator');
const transparencyController = require('../controllers/transparencyController');
const { createContactSubmissionSchema } = require('../validators/contactSubmissionValidator');
const { createVolunteerRegistrationSchema } = require('../validators/volunteerRegistrationValidator');

/**
 * Get page content for mainsite (public)
 */
router.get('/pages/:pageId/:language', async (req, res, next) => {
  try {
    const { pageId, language } = req.params;
    const pageContent = await PageContent.findOne({
      pageId,
      language,
      status: 'published',
      softDelete: false
    });

    if (!pageContent) {
      return res.status(404).json({
        success: false,
        message: 'Page content not found'
      });
    }

    res.status(200).json({
      success: true,
      data: pageContent
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get Durga content for mainsite (public)
 */
router.get('/durga/:durgaId', async (req, res, next) => {
  try {
    const { durgaId } = req.params;
    const durgaContent = await DurgaContent.findOne({
      durgaId,
      isActive: true,
      softDelete: false
    });

    if (!durgaContent) {
      return res.status(404).json({
        success: false,
        message: 'Durga content not found'
      });
    }

    res.status(200).json({
      success: true,
      data: durgaContent
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get all Durga for mainsite (public)
 */
router.get('/durga', async (req, res, next) => {
  try {
    const durgaContents = await DurgaContent.find({
      isActive: true,
      softDelete: false
    }).sort({ order: 1 });

    res.status(200).json({
      success: true,
      data: durgaContents
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get gallery items for mainsite (public)
 */
router.get('/gallery', async (req, res, next) => {
  try {
    const { category, durgaId, eventId, type, limit = 50 } = req.query;
    const filter = {
      softDelete: false
    };

    if (category && category !== 'all') {
      filter.category = category;
    }
    if (durgaId) {
      filter.durgaId = durgaId;
    }
    if (eventId) {
      filter.eventId = eventId;
    }
    if (type) {
      filter.type = type;
    }

    const galleryItems = await GalleryItem.find(filter)
      .sort({ displayOrder: 1, createdAt: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: galleryItems
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get testimonials for mainsite (public)
 */
router.get('/testimonials', async (req, res, next) => {
  try {
    const { language, limit = 10 } = req.query;
    const filter = {
      isActive: true,
      softDelete: false
    };

    if (language) {
      filter.language = language;
    }

    const testimonials = await Testimonial.find(filter)
      .sort({ displayOrder: 1, createdAt: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: testimonials
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get impact numbers for mainsite (public)
 */
router.get('/impact', async (req, res, next) => {
  try {
    const { language } = req.query;
    const filter = {
      isActive: true
    };

    if (language) {
      filter.language = language;
    }

    const impactNumbers = await ImpactNumber.find(filter)
      .sort({ displayOrder: 1 });

    res.status(200).json({
      success: true,
      data: impactNumbers
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get public events for mainsite
 */
router.get('/events', async (req, res, next) => {
  try {
    const { upcoming, limit = 100 } = req.query;
    const now = new Date();
    const filter = {
      softDelete: false
    };

    // Filter events based on upcoming parameter
    if (upcoming === 'true' || upcoming === true) {
      // Upcoming events: startDate is in the future or event is ongoing
      filter.$or = [
        { startDate: { $gte: now } },
        { 
          startDate: { $lte: now },
          endDate: { $gte: now },
          status: 'ongoing'
        }
      ];
      // Exclude cancelled events from upcoming
      filter.status = { $ne: 'cancelled' };
    } else if (upcoming === 'false' || upcoming === false) {
      // Past events: endDate is in the past
      filter.endDate = { $lt: now };
      // Include completed and cancelled, but exclude ongoing
      filter.status = { $in: ['completed', 'cancelled'] };
    }
    // If upcoming is not specified, show all events

    const events = await Event.find(filter)
      .populate('managerId', 'name email')
      .sort(upcoming === 'true' || upcoming === true ? { startDate: 1 } : { endDate: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: events
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get single event for mainsite (public)
 */
router.get('/events/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const event = await Event.findOne({
      _id: id,
      softDelete: false
    }).populate('managerId', 'name email');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.status(200).json({
      success: true,
      data: event
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get event + items for event-based donate (public)
 * Used by /donate/event/:id – same shape as donation-link event-items.
 */
router.get('/events/:id/items', async (req, res, next) => {
  try {
    const { id } = req.params;
    const event = await Event.findOne({ _id: id, softDelete: false }).select('name _id');
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    const items = await EventItem.find({ eventId: id, softDelete: false })
      .sort({ createdAt: -1 })
      .limit(100)
      .select('name description unitPrice totalQuantity donatedQuantity totalAmount donatedAmount status')
      .lean();
    res.status(200).json({
      success: true,
      data: {
        event: { _id: event._id, name: event.name },
        items
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get public site settings
 */
router.get('/settings', async (req, res, next) => {
  try {
    const settings = await siteSettingsService.getPublicSettings();
    res.status(200).json({
      success: true,
      data: settings
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Submit contact form (public)
 */
router.post('/contact/submit', validate(createContactSubmissionSchema), async (req, res, next) => {
  try {
    const contactSubmission = await contactSubmissionService.createContactSubmission(req.body);
    res.status(201).json({
      success: true,
      message: 'Contact submission received successfully',
      data: contactSubmission
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Newsletter subscribe (public)
 */
router.post(
  '/newsletter/subscribe',
  validate(subscribeNewsletterSchema),
  newsletterController.subscribe
);

/**
 * Newsletter unsubscribe (public)
 */
router.get('/newsletter/unsubscribe/:token', newsletterController.unsubscribe);

/**
 * Submit volunteer registration (public)
 */
router.post('/volunteers/register', validate(createVolunteerRegistrationSchema), async (req, res, next) => {
  try {
    const volunteerRegistration = await volunteerRegistrationService.createVolunteerRegistration(req.body);
    res.status(201).json({
      success: true,
      message: 'Volunteer registration submitted successfully',
      data: volunteerRegistration
    });
  } catch (error) {
    next(error);
  }
});

/**
 * TRANSPARENCY ROUTES - Public financial transparency
 */

/**
 * Get public wallet summary (balance, totals)
 */
router.get('/transparency/wallet', transparencyController.getPublicWalletSummary);

/**
 * Get public donations list
 */
router.get('/transparency/donations', transparencyController.getPublicDonations);

/**
 * Get public expenses list
 */
router.get('/transparency/expenses', transparencyController.getPublicExpenses);

/**
 * Get complete transparency summary (wallet + statistics + trends)
 */
router.get('/transparency/summary', transparencyController.getTransparencySummary);

module.exports = router;
