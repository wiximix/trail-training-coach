"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import AuthGuard from "@/components/AuthGuard"
import DashboardLayout from "@/components/DashboardLayout"

interface TerrainType {
  id: string
  name: string
  paceFactor: string
  color: string
  icon: string | null
  isActive: boolean
  sortOrder: number
}

export default function SettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [terrainTypes, setTerrainTypes] = useState<TerrainType[]>([])

  // 新增地形类型表单
  const [newTerrainType, setNewTerrainType] = useState({
    name: "",
    paceFactor: "1.0",
    color: "#6366F1",
    icon: "",
    sortOrder: 0,
  })

  useEffect(() => {
    fetchTerrainTypes()
  }, [])

  const fetchTerrainTypes = async () => {
    try {
      const response = await fetch("/api/terrain-types")
      const data = await response.json()
      if (data.success) {
        setTerrainTypes(data.data)
      } else {
        setError("加载地形类型失败")
      }
    } catch (err) {
      setError("网络错误，请稍后重试")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTerrainType = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSaving(true)

    try {
      const response = await fetch("/api/terrain-types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTerrainType),
      })

      const data = await response.json()
      if (data.success) {
        setNewTerrainType({
          name: "",
          paceFactor: "1.0",
          color: "#6366F1",
          icon: "",
          sortOrder: 0,
        })
        fetchTerrainTypes()
      } else {
        setError(data.error || "创建失败")
      }
    } catch (err) {
      setError("网络错误，请稍后重试")
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateTerrainType = async (id: string, updates: Partial<TerrainType>) => {
    try {
      const response = await fetch(`/api/terrain-types/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })

      const data = await response.json()
      if (data.success) {
        setTerrainTypes(prev =>
          prev.map(tt => tt.id === id ? data.data : tt)
        )
      } else {
        setError(data.error || "更新失败")
      }
    } catch (err) {
      setError("网络错误，请稍后重试")
    }
  }

  const handleDeleteTerrainType = async (id: string) => {
    if (!confirm("确定要删除这个地形类型吗？")) return

    try {
      const response = await fetch(`/api/terrain-types/${id}`, {
        method: "DELETE",
      })

      const data = await response.json()
      if (data.success) {
        setTerrainTypes(prev => prev.filter(tt => tt.id !== id))
      } else {
        setError(data.error || "删除失败")
      }
    } catch (err) {
      setError("网络错误，请稍后重试")
    }
  }

  if (loading) {
    return (
      <AuthGuard>
        <DashboardLayout>
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-600 dark:text-gray-400">加载中...</div>
          </div>
        </DashboardLayout>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">系统设置</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              配置全局参数，如地形类型及其复杂度系数
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-lg bg-red-50 dark:bg-red-900/20 p-4 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800">
              {error}
            </div>
          )}

          {/* 地形类型设置 */}
          <div className="rounded-lg bg-white dark:bg-gray-800 shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">地形类型配置</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              地形复杂度系数α：表示地形对配速的影响程度。系数越大，该地形对配速的影响越大。
              例如，系数为1.1表示在该地形上的配速会增加10%。
            </p>

            {/* 地形类型列表 */}
            <div className="space-y-4 mb-8">
              {terrainTypes.map((terrainType) => (
                <div
                  key={terrainType.id}
                  className={`flex items-center gap-4 p-4 border rounded-lg ${
                    !terrainType.isActive
                      ? "bg-gray-50 dark:bg-gray-700/50 opacity-60"
                      : "bg-white dark:bg-gray-800"
                  } border-gray-200 dark:border-gray-700`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="text"
                        value={terrainType.name}
                        onChange={(e) => handleUpdateTerrainType(terrainType.id, { name: e.target.value })}
                        className="text-sm font-medium text-gray-900 dark:text-white bg-transparent border border-transparent hover:border-gray-300 dark:hover:border-gray-600 rounded px-2 py-1 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                      />
                      <div
                        className="w-6 h-6 rounded-full"
                        style={{ backgroundColor: terrainType.color }}
                      />
                      {!terrainType.isActive && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">(已禁用)</span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <label className="text-gray-600 dark:text-gray-400">系数α:</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0.1"
                          max="5"
                          value={parseFloat(terrainType.paceFactor)}
                          onChange={(e) => handleUpdateTerrainType(terrainType.id, { paceFactor: e.target.value })}
                          className="w-20 rounded border border-gray-300 dark:border-gray-600 px-2 py-1 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-gray-600 dark:text-gray-400">排序:</label>
                        <input
                          type="number"
                          min="0"
                          max="99"
                          value={terrainType.sortOrder}
                          onChange={(e) => handleUpdateTerrainType(terrainType.id, { sortOrder: parseInt(e.target.value) })}
                          className="w-16 rounded border border-gray-300 dark:border-gray-600 px-2 py-1 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-gray-600 dark:text-gray-400">启用:</label>
                        <input
                          type="checkbox"
                          checked={terrainType.isActive}
                          onChange={(e) => handleUpdateTerrainType(terrainType.id, { isActive: e.target.checked })}
                          className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteTerrainType(terrainType.id)}
                    className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                    title="删除"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            {/* 新增地形类型表单 */}
            <form onSubmit={handleCreateTerrainType} className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">新增地形类型</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    地形类型名称
                  </label>
                  <input
                    type="text"
                    value={newTerrainType.name}
                    onChange={(e) => setNewTerrainType({ ...newTerrainType, name: e.target.value })}
                    required
                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    placeholder="如：沙地、机耕道"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    地形复杂度系数 α
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.1"
                    max="5"
                    value={newTerrainType.paceFactor}
                    onChange={(e) => setNewTerrainType({ ...newTerrainType, paceFactor: e.target.value })}
                    required
                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    placeholder="如：1.1"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    颜色
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={newTerrainType.color}
                      onChange={(e) => setNewTerrainType({ ...newTerrainType, color: e.target.value })}
                      className="h-10 w-20 rounded border border-gray-300 dark:border-gray-600"
                    />
                    <input
                      type="text"
                      value={newTerrainType.color}
                      onChange={(e) => setNewTerrainType({ ...newTerrainType, color: e.target.value })}
                      className="flex-1 rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                      placeholder="#6366F1"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    排序序号
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="99"
                    value={newTerrainType.sortOrder}
                    onChange={(e) => setNewTerrainType({ ...newTerrainType, sortOrder: parseInt(e.target.value) })}
                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="mt-4">
                <button
                  type="submit"
                  disabled={saving || !newTerrainType.name}
                  className="rounded-lg bg-blue-600 px-6 py-2 text-white font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {saving ? "添加中..." : "添加地形类型"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}
