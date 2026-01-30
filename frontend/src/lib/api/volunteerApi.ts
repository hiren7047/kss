import axios, { AxiosError, AxiosInstance } from 'axios';
import { toast } from 'sonner';

// API Base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Create axios instance for volunteer API
const volunteerApi: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add volunteer auth token
volunteerApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('volunteerAccessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
volunteerApi.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ success: boolean; message: string }>) => {
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem('volunteerAccessToken');
      localStorage.removeItem('volunteerRefreshToken');
      localStorage.removeItem('volunteer');
      window.location.href = '/volunteer/login';
      return Promise.reject(error);
    }

    // Handle other errors
    const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
    
    if (error.response?.status !== 401) {
      toast.error(errorMessage);
    }

    return Promise.reject(error);
  }
);

export default volunteerApi;
