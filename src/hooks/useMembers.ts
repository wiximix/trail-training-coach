/**
 * 成员管理相关的自定义 Hooks
 */

import { useState, useEffect, useCallback } from "react"
import { getMembers, createMember, updateMember, deleteMember } from "@/services"
import type { Member, InsertMember, UpdateMember, PaginationParams } from "@/types"

export function useMembers(params?: PaginationParams) {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMembers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await getMembers(params)
      if (response.success && response.data) {
        setMembers(response.data)
      } else {
        setError(response.error || "获取成员列表失败")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "获取成员列表失败")
    } finally {
      setLoading(false)
    }
  }, [params])

  const addMember = useCallback(async (data: InsertMember) => {
    try {
      const response = await createMember(data)
      if (response.success && response.data) {
        setMembers((prev) => [...prev, response.data!])
        return response.data
      } else {
        throw new Error(response.error || "创建成员失败")
      }
    } catch (err) {
      throw err
    }
  }, [])

  const editMember = useCallback(async (id: string, data: UpdateMember) => {
    try {
      const response = await updateMember(id, data)
      if (response.success && response.data) {
        setMembers((prev) =>
          prev.map((member) => (member.id === id ? response.data! : member))
        )
        return response.data
      } else {
        throw new Error(response.error || "更新成员失败")
      }
    } catch (err) {
      throw err
    }
  }, [])

  const removeMember = useCallback(async (id: string) => {
    try {
      const response = await deleteMember(id)
      if (response.success) {
        setMembers((prev) => prev.filter((member) => member.id !== id))
        return true
      } else {
        throw new Error(response.error || "删除成员失败")
      }
    } catch (err) {
      throw err
    }
  }, [])

  useEffect(() => {
    fetchMembers()
  }, [fetchMembers])

  return {
    members,
    loading,
    error,
    refetch: fetchMembers,
    addMember,
    editMember,
    removeMember,
  }
}

export function useMember(id: string) {
  const [member, setMember] = useState<Member | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      setLoading(false)
      return
    }

    const fetchMember = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await getMembers() // 这里应该调用 getMemberById，但为了简化先这样
        if (response.success && response.data) {
          const found = response.data.find((m) => m.id === id)
          setMember(found || null)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "获取成员详情失败")
      } finally {
        setLoading(false)
      }
    }

    fetchMember()
  }, [id])

  return { member, loading, error }
}
