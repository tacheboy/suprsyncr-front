// src/types/api/auth.types.ts
// Auth types derived from backend API

export interface AuthUser {
  id: number;
  email: string;
  fullName: string;
  role: 'SELLER' | 'ADMIN';
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  expiresIn: number; // seconds (900 = 15 min)
}

export interface AuthResponse extends AuthTokens {
  user: AuthUser;
}

// Request bodies
export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshRequest {
  refreshToken: string;
}
