import api from '../api';

export interface Member {
  _id: string;
  memberId: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  name: string;
  dateOfBirth?: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  parentsName?: string;
  fatherBusiness?: string;
  motherBusiness?: string;
  email?: string;
  mobile: string;
  whatsappNumber?: string;
  emergencyContact?: {
    name?: string;
    number?: string;
    relation?: string;
  };
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    pincode?: string;
  };
  aadharNumber?: string;
  idProofType?: string;
  photo?: string;
  idProof?: string;
  occupation?: string;
  business?: string;
  educationDetails?: string;
  familyMembersCount?: number;
  interests?: string[];
  availability?: 'full-time' | 'part-time' | 'event-based';
  memberType: 'donor' | 'volunteer' | 'beneficiary' | 'core';
  joinDate: string;
  status: 'pending' | 'active' | 'inactive' | 'rejected';
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  notes?: string;
  registrationFormUrl?: string;
  idCardUrl?: string;
  signature?: string;
  registrationId?: string; // For volunteers
  volunteerCredentials?: {
    registrationId: string;
    password: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateMemberRequest {
  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth?: string;
  age?: string | number;
  gender?: 'male' | 'female' | 'other';
  parentsName?: string;
  fatherBusiness?: string;
  motherBusiness?: string;
  email?: string;
  mobile: string;
  whatsappNumber?: string;
  emergencyContact?: {
    name?: string;
    number?: string;
    relation?: string;
  };
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    pincode?: string;
  };
  aadharNumber?: string;
  idProofType?: string;
  photo?: string;
  idProof?: string;
  occupation?: string;
  business?: string;
  educationDetails?: string;
  familyMembersCount?: number;
  interests?: string[];
  availability?: string;
  memberType: 'donor' | 'volunteer' | 'beneficiary' | 'core';
  joinDate?: string;
  status?: 'active' | 'inactive';
  notes?: string;
  signature?: string;
}

export interface MembersResponse {
  success: boolean;
  data: Member[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface MemberResponse {
  success: boolean;
  data: Member;
}

export const membersApi = {
  getMembers: async (params?: {
    page?: number;
    limit?: number;
    memberType?: string;
    status?: string;
    approvalStatus?: string;
    search?: string;
  }): Promise<MembersResponse> => {
    const response = await api.get<MembersResponse>('/members', { params });
    return response.data;
  },

  getMemberById: async (id: string): Promise<MemberResponse> => {
    const response = await api.get<MemberResponse>(`/members/${id}`);
    return response.data;
  },

  createMember: async (data: CreateMemberRequest): Promise<MemberResponse> => {
    const response = await api.post<MemberResponse>('/members', data);
    return response.data;
  },

  updateMember: async (id: string, data: Partial<CreateMemberRequest>): Promise<MemberResponse> => {
    const response = await api.put<MemberResponse>(`/members/${id}`, data);
    return response.data;
  },

  deleteMember: async (id: string): Promise<void> => {
    await api.delete(`/members/${id}`);
  },

  uploadPhoto: async (file: File): Promise<{ success: boolean; data: { photoUrl: string; filename: string } }> => {
    const formData = new FormData();
    formData.append('photo', file);
    const response = await api.post('/members/upload-photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  downloadRegistrationForm: async (id: string): Promise<Blob> => {
    const response = await api.get(`/members/${id}/registration-form`, {
      responseType: 'blob',
    });
    return response.data;
  },

  downloadIdCard: async (id: string): Promise<Blob> => {
    const response = await api.get(`/members/${id}/id-card`, {
      responseType: 'blob',
    });
    return response.data;
  },

  approveMember: async (id: string): Promise<MemberResponse> => {
    const response = await api.post<MemberResponse>(`/members/${id}/approve`);
    return response.data;
  },

  rejectMember: async (id: string, reason?: string): Promise<MemberResponse> => {
    const response = await api.post<MemberResponse>(`/members/${id}/reject`, { reason });
    return response.data;
  },
};

// Public API (no authentication required)
import axios from 'axios';

const publicApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const publicMembersApi = {
  register: async (data: CreateMemberRequest): Promise<{ success: boolean; message: string; data: { memberId: string; name: string; memberType: string } }> => {
    const response = await publicApi.post('/members/public/register', data);
    return response.data;
  },

  uploadPhoto: async (file: File): Promise<{ success: boolean; data: { photoUrl: string; filename: string } }> => {
    const formData = new FormData();
    formData.append('photo', file);
    const response = await publicApi.post('/members/public/upload-photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};
