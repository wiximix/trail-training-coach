"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Input, Button, Label, Select, Card } from "@/components/ui"

interface Member {
  id: string
  name: string
  height?: number
  weight?: number
  gender?: string
  restingHeartRate?: number
  maxHeartRate?: number
  lactateThresholdHeartRate?: number
  marathonPace?: string
  preferredSupplyTypes?: string[]
  crampFrequency?: string
  expectedSweatRate?: string
}

export default function EditMemberPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [memberId, setMemberId] = useState<string>("")

  const [formData, setFormData] = useState({
    name: "",
    height: "",
    weight: "",
    gender: "",
    restingHeartRate: "",
    maxHeartRate: "",
    lactateThresholdHeartRate: "",
    lactateThresholdPace: "",
    marathonPace: "",
    vo2Max: "", // 最大摄氧量（VO2Max）
    flatBaselinePace: "", // 平路基准配速（P0）
    preferredSupplyTypes: [] as string[],
    crampFrequency: "",
    expectedSweatRate: "",
  })

  useEffect(() => {
    params.then(({ id }) => {
      setMemberId(id)
      fetchMember(id)
    })
  }, [params])

  const fetchMember = async (id: string) => {
    try {
      const response = await fetch(`/api/members/${id}`)
      const data = await response.json()
      if (data.success) {
        const member = data.data as any
        setFormData({
          name: member.name || "",
          height: member.height?.toString() || "",
          weight: member.weight?.toString() || "",
          gender: member.gender || "",
          restingHeartRate: member.restingHeartRate?.toString() || "",
          maxHeartRate: member.maxHeartRate?.toString() || "",
          lactateThresholdHeartRate: member.lactateThresholdHeartRate?.toString() || "",
          lactateThresholdPace: member.lactateThresholdPace || "",
          marathonPace: member.marathonPace || "",
          vo2Max: member.vo2Max?.toString() || "", // 最大摄氧量
          flatBaselinePace: member.flatBaselinePace || "", // 平路基准配速
          preferredSupplyTypes: (member.preferredSupplyTypes as string[]) || [],
          crampFrequency: member.crampFrequency || "",
          expectedSweatRate: member.expectedSweatRate || "",
        })
      } else {
        setError(data.error || "获取成员信息失败")
      }
    } catch (err) {
      setError("网络错误，请稍后重试")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSaving(true)

    try {
      const payload = {
        ...formData,
        height: formData.height ? Number(formData.height) : null,
        weight: formData.weight ? Number(formData.weight) : null,
        restingHeartRate: formData.restingHeartRate
          ? Number(formData.restingHeartRate)
          : null,
        maxHeartRate: formData.maxHeartRate
          ? Number(formData.maxHeartRate)
          : null,
        lactateThresholdHeartRate: formData.lactateThresholdHeartRate
          ? Number(formData.lactateThresholdHeartRate)
          : null,
        vo2Max: formData.vo2Max ? Number(formData.vo2Max) : null, // 最大摄氧量
        preferredSupplyTypes:
          formData.preferredSupplyTypes.length > 0
            ? formData.preferredSupplyTypes
            : null,
      }

      const response = await fetch(`/api/members/${memberId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await response.json()
      if (data.success) {
        // 刷新路由缓存，确保列表页面显示最新数据
        router.refresh()
        router.push("/members")
      } else {
        setError(data.error || "更新成员失败")
      }
    } catch (err) {
      setError("网络错误，请稍后重试")
    } finally {
      setSaving(false)
    }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8">
            <Link href="/members" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
              ← 返回成员列表
            </Link>
          </div>
          <p className="text-center text-gray-600 dark:text-gray-400">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <Link href="/members" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
            ← 返回成员列表
          </Link>
          <h1 className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">编辑成员</h1>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 dark:bg-red-900/20 p-4 text-red-600 dark:text-red-400">{error}</div>
        )}

        <Card>
          <form onSubmit={handleSubmit} className="space-y-6 p-6">
            {/* 基础数据 */}
            <div>
              <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">基础数据</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">姓名 <span className="text-red-500">*</span></Label>
                  <Input
                    id="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="gender">性别</Label>
                  <Select
                    id="gender"
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    options={[
                      { value: "", label: "请选择" },
                      { value: "男", label: "男" },
                      { value: "女", label: "女" }
                    ]}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="height">身高 (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      value={formData.height}
                      onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="weight">体重 (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
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
                  <Label htmlFor="flatBaselinePace">平路基准配速 P0（如 5:30/km）</Label>
                  <Input
                    id="flatBaselinePace"
                    type="text"
                    placeholder="5:30/km"
                    value={formData.flatBaselinePace}
                    onChange={(e) => setFormData({ ...formData, flatBaselinePace: e.target.value })}
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    跑者跑步能力中"有氧耐力区间"的平均配速（越野赛以有氧强度为主）
                  </p>
                </div>
                <div>
                  <Label htmlFor="vo2Max">最大摄氧量 VO2Max（ml/kg/min）</Label>
                  <Input
                    id="vo2Max"
                    type="number"
                    placeholder="如 50"
                    min="30"
                    max="80"
                    step="1"
                    value={formData.vo2Max}
                    onChange={(e) => setFormData({ ...formData, vo2Max: e.target.value })}
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    范围：30-80 ml/kg/min，用于计算爬升损耗系数k（VO2Max越高，k越小）
                  </p>
                </div>
                <div>
                  <Label htmlFor="marathonPace">马拉松配速 (如 5:30/km)</Label>
                  <Input
                    id="marathonPace"
                    type="text"
                    placeholder="5:30/km"
                    value={formData.marathonPace}
                    onChange={(e) => setFormData({ ...formData, marathonPace: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="lactateThresholdPace">乳酸阈值配速 (如 5:00/km)</Label>
                  <Input
                    id="lactateThresholdPace"
                    type="text"
                    placeholder="5:00/km"
                    value={formData.lactateThresholdPace}
                    onChange={(e) => setFormData({ ...formData, lactateThresholdPace: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="restingHeartRate">静息心率 (bpm)</Label>
                    <Input
                      id="restingHeartRate"
                      type="number"
                      value={formData.restingHeartRate}
                      onChange={(e) =>
                        setFormData({ ...formData, restingHeartRate: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxHeartRate">最大心率 (bpm)</Label>
                    <Input
                      id="maxHeartRate"
                      type="number"
                      value={formData.maxHeartRate}
                      onChange={(e) =>
                        setFormData({ ...formData, maxHeartRate: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="lactateThresholdHeartRate">乳酸阈值 (bpm)</Label>
                    <Input
                      id="lactateThresholdHeartRate"
                      type="number"
                      value={formData.lactateThresholdHeartRate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          lactateThresholdHeartRate: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 补给数据 */}
            <div>
              <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">补给数据</h2>
              <div className="space-y-4">
                <div>
                  <Label>喜好的补给类型（多选）</Label>
                  <div className="flex flex-wrap gap-3 mt-2">
                    {["能量胶", "能量+电解质冲剂", "能量棒"].map((type) => (
                      <label key={type} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.preferredSupplyTypes.includes(type)}
                          onChange={() => handleSupplyTypeChange(type)}
                          className="rounded border-gray-300 dark:border-gray-600 text-blue-600 dark:text-blue-400 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <Label htmlFor="crampFrequency">比赛中抽经情况</Label>
                  <Select
                    id="crampFrequency"
                    value={formData.crampFrequency}
                    onChange={(e) => setFormData({ ...formData, crampFrequency: e.target.value })}
                    options={[
                      { value: "", label: "请选择" },
                      { value: "从来没有", label: "从来没有" },
                      { value: "非常少", label: "非常少" },
                      { value: "有时", label: "有时" },
                      { value: "经常", label: "经常" }
                    ]}
                  />
                </div>
                <div>
                  <Label htmlFor="expectedSweatRate">比赛日预计出汗量</Label>
                  <Select
                    id="expectedSweatRate"
                    value={formData.expectedSweatRate}
                    onChange={(e) =>
                      setFormData({ ...formData, expectedSweatRate: e.target.value })
                    }
                    options={[
                      { value: "", label: "请选择" },
                      { value: "有一点", label: "有一点" },
                      { value: "多汗", label: "多汗" },
                      { value: "非常多汗", label: "非常多汗" },
                      { value: "汗流浃背", label: "汗流浃背" }
                    ]}
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    注：此字段也可在成绩预测时补充填写
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={saving}
                className="flex-1"
              >
                {saving ? "保存中..." : "保存"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.push("/members")}
                className="flex-1"
              >
                取消
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}
