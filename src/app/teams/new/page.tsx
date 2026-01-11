"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import AuthGuard from "@/components/AuthGuard"
import DashboardLayout from "@/components/DashboardLayout"

export default function CreateTeamPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      setError("请输入跑团名称")
      return
    }

    setLoading(true)
    setError("")

    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}")
      const payload = {
        ...formData,
        ownerId: user.id,
      }

      const response = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await response.json()
      if (data.success) {
        router.push("/teams")
      } else {
        setError(data.error || "创建跑团失败")
      }
    } catch (err) {
      setError("网络错误，请稍后重试")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <Link href="/teams" className="text-blue-600 hover:text-blue-700">
              ← 返回跑团列表
            </Link>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-gray-900">创建跑团</h1>
            <p className="mt-1 text-sm text-gray-600">
              创建一个新的跑团，邀请其他跑者一起训练
            </p>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-4 text-red-600">{error}</div>
          )}

          <div className="rounded-lg bg-white p-6 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  跑团名称 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="例如：周末跑团、越野训练营"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  maxLength={100}
                />
                <p className="mt-1 text-sm text-gray-600">
                  最多 {formData.name.length}/100 字符
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  跑团描述
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="介绍一下你的跑团，例如训练时间、地点、目标等..."
                  rows={4}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded-lg bg-blue-600 px-6 py-3 text-white font-medium hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {loading ? "创建中..." : "创建跑团"}
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/teams")}
                  className="flex-1 rounded-lg bg-gray-100 px-6 py-3 font-medium text-gray-700 hover:bg-gray-200"
                >
                  取消
                </button>
              </div>
            </form>
          </div>
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}
