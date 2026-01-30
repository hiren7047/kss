import api from '../api';

export interface Document {
  _id: string;
  title: string;
  category: 'audit' | 'utilization' | 'event' | 'legal' | 'other';
  fileUrl: string;
  visibility: 'public' | 'private';
  uploadedBy: {
    _id: string;
    name: string;
    email: string;
  };
  uploadedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDocumentRequest {
  title: string;
  category: 'audit' | 'utilization' | 'event' | 'legal' | 'other';
  fileUrl: string;
  visibility?: 'public' | 'private';
}

export interface DocumentsResponse {
  success: boolean;
  data: Document[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface DocumentResponse {
  success: boolean;
  data: Document;
}

export const documentsApi = {
  getDocuments: async (params?: {
    page?: number;
    limit?: number;
    category?: string;
    visibility?: string;
    search?: string;
  }): Promise<DocumentsResponse> => {
    const response = await api.get<DocumentsResponse>('/documents', { params });
    return response.data;
  },

  getDocumentById: async (id: string): Promise<DocumentResponse> => {
    const response = await api.get<DocumentResponse>(`/documents/${id}`);
    return response.data;
  },

  uploadDocument: async (data: FormData | CreateDocumentRequest): Promise<DocumentResponse> => {
    const response = await api.post<DocumentResponse>('/documents/upload', data, {
      headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
    });
    return response.data;
  },

  updateDocument: async (id: string, data: FormData | Partial<CreateDocumentRequest>): Promise<DocumentResponse> => {
    const response = await api.put<DocumentResponse>(`/documents/${id}`, data, {
      headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
    });
    return response.data;
  },

  deleteDocument: async (id: string): Promise<void> => {
    await api.delete(`/documents/${id}`);
  },
};

