"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

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
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8">
            <Link href="/" className="text-blue-600 hover:text-blue-700">
              ← 返回首页
            </Link>
          </div>
          <p className="text-center text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link href="/" className="text-blue-600 hover:text-blue-700">
              ← 返回首页
            </Link>
            <h1 className="mt-4 text-3xl font-bold text-gray-900">赛道管理</h1>
          </div>
          <button
            onClick={() => router.push("/trails/new")}
            className="rounded-lg bg-green-600 px-6 py-3 text-white font-medium hover:bg-green-700"
          >
            新增赛道
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-600">
            {error}
          </div>
        )}

        {trails.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center text-gray-500">
            暂无赛道数据，点击上方按钮添加第一个赛道
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {trails.map((trail) => (
              <div key={trail.id} className="rounded-lg bg-white p-6 shadow-md">
                <h3 className="mb-3 text-xl font-semibold text-gray-900">
                  {trail.name}
                </h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">CP点数量：</span>
                    {trail.cpCount} 个
                  </div>
                  <div>
                    <span className="font-medium">总距离：</span>
                    {getTotalDistance(trail.checkpoints)} km
                  </div>
                  <div>
                    <span className="font-medium">总爬升：</span>
                    {getTotalElevation(trail.checkpoints)} m
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => router.push(`/trails/${trail.id}/edit`)}
                    className="flex-1 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
                  >
                    编辑
                  </button>
                  <button
                    onClick={() => handleDelete(trail.id, trail.name)}
                    className="flex-1 rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
                  >
                    删除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
