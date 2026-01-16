/**
 * 赛道管理 API 服务
 */

import { get, post, put, del, uploadFile } from "./apiClient"
import type {
  ApiResponse,
  Trail,
  InsertTrail,
  UpdateTrail,
  PaginationParams,
} from "@/types"

/**
 * 获取赛道列表
 */
export function getTrails(
  params?: PaginationParams
): Promise<ApiResponse<Trail[]>> {
  const searchParams = new URLSearchParams()
  if (params?.skip !== undefined) searchParams.append("skip", String(params.skip))
  if (params?.limit !== undefined) searchParams.append("limit", String(params.limit))
  const query = searchParams.toString()
  return get<Trail[]>(`/api/trails${query ? `?${query}` : ""}`)
}

/**
 * 获取赛道详情
 */
export function getTrailById(id: string): Promise<ApiResponse<Trail>> {
  return get<Trail>(`/api/trails/${id}`)
}

/**
 * 创建赛道
 */
export function createTrail(data: InsertTrail): Promise<ApiResponse<Trail>> {
  return post<Trail>("/api/trails", data)
}

/**
 * 更新赛道
 */
export function updateTrail(
  id: string,
  data: UpdateTrail
): Promise<ApiResponse<Trail>> {
  return put<Trail>(`/api/trails/${id}`, data)
}

/**
 * 删除赛道
 */
export function deleteTrail(id: string): Promise<ApiResponse<void>> {
  return del<void>(`/api/trails/${id}`)
}

/**
 * 识别路书
 */
export function recognizeRoute(
  file: File
): Promise<ApiResponse<any>> {
  return uploadFile("/api/recognize-route", file, "image")
}

/**
 * 上传路书图片
 */
export function uploadRouteMap(
  file: File
): Promise<ApiResponse<{ fileKey: string; signedUrl: string }>> {
  return uploadFile("/api/upload", file, "file")
}
