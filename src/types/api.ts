/**
 * API 通用类型定义
 */

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginationParams {
  skip?: number
  limit?: number
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total?: number
  skip?: number
  limit?: number
}

/**
 * API 错误类型
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public details?: any
  ) {
    super(message)
    this.name = "ApiError"
  }
}
