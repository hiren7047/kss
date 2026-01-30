import api from '../api';

export interface Notification {
  _id: string;
  userId: string;
  type: 
    | 'DONATION_RECEIVED'
    | 'EXPENSE_PENDING'
    | 'EXPENSE_APPROVED'
    | 'EXPENSE_REJECTED'
    | 'MEMBER_REGISTERED'
    | 'VOLUNTEER_REGISTERED'
    | 'EVENT_CREATED'
    | 'EVENT_UPDATED'
    | 'LOW_WALLET_BALANCE'
    | 'FORM_SUBMISSION'
    | 'VOLUNTEER_WORK_SUBMITTED'
    | 'DOCUMENT_UPLOADED'
    | 'CONTACT_SUBMISSION'
    | 'SYSTEM_ALERT';
  title: string;
  message: string;
  relatedId?: string;
  relatedType?: 'DONATION' | 'EXPENSE' | 'MEMBER' | 'EVENT' | 'VOLUNTEER' | 'FORM' | 'DOCUMENT' | 'CONTACT' | null;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationsResponse {
  success: boolean;
  data: Notification[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface UnreadCountResponse {
  success: boolean;
  data: {
    count: number;
  };
}

export const notificationsApi = {
  /**
   * Get notifications for authenticated user
   */
  getNotifications: async (params?: {
    page?: number;
    limit?: number;
    isRead?: string;
    type?: string;
  }): Promise<NotificationsResponse> => {
    const response = await api.get<NotificationsResponse>('/notifications', { params });
    return response.data;
  },

  /**
   * Get unread notification count
   */
  getUnreadCount: async (): Promise<UnreadCountResponse> => {
    const response = await api.get<UnreadCountResponse>('/notifications/unread-count');
    return response.data;
  },

  /**
   * Mark notification as read
   */
  markAsRead: async (notificationId: string): Promise<{ success: boolean; data: Notification }> => {
    const response = await api.put<{ success: boolean; data: Notification }>(
      `/notifications/${notificationId}/read`
    );
    return response.data;
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async (): Promise<{ success: boolean; data: { count: number } }> => {
    const response = await api.put<{ success: boolean; data: { count: number } }>(
      '/notifications/read-all'
    );
    return response.data;
  },

  /**
   * Delete notification
   */
  deleteNotification: async (notificationId: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete<{ success: boolean; message: string }>(
      `/notifications/${notificationId}`
    );
    return response.data;
  },

  /**
   * Delete all read notifications
   */
  deleteAllRead: async (): Promise<{ success: boolean; data: { count: number } }> => {
    const response = await api.delete<{ success: boolean; data: { count: number } }>(
      '/notifications/read-all'
    );
    return response.data;
  },
};
