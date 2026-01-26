import axios from 'axios';

// API Base URL - Update this to your backend URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Request interceptor for error handling
api.interceptors.request.use(
  (config) => config,
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error
      console.error('API Error:', error.response.status, error.response.data);
    } else if (error.request) {
      // Request made but no response
      console.error('Network Error:', error.request);
    } else {
      // Something else happened
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// Public API endpoints (no auth required)
export const publicApi = {
  // Page Content
  getPageContent: async (pageId: string, language: string = 'en') => {
    const response = await api.get(`/public/pages/${pageId}/${language}`);
    return response.data;
  },

  // Durga Content
  getDurgaContent: async (durgaId?: string) => {
    const url = durgaId ? `/public/durga/${durgaId}` : '/public/durga';
    const response = await api.get(url);
    return response.data;
  },

  // Gallery
  getGallery: async (params?: { category?: string; type?: string; limit?: number }) => {
    const response = await api.get('/public/gallery', { params });
    return response.data;
  },

  // Testimonials
  getTestimonials: async (language?: string) => {
    const response = await api.get('/public/testimonials', { params: { language } });
    return response.data;
  },

  // Impact Numbers
  getImpactNumbers: async (language?: string) => {
    const response = await api.get('/public/impact', { params: { language } });
    return response.data;
  },

  // Events
  getEvents: async (params?: { upcoming?: boolean; limit?: number }) => {
    const queryParams: any = {};
    if (params?.upcoming !== undefined) {
      queryParams.upcoming = params.upcoming;
    }
    if (params?.limit) {
      queryParams.limit = params.limit;
    }
    const response = await api.get('/public/events', { params: queryParams });
    return response.data;
  },

  // Event - Get by ID (public)
  getEventById: async (eventId: string) => {
    const response = await api.get(`/public/events/${eventId}`);
    return response.data;
  },

  // Event - Get event + items for donate (public, event-based donate)
  getEventDonateItems: async (eventId: string) => {
    const response = await api.get(`/public/events/${eventId}/items`);
    return response.data;
  },

  // Site Settings
  getSiteSettings: async () => {
    const response = await api.get('/public/settings');
    return response.data;
  },

  // Contact Submission (POST)
  submitContact: async (data: {
    name: string;
    email: string;
    phone?: string;
    subject?: string;
    message: string;
  }) => {
    const response = await api.post('/public/contact/submit', data);
    return response.data;
  },

  // Volunteer Registration (POST)
  submitVolunteerRegistration: async (data: {
    name: string;
    phone: string;
    email?: string;
    city: string;
    age: number;
    occupation?: string;
    interests?: string[];
    aboutYou?: string;
  }) => {
    const response = await api.post('/public/volunteers/register', data);
    return response.data;
  },

  // Donation - Create Razorpay Order
  createDonationOrder: async (data: {
    amount: number;
    receiptNumber?: string;
    notes?: Record<string, string>;
  }) => {
    const response = await api.post('/donations/create-order', data);
    return response.data;
  },

  // Donation - Verify Razorpay Payment
  verifyDonationPayment: async (data: {
    donationData: {
      donorName: string;
      amount: number;
      purpose: 'event' | 'general' | 'emergency';
      isAnonymous?: boolean;
      eventId?: string;
      eventItemId?: string;
      itemQuantity?: number;
      donationType?: 'general' | 'item_specific' | 'expense_specific';
      donationLinkSlug?: string;
    };
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }) => {
    const response = await api.post('/donations/verify-payment', data);
    return response.data;
  },

  // Donation Link - Get by slug (public)
  getDonationLinkBySlug: async (slug: string) => {
    const response = await api.get(`/donations/links/${slug}`);
    return response.data;
  },

  // Donation Link - Get Durga donation link (public)
  getDurgaDonationLink: async (durgaId: string) => {
    const response = await api.get(`/donations/links/durga/${durgaId}`);
    return response.data;
  },

  // Donation Link - Get event + items for link (public, item-based donations)
  getDonationLinkEventItems: async (slug: string) => {
    const response = await api.get(`/donations/links/${slug}/event-items`);
    return response.data;
  },

  // Transparency - Get wallet summary
  getTransparencyWallet: async () => {
    const response = await api.get('/public/transparency/wallet');
    return response.data;
  },

  // Transparency - Get donations
  getTransparencyDonations: async (params?: {
    page?: number;
    limit?: number;
    purpose?: string;
    paymentMode?: string;
    eventId?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    const response = await api.get('/public/transparency/donations', { params });
    return response.data;
  },

  // Transparency - Get expenses
  getTransparencyExpenses: async (params?: {
    page?: number;
    limit?: number;
    category?: string;
    eventId?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    const response = await api.get('/public/transparency/expenses', { params });
    return response.data;
  },

  // Transparency - Get complete summary
  getTransparencySummary: async () => {
    const response = await api.get('/public/transparency/summary');
    return response.data;
  },
};

export default api;
