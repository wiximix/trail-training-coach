"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import AuthGuard from "@/components/features/auth/AuthGuard"
import DashboardLayout from "@/components/features/layout/DashboardLayout"

interface Trail {
  id: string
  name: string
  cpCount: number
  checkpoints: Array<{
    id: number
    distance: number
    elevation: number
  }>
}

export default function TrailsPage() {
  const [trails, setTrails] = useState<Trail[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    fetchTrails()
  }, [])

  const fetchTrails = async () => {
    try {
      const response = await fetch("/api/trails")
      const data = await response.json()
      if (data.success) {
        setTrails(data.data)
      } else {
        setError(data.error || "获取赛道列表失败")
      }
    } catch (err) {
      setError("网络错误，请稍后重试")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`确定要删除赛道 "${name}" 吗？`)) {
      return
    }

    try {
      const response = await fetch(`/api/trails/${id}`, {
        method: "DELETE",
      })
      const data = await response.json()
      if (data.success) {
        setTrails(trails.filter((t) => t.id !== id))
      } else {
        alert(data.error || "删除失败")
      }
    } catch (err) {
      alert("网络错误，请稍后重试")
    }
  }

  const getTotalDistance = (checkpoints: Trail["checkpoints"]) => {
    return checkpoints.reduce((sum, cp) => sum + cp.distance, 0).toFixed(1)
  }

  const getTotalElevation = (checkpoints: Trail["checkpoints"]) => {
    return checkpoints.reduce((sum, cp) => sum + cp.elevation, 0).toFixed(0)
  }

  if (loading) {
    return (
      <AuthGuard>
        <DashboardLayout>
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-600">加载中...</div>
          </div>
        </DashboardLayout>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="space-y-6">
          {/* 页面标题和操作按钮 */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">赛道管理</h1>
              <p className="mt-1 text-sm text-gray-600">
                管理越野赛道的详细信息
              </p>
            </div>
            <button
              onClick={() => router.push("/trails/new")}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition-colors"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              新增赛道
            </button>
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="rounded-lg bg-red-50 p-4 text-red-600">{error}</div>
          )}

          {/* 赛道列表 */}
          {trails.length === 0 ? (
            <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center text-gray-500">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                <svg
                  className="h-6 w-6 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-medium text-gray-900">
                暂无赛道数据
              </h3>
              <p className="mb-6 text-sm text-gray-600">
                点击上方按钮添加第一个赛道
              </p>
              <button
                onClick={() => router.push("/trails/new")}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition-colors"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                创建赛道
              </button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {trails.map((trail) => (
                <div
                  key={trail.id}
                  className="rounded-lg bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <h3 className="mb-3 text-lg font-semibold text-gray-900">
                    {trail.name}
                  </h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span className="font-medium">CP点数量</span>
                      <span>{trail.cpCount} 个</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">总距离</span>
                      <span>{getTotalDistance(trail.checkpoints)} km</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">总爬升</span>
                      <span>{getTotalElevation(trail.checkpoints)} m</span>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => router.push(`/trails/${trail.id}/edit`)}
                      className="flex-1 rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => handleDelete(trail.id, trail.name)}
                      className="flex-1 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100 transition-colors"
                    >
                      删除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}
