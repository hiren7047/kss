import api from '../api';

export interface WhatsAppTemplate {
  _id: string;
  name: string;
  title: string;
  message: string;
  description?: string;
  pdf?: string;
  img1?: string;
  img2?: string;
  variables: string[];
  status: 'active' | 'inactive';
  usageCount: number;
  lastUsedAt?: string;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  updatedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface WhatsAppMessage {
  _id: string;
  templateId?: string;
  recipientId?: {
    _id: string;
    name: string;
    memberId: string;
    memberType: string;
  };
  recipientMobile: string;
  recipientName: string;
  message: string;
  pdf?: string;
  img1?: string;
  img2?: string;
  status: 'pending' | 'sent' | 'failed' | 'scheduled';
  statusCode?: number;
  errorMessage?: string;
  scheduledFor?: string;
  sentAt?: string;
  msgCount: number;
  msgCost: number;
  batchId?: string;
  sentBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface TemplatesResponse {
  success: boolean;
  data: WhatsAppTemplate[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface MessagesResponse {
  success: boolean;
  data: WhatsAppMessage[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface MessageStatistics {
  totalMessages: number;
  sentMessages: number;
  failedMessages: number;
  pendingMessages: number;
  totalCost: number;
  totalRecipients: number;
}

export interface BulkSendResult {
  batchId: string;
  success: Array<{
    messageId: string;
    memberId: string;
    name: string;
    mobile: string;
  }>;
  failed: Array<{
    memberId?: string;
    name?: string;
    mobile?: string;
    error: string;
  }>;
  total: number;
}

export const whatsAppApi = {
  // Templates
  getTemplates: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<TemplatesResponse> => {
    const response = await api.get<TemplatesResponse>('/whatsapp/templates', { params });
    return response.data;
  },

  getTemplate: async (id: string): Promise<{ success: boolean; data: WhatsAppTemplate }> => {
    const response = await api.get<{ success: boolean; data: WhatsAppTemplate }>(
      `/whatsapp/templates/${id}`
    );
    return response.data;
  },

  createTemplate: async (data: {
    name: string;
    title: string;
    message: string;
    description?: string;
    pdf?: string;
    img1?: string;
    img2?: string;
    status?: 'active' | 'inactive';
  }): Promise<{ success: boolean; data: WhatsAppTemplate; message: string }> => {
    const response = await api.post<{ success: boolean; data: WhatsAppTemplate; message: string }>(
      '/whatsapp/templates',
      data
    );
    return response.data;
  },

  updateTemplate: async (
    id: string,
    data: {
      name?: string;
      title?: string;
      message?: string;
      description?: string;
      pdf?: string;
      img1?: string;
      img2?: string;
      status?: 'active' | 'inactive';
    }
  ): Promise<{ success: boolean; data: WhatsAppTemplate; message: string }> => {
    const response = await api.put<{ success: boolean; data: WhatsAppTemplate; message: string }>(
      `/whatsapp/templates/${id}`,
      data
    );
    return response.data;
  },

  deleteTemplate: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete<{ success: boolean; message: string }>(
      `/whatsapp/templates/${id}`
    );
    return response.data;
  },

  // Messages
  sendMessage: async (data: {
    templateId?: string;
    recipientId?: string;
    recipientMobile?: string;
    message?: string;
    pdf?: string;
    img1?: string;
    img2?: string;
    variables?: Record<string, string>;
    scheduleon?: string;
  }): Promise<{ success: boolean; data: WhatsAppMessage; message: string }> => {
    const response = await api.post<{ success: boolean; data: WhatsAppMessage; message: string }>(
      '/whatsapp/send',
      data
    );
    return response.data;
  },

  sendBulkMessages: async (data: {
    templateId?: string;
    recipientIds?: string[];
    memberTypes?: string[];
    memberStatuses?: string[];
    message?: string;
    pdf?: string;
    img1?: string;
    img2?: string;
    variables?: Record<string, string>;
    scheduleon?: string;
  }): Promise<{ success: boolean; data: BulkSendResult; message: string }> => {
    const response = await api.post<{ success: boolean; data: BulkSendResult; message: string }>(
      '/whatsapp/send-bulk',
      data
    );
    return response.data;
  },

  getMessages: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    templateId?: string;
    batchId?: string;
    search?: string;
  }): Promise<MessagesResponse> => {
    const response = await api.get<MessagesResponse>('/whatsapp/messages', { params });
    return response.data;
  },

  getStatistics: async (params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<{ success: boolean; data: MessageStatistics }> => {
    const response = await api.get<{ success: boolean; data: MessageStatistics }>(
      '/whatsapp/statistics',
      { params }
    );
    return response.data;
  },
};
