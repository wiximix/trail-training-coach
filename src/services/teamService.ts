/**
 * 跑团管理 API 服务
 */

import { get, post, put, del } from "./apiClient"
import type {
  ApiResponse,
  Team,
  TeamMember,
  InsertTeam,
  UpdateTeam,
  InsertTeamMember,
  UpdateTeamMember,
  PaginationParams,
} from "@/types"

/**
 * 获取跑团列表
 */
export function getTeams(
  params?: PaginationParams
): Promise<ApiResponse<Team[]>> {
  const searchParams = new URLSearchParams()
  if (params?.skip !== undefined) searchParams.append("skip", String(params.skip))
  if (params?.limit !== undefined) searchParams.append("limit", String(params.limit))
  const query = searchParams.toString()
  return get<Team[]>(`/api/teams${query ? `?${query}` : ""}`)
}

/**
 * 获取我的跑团
 */
export function getMyTeams(): Promise<ApiResponse<Team[]>> {
  return get<Team[]>("/api/teams/my")
}

/**
 * 获取跑团详情
 */
export function getTeamById(id: string): Promise<ApiResponse<Team>> {
  return get<Team>(`/api/teams/${id}`)
}

/**
 * 创建跑团
 */
export function createTeam(data: InsertTeam): Promise<ApiResponse<Team>> {
  return post<Team>("/api/teams", data)
}

/**
 * 更新跑团
 */
export function updateTeam(
  id: string,
  data: UpdateTeam
): Promise<ApiResponse<Team>> {
  return put<Team>(`/api/teams/${id}`, data)
}

/**
 * 删除跑团
 */
export function deleteTeam(id: string): Promise<ApiResponse<void>> {
  return del<void>(`/api/teams/${id}`)
}

/**
 * 获取跑团成员列表
 */
export function getTeamMembers(
  teamId: string,
  params?: PaginationParams
): Promise<ApiResponse<TeamMember[]>> {
  const searchParams = new URLSearchParams()
  if (params?.skip !== undefined) searchParams.append("skip", String(params.skip))
  if (params?.limit !== undefined) searchParams.append("limit", String(params.limit))
  const query = searchParams.toString()
  return get<TeamMember[]>(
    `/api/teams/${teamId}/members${query ? `?${query}` : ""}`
  )
}

/**
 * 添加跑团成员
 */
export function addTeamMember(
  teamId: string,
  data: InsertTeamMember
): Promise<ApiResponse<TeamMember>> {
  return post<TeamMember>(`/api/teams/${teamId}/members`, data)
}

/**
 * 更新跑团成员角色
 */
export function updateTeamMemberRole(
  teamId: string,
  userId: string,
  data: UpdateTeamMember
): Promise<ApiResponse<TeamMember>> {
  return put<TeamMember>(
    `/api/teams/${teamId}/members/${userId}`,
    data
  )
}

/**
 * 移除跑团成员
 */
export function removeTeamMember(
  teamId: string,
  userId: string
): Promise<ApiResponse<void>> {
  return del<void>(`/api/teams/${teamId}/members/${userId}`)
}

/**
 * 申请加入跑团
 */
export function applyToJoinTeam(
  teamId: string
): Promise<ApiResponse<void>> {
  return post<void>(`/api/teams/${teamId}/apply`, {})
}

/**
 * 批准跑团申请
 */
export function approveTeamMember(
  teamId: string,
  userId: string
): Promise<ApiResponse<void>> {
  return post<void>(`/api/teams/${teamId}/approve`, { userId })
}

/**
 * 拒绝跑团申请
 */
export function rejectTeamMember(
  teamId: string,
  userId: string
): Promise<ApiResponse<void>> {
  return post<void>(`/api/teams/${teamId}/reject`, { userId })
}

/**
 * 离开跑团
 */
export function leaveTeam(teamId: string): Promise<ApiResponse<void>> {
  return post<void>(`/api/teams/${teamId}/leave`, {})
}
