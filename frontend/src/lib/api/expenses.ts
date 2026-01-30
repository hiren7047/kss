import api from '../api';

export interface Expense {
  _id: string;
  title: string;
  category: string;
  amount: number;
  eventId?: {
    _id: string;
    name: string;
  };
  billUrl?: string;
  approvedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  approvalStatus: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExpenseRequest {
  title: string;
  category: string;
  amount: number;
  eventId?: string;
  billUrl?: string;
}

export interface ApproveExpenseRequest {
  approvalStatus: 'approved' | 'rejected';
  rejectionReason?: string;
}

export interface ExpensesResponse {
  success: boolean;
  data: Expense[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface ExpenseResponse {
  success: boolean;
  data: Expense;
}

export interface ExpenseReport {
  success: boolean;
  data: {
    summary: {
      totalAmount: number;
      totalCount: number;
      approvedAmount: number;
      pendingAmount: number;
    };
    byCategory: Record<string, number>;
    byStatus: Record<string, number>;
    expenses: Expense[];
  };
}

export const expensesApi = {
  getExpenses: async (params?: {
    page?: number;
    limit?: number;
    approvalStatus?: string;
    category?: string;
    eventId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ExpensesResponse> => {
    const response = await api.get<ExpensesResponse>('/expenses', { params });
    return response.data;
  },

  getExpenseById: async (id: string): Promise<ExpenseResponse> => {
    const response = await api.get<ExpenseResponse>(`/expenses/${id}`);
    return response.data;
  },

  createExpense: async (data: CreateExpenseRequest): Promise<ExpenseResponse> => {
    const response = await api.post<ExpenseResponse>('/expenses', data);
    return response.data;
  },

  approveExpense: async (id: string, data: ApproveExpenseRequest): Promise<ExpenseResponse> => {
    const response = await api.put<ExpenseResponse>(`/expenses/${id}/approve`, data);
    return response.data;
  },

  getExpenseReport: async (params?: {
    startDate?: string;
    endDate?: string;
    category?: string;
    approvalStatus?: string;
    eventId?: string;
  }): Promise<ExpenseReport> => {
    const response = await api.get<ExpenseReport>('/expenses/report', { params });
    return response.data;
  },

  deleteExpense: async (id: string): Promise<void> => {
    await api.delete(`/expenses/${id}`);
  },
};

