// User types
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

// Novel types
export interface Novel {
  id: string;
  title: string;
  author: string;
  authorId?: string;
  synopsis: string;
  cover: string;
  status: 'ongoing' | 'completed' | 'hiatus';
  categories: Category[];
  tags: string[];
  chapterCount: number;
  viewCount: number;
  rating: number;
  ratingCount: number;
  createdAt: string;
  updatedAt: string;
  lastChapterAt?: string;
}

// Chapter types
export interface Chapter {
  id: string;
  novelId: string;
  title: string;
  number: number;
  content?: string;
  wordCount: number;
  createdAt: string;
  updatedAt: string;
}

// Category types
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  novelCount?: number;
}

// Library types
export interface LibraryItem {
  id: string;
  novel: Novel;
  addedAt: string;
  lastReadChapterId?: string;
  lastReadAt?: string;
  progress: number;
}

// Reading progress
export interface ReadingProgress {
  novelId: string;
  chapterId: string;
  chapterNumber: number;
  progress: number;
  updatedAt: string;
}

// API Response types
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    currentPage: number;
    lastPage: number;
    perPage: number;
    total: number;
  };
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  statusCode: number;
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  passwordConfirmation: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Notification settings
export interface NotificationSettings {
  enabled: boolean;
  newChapters: boolean;
  promotions: boolean;
  updates: boolean;
}

// Navigation types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  Home: undefined;
  Search: undefined;
  Library: undefined;
  Profile: undefined;
  NovelDetail: {novelId: string};
  ChapterReader: {novelId: string; chapterId: string};
  CategoryList: undefined;
  CategoryDetail: {categoryId: string; categoryName: string};
  Settings: undefined;
  NotificationSettings: undefined;
};

export type BottomTabParamList = {
  HomeTab: undefined;
  SearchTab: undefined;
  LibraryTab: undefined;
  ProfileTab: undefined;
};
