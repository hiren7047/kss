import api from '../api';

export interface Donation {
  _id: string;
  donorName: string;
  memberId?: {
    _id: string;
    name: string;
    memberId: string;
    email?: string;
  };
  amount: number;
  purpose: 'event' | 'general' | 'emergency';
  paymentMode: 'upi' | 'cash' | 'bank' | 'razorpay';
  transactionId?: string;
  eventId?: {
    _id: string;
    name: string;
  };
  receiptNumber: string;
  status?: 'pending' | 'completed' | 'failed';
  isAnonymous?: boolean;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  createdBy?: {
    _id: string;
    name: string;
    email: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDonationRequest {
  donorName: string;
  memberId?: string;
  amount: number;
  purpose: 'event' | 'general' | 'emergency';
  paymentMode: 'upi' | 'cash' | 'bank' | 'razorpay';
  transactionId?: string;
  eventId?: string;
  isAnonymous?: boolean;
  donationLinkSlug?: string;
}

export interface DonationsResponse {
  success: boolean;
  data: Donation[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface DonationResponse {
  success: boolean;
  data: Donation;
}

export interface DonationReport {
  success: boolean;
  data: {
    summary: {
      totalAmount: number;
      totalCount: number;
      thisMonthAmount?: number;
      monthGrowth?: number;
      averageDonation?: number;
      uniqueDonors?: number;
    };
    byPurpose: Record<string, number>;
    byPaymentMode: Record<string, number>;
    donations: Donation[];
  };
}

export interface DonationLink {
  _id: string;
  slug: string;
  title: string;
  description?: string;
  purpose: 'event' | 'general' | 'emergency';
  eventId?: { _id: string; name: string };
  durgaId?: string;
  suggestedAmount?: number | null;
  isActive: boolean;
  expiresAt?: string | null;
  donationCount: number;
  totalAmount: number;
  createdAt: string;
}

export interface EventItemForDonate {
  _id: string;
  name: string;
  description?: string;
  unitPrice: number;
  totalQuantity: number;
  donatedQuantity: number;
  totalAmount: number;
  donatedAmount: number;
  status: string;
}

export interface CreateDonationLinkRequest {
  title?: string;
  description?: string;
  purpose: 'event' | 'general' | 'emergency';
  eventId?: string;
  durgaId?: string;
  suggestedAmount?: number | null;
  expiresAt?: string | null;
}

export interface RazorpayOrderResponse {
  success: boolean;
  data: {
    orderId: string;
    amount: number;
    currency: string;
    keyId: string;
  };
}

export const donationsApi = {
  getDonations: async (params?: {
    page?: number;
    limit?: number;
    purpose?: string;
    paymentMode?: string;
    memberId?: string;
    eventId?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
  }): Promise<DonationsResponse> => {
    const response = await api.get<DonationsResponse>('/donations', { params });
    return response.data;
  },

  getDonationById: async (id: string): Promise<DonationResponse> => {
    const response = await api.get<DonationResponse>(`/donations/${id}`);
    return response.data;
  },

  createDonation: async (data: CreateDonationRequest): Promise<DonationResponse> => {
    const response = await api.post<DonationResponse>('/donations', data);
    return response.data;
  },

  getDonationReport: async (params?: {
    startDate?: string;
    endDate?: string;
    purpose?: string;
    paymentMode?: string;
    eventId?: string;
  }): Promise<DonationReport> => {
    const response = await api.get<DonationReport>('/donations/report', { params });
    return response.data;
  },

  getDonationsByMember: async (memberId: string): Promise<{
    success: boolean;
    data: {
      donations: Donation[];
      totalAmount: number;
      totalCount: number;
    };
  }> => {
    const response = await api.get(`/donations/member/${memberId}`);
    return response.data;
  },

  deleteDonation: async (id: string): Promise<void> => {
    await api.delete(`/donations/${id}`);
  },

  createDonationLink: async (data: CreateDonationLinkRequest): Promise<{ success: boolean; data: DonationLink }> => {
    const response = await api.post<{ success: boolean; data: DonationLink }>('/donations/links', data);
    return response.data;
  },

  getDonationLinkBySlug: async (slug: string): Promise<{ success: boolean; data: DonationLink }> => {
    const response = await api.get<{ success: boolean; data: DonationLink }>(`/donations/links/${slug}`);
    return response.data;
  },

  getDonationLinkEventItems: async (
    slug: string
  ): Promise<{
    success: boolean;
    data: { event: { _id: string; name: string } | null; items: EventItemForDonate[] };
  }> => {
    const response = await api.get<{
      success: boolean;
      data: { event: { _id: string; name: string } | null; items: EventItemForDonate[] };
    }>(`/donations/links/${slug}/event-items`);
    return response.data;
  },

  createRazorpayOrder: async (amount: number, receiptNumber: string, notes?: Record<string, string>): Promise<RazorpayOrderResponse> => {
    const response = await api.post<RazorpayOrderResponse>('/donations/create-order', {
      amount,
      receiptNumber,
      notes: notes ?? {},
    });
    return response.data;
  },

  verifyRazorpayPayment: async (
    donationData: {
      donorName: string;
      memberId?: string;
      amount: number;
      purpose: 'event' | 'general' | 'emergency';
      eventId?: string;
      eventItemId?: string;
      itemQuantity?: number;
      donationType?: 'general' | 'item_specific' | 'expense_specific';
      isAnonymous?: boolean;
      donationLinkSlug?: string;
    },
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string
  ): Promise<DonationResponse> => {
    const response = await api.post<DonationResponse>('/donations/verify-payment', {
      donationData,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });
    return response.data;
  },

  downloadDonationSlip: async (id: string): Promise<Blob> => {
    const response = await api.get(`/donations/${id}/slip`, { responseType: 'blob' });
    return response.data as Blob;
  },

  getPaymentTransactions: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    processed?: boolean;
  }) => {
    const response = await api.get('/donations/transactions', { params });
    return response.data;
  },

  getPaymentTransactionById: async (id: string) => {
    const response = await api.get(`/donations/transactions/${id}`);
    return response.data;
  },
};

