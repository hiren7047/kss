import api from '../api';

export interface DeleteAllDataResponse {
  success: boolean;
  message: string;
  data: {
    deletedCounts: {
      members: number;
      donations: number;
      expenses: number;
      events: number;
      eventItems: number;
      eventExpensePlans: number;
      volunteerAssignments: number;
      volunteerPoints: number;
      volunteerRegistrations: number;
      volunteerWorkSubmissions: number;
      documents: number;
      auditLogs: number;
      contactSubmissions: number;
      contentVersions: number;
      durgaContents: number;
      forms: number;
      formSubmissions: number;
      galleryItems: number;
      impactNumbers: number;
      pageContents: number;
      paymentTransactions: number;
      testimonials: number;
      donationLinks: number;
    };
    timestamp: string;
  };
}

export const adminApi = {
  /**
   * Delete all data from database (SUPER_ADMIN only)
   * ⚠️ WARNING: This action is irreversible!
   */
  deleteAllData: async (): Promise<DeleteAllDataResponse> => {
    const response = await api.delete<DeleteAllDataResponse>('/admin/database/reset');
    return response.data;
  },
};
