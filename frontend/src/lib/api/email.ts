import api from '../api';

export interface EmailTemplate {
  _id: string;
  name: string;
  code: string;
  type: 'transactional' | 'newsletter';
  subject: string;
  bodyHtml: string;
  bodyText?: string;
  variables: string[];
  status: 'active' | 'inactive';
  usageCount: number;
  lastUsedAt?: string;
  createdBy?: {
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

export interface NewsletterSubscriber {
  _id: string;
  email: string;
  name?: string;
  language: 'en' | 'gu' | 'hi';
  isSubscribed: boolean;
  unsubscribeToken: string;
  subscribedAt: string;
  unsubscribedAt?: string;
  source: 'mainsite' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface EmailLog {
  _id: string;
  templateId?: string;
  templateCode?: string;
  to: string;
  subject: string;
  status: 'sent' | 'failed';
  errorMessage?: string;
  meta?: Record<string, any>;
  sentAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export const emailApi = {
  // Email templates
  getTemplates: async (params?: {
    page?: number;
    limit?: number;
    type?: string;
    status?: string;
    search?: string;
  }): Promise<PaginatedResponse<EmailTemplate>> => {
    const response = await api.get<PaginatedResponse<EmailTemplate>>('/newsletter/templates', { params });
    return response.data;
  },

  getTemplate: async (id: string): Promise<{ success: boolean; data: EmailTemplate }> => {
    const response = await api.get<{ success: boolean; data: EmailTemplate }>(`/newsletter/templates/${id}`);
    return response.data;
  },

  createTemplate: async (data: {
    name: string;
    code: string;
    type: 'transactional' | 'newsletter';
    subject: string;
    bodyHtml: string;
    bodyText?: string;
    variables?: string[];
    status?: 'active' | 'inactive';
  }): Promise<{ success: boolean; data: EmailTemplate; message: string }> => {
    const response = await api.post<{ success: boolean; data: EmailTemplate; message: string }>(
      '/newsletter/templates',
      data
    );
    return response.data;
  },

  updateTemplate: async (
    id: string,
    data: Partial<{
      name: string;
      subject: string;
      bodyHtml: string;
      bodyText?: string;
      variables?: string[];
      status?: 'active' | 'inactive';
    }>
  ): Promise<{ success: boolean; data: EmailTemplate; message: string }> => {
    const response = await api.put<{ success: boolean; data: EmailTemplate; message: string }>(
      `/newsletter/templates/${id}`,
      data
    );
    return response.data;
  },

  deleteTemplate: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete<{ success: boolean; message: string }>(`/newsletter/templates/${id}`);
    return response.data;
  },

  // Subscribers
  getSubscribers: async (params?: {
    page?: number;
    limit?: number;
    isSubscribed?: string;
    language?: string;
    search?: string;
  }): Promise<PaginatedResponse<NewsletterSubscriber>> => {
    const response = await api.get<PaginatedResponse<NewsletterSubscriber>>('/newsletter/subscribers', { params });
    return response.data;
  },

  // Send newsletter
  sendNewsletter: async (data: {
    templateId: string;
    language?: 'en' | 'gu' | 'hi';
    onlySubscribed?: boolean;
    testEmail?: string;
  }): Promise<{
    success: boolean;
    message: string;
    data: {
      mode: 'test' | 'bulk';
      recipients: number;
      successCount?: number;
      failureCount?: number;
    };
  }> => {
    const response = await api.post('/newsletter/send', data);
    return response.data;
  },

  // Email logs
  getEmailLogs: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    templateCode?: string;
    email?: string;
  }): Promise<PaginatedResponse<EmailLog>> => {
    const response = await api.get<PaginatedResponse<EmailLog>>('/newsletter/logs', { params });
    return response.data;
  },
};

