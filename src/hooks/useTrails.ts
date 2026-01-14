/**
 * 赛道管理相关的自定义 Hooks
 */

import { useState, useEffect, useCallback } from "react"
import { getTrails, createTrail, updateTrail, deleteTrail } from "@/services"
import type { Trail, InsertTrail, UpdateTrail, PaginationParams } from "@/types"

export function useTrails(params?: PaginationParams) {
  const [trails, setTrails] = useState<Trail[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTrails = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await getTrails(params)
      if (response.success && response.data) {
        setTrails(response.data)
      } else {
        setError(response.error || "获取赛道列表失败")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "获取赛道列表失败")
    } finally {
      setLoading(false)
    }
  }, [params])

  const addTrail = useCallback(async (data: InsertTrail) => {
    try {
      const response = await createTrail(data)
      if (response.success && response.data) {
        setTrails((prev) => [...prev, response.data!])
        return response.data
      } else {
        throw new Error(response.error || "创建赛道失败")
      }
    } catch (err) {
      throw err
    }
  }, [])

  const editTrail = useCallback(async (id: string, data: UpdateTrail) => {
    try {
      const response = await updateTrail(id, data)
      if (response.success && response.data) {
        setTrails((prev) =>
          prev.map((trail) => (trail.id === id ? response.data! : trail))
        )
        return response.data
      } else {
        throw new Error(response.error || "更新赛道失败")
      }
    } catch (err) {
      throw err
    }
  }, [])

  const removeTrail = useCallback(async (id: string) => {
    try {
      const response = await deleteTrail(id)
      if (response.success) {
        setTrails((prev) => prev.filter((trail) => trail.id !== id))
        return true
      } else {
        throw new Error(response.error || "删除赛道失败")
      }
    } catch (err) {
      throw err
    }
  }, [])

  useEffect(() => {
    fetchTrails()
  }, [fetchTrails])

  return {
    trails,
    loading,
    error,
    refetch: fetchTrails,
    addTrail,
    editTrail,
    removeTrail,
  }
}

export function useTrail(id: string) {
  const [trail, setTrail] = useState<Trail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      setLoading(false)
      return
    }

    const fetchTrail = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await getTrails() // 这里应该调用 getTrailById，但为了简化先这样
        if (response.success && response.data) {
          const found = response.data.find((t) => t.id === id)
          setTrail(found || null)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "获取赛道详情失败")
      } finally {
        setLoading(false)
      }
    }

    fetchTrail()
  }, [id])

  return { trail, loading, error }
}
