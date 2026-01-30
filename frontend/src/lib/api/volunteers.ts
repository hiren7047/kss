import api from '../api';

export interface VolunteerAssignment {
  _id: string;
  volunteerId: {
    _id: string;
    name: string;
    memberId: string;
    email?: string;
    mobile: string;
    photo?: string;
  };
  eventId: {
    _id: string;
    name: string;
    startDate: string;
    endDate: string;
    location?: string;
    status: string;
  } | string;
  role: string;
  attendance: 'present' | 'absent' | 'pending';
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AssignmentsResponse {
  success: boolean;
  data: VolunteerAssignment[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface AssignVolunteerRequest {
  volunteerId: string;
  eventId: string;
  role?: string;
  remarks?: string;
}

export interface UpdateAttendanceRequest {
  attendance: 'present' | 'absent' | 'pending';
  remarks?: string;
}

export const volunteersApi = {
  getAllAssignments: async (params?: {
    page?: number;
    limit?: number;
    volunteerId?: string;
    eventId?: string;
    attendance?: 'present' | 'absent' | 'pending';
    search?: string;
  }): Promise<AssignmentsResponse> => {
    const response = await api.get<AssignmentsResponse>('/volunteers/assignments', { params });
    return response.data;
  },

  assignVolunteer: async (data: AssignVolunteerRequest): Promise<{
    success: boolean;
    message: string;
    data: VolunteerAssignment;
  }> => {
    const response = await api.post('/volunteers/assign', data);
    return response.data;
  },

  getVolunteersByEvent: async (eventId: string): Promise<{
    success: boolean;
    data: VolunteerAssignment[];
  }> => {
    const response = await api.get(`/volunteers/event/${eventId}`);
    return response.data;
  },

  getAssignmentsByVolunteer: async (volunteerId: string): Promise<{
    success: boolean;
    data: VolunteerAssignment[];
  }> => {
    const response = await api.get(`/volunteers/volunteer/${volunteerId}`);
    return response.data;
  },

  updateAttendance: async (assignmentId: string, data: UpdateAttendanceRequest): Promise<{
    success: boolean;
    message: string;
    data: VolunteerAssignment;
  }> => {
    const response = await api.put(`/volunteers/${assignmentId}/attendance`, data);
    return response.data;
  },

  removeVolunteer: async (assignmentId: string): Promise<void> => {
    await api.delete(`/volunteers/${assignmentId}`);
  },
};

