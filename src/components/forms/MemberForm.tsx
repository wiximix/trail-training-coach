"use client"

import { useState, useEffect } from "react"
import { Card, Input, Select, Label, Button } from "@/components/ui"
import { errorContainerStyles, sectionTitleStyles, formContainerStyles } from "@/lib/styles"

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
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        {error && <div className={errorContainerStyles}>{error}</div>}

        {/* 基础数据 */}
        <div>
          <h2 className={sectionTitleStyles}>基础数据</h2>
          <div className={formContainerStyles}>
            <Input
              id="name"
              type="text"
              label="姓名"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="请输入姓名"
            />
            <Select
              id="gender"
              label="性别"
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              options={[
                { value: "", label: "请选择" },
                { value: "男", label: "男" },
                { value: "女", label: "女" },
              ]}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                id="height"
                type="number"
                label="身高 (cm)"
                value={formData.height}
                onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                placeholder="175"
              />
              <Input
                id="weight"
                type="number"
                label="体重 (kg)"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                placeholder="70"
              />
            </div>
          </div>
        </div>

        {/* 跑力数据 */}
        <div>
          <h2 className={sectionTitleStyles}>跑力数据</h2>
          <div className={formContainerStyles}>
            <Input
              id="flatBaselinePace"
              type="text"
              label="平路基准配速 P0（MMSS 格式，如 530 代表 5分30秒/公里）"
              placeholder="530"
              value={formData.flatBaselinePace}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '') // 只允许数字
                setFormData({ ...formData, flatBaselinePace: value })
              }}
              maxLength={4}
              helperText="跑者跑步能力中'有氧耐力区间'的平均配速（越野赛以有氧强度为主）"
            />
            <Input
              id="vo2Max"
              type="number"
              label="最大摄氧量 VO2Max（ml/kg/min）"
              placeholder="50"
              min="30"
              max="80"
              step="1"
              value={formData.vo2Max}
              onChange={(e) => setFormData({ ...formData, vo2Max: e.target.value })}
              helperText="范围：30-80 ml/kg/min，用于计算爬升损耗系数k（VO2Max越高，k越小）"
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                id="restingHeartRate"
                type="number"
                label="静息心率"
                value={formData.restingHeartRate}
                onChange={(e) => setFormData({ ...formData, restingHeartRate: e.target.value })}
                placeholder="60"
              />
              <Input
                id="maxHeartRate"
                type="number"
                label="最大心率"
                value={formData.maxHeartRate}
                onChange={(e) => setFormData({ ...formData, maxHeartRate: e.target.value })}
                placeholder="185"
              />
            </div>
            <Input
              id="lactateThresholdHeartRate"
              type="number"
              label="乳酸阈值心率"
              value={formData.lactateThresholdHeartRate}
              onChange={(e) => setFormData({ ...formData, lactateThresholdHeartRate: e.target.value })}
              placeholder="165"
            />
            <Input
              id="lactateThresholdPace"
              type="text"
              label="乳酸阈值配速（MMSS 格式）"
              placeholder="445"
              value={formData.lactateThresholdPace}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '') // 只允许数字
                setFormData({ ...formData, lactateThresholdPace: value })
              }}
              maxLength={4}
            />
            <Input
              id="marathonPace"
              type="text"
              label="马拉松配速（MMSS 格式）"
              value={formData.marathonPace}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '') // 只允许数字
                setFormData({ ...formData, marathonPace: value })
              }}
              placeholder="500"
              maxLength={4}
            />
          </div>
        </div>

        {/* 补给数据 */}
        <div>
          <h2 className={sectionTitleStyles}>补给偏好</h2>
          <div className={formContainerStyles}>
            <div>
              <Label>偏好的补给类型（可多选）</Label>
              <div className="flex flex-wrap gap-3 mt-2">
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
            <Select
              id="crampFrequency"
              label="抽筋频率"
              value={formData.crampFrequency}
              onChange={(e) => setFormData({ ...formData, crampFrequency: e.target.value })}
              options={[
                { value: "", label: "请选择" },
                ...CRAMP_FREQUENCIES.map((freq) => ({ value: freq, label: freq })),
              ]}
            />
            <Select
              id="expectedSweatRate"
              label="出汗量"
              value={formData.expectedSweatRate}
              onChange={(e) => setFormData({ ...formData, expectedSweatRate: e.target.value })}
              options={[
                { value: "", label: "请选择" },
                ...SWEAT_RATES.map((rate) => ({ value: rate, label: rate })),
              ]}
            />
          </div>
        </div>

        {/* 提交按钮 */}
        <div className="flex items-center gap-4">
          <Button
            type="submit"
            disabled={loading}
            variant="primary"
            size="lg"
            loading={loading}
          >
            {mode === "create" ? "创建成员" : "保存修改"}
          </Button>
        </div>
      </Card>
    </form>
  )
}
