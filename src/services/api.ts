import axios, {AxiosInstance, InternalAxiosRequestConfig} from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://novelart.com.br/api';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  },
);

// Response interceptor for error handling
api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      // Handle unauthorized access - clear token and redirect to login
      await AsyncStorage.removeItem('authToken');
    }
    return Promise.reject(error);
  },
);

// Auth endpoints
export const authService = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', {email, password});
    return response.data;
  },
  register: async (name: string, email: string, password: string) => {
    const response = await api.post('/auth/register', {name, email, password});
    return response.data;
  },
  socialLogin: async (provider: string, token: string) => {
    const response = await api.post('/auth/social', {provider, token});
    return response.data;
  },
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
  getProfile: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// Novel endpoints
export const novelService = {
  getAll: async (page = 1, limit = 20) => {
    const response = await api.get('/novels', {params: {page, limit}});
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/novels/${id}`);
    return response.data;
  },
  getChapters: async (novelId: string, page = 1) => {
    const response = await api.get(`/novels/${novelId}/chapters`, {
      params: {page},
    });
    return response.data;
  },
  search: async (query: string, page = 1) => {
    const response = await api.get('/novels/search', {params: {query, page}});
    return response.data;
  },
  getByCategory: async (categoryId: string, page = 1) => {
    const response = await api.get(`/categories/${categoryId}/novels`, {
      params: {page},
    });
    return response.data;
  },
  getPopular: async (page = 1) => {
    const response = await api.get('/novels/popular', {params: {page}});
    return response.data;
  },
  getRecent: async (page = 1) => {
    const response = await api.get('/novels/recent', {params: {page}});
    return response.data;
  },
};

// Chapter endpoints
export const chapterService = {
  getById: async (chapterId: string) => {
    const response = await api.get(`/chapters/${chapterId}`);
    return response.data;
  },
  getContent: async (chapterId: string) => {
    const response = await api.get(`/chapters/${chapterId}/content`);
    return response.data;
  },
};

// Category endpoints
export const categoryService = {
  getAll: async () => {
    const response = await api.get('/categories');
    return response.data;
  },
};

// User library endpoints
export const libraryService = {
  getLibrary: async () => {
    const response = await api.get('/user/library');
    return response.data;
  },
  addToLibrary: async (novelId: string) => {
    const response = await api.post('/user/library', {novelId});
    return response.data;
  },
  removeFromLibrary: async (novelId: string) => {
    const response = await api.delete(`/user/library/${novelId}`);
    return response.data;
  },
  getReadingProgress: async (novelId: string) => {
    const response = await api.get(`/user/progress/${novelId}`);
    return response.data;
  },
  updateReadingProgress: async (novelId: string, chapterId: string) => {
    const response = await api.put(`/user/progress/${novelId}`, {chapterId});
    return response.data;
  },
};

// User preferences
export const userService = {
  updateProfile: async (data: {name?: string; avatar?: string}) => {
    const response = await api.put('/user/profile', data);
    return response.data;
  },
  getNotificationSettings: async () => {
    const response = await api.get('/user/notifications/settings');
    return response.data;
  },
  updateNotificationSettings: async (settings: {
    enabled: boolean;
    newChapters: boolean;
  }) => {
    const response = await api.put('/user/notifications/settings', settings);
    return response.data;
  },
};

export default api;
