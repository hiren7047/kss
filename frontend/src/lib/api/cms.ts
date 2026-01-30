import api from '../api';

// ==================== Types ====================

export interface PageContent {
  _id?: string;
  pageId: 'home' | 'about' | 'contact' | 'donate' | 'volunteer' | 'durga' | 'events' | 'gallery';
  language: 'en' | 'gu' | 'hi';
  sections: PageSection[];
  metaTags: {
    title?: string;
    description?: string;
    keywords?: string;
    ogImage?: string;
  };
  status: 'draft' | 'published' | 'archived';
  publishedAt?: string;
  publishedBy?: string;
  version: number;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PageSection {
  sectionId: string;
  title?: string;
  subtitle?: string;
  content?: string;
  imageUrl?: string;
  order: number;
  isActive: boolean;
}

export interface DurgaContent {
  _id?: string;
  durgaId: 'saraswati' | 'annapurna' | 'ganga' | 'kali' | 'lakshmi';
  language: 'en' | 'gu' | 'hi';
  name: string;
  nameGujarati?: string;
  meaning?: string;
  meaningGujarati?: string;
  description?: string;
  descriptionLong?: string;
  imageUrl?: string;
  color?: string;
  activities: string[];
  activitiesDetailed: {
    name: string;
    description?: string;
  }[];
  impactNumbers: {
    label: string;
    value: number;
    suffix?: string;
  }[];
  isActive: boolean;
  order: number;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface GalleryItem {
  _id?: string;
  title: string;
  description?: string;
  type: 'photo' | 'video';
  fileUrl: string;
  thumbnailUrl?: string;
  category: 'annapurna' | 'ganga' | 'kali' | 'saraswati' | 'events' | 'general';
  durgaId?: string;
  eventId?: string;
  tags?: string[];
  isFeatured: boolean;
  displayOrder: number;
  uploadedBy?: string;
  views?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Testimonial {
  _id?: string;
  quote: string;
  name: string;
  role: string;
  language: 'en' | 'gu' | 'hi';
  photo?: string;
  isActive: boolean;
  displayOrder: number;
  approvedBy?: string;
  approvedAt?: string;
  createdBy?: string;
  createdAt?: string;
}

export interface ImpactNumber {
  _id?: string;
  label: string;
  value: number;
  suffix?: string;
  icon?: string;
  language: 'en' | 'gu' | 'hi';
  isActive: boolean;
  displayOrder: number;
  updatedBy?: string;
  updatedAt?: string;
}

export interface SiteSettings {
  _id?: string;
  organizationName: {
    en?: string;
    gu?: string;
    hi?: string;
  };
  tagline: {
    en?: string;
    gu?: string;
    hi?: string;
  };
  contactInfo: {
    phone?: string;
    whatsapp?: string;
    email?: string;
    address: {
      en?: string;
      gu?: string;
      hi?: string;
    };
    officeHours: {
      monSat?: string;
      sunday?: string;
    };
    mapEmbedUrl?: string;
  };
  socialMedia: {
    facebook?: string;
    instagram?: string;
    youtube?: string;
    twitter?: string;
    whatsappCommunity?: string;
    telegram?: string;
    linkedin?: string;
  };
  paymentInfo: {
    upiId?: string;
    bankAccount?: string;
    bankName?: string;
    ifscCode?: string;
    taxInfo?: string;
  };
  donationAmounts?: number[];
  governance?: {
    governingBody?: {
      name?: string;
      designation?: string;
      photoUrl?: string;
      bio?: string;
      order?: number;
      isActive?: boolean;
    }[];
    signatories?: {
      name?: string;
      designation?: string;
      signatureImageUrl?: string;
      stampImageUrl?: string;
      useForDonationReceipt?: boolean;
      useFor80GCertificate?: boolean;
      useForVolunteerCertificate?: boolean;
      useForAppreciationLetter?: boolean;
      _id?: string;
    }[];
    defaults?: {
      donationReceiptSignatoryId?: string | null;
      eightyGSignatoryId?: string | null;
      volunteerCertificateSignatoryId?: string | null;
      appreciationLetterSignatoryId?: string | null;
    };
  };
  branding?: {
    logos?: {
      primaryLogoUrl?: string;
      secondaryLogoUrl?: string;
      emblemUrl?: string;
    };
    colors?: {
      primaryColor?: string;
      secondaryColor?: string;
      accentColor?: string;
      backgroundColor?: string;
    };
    media?: {
      defaultHeroImageUrl?: string;
    };
  };
  financeSettings?: {
    receiptNumbering?: {
      prefix?: string;
      paddingLength?: number;
      includeFinancialYear?: boolean;
      financialYearFormat?: 'YYYY-YY' | 'YY-YY';
    };
    financialYear?: {
      startMonth?: number;
    };
    receiptPreferences?: {
      showNgoPanOnReceipt?: boolean;
      donorPanMandatory?: boolean;
      donorAddressMandatory?: boolean;
      donorEmailMandatory?: boolean;
      defaultReceiptFooter?: string;
      eightyGNote?: string;
    };
    donationPreferences?: {
      minimumOnlineAmount?: number;
      defaultPurpose?: string;
    };
    qrCode?: {
      imageUrl?: string;
    };
  };
  communicationSettings?: {
    email?: {
      fromName?: string;
      fromEmail?: string;
      replyToEmail?: string;
      defaultFooter?: string;
      notifications?: {
        newDonationEmailToAdmin?: boolean;
        monthlyDonationSummaryToDirector?: boolean;
        newVolunteerRegistrationToAdmin?: boolean;
        newContactEnquiryToAdmin?: boolean;
      };
    };
    whatsapp?: {
      templateLanguage?: 'en' | 'gu' | 'hi';
      autoMessages?: {
        donationThankYou?: boolean;
        eventReminderToVolunteers?: boolean;
        postEventThanksToVolunteers?: boolean;
      };
    };
    inAppNotifications?: {
      lowWalletBalance?: boolean;
      highValueDonation?: boolean;
      newExpensePendingApproval?: boolean;
      volunteerWorkPendingReview?: boolean;
      thresholds?: {
        lowWalletAmount?: number;
        highDonationAmount?: number;
      };
    };
  };
  systemPreferences?: {
    defaultLanguage?: 'en' | 'gu' | 'hi';
    timezone?: string;
    dateFormat?: 'DD-MM-YYYY' | 'MM-DD-YYYY' | 'YYYY-MM-DD';
    numberFormat?: 'en-IN' | 'en-US';
    sessionTimeoutMinutes?: number;
    require2FAForSuperAdmins?: boolean;
    privacy?: {
      showDonorNamesPublicly?: boolean;
      showDonationAmountsPublicly?: boolean;
    };
  };
  seoSettings: {
    defaultTitle?: string;
    defaultDescription?: string;
    defaultKeywords?: string;
    ogImage?: string;
    favicon?: string;
  };
  maintenanceMode?: boolean;
  maintenanceMessage?: string;
  updatedBy?: string;
  updatedAt?: string;
}

export interface ContactSubmission {
  _id?: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  status: 'new' | 'read' | 'replied' | 'archived';
  repliedBy?: string;
  repliedAt?: string;
  replyMessage?: string;
  createdAt?: string;
}

export interface VolunteerRegistration {
  _id?: string;
  name: string;
  phone: string;
  email?: string;
  city: string;
  age: number;
  occupation?: string;
  interests?: string[];
  aboutYou?: string;
  status: 'pending' | 'contacted' | 'approved' | 'rejected';
  assignedTo?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ContentVersion {
  _id: string;
  contentType: string;
  contentId: string;
  version: number;
  data: any;
  changedBy: string;
  changeReason?: string;
  createdAt: string;
}

// ==================== Page Content API ====================

export const pageContentApi = {
  create: async (data: Partial<PageContent>) => {
    const response = await api.post('/cms/pages', data);
    return response.data;
  },

  getAll: async (params?: { pageId?: string; language?: string; status?: string; page?: number; limit?: number }) => {
    const response = await api.get('/cms/pages', { params });
    return response.data;
  },

  get: async (pageId: string, language: string) => {
    const response = await api.get(`/cms/pages/${pageId}/${language}`);
    return response.data;
  },

  update: async (pageId: string, language: string, data: Partial<PageContent>) => {
    const response = await api.put(`/cms/pages/${pageId}/${language}`, data);
    return response.data;
  },

  publish: async (pageId: string, language: string, changeReason?: string) => {
    const response = await api.put(`/cms/pages/${pageId}/${language}/publish`, { changeReason });
    return response.data;
  },

  delete: async (pageId: string, language: string) => {
    const response = await api.delete(`/cms/pages/${pageId}/${language}`);
    return response.data;
  },

  getVersions: async (pageId: string, language: string) => {
    const response = await api.get(`/cms/pages/${pageId}/${language}/versions`);
    return response.data;
  },

  revert: async (pageId: string, language: string, version: number) => {
    const response = await api.post(`/cms/pages/${pageId}/${language}/revert`, { version });
    return response.data;
  },
};

// ==================== Durga Content API ====================

export const durgaContentApi = {
  create: async (data: Partial<DurgaContent>) => {
    const response = await api.post('/cms/durga', data);
    return response.data;
  },

  getAll: async (params?: { durgaId?: string; isActive?: boolean; page?: number; limit?: number }) => {
    const response = await api.get('/cms/durga', { params });
    return response.data;
  },

  get: async (durgaId: string) => {
    const response = await api.get(`/cms/durga/${durgaId}`);
    return response.data;
  },

  update: async (durgaId: string, data: Partial<DurgaContent>) => {
    const response = await api.put(`/cms/durga/${durgaId}`, data);
    return response.data;
  },

  delete: async (durgaId: string) => {
    const response = await api.delete(`/cms/durga/${durgaId}`);
    return response.data;
  },
};

// ==================== Gallery API ====================

export const galleryApi = {
  create: async (data: Partial<GalleryItem>) => {
    const response = await api.post('/cms/gallery', data);
    return response.data;
  },

  getAll: async (params?: { category?: string; type?: string; durgaId?: string; eventId?: string; isFeatured?: boolean; page?: number; limit?: number }) => {
    const response = await api.get('/cms/gallery', { params });
    return response.data;
  },

  get: async (id: string) => {
    const response = await api.get(`/cms/gallery/${id}`);
    return response.data;
  },

  update: async (id: string, data: Partial<GalleryItem>) => {
    const response = await api.put(`/cms/gallery/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/cms/gallery/${id}`);
    return response.data;
  },
};

// ==================== Testimonial API ====================

export const testimonialApi = {
  create: async (data: Partial<Testimonial>) => {
    const response = await api.post('/cms/testimonials', data);
    return response.data;
  },

  getAll: async (params?: { language?: string; isActive?: boolean; page?: number; limit?: number }) => {
    const response = await api.get('/cms/testimonials', { params });
    return response.data;
  },

  get: async (id: string) => {
    const response = await api.get(`/cms/testimonials/${id}`);
    return response.data;
  },

  update: async (id: string, data: Partial<Testimonial>) => {
    const response = await api.put(`/cms/testimonials/${id}`, data);
    return response.data;
  },

  approve: async (id: string, isActive: boolean) => {
    const response = await api.put(`/cms/testimonials/${id}/approve`, { isActive });
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/cms/testimonials/${id}`);
    return response.data;
  },
};

// ==================== Impact Numbers API ====================

export const impactApi = {
  getAll: async (language?: string) => {
    const response = await api.get('/cms/impact', { params: { language } });
    return response.data;
  },

  update: async (id: string, data: Partial<ImpactNumber>) => {
    const response = await api.put(`/cms/impact/${id}`, data);
    return response.data;
  },

  bulkUpdate: async (impactNumbers: Partial<ImpactNumber>[]) => {
    const response = await api.put('/cms/impact', { impactNumbers });
    return response.data;
  },
};

// ==================== Site Settings API ====================

export const siteSettingsApi = {
  get: async () => {
    const response = await api.get('/cms/settings');
    return response.data;
  },

  update: async (data: Partial<SiteSettings>) => {
    const response = await api.put('/cms/settings', data);
    return response.data;
  },
};

// ==================== Contact Submissions API ====================

export const contactSubmissionApi = {
  create: async (data: Partial<ContactSubmission>) => {
    const response = await api.post('/cms/contact/submissions', data);
    return response.data;
  },

  getAll: async (params?: { status?: string; page?: number; limit?: number }) => {
    const response = await api.get('/cms/contact/submissions', { params });
    return response.data;
  },

  get: async (id: string) => {
    const response = await api.get(`/cms/contact/submissions/${id}`);
    return response.data;
  },

  updateStatus: async (id: string, status: string) => {
    const response = await api.put(`/cms/contact/submissions/${id}/status`, { status });
    return response.data;
  },

  reply: async (id: string, replyMessage: string) => {
    const response = await api.post(`/cms/contact/submissions/${id}/reply`, { replyMessage });
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/cms/contact/submissions/${id}`);
    return response.data;
  },
};

// ==================== Volunteer Registrations API ====================

export const volunteerRegistrationApi = {
  create: async (data: Partial<VolunteerRegistration>) => {
    const response = await api.post('/cms/volunteers/registrations', data);
    return response.data;
  },

  getAll: async (params?: { status?: string; city?: string; page?: number; limit?: number }) => {
    const response = await api.get('/cms/volunteers/registrations', { params });
    return response.data;
  },

  get: async (id: string) => {
    const response = await api.get(`/cms/volunteers/registrations/${id}`);
    return response.data;
  },

  update: async (id: string, data: Partial<VolunteerRegistration>) => {
    const response = await api.put(`/cms/volunteers/registrations/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/cms/volunteers/registrations/${id}`);
    return response.data;
  },
};
