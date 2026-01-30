import api from '../api';

export interface Event {
  _id: string;
  name: string;
  description?: string;
  location?: string;
  startDate: string;
  endDate: string;
  budget: number;
  targetAmount?: number;
  managerId: {
    _id: string;
    name: string;
    email: string;
  };
  status: 'planned' | 'ongoing' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventRequest {
  name: string;
  description?: string;
  location?: string;
  startDate: string;
  endDate: string;
  budget?: number;
  targetAmount?: number;
  managerId: string;
  status?: 'planned' | 'ongoing' | 'completed' | 'cancelled';
}

export interface EventItem {
  _id: string;
  eventId: string;
  name: string;
  description?: string;
  unitPrice: number;
  totalQuantity: number;
  donatedQuantity: number;
  totalAmount: number;
  donatedAmount: number;
  status: 'pending' | 'partial' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventItemRequest {
  eventId: string;
  name: string;
  description?: string;
  unitPrice: number;
  totalQuantity: number;
  totalAmount?: number;
  priority?: 'low' | 'medium' | 'high' | 'critical';
}

export interface EventExpensePlan {
  _id: string;
  eventId: string;
  title: string;
  description?: string;
  category: string;
  estimatedAmount: number;
  actualAmount: number;
  plannedDate: string;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  isApproved: boolean;
  approvedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  expenseId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExpensePlanRequest {
  eventId: string;
  title: string;
  description?: string;
  category: string;
  estimatedAmount: number;
  plannedDate: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  notes?: string;
}

export interface EventsResponse {
  success: boolean;
  data: Event[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface EventResponse {
  success: boolean;
  data: Event;
}

export interface EventSummary {
  success: boolean;
  data: {
    event: Event;
    summary: {
      targetAmount: number;
      totalDonations: number;
      targetAchievement: number;
      totalExpenses: number;
      remainingAmount: number;
      budget: number;
      budgetVariance: number;
      volunteerCount: number;
    };
    donations: {
      count: number;
      total: number;
    };
    expenses: {
      count: number;
      total: number;
    };
    volunteers: any[];
  };
}

export interface EventAnalytics {
  success: boolean;
  data: {
    event: {
      id: string;
      name: string;
      targetAmount: number;
      budget: number;
      status: string;
    };
    financialSummary: {
      targetAmount: number;
      totalDonations: number;
      targetAchievement: number;
      targetRemaining: number;
      totalApprovedExpenses: number;
      totalPendingExpenses: number;
      availableBalance: number;
      projectedBalance: number;
      budgetVariance: number;
      budgetStatus: string;
    };
    donationAnalysis: {
      total: number;
      count: number;
      generalDonations: {
        total: number;
        count: number;
        percentage: number;
      };
      itemDonations: {
        total: number;
        count: number;
        percentage: number;
      };
      byDate: Record<string, { count: number; amount: number }>;
      byPaymentMode: Record<string, { count: number; amount: number }>;
      averageDonation: number;
    };
    itemAnalysis: {
      totalItems: number;
      totalItemTarget: number;
      totalItemDonated: number;
      itemCompletionPercentage: number;
      items: Array<{
        itemId: string;
        name: string;
        totalAmount: number;
        donatedAmount: number;
        remainingAmount: number;
        completionPercentage: number;
        status: string;
      }>;
      itemsByStatus: {
        pending: number;
        partial: number;
        completed: number;
      };
    };
    expenseAnalysis: {
      totalPlanned: number;
      totalActual: number;
      variance: number;
      variancePercentage: number;
      plannedCount: number;
      completedCount: number;
      totalPlannedExpenses: number;
    };
    recommendations: Array<{
      type: string;
      priority: string;
      message: string;
      action: string;
    }>;
  };
}

export interface EventDashboard extends EventAnalytics {
  data: EventAnalytics['data'] & {
    recentDonations: any[];
    upcomingExpenses: any[];
    topDonors: Array<{
      _id: string;
      totalAmount: number;
      count: number;
    }>;
  };
}

export const eventsApi = {
  getEvents: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    managerId?: string;
  }): Promise<EventsResponse> => {
    const response = await api.get<EventsResponse>('/events', { params });
    return response.data;
  },

  getEventById: async (id: string): Promise<EventResponse> => {
    const response = await api.get<EventResponse>(`/events/${id}`);
    return response.data;
  },

  createEvent: async (data: CreateEventRequest): Promise<EventResponse> => {
    const response = await api.post<EventResponse>('/events', data);
    return response.data;
  },

  updateEvent: async (id: string, data: Partial<CreateEventRequest>): Promise<EventResponse> => {
    const response = await api.put<EventResponse>(`/events/${id}`, data);
    return response.data;
  },

  getEventSummary: async (id: string): Promise<EventSummary> => {
    const response = await api.get<EventSummary>(`/events/${id}/summary`);
    return response.data;
  },

  deleteEvent: async (id: string): Promise<void> => {
    await api.delete(`/events/${id}`);
  },

  // Analytics endpoints
  getEventAnalytics: async (id: string): Promise<EventAnalytics> => {
    const response = await api.get<EventAnalytics>(`/events/${id}/analytics`);
    return response.data;
  },

  getEventDashboard: async (id: string): Promise<EventDashboard> => {
    const response = await api.get<EventDashboard>(`/events/${id}/dashboard`);
    return response.data;
  },

  getEventItems: async (eventId: string): Promise<{ success: boolean; data: EventItem[] }> => {
    const response = await api.get(`/event-items/event/${eventId}`);
    return response.data;
  },

  // Event Items API
  createEventItem: async (data: CreateEventItemRequest): Promise<{ success: boolean; data: EventItem }> => {
    const response = await api.post(`/event-items`, data);
    return response.data;
  },

  updateEventItem: async (id: string, data: Partial<CreateEventItemRequest>): Promise<{ success: boolean; data: EventItem }> => {
    const response = await api.put(`/event-items/${id}`, data);
    return response.data;
  },

  deleteEventItem: async (id: string): Promise<void> => {
    await api.delete(`/event-items/${id}`);
  },

  getItemDonations: async (id: string): Promise<{ success: boolean; data: any }> => {
    const response = await api.get(`/event-items/${id}/donations`);
    return response.data;
  },

  // Expense Plans API
  getEventExpensePlans: async (eventId: string): Promise<{ success: boolean; data: EventExpensePlan[] }> => {
    const response = await api.get(`/event-expense-plans/event/${eventId}`);
    return response.data;
  },

  createExpensePlan: async (data: CreateExpensePlanRequest): Promise<{ success: boolean; data: EventExpensePlan }> => {
    const response = await api.post(`/event-expense-plans`, data);
    return response.data;
  },

  updateExpensePlan: async (id: string, data: Partial<CreateExpensePlanRequest>): Promise<{ success: boolean; data: EventExpensePlan }> => {
    const response = await api.put(`/event-expense-plans/${id}`, data);
    return response.data;
  },

  approveExpensePlan: async (id: string): Promise<{ success: boolean; data: EventExpensePlan }> => {
    const response = await api.put(`/event-expense-plans/${id}/approve`);
    return response.data;
  },

  deleteExpensePlan: async (id: string): Promise<void> => {
    await api.delete(`/event-expense-plans/${id}`);
  },
};

