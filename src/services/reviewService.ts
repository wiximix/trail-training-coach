/**
 * 复盘相关 API 服务
 */

import { get, post, put, del } from "./apiClient"
import type {
  ApiResponse,
  Review,
  InsertReview,
  UpdateReview,
  PaginationParams,
} from "@/types"

/**
 * 获取复盘列表
 */
export function getReviews(
  params?: PaginationParams
): Promise<ApiResponse<Review[]>> {
  const searchParams = new URLSearchParams()
  if (params?.skip !== undefined) searchParams.append("skip", String(params.skip))
  if (params?.limit !== undefined) searchParams.append("limit", String(params.limit))
  const query = searchParams.toString()
  return get<Review[]>(`/api/reviews${query ? `?${query}` : ""}`)
}

/**
 * 获取复盘详情
 */
export function getReviewById(id: string): Promise<ApiResponse<Review>> {
  return get<Review>(`/api/reviews/${id}`)
}

/**
 * 创建复盘
 */
export function createReview(data: InsertReview): Promise<ApiResponse<Review>> {
  return post<Review>("/api/reviews", data)
}

/**
 * 更新复盘
 */
export function updateReview(
  id: string,
  data: UpdateReview
): Promise<ApiResponse<Review>> {
  return put<Review>(`/api/reviews/${id}`, data)
}

/**
 * 删除复盘
 */
export function deleteReview(id: string): Promise<ApiResponse<void>> {
  return del<void>(`/api/reviews/${id}`)
}
