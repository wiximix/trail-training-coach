/**
 * 认证相关 API 服务
 */

import { post } from "./apiClient"
import type {
  ApiResponse,
  AuthUser,
  LoginRequest,
  RegisterRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
} from "@/types"

/**
 * 登录
 */
export async function login(
  credentials: LoginRequest
): Promise<ApiResponse<{ user: AuthUser; token: string }>> {
  return post<{ user: AuthUser; token: string }>("/api/auth/login", credentials)
}

/**
 * 注册
 */
export async function register(
  data: RegisterRequest
): Promise<ApiResponse<{ user: AuthUser; token: string }>> {
  return post<{ user: AuthUser; token: string }>("/api/auth/register", data)
}

/**
 * 忘记密码
 */
export async function forgotPassword(
  data: ForgotPasswordRequest
): Promise<ApiResponse<void>> {
  return post("/api/auth/forgot-password", data)
}

/**
 * 重置密码
 */
export async function resetPassword(
  data: ResetPasswordRequest
): Promise<ApiResponse<void>> {
  return post("/api/auth/reset-password", data)
}
