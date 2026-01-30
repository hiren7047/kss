import volunteerApiInstance from './volunteerApi';

export interface VolunteerLoginRequest {
  registrationId: string;
  password: string;
}

export interface VolunteerLoginResponse {
  success: boolean;
  message: string;
  data: {
    volunteer: {
      _id: string;
      name: string;
      memberId: string;
      registrationId: string;
      email?: string;
      mobile: string;
      photo?: string;
    };
    accessToken: string;
    refreshToken: string;
  };
}

export interface VolunteerProfile {
  _id: string;
  name: string;
  memberId: string;
  registrationId: string;
  email?: string;
  mobile: string;
  photo?: string;
}

export interface WorkSubmission {
  _id: string;
  volunteerId: string;
  eventId: string;
  workTitle: string;
  workDescription: string;
  workType: string;
  attachments?: string[];
  pointsAwarded: number;
  status: 'submitted' | 'under_review' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VolunteerActivity {
  assignment: {
    _id: string;
    role: string;
    attendance: string;
    remarks?: string;
    assignedAt: string;
  };
  event: {
    _id: string;
    name: string;
    description?: string;
    location?: string;
    startDate: string;
    endDate: string;
    status: string;
    isPublic: boolean;
  } | null;
  workSubmissions: Array<{
    workTitle: string;
    pointsAwarded: number;
    status: string;
    submittedAt: string;
  }>;
}

export interface VolunteerStats {
  rank: number | null;
  volunteer: {
    _id: string;
    name: string;
    memberId: string;
    registrationId: string;
    photo?: string;
  };
  points: number;
  verifiedPoints: number;
  pendingPoints: number;
  lastVerifiedAt?: string;
}

export interface LeaderboardEntry {
  rank: number;
  volunteer: {
    _id: string;
    name: string;
    memberId: string;
    registrationId: string;
    photo?: string;
  };
  points: number;
  verifiedPoints: number;
  pendingPoints: number;
  lastVerifiedAt?: string;
}

export interface Expense {
  _id: string;
  title: string;
  category: string;
  amount: number;
  eventId?: string;
  billUrl?: string;
  submittedBy?: string;
  approvedBy?: string;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export const volunteerApi = {
  login: async (data: VolunteerLoginRequest): Promise<VolunteerLoginResponse> => {
    const response = await volunteerApiInstance.post<VolunteerLoginResponse>('/volunteer-auth/login', data);
    return response.data;
  },

  getProfile: async (): Promise<{ success: boolean; data: VolunteerProfile }> => {
    const response = await volunteerApiInstance.get('/volunteer-auth/profile');
    return response.data;
  },

  changePassword: async (oldPassword: string, newPassword: string): Promise<void> => {
    await volunteerApiInstance.put('/volunteer-auth/change-password', { oldPassword, newPassword });
  },

  submitWork: async (data: {
    eventId: string;
    workTitle: string;
    workDescription: string;
    workType?: string;
    attachments?: string[];
  }): Promise<{ success: boolean; data: WorkSubmission }> => {
    const response = await volunteerApiInstance.post('/volunteer-work/submit', data);
    return response.data;
  },

  getWorkSubmissions: async (params?: {
    page?: number;
    limit?: number;
    eventId?: string;
    status?: string;
  }): Promise<{ success: boolean; data: { data: WorkSubmission[]; pagination: any } }> => {
    const response = await volunteerApiInstance.get('/volunteer-work', { params });
    return response.data;
  },

  getWorkSubmissionById: async (id: string): Promise<{ success: boolean; data: WorkSubmission }> => {
    const response = await volunteerApiInstance.get(`/volunteer-work/${id}`);
    return response.data;
  },

  getActivities: async (params?: {
    page?: number;
    limit?: number;
    attendance?: string;
  }): Promise<{ success: boolean; data: { data: VolunteerActivity[]; pagination: any } }> => {
    const response = await volunteerApiInstance.get('/volunteer-activities', { params });
    return response.data;
  },

  getActivitySummary: async (): Promise<{
    success: boolean;
    data: {
      totalEvents: number;
      presentEvents: number;
      pendingEvents: number;
      absentEvents: number;
      workSubmissions: number;
      approvedWork: number;
      totalPointsEarned: number;
    };
  }> => {
    const response = await volunteerApiInstance.get('/volunteer-activities/summary');
    return response.data;
  },

  getLeaderboard: async (params?: {
    page?: number;
    limit?: number;
    sortBy?: 'points' | 'verified';
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ success: boolean; data: { data: LeaderboardEntry[]; pagination: any } }> => {
    const response = await volunteerApiInstance.get('/volunteer-leaderboard', { params });
    return response.data;
  },

  getMyStats: async (): Promise<{ success: boolean; data: VolunteerStats }> => {
    const response = await volunteerApiInstance.get('/volunteer-leaderboard/stats');
    return response.data;
  },

  getTopVolunteers: async (limit: number = 10): Promise<{ success: boolean; data: LeaderboardEntry[] }> => {
    const response = await volunteerApiInstance.get('/volunteer-leaderboard/top', { params: { limit } });
    return response.data;
  },

  submitExpense: async (data: {
    title: string;
    category: string;
    amount: number;
    eventId?: string;
    billUrl?: string;
  }): Promise<{ success: boolean; data: Expense }> => {
    const response = await volunteerApiInstance.post('/volunteer-expenses/submit', data);
    return response.data;
  },

  getMyExpenses: async (params?: {
    page?: number;
    limit?: number;
    approvalStatus?: string;
  }): Promise<{ success: boolean; data: { data: Expense[]; pagination: any } }> => {
    const response = await volunteerApiInstance.get('/volunteer-expenses', { params });
    return response.data;
  },

  getExpenseById: async (id: string): Promise<{ success: boolean; data: Expense }> => {
    const response = await volunteerApiInstance.get(`/volunteer-expenses/${id}`);
    return response.data;
  },
};
