import api from '../api';

export interface FormField {
  fieldId: string;
  label: string;
  type: 'text' | 'email' | 'phone' | 'number' | 'date' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'file';
  placeholder?: string;
  required?: boolean;
  options?: Array<{ label: string; value: string }>;
  validation?: {
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: string;
    customMessage?: string;
  };
  order?: number;
}

export interface Form {
  _id: string;
  title: string;
  description?: string;
  eventId?: {
    _id: string;
    name: string;
    startDate: string;
    endDate: string;
  };
  fields: FormField[];
  slug?: string;
  shareableToken: string;
  status: 'draft' | 'active' | 'inactive' | 'closed';
  allowMultipleSubmissions: boolean;
  maxSubmissions?: number;
  startDate?: string;
  endDate?: string;
  successMessage?: string;
  redirectUrl?: string;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  submissionCount: number;
  createdAt: string;
  updatedAt: string;
  publicUrl?: string;
}

export interface CreateFormRequest {
  title: string;
  description?: string;
  eventId?: string;
  fields: FormField[];
  slug?: string;
  status?: 'draft' | 'active' | 'inactive' | 'closed';
  allowMultipleSubmissions?: boolean;
  maxSubmissions?: number;
  startDate?: string;
  endDate?: string;
  successMessage?: string;
  redirectUrl?: string;
}

export interface FormsResponse {
  success: boolean;
  data: Form[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface FormResponse {
  success: boolean;
  data: Form;
}

export interface FormSubmission {
  _id: string;
  formId: {
    _id: string;
    title: string;
    fields: FormField[];
  };
  responses: Record<string, any>;
  fileUploads?: Array<{
    fieldId: string;
    fileName: string;
    filePath: string;
    fileSize: number;
    mimeType: string;
  }>;
  submitterInfo?: {
    ipAddress?: string;
    userAgent?: string;
    referrer?: string;
  };
  status: 'submitted' | 'reviewed' | 'archived';
  adminNotes?: string;
  reviewedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FormSubmissionsResponse {
  success: boolean;
  data: FormSubmission[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface FormAnalytics {
  success: boolean;
  data: {
    form: {
      id: string;
      title: string;
      status: string;
      eventId?: {
        _id: string;
        name: string;
      };
      createdBy: {
        _id: string;
        name: string;
        email: string;
      };
    };
    statistics: {
      totalSubmissions: number;
      submissionCount: number;
      maxSubmissions?: number;
      remainingSubmissions?: number;
      submissionsByStatus: {
        submitted: number;
        reviewed: number;
        archived: number;
      };
    };
    trends: {
      submissionsByDate: Array<{
        _id: string;
        count: number;
      }>;
    };
    formSettings: {
      allowMultipleSubmissions: boolean;
      startDate?: string;
      endDate?: string;
      isAcceptingSubmissions: boolean;
    };
  };
}

export const formsApi = {
  getForms: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    eventId?: string;
    search?: string;
  }): Promise<FormsResponse> => {
    const response = await api.get<FormsResponse>('/forms', { params });
    return response.data;
  },

  getFormById: async (id: string): Promise<FormResponse> => {
    const response = await api.get<FormResponse>(`/forms/${id}`);
    return response.data;
  },

  createForm: async (data: CreateFormRequest): Promise<FormResponse> => {
    const response = await api.post<FormResponse>('/forms', data);
    return response.data;
  },

  updateForm: async (id: string, data: Partial<CreateFormRequest>): Promise<FormResponse> => {
    const response = await api.put<FormResponse>(`/forms/${id}`, data);
    return response.data;
  },

  deleteForm: async (id: string): Promise<void> => {
    await api.delete(`/forms/${id}`);
  },

  getFormSubmissions: async (
    formId: string,
    params?: {
      page?: number;
      limit?: number;
      status?: string;
    }
  ): Promise<FormSubmissionsResponse> => {
    const response = await api.get<FormSubmissionsResponse>(`/forms/${formId}/submissions`, { params });
    return response.data;
  },

  getSubmissionById: async (formId: string, submissionId: string): Promise<{ success: boolean; data: FormSubmission }> => {
    const response = await api.get<{ success: boolean; data: FormSubmission }>(`/forms/${formId}/submissions/${submissionId}`);
    return response.data;
  },

  updateSubmission: async (
    formId: string,
    submissionId: string,
    data: {
      status?: 'submitted' | 'reviewed' | 'archived';
      adminNotes?: string;
    }
  ): Promise<{ success: boolean; data: FormSubmission }> => {
    const response = await api.put<{ success: boolean; data: FormSubmission }>(`/forms/${formId}/submissions/${submissionId}`, data);
    return response.data;
  },

  deleteSubmission: async (formId: string, submissionId: string): Promise<void> => {
    await api.delete(`/forms/${formId}/submissions/${submissionId}`);
  },

  getFormAnalytics: async (id: string): Promise<FormAnalytics> => {
    const response = await api.get<FormAnalytics>(`/forms/${id}/analytics`);
    return response.data;
  },

  // Public API (no auth token needed)
  getFormByToken: async (token: string): Promise<FormResponse> => {
    const response = await api.get<FormResponse>(`/forms/public/token/${token}`);
    return response.data;
  },

  submitForm: async (token: string, data: FormData): Promise<{ success: boolean; message: string; data: { submissionId: string; redirectUrl?: string } }> => {
    const response = await api.post(`/forms/public/token/${token}/submit`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};
