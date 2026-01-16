/**
 * 地形类型 API 服务
 */

import { get, post, put, del } from "./apiClient"
import type {
  ApiResponse,
  TerrainType,
  InsertTerrainType,
  UpdateTerrainType,
  PaginationParams,
} from "@/types"

/**
 * 获取地形类型列表
 */
export function getTerrainTypes(
  params?: PaginationParams
): Promise<ApiResponse<TerrainType[]>> {
  const searchParams = new URLSearchParams()
  if (params?.skip !== undefined) searchParams.append("skip", String(params.skip))
  if (params?.limit !== undefined) searchParams.append("limit", String(params.limit))
  const query = searchParams.toString()
  return get<TerrainType[]>(`/api/terrain-types${query ? `?${query}` : ""}`)
}

/**
 * 获取地形类型详情
 */
export function getTerrainTypeById(id: string): Promise<ApiResponse<TerrainType>> {
  return get<TerrainType>(`/api/terrain-types/${id}`)
}

/**
 * 创建地形类型
 */
export function createTerrainType(data: InsertTerrainType): Promise<ApiResponse<TerrainType>> {
  return post<TerrainType>("/api/terrain-types", data)
}

/**
 * 更新地形类型
 */
export function updateTerrainType(
  id: string,
  data: UpdateTerrainType
): Promise<ApiResponse<TerrainType>> {
  return put<TerrainType>(`/api/terrain-types/${id}`, data)
}

/**
 * 删除地形类型
 */
export function deleteTerrainType(id: string): Promise<ApiResponse<void>> {
  return del<void>(`/api/terrain-types/${id}`)
}
