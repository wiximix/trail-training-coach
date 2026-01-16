/**
 * 认证相关类型定义
 */

export interface AuthUser {
  id: string
  username: string
  email: string
  isActive: boolean
  createdAt: string
  updatedAt: string | null
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
  confirmPassword: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  token: string
  password: string
  confirmPassword: string
}
