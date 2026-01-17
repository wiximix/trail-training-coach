"use client"

import { useState, useEffect } from "react"

export interface MemberFormData {
  // 基础数据
  name: string
  height: string
  weight: string
  gender: string
  // 跑力数据
  restingHeartRate: string
  maxHeartRate: string
  lactateThresholdHeartRate: string
  lactateThresholdPace: string
  marathonPace: string
  vo2Max: string
  flatBaselinePace: string
  // 补给数据
  preferredSupplyTypes: string[]
  crampFrequency: string
  expectedSweatRate: string
}

interface MemberFormProps {
  onSubmit: (data: MemberFormData) => Promise<void> | void
  initialData?: Partial<MemberFormData>
  mode?: "create" | "edit"
  loading?: boolean
  error?: string
}

const SUPPLY_TYPES = [
  "能量胶",
  "盐丸",
  "电解质水",
  "香蕉",
  "坚果",
  "能量棒",
  "饮料",
]

const SWEAT_RATES = [
  "有一点",
  "多汗",
  "非常多汗",
  "汗流浃背",
]

const CRAMP_FREQUENCIES = [
  "从未抽筋",
  "偶尔抽筋",
  "经常抽筋",
  "频繁抽筋",
]

export default function MemberForm({
  onSubmit,
  initialData = {},
  mode = "create",
  loading = false,
  error,
}: MemberFormProps) {
  const [formData, setFormData] = useState<MemberFormData>({
    name: initialData.name || "",
    height: initialData.height || "",
    weight: initialData.weight || "",
    gender: initialData.gender || "",
    restingHeartRate: initialData.restingHeartRate || "",
    maxHeartRate: initialData.maxHeartRate || "",
    lactateThresholdHeartRate: initialData.lactateThresholdHeartRate || "",
    lactateThresholdPace: initialData.lactateThresholdPace || "",
    marathonPace: initialData.marathonPace || "",
    vo2Max: initialData.vo2Max || "",
    flatBaselinePace: initialData.flatBaselinePace || "",
    preferredSupplyTypes: initialData.preferredSupplyTypes || [],
    crampFrequency: initialData.crampFrequency || "",
    expectedSweatRate: initialData.expectedSweatRate || "",
  })

  useEffect(() => {
    if (Object.keys(initialData).length > 0) {
      setFormData({
        name: initialData.name || "",
        height: initialData.height || "",
        weight: initialData.weight || "",
        gender: initialData.gender || "",
        restingHeartRate: initialData.restingHeartRate || "",
        maxHeartRate: initialData.maxHeartRate || "",
        lactateThresholdHeartRate: initialData.lactateThresholdHeartRate || "",
        lactateThresholdPace: initialData.lactateThresholdPace || "",
        marathonPace: initialData.marathonPace || "",
        vo2Max: initialData.vo2Max || "",
        flatBaselinePace: initialData.flatBaselinePace || "",
        preferredSupplyTypes: initialData.preferredSupplyTypes || [],
        crampFrequency: initialData.crampFrequency || "",
        expectedSweatRate: initialData.expectedSweatRate || "",
      })
    }
  }, [initialData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(formData)
  }

  const handleSupplyTypeChange = (type: string) => {
    setFormData((prev) => {
      const current = prev.preferredSupplyTypes
      if (current.includes(type)) {
        return {
          ...prev,
          preferredSupplyTypes: current.filter((t) => t !== type),
        }
      } else {
        return { ...prev, preferredSupplyTypes: [...current, type] }
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-lg bg-white dark:bg-gray-800 p-6 shadow-md">
      {error && (
        <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800">
          {error}
        </div>
      )}

      {/* 基础数据 */}
      <div>
        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">基础数据</h2>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              姓名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              placeholder="请输入姓名"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              性别
            </label>
            <select
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">请选择</option>
              <option value="男">男</option>
              <option value="女">女</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                身高 (cm)
              </label>
              <input
                type="number"
                value={formData.height}
                onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                placeholder="175"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                体重 (kg)
              </label>
              <input
                type="number"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                placeholder="70"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 跑力数据 */}
      <div>
        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">跑力数据</h2>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              平路基准配速 P0（如 5:30/km）
            </label>
            <input
              type="text"
              placeholder="5:30"
              value={formData.flatBaselinePace}
              onChange={(e) => setFormData({ ...formData, flatBaselinePace: e.target.value })}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              跑者跑步能力中"有氧耐力区间"的平均配速（越野赛以有氧强度为主）
            </p>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              最大摄氧量 VO2Max（ml/kg/min）
            </label>
            <input
              type="number"
              placeholder="50"
              min="30"
              max="80"
              step="1"
              value={formData.vo2Max}
              onChange={(e) => setFormData({ ...formData, vo2Max: e.target.value })}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              范围：30-80 ml/kg/min，用于计算爬升损耗系数k（VO2Max越高，k越小）
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                静息心率
              </label>
              <input
                type="number"
                value={formData.restingHeartRate}
                onChange={(e) => setFormData({ ...formData, restingHeartRate: e.target.value })}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                placeholder="60"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                最大心率
              </label>
              <input
                type="number"
                value={formData.maxHeartRate}
                onChange={(e) => setFormData({ ...formData, maxHeartRate: e.target.value })}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                placeholder="185"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              乳酸阈值心率
            </label>
            <input
              type="number"
              value={formData.lactateThresholdHeartRate}
              onChange={(e) => setFormData({ ...formData, lactateThresholdHeartRate: e.target.value })}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              placeholder="165"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              乳酸阈值配速
            </label>
            <input
              type="text"
              value={formData.lactateThresholdPace}
              onChange={(e) => setFormData({ ...formData, lactateThresholdPace: e.target.value })}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              placeholder="4:45"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              马拉松配速
            </label>
            <input
              type="text"
              value={formData.marathonPace}
              onChange={(e) => setFormData({ ...formData, marathonPace: e.target.value })}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              placeholder="5:00"
            />
          </div>
        </div>
      </div>

      {/* 补给数据 */}
      <div>
        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">补给偏好</h2>
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              偏好的补给类型（可多选）
            </label>
            <div className="flex flex-wrap gap-3">
              {SUPPLY_TYPES.map((type) => (
                <label
                  key={type}
                  className={`inline-flex cursor-pointer items-center rounded-full px-4 py-2 text-sm transition-colors ${
                    formData.preferredSupplyTypes.includes(type)
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={formData.preferredSupplyTypes.includes(type)}
                    onChange={() => handleSupplyTypeChange(type)}
                  />
                  {type}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              抽筋频率
            </label>
            <select
              value={formData.crampFrequency}
              onChange={(e) => setFormData({ ...formData, crampFrequency: e.target.value })}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">请选择</option>
              {CRAMP_FREQUENCIES.map((freq) => (
                <option key={freq} value={freq}>
                  {freq}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              出汗量
            </label>
            <select
              value={formData.expectedSweatRate}
              onChange={(e) => setFormData({ ...formData, expectedSweatRate: e.target.value })}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">请选择</option>
              {SWEAT_RATES.map((rate) => (
                <option key={rate} value={rate}>
                  {rate}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 提交按钮 */}
      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-blue-600 px-6 py-3 text-white font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? "提交中..." : mode === "create" ? "创建成员" : "保存修改"}
        </button>
      </div>
    </form>
  )
}
