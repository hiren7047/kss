import api from '../api';

export interface EventCompletionRequest {
  defaultPointsForPresent?: number;
  defaultPointsForAbsent?: number;
  defaultPointsForPending?: number;
  volunteerPoints?: Array<{
    volunteerId: string;
    points: number;
    notes?: string;
  }>;
}

export interface EventCompletionResponse {
  success: boolean;
  message: string;
  data: {
    event: any;
    pointsAssigned: Array<{
      volunteerId: string;
      volunteerName: string;
      pointsAwarded: number;
      attendance: string;
    }>;
    totalVolunteers: number;
    totalPointsAwarded: number;
  };
}

export interface EventCompletionSummary {
  success: boolean;
  data: {
    event: {
      _id: string;
      name: string;
      startDate: string;
      endDate: string;
      status: string;
    };
    volunteers: Array<{
      _id: string;
      name: string;
      memberId: string;
      registrationId?: string;
      photo?: string;
      attendance: string;
      role: string;
      currentPoints: number;
      verifiedPoints: number;
      pendingPoints: number;
    }>;
    summary: {
      totalVolunteers: number;
      present: number;
      absent: number;
      pending: number;
    };
  };
}

export const eventCompletionApi = {
  getCompletionSummary: async (eventId: string): Promise<EventCompletionSummary> => {
    const response = await api.get(`/events/${eventId}/completion-summary`);
    return response.data;
  },

  completeEvent: async (
    eventId: string,
    data: EventCompletionRequest
  ): Promise<EventCompletionResponse> => {
    const response = await api.post(`/events/${eventId}/complete`, data);
    return response.data;
  },
};
