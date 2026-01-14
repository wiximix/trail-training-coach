/**
 * 成员管理 API 服务
 */

import { get, post, put, del } from "./apiClient"
import type {
  ApiResponse,
  Member,
  InsertMember,
  UpdateMember,
  PaginationParams,
} from "@/types"

/**
 * 获取成员列表
 */
export function getMembers(
  params?: PaginationParams
): Promise<ApiResponse<Member[]>> {
  const searchParams = new URLSearchParams()
  if (params?.skip !== undefined) searchParams.append("skip", String(params.skip))
  if (params?.limit !== undefined) searchParams.append("limit", String(params.limit))
  const query = searchParams.toString()
  return get<Member[]>(`/api/members${query ? `?${query}` : ""}`)
}

/**
 * 获取成员详情
 */
export function getMemberById(id: string): Promise<ApiResponse<Member>> {
  return get<Member>(`/api/members/${id}`)
}

/**
 * 创建成员
 */
export function createMember(data: InsertMember): Promise<ApiResponse<Member>> {
  return post<Member>("/api/members", data)
}

/**
 * 更新成员
 */
export function updateMember(
  id: string,
  data: UpdateMember
): Promise<ApiResponse<Member>> {
  return put<Member>(`/api/members/${id}`, data)
}

/**
 * 删除成员
 */
export function deleteMember(id: string): Promise<ApiResponse<void>> {
  return del<void>(`/api/members/${id}`)
}
