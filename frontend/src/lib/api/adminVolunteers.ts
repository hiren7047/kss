import api from '../api';

export interface VolunteerCredentials {
  registrationId: string;
  password?: string;
  hasPassword: boolean;
}

export interface VolunteerProfile {
  volunteer: any;
  credentials: VolunteerCredentials;
  points: {
    total: number;
    verified: number;
    pending: number;
    lastVerifiedAt?: string;
  };
  stats: {
    workSubmissions: number;
    approvedWork: number;
    totalPointsEarned: number;
    expensesSubmitted: number;
  };
}

export const adminVolunteersApi = {
  getVolunteerCredentials: async (volunteerId: string): Promise<{
    success: boolean;
    data: {
      _id: string;
      name: string;
      memberId: string;
      registrationId: string;
      password: string | null;
      hasPassword: boolean;
    };
  }> => {
    const response = await api.get(`/admin/volunteers/${volunteerId}/credentials`);
    return response.data;
  },

  resetVolunteerPassword: async (volunteerId: string): Promise<{
    success: boolean;
    message: string;
    data: {
      registrationId: string;
      newPassword: string;
    };
  }> => {
    const response = await api.put(`/admin/volunteers/${volunteerId}/reset-password`);
    return response.data;
  },

  getVolunteerProfile: async (volunteerId: string): Promise<{
    success: boolean;
    data: VolunteerProfile;
  }> => {
    const response = await api.get(`/admin/volunteers/${volunteerId}/profile`);
    return response.data;
  },

  getAllWorkSubmissions: async (params?: {
    page?: number;
    limit?: number;
    volunteerId?: string;
    eventId?: string;
    status?: string;
  }): Promise<{
    success: boolean;
    data: {
      data: any[];
      pagination: any;
    };
  }> => {
    const response = await api.get('/admin/volunteers/work-submissions', { params });
    return response.data;
  },

  getVolunteerExpenses: async (params?: {
    page?: number;
    limit?: number;
    volunteerId?: string;
    approvalStatus?: string;
  }): Promise<{
    success: boolean;
    data: {
      data: any[];
      pagination: any;
    };
  }> => {
    const response = await api.get('/admin/volunteers/expenses', { params });
    return response.data;
  },
};
