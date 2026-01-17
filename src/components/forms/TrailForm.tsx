"use client"

import { useState, useEffect } from "react"
import { Upload, ZoomIn, Sparkles, X } from "lucide-react"

export interface Checkpoint {
  id: number
  distance: number
  elevation: number
  downhillDistance: number
  terrainType: "沙地" | "机耕道" | "山路" | "石铺路" | "台阶"
  per100mElevation?: number
  slopePercent?: number
  elevationFactor?: number
}

export interface TrailFormData {
  name: string
  cpCount: number
  checkpoints: Checkpoint[]
  routeMapKey?: string
  routeMapUrl?: string
}

interface TrailFormProps {
  onSubmit: (data: TrailFormData) => Promise<void> | void
  initialData?: Partial<TrailFormData>
  mode?: "create" | "edit"
  loading?: boolean
  error?: string
  onUploadRouteMap?: (file: File) => Promise<void>
  onRecognizeRoute?: () => Promise<void>
  uploading?: boolean
  recognizing?: boolean
}

const TERRAIN_TYPES = ["沙地", "机耕道", "山路", "石铺路", "台阶"]

export default function TrailForm({
  onSubmit,
  initialData = {},
  mode = "create",
  loading = false,
  error,
  onUploadRouteMap,
  onRecognizeRoute,
  uploading = false,
  recognizing = false,
}: TrailFormProps) {
  const [formData, setFormData] = useState<TrailFormData>({
    name: initialData.name || "",
    cpCount: initialData.cpCount || 0,
    checkpoints: initialData.checkpoints || [],
    routeMapKey: initialData.routeMapKey,
    routeMapUrl: initialData.routeMapUrl,
  })

  const [showImageModal, setShowImageModal] = useState(false)

  useEffect(() => {
    if (Object.keys(initialData).length > 0) {
      setFormData({
        name: initialData.name || "",
        cpCount: initialData.cpCount || 0,
        checkpoints: initialData.checkpoints || [],
        routeMapKey: initialData.routeMapKey,
        routeMapUrl: initialData.routeMapUrl,
      })
    }
  }, [initialData])

  // 计算爬升影响值
  const calculateElevationFactor = (per100mElevation: number): number => {
    let elevationFactor

    if (per100mElevation >= 0) {
      if (per100mElevation <= 3) {
        elevationFactor = 0.1
      } else if (per100mElevation <= 8) {
        elevationFactor = 0.3 * per100mElevation
      } else if (per100mElevation <= 15) {
        elevationFactor = 0.4 * per100mElevation
      } else {
        elevationFactor = 0.5 * per100mElevation
      }
    } else {
      const absElevation = Math.abs(per100mElevation)
      const slopeRatio = Math.min(absElevation / 10, 1)
      elevationFactor = -(0.1 + 0.1 * slopeRatio) * absElevation
      elevationFactor = Math.max(elevationFactor, -0.5)
    }

    return Number(elevationFactor.toFixed(2))
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

    if (field === "distance" || field === "elevation") {
      const distance = Number(newCheckpoints[index].distance)
      const elevation = Number(newCheckpoints[index].elevation)

      if (distance > 0) {
        const num100mSegments = distance * 10
        const per100mElevation = elevation / num100mSegments
        const slopePercent = (elevation / (distance * 1000)) * 100
        const elevationFactor = calculateElevationFactor(per100mElevation)

        newCheckpoints[index] = {
          ...newCheckpoints[index],
          per100mElevation: Number(per100mElevation.toFixed(2)),
          slopePercent: Number(slopePercent.toFixed(2)),
          elevationFactor,
        }
      }
    }

    setFormData({
      ...formData,
      checkpoints: newCheckpoints,
    })
  }

  const handleUploadRouteMap = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !onUploadRouteMap) return

    await onUploadRouteMap(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-lg bg-white dark:bg-gray-800 p-6 shadow-md">
      {error && (
        <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800">
          {error}
        </div>
      )}

      {/* 基本信息 */}
      <div>
        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">基本信息</h2>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              赛道名称 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              placeholder="请输入赛道名称"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              CP点数量
            </label>
            <input
              type="number"
              min="0"
              value={formData.cpCount}
              onChange={(e) => handleCpCountChange(Number(e.target.value))}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              placeholder="0"
            />
          </div>

          {/* 路书上传 */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              路书图片
            </label>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 rounded-md border-2 border-dashed border-gray-300 dark:border-gray-600 px-4 py-3 hover:border-blue-500 dark:hover:border-blue-400 cursor-pointer transition-colors">
                  <Upload className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {uploading ? "上传中..." : "点击上传路书"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleUploadRouteMap}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
                {formData.routeMapUrl && onRecognizeRoute && (
                  <button
                    type="button"
                    onClick={onRecognizeRoute}
                    disabled={recognizing || !formData.routeMapUrl}
                    className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-3 text-white font-medium hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    <Sparkles className="h-4 w-4" />
                    {recognizing ? "识别中..." : "AI 识别路书"}
                  </button>
                )}
              </div>

              {formData.routeMapUrl && (
                <div className="relative group">
                  <div
                    className="relative inline-block cursor-pointer rounded-lg border-2 border-gray-200 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 overflow-hidden"
                    onClick={() => setShowImageModal(true)}
                  >
                    <img
                      src={formData.routeMapUrl}
                      alt="路书"
                      className="h-48 w-auto object-contain"
                    />
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <ZoomIn className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CP点列表 */}
      {formData.cpCount > 0 && formData.checkpoints.length > 0 && (
        <div>
          <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">CP点列表</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-300">
                    CP点
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-300">
                    距离 (km)
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-300">
                    爬升 (m)
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-300">
                    下坡 (m)
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-300">
                    地形类型
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-300">
                    坡度 (%)
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-300">
                    每100m爬升 (m)
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-300">
                    爬升影响
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                {formData.checkpoints.map((cp, index) => (
                  <tr key={cp.id}>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                      CP{cp.id}
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={cp.distance}
                        onChange={(e) => handleCheckpointChange(index, 'distance', parseFloat(e.target.value) || 0)}
                        className="w-24 rounded border border-gray-300 dark:border-gray-600 px-2 py-1 text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        step="10"
                        value={cp.elevation}
                        onChange={(e) => handleCheckpointChange(index, 'elevation', parseInt(e.target.value) || 0)}
                        className="w-20 rounded border border-gray-300 dark:border-gray-600 px-2 py-1 text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        step="10"
                        min="0"
                        value={cp.downhillDistance || 0}
                        onChange={(e) => handleCheckpointChange(index, 'downhillDistance', parseInt(e.target.value) || 0)}
                        className="w-20 rounded border border-gray-300 dark:border-gray-600 px-2 py-1 text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={cp.terrainType || "山路"}
                        onChange={(e) => handleCheckpointChange(index, 'terrainType', e.target.value)}
                        className="w-24 rounded border border-gray-300 dark:border-gray-600 px-2 py-1 text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      >
                        {TERRAIN_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {cp.slopePercent?.toFixed(2) || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {cp.per100mElevation?.toFixed(2) || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {cp.elevationFactor?.toFixed(2) || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 提交按钮 */}
      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-blue-600 px-6 py-3 text-white font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? "保存中..." : mode === "create" ? "创建赛道" : "保存修改"}
        </button>
      </div>

      {/* 图片弹窗 */}
      {showImageModal && formData.routeMapUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setShowImageModal(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={formData.routeMapUrl}
              alt="路书"
              className="max-h-[90vh] w-auto object-contain"
            />
            <button
              type="button"
              onClick={() => setShowImageModal(false)}
              className="absolute -top-4 -right-4 rounded-full bg-white p-2 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700"
            >
              <X className="h-6 w-6 text-gray-900 dark:text-white" />
            </button>
          </div>
        </div>
      )}
    </form>
  )
}
