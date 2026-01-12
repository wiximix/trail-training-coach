"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

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

export default function NewTrailPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [recognizing, setRecognizing] = useState(false)
  const [error, setError] = useState("")
  const [routeMapKey, setRouteMapKey] = useState("")
  const [routeMapUrl, setRouteMapUrl] = useState("")
  const [uploading, setUploading] = useState(false)

  // 计算爬升影响值
  const calculateElevationFactor = (per100mElevation: number): number => {
    let elevationFactor

    // 判断上下坡
    if (per100mElevation >= 0) {
      // 上坡处理：根据坡度分级计算
      if (per100mElevation <= 3) {
        // 平路/微坡（0~3米）：轻微影响
        elevationFactor = 0.1
      } else if (per100mElevation <= 8) {
        // 缓上坡（3~8米）：缓坡线性影响
        elevationFactor = 0.3 * per100mElevation
      } else if (per100mElevation <= 15) {
        // 陡上坡（8~15米）：陡坡影响系数提升
        elevationFactor = 0.4 * per100mElevation
      } else {
        // 急上坡（>15米）：急坡大幅增加配速
        elevationFactor = 0.5 * per100mElevation
      }
    } else {
      // 下坡处理：负值计算
      const absElevation = Math.abs(per100mElevation)

      // 下坡配速提升，系数在 -0.1 到 -0.2 之间
      const slopeRatio = Math.min(absElevation / 10, 1)
      elevationFactor = -(0.1 + 0.1 * slopeRatio) * absElevation

      // 最低限制：不低于-0.5
      elevationFactor = Math.max(elevationFactor, -0.5)
    }

    return Number(elevationFactor.toFixed(2))
  }

  const [formData, setFormData] = useState({
    name: "",
    cpCount: 0,
    checkpoints: [] as Checkpoint[],
  })

  // 上传路书图片
  const handleUploadRouteMap = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError("")

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()
      if (data.success) {
        setRouteMapKey(data.data.fileKey)
        setRouteMapUrl(data.data.signedUrl)
      } else {
        setError(data.error || "上传失败")
      }
    } catch (err) {
      setError("网络错误，请稍后重试")
    } finally {
      setUploading(false)
    }
  }

  // 识别路书
  const handleRecognizeRoute = async () => {
    if (!routeMapUrl) {
      setError("请先上传路书图片")
      return
    }

    setRecognizing(true)
    setError("")

    try {
      const response = await fetch("/api/recognize-route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: routeMapUrl }),
      })

      const data = await response.json()
      if (data.success) {
        setFormData({
          name: data.data.name || "",
          cpCount: data.data.cpCount || data.data.checkpoints.length,
          checkpoints: data.data.checkpoints,
        })
      } else {
        setError(data.error || "识别失败，请手动输入")
      }
    } catch (err) {
      setError("网络错误，请稍后重试")
    } finally {
      setRecognizing(false)
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

      // 计算坡度
      if (distance > 0) {
        const num100mSegments = distance * 10
        const per100mElevation = elevation / num100mSegments
        const slopePercent = (elevation / (distance * 1000)) * 100
        const elevationFactor = calculateElevationFactor(per100mElevation)

        newCp = {
          ...newCp,
          per100mElevation: Number(per100mElevation.toFixed(2)),
          slopePercent: Number(slopePercent.toFixed(2)),
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

    // 如果修改了距离或爬升，自动计算坡度和爬升影响
    if (field === "distance" || field === "elevation") {
      const distance = Number(newCheckpoints[index].distance)
      const elevation = Number(newCheckpoints[index].elevation)

      if (distance > 0) {
        // 计算每100米爬升量
        const num100mSegments = distance * 10
        const per100mElevation = elevation / num100mSegments

        // 计算坡度百分比
        const slopePercent = (elevation / (distance * 1000)) * 100

        // 计算爬升影响
        const elevationFactor = calculateElevationFactor(per100mElevation)

        newCheckpoints[index] = {
          ...newCheckpoints[index],
          per100mElevation: Number(per100mElevation.toFixed(2)),
          slopePercent: Number(slopePercent.toFixed(2)),
          elevationFactor,
        }
      }
    }

    setFormData({ ...formData, checkpoints: newCheckpoints })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const payload = {
        ...formData,
        cpCount: Number(formData.cpCount),
        routeMapKey,
        routeMapUrl,
        checkpoints: formData.checkpoints.map((cp) => ({
          ...cp,
          distance: Number(cp.distance),
          elevation: Number(cp.elevation),
        })),
      }

      const response = await fetch("/api/trails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await response.json()
      if (data.success) {
        // 刷新路由缓存，确保列表页面显示最新数据
        router.refresh()
        router.push("/trails")
      } else {
        setError(data.error || "创建赛道失败")
      }
    } catch (err) {
      setError("网络错误，请稍后重试")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <Link href="/trails" className="text-blue-600 hover:text-blue-700">
            ← 返回赛道列表
          </Link>
          <h1 className="mt-4 text-3xl font-bold text-gray-900">新增赛道</h1>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-600">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 rounded-lg bg-white p-6 shadow-md">
          {/* 路书图片上传区域 */}
          <div className="rounded-lg border-2 border-dashed border-gray-300 p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">路书图片识别（可选）</h3>
            <p className="mb-4 text-sm text-gray-500">
              上传路书图片，AI将自动识别赛道信息并填入表单
            </p>

            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    选择图片文件
                  </label>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                    onChange={handleUploadRouteMap}
                    disabled={uploading}
                    className="w-full rounded-md border border-gray-300 px-4 py-2 text-gray-900 file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={handleRecognizeRoute}
                    disabled={!routeMapUrl || recognizing}
                    className="rounded-lg bg-purple-600 px-6 py-2.5 text-white font-medium hover:bg-purple-700 disabled:bg-gray-400"
                  >
                    {recognizing ? "识别中..." : "识别路书"}
                  </button>
                </div>
              </div>

              {routeMapUrl && (
                <div className="flex items-start gap-4">
                  <img
                    src={routeMapUrl}
                    alt="路书预览"
                    className="h-40 w-auto rounded-lg border border-gray-200 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setRouteMapKey("")
                      setRouteMapUrl("")
                    }}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    删除图片
                  </button>
                </div>
              )}
            </div>
          </div>

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
              placeholder="例如：2024北京100公里越野赛"
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
              placeholder="例如：10"
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
              disabled={loading}
              className="flex-1 rounded-lg bg-green-600 px-6 py-3 text-white font-medium hover:bg-green-700 disabled:bg-gray-400"
            >
              {loading ? "保存中..." : "保存"}
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
