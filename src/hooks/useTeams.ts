/**
 * 跑团管理相关的自定义 Hooks
 */

import { useState, useEffect, useCallback } from "react"
import { getTeams, createTeam, updateTeam, deleteTeam } from "@/services"
import type { Team, InsertTeam, UpdateTeam, PaginationParams } from "@/types"

export function useTeams(params?: PaginationParams) {
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTeams = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await getTeams(params)
      if (response.success && response.data) {
        setTeams(response.data)
      } else {
        setError(response.error || "获取跑团列表失败")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "获取跑团列表失败")
    } finally {
      setLoading(false)
    }
  }, [params])

  const addTeam = useCallback(async (data: InsertTeam) => {
    try {
      const response = await createTeam(data)
      if (response.success && response.data) {
        setTeams((prev) => [...prev, response.data!])
        return response.data
      } else {
        throw new Error(response.error || "创建跑团失败")
      }
    } catch (err) {
      throw err
    }
  }, [])

  const editTeam = useCallback(async (id: string, data: UpdateTeam) => {
    try {
      const response = await updateTeam(id, data)
      if (response.success && response.data) {
        setTeams((prev) =>
          prev.map((team) => (team.id === id ? response.data! : team))
        )
        return response.data
      } else {
        throw new Error(response.error || "更新跑团失败")
      }
    } catch (err) {
      throw err
    }
  }, [])

  const removeTeam = useCallback(async (id: string) => {
    try {
      const response = await deleteTeam(id)
      if (response.success) {
        setTeams((prev) => prev.filter((team) => team.id !== id))
        return true
      } else {
        throw new Error(response.error || "删除跑团失败")
      }
    } catch (err) {
      throw err
    }
  }, [])

  useEffect(() => {
    fetchTeams()
  }, [fetchTeams])

  return {
    teams,
    loading,
    error,
    refetch: fetchTeams,
    addTeam,
    editTeam,
    removeTeam,
  }
}
