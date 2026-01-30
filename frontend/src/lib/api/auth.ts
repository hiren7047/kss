import api from '../api';

export interface LoginRequest {
  email?: string;
  mobile?: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      _id: string;
      name: string;
      email: string;
      mobile: string;
      role: string;
      status: string;
    };
    accessToken: string;
    refreshToken: string;
  };
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface RegisterRequest {
  name: string;
  email: string;
  mobile: string;
  password: string;
  role?: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      _id: string;
      name: string;
      email: string;
      mobile: string;
      role: string;
      status: string;
    };
    accessToken: string;
    refreshToken: string;
  };
}

export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', data);
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    const response = await api.post<RegisterResponse>('/auth/register', data);
    return response.data;
  },

  refreshToken: async (data: RefreshTokenRequest): Promise<RefreshTokenResponse> => {
    const response = await api.post<RefreshTokenResponse>('/auth/refresh', data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },
};

