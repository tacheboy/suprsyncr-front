// src/types/common.types.ts
// Common response wrappers matching backend API

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  timestamp: string;
}

export interface PagedResponse<T> {
  success: boolean;
  data: {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number; // current page (0-indexed from backend)
  };
  message: string;
  timestamp: string;
}

export interface ApiError {
  success: false;
  message: string;
  timestamp: string;
  errors?: Record<string, string>;
}
