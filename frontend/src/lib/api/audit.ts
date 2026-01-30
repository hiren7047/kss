import api from '../api';

export interface AuditLog {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'APPROVE' | 'REJECT' | 'LOGIN' | 'LOGOUT';
  module: 'USER' | 'MEMBER' | 'DONATION' | 'EXPENSE' | 'EVENT' | 'VOLUNTEER' | 'WALLET' | 'DOCUMENT' | 'AUTH';
  oldData?: any;
  newData?: any;
  timestamp: string;
  ipAddress?: string;
  createdAt: string;
}

export interface AuditLogsResponse {
  success: boolean;
  data: AuditLog[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export const auditApi = {
  getAuditLogs: async (params?: {
    page?: number;
    limit?: number;
    userId?: string;
    module?: string;
    action?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<AuditLogsResponse> => {
    const response = await api.get<AuditLogsResponse>('/audit/logs', { params });
    return response.data;
  },
};

