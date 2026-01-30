import api from '../api';

export interface Wallet {
  _id: string;
  totalDonations: number;
  totalExpenses: number;
  availableBalance: number;
  restrictedFunds: number;
  updatedAt: string;
  createdAt: string;
}

export interface WalletResponse {
  success: boolean;
  data: Wallet;
}

export const walletApi = {
  getWalletSummary: async (): Promise<WalletResponse> => {
    const response = await api.get<WalletResponse>('/wallet/summary');
    return response.data;
  },
};

