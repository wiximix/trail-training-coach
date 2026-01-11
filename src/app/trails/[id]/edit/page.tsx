"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  calculatePer100mElevation,
  calculateSlopePercent,
  calculateElevationFactor,
} from "@/lib/trailAlgorithm"

interface Checkpoint {
  id: number
  distance: number
  elevation: number
  downhillDistance: number
  terrainType: "沙地" | "机耕道" | "山路" | "石铺路" | "台阶"
  per100mElevation?: number
  slopePercent?: number
  elevationFactor?: number
}

interface Trail {
  id: string
  name: string
  cpCount: number
  checkpoints: Checkpoint[]
}

export default function EditTrailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [trailId, setTrailId] = useState<string>("")

  const [formData, setFormData] = useState({
    name: "",
    cpCount: 0,
    checkpoints: [] as Checkpoint[],
  })

  useEffect(() => {
    params.then(({ id }) => {
      setTrailId(id)
      fetchTrail(id)
    })
  }, [params])

  const fetchTrail = async (id: string) => {
    try {
      const response = await fetch(`/api/trails/${id}`)
      const data = await response.json()
      if (data.success) {
        const trail = data.data as Trail

        // 为所有checkpoint计算坡度和爬升影响（使用抽离的算法）
        const checkpointsWithSlope = (trail.checkpoints || []).map((cp) => {
          const distance = Number(cp.distance)
          const elevation = Number(cp.elevation)

          if (distance > 0) {
            // 使用抽离的算法函数
            const per100mElevation = calculatePer100mElevation(elevation, distance)
            const slopePercent = calculateSlopePercent(elevation, distance)
            const elevationFactor = calculateElevationFactor(per100mElevation)

            return {
              ...cp,
              per100mElevation,
              slopePercent,
              elevationFactor,
            }
          }

          return cp
        })

        setFormData({
          name: trail.name || "",
          cpCount: trail.cpCount || 0,
          checkpoints: checkpointsWithSlope,
        })
      } else {
        setError(data.error || "获取赛道信息失败")
      }
    } catch (err) {
      setError("网络错误，请稍后重试")
    } finally {
      setLoading(false)
    }
  }

  const handleCpCountChange = (count: number) => {
    const newCheckpoints: Checkpoint[] = []
    for (let i = 0; i < count; i++) {
      const existingCp = formData.checkpoints[i]
      const distance = existingCp?.distance || 0
      const elevation = existingCp?.elevation || 0

      let newCp: Checkpoint = {
        id: i + 1,
        distance,
        elevation,
        downhillDistance: existingCp?.downhillDistance || 0,
        terrainType: existingCp?.terrainType || "山路",
      }

      // 计算坡度和爬升影响（使用抽离的算法）
      if (distance > 0) {
        const per100mElevation = calculatePer100mElevation(elevation, distance)
        const slopePercent = calculateSlopePercent(elevation, distance)
        const elevationFactor = calculateElevationFactor(per100mElevation)

        newCp = {
          ...newCp,
          per100mElevation,
          slopePercent,
          elevationFactor,
        }
      }

      newCheckpoints.push(newCp)
    }
    setFormData({
      ...formData,
      cpCount: count,
      checkpoints: newCheckpoints,
    })
  }

  const handleCheckpointChange = (
    index: number,
    field: keyof Checkpoint,
    value: number | string
  ) => {
    const newCheckpoints = [...formData.checkpoints]
    newCheckpoints[index] = { ...newCheckpoints[index], [field]: value }

    // 如果修改了距离或爬升，自动计算坡度和爬升影响（使用抽离的算法）
    if (field === "distance" || field === "elevation") {
      const distance = Number(newCheckpoints[index].distance)
      const elevation = Number(newCheckpoints[index].elevation)

      if (distance > 0) {
        // 使用抽离的算法函数
        const per100mElevation = calculatePer100mElevation(elevation, distance)
        const slopePercent = calculateSlopePercent(elevation, distance)
        const elevationFactor = calculateElevationFactor(per100mElevation)

        newCheckpoints[index] = {
          ...newCheckpoints[index],
          per100mElevation,
          slopePercent,
          elevationFactor,
        }
      }
    }

    setFormData({ ...formData, checkpoints: newCheckpoints })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSaving(true)

    try {
      const payload = {
        ...formData,
        cpCount: Number(formData.cpCount),
        checkpoints: formData.checkpoints.map((cp) => ({
          ...cp,
          distance: Number(cp.distance),
          elevation: Number(cp.elevation),
        })),
      }

      const response = await fetch(`/api/trails/${trailId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await response.json()
      if (data.success) {
        // 刷新路由缓存，确保列表页面显示最新数据
        router.refresh()
        router.push("/trails")
      } else {
        setError(data.error || "更新赛道失败")
      }
    } catch (err) {
      setError("网络错误，请稍后重试")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8">
            <Link href="/trails" className="text-blue-600 hover:text-blue-700">
              ← 返回赛道列表
            </Link>
          </div>
          <p className="text-center text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <Link href="/trails" className="text-blue-600 hover:text-blue-700">
            ← 返回赛道列表
          </Link>
          <h1 className="mt-4 text-3xl font-bold text-gray-900">编辑赛道</h1>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-600">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 rounded-lg bg-white p-6 shadow-md">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              赛道名称 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              CP点数量 <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              required
              min="1"
              value={formData.cpCount}
              onChange={(e) => handleCpCountChange(Number(e.target.value))}
              className="w-full rounded-md border border-gray-300 px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {formData.cpCount > 0 && (
            <div>
              <h3 className="mb-4 text-lg font-semibold text-gray-900">CP点详细信息</h3>
              <p className="mb-3 text-sm text-gray-500">
                编辑距离和爬升后，坡度数据和爬升影响将自动计算并保存
              </p>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                        CP点
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                        段落距离 (km)
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                        爬升量 (m)
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                        下坡距离 (m)
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                        路段类型
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                        每100米爬升 (m)
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                        坡度 (%)
                      </th>
                      <th
                        className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 cursor-help"
                        title="爬升影响根据每100米爬升量分级计算：0~3米：0.1；3~8米：0.3×每100米爬升；8~15米：0.4×每100米爬升；>15米：0.5×每100米爬升；下坡时为负值"
                      >
                        爬升影响(分钟) ⚡
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {formData.checkpoints.map((cp, index) => (
                      <tr key={cp.id}>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          CP{cp.id}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          <input
                            type="number"
                            required
                            min="0"
                            step="0.01"
                            value={cp.distance}
                            onChange={(e) =>
                              handleCheckpointChange(index, "distance", Number(e.target.value))
                            }
                            className="w-full rounded border border-gray-300 px-2 py-1 text-gray-900 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            placeholder="0.00"
                          />
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          <input
                            type="number"
                            required
                            min="0"
                            value={cp.elevation}
                            onChange={(e) =>
                              handleCheckpointChange(index, "elevation", Number(e.target.value))
                            }
                            className="w-full rounded border border-gray-300 px-2 py-1 text-gray-900 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            placeholder="0"
                          />
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          <input
                            type="number"
                            required
                            min="0"
                            value={cp.downhillDistance}
                            onChange={(e) =>
                              handleCheckpointChange(index, "downhillDistance", Number(e.target.value))
                            }
                            className="w-full rounded border border-gray-300 px-2 py-1 text-gray-900 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            placeholder="0"
                          />
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          <select
                            required
                            value={cp.terrainType}
                            onChange={(e) =>
                              handleCheckpointChange(index, "terrainType", e.target.value)
                            }
                            className="w-full rounded border border-gray-300 px-2 py-1 text-gray-900 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="沙地">沙地</option>
                            <option value="机耕道">机耕道</option>
                            <option value="山路">山路</option>
                            <option value="石铺路">石铺路</option>
                            <option value="台阶">台阶</option>
                          </select>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          <span className="inline-block rounded bg-blue-50 px-2 py-1 text-blue-800">
                            {cp.per100mElevation?.toFixed(2) || "-"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          <span className="inline-block rounded bg-green-50 px-2 py-1 text-green-800">
                            {cp.slopePercent?.toFixed(2) || "-"}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          <span
                            className={`inline-block rounded px-2 py-1 ${
                              cp.elevationFactor && cp.elevationFactor > 0
                                ? "bg-red-50 text-red-800"
                                : cp.elevationFactor && cp.elevationFactor < 0
                                ? "bg-green-50 text-green-800"
                                : "bg-gray-50 text-gray-800"
                            }`}
                          >
                            {cp.elevationFactor?.toFixed(2) || "-"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-lg bg-green-600 px-6 py-3 text-white font-medium hover:bg-green-700 disabled:bg-gray-400"
            >
              {saving ? "保存中..." : "保存"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/trails")}
              className="flex-1 rounded-lg bg-gray-100 px-6 py-3 font-medium text-gray-700 hover:bg-gray-200"
            >
              取消
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
