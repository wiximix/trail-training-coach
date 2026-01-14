/**
 * API 客户端基础封装
 * 提供统一的请求封装和错误处理
 */

import type { ApiResponse } from "@/types"

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

/**
 * API 配置
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ""

/**
 * 通用请求函数
 */
async function request<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`

  // 默认请求头
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  }

  // 自动添加 token
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token")
    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    })

    // 尝试解析 JSON 响应
    const data: ApiResponse<T> = await response.json().catch(() => ({
      success: false,
      error: "解析响应失败",
    }))

    if (!response.ok) {
      throw new ApiError(
        data.error || `请求失败: ${response.statusText}`,
        response.status,
        data
      )
    }

    return data
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }

    // 网络错误或其他错误
    throw new ApiError(
      error instanceof Error ? error.message : "网络错误",
      undefined,
      error
    )
  }
}

/**
 * GET 请求
 */
export function get<T = any>(endpoint: string): Promise<ApiResponse<T>> {
  return request<T>(endpoint, { method: "GET" })
}

/**
 * POST 请求
 */
export function post<T = any>(
  endpoint: string,
  body?: any
): Promise<ApiResponse<T>> {
  return request<T>(endpoint, {
    method: "POST",
    body: body ? JSON.stringify(body) : undefined,
  })
}

/**
 * PUT 请求
 */
export function put<T = any>(
  endpoint: string,
  body?: any
): Promise<ApiResponse<T>> {
  return request<T>(endpoint, {
    method: "PUT",
    body: body ? JSON.stringify(body) : undefined,
  })
}

/**
 * DELETE 请求
 */
export function del<T = any>(endpoint: string): Promise<ApiResponse<T>> {
  return request<T>(endpoint, { method: "DELETE" })
}

/**
 * 文件上传
 */
export async function uploadFile<T = any>(
  endpoint: string,
  file: File,
  fieldName: string = "file"
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`
  const formData = new FormData()
  formData.append(fieldName, file)

  const headers: HeadersInit = {}

  // 自动添加 token
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token")
    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: formData,
    })

    const data: ApiResponse<T> = await response.json()

    if (!response.ok) {
      throw new ApiError(
        data.error || `上传失败: ${response.statusText}`,
        response.status,
        data
      )
    }

    return data
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }

    throw new ApiError(
      error instanceof Error ? error.message : "上传失败",
      undefined,
      error
    )
  }
}
