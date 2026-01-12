"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function NewMemberPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({
    // 基础数据
    name: "",
    height: "",
    weight: "",
    gender: "",
    // 跑力数据
    restingHeartRate: "",
    maxHeartRate: "",
    lactateThresholdHeartRate: "",
    lactateThresholdPace: "",
    marathonPace: "",
    vo2Max: "", // 最大摄氧量（VO2Max）
    flatBaselinePace: "", // 平路基准配速（P0）
    // 地形复杂度系数
    terrainPaceFactors: {
      sand: 1.1,
      farmRoad: 1.0,
      mountainRoad: 1.0,
      stoneRoad: 1.0,
      steps: 1.0,
    },
    // 补给数据
    preferredSupplyTypes: [] as string[],
    crampFrequency: "",
    expectedSweatRate: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

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

      const response = await fetch("/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await response.json()
      if (data.success) {
        // 刷新路由缓存，确保列表页面显示最新数据
        router.refresh()
        router.push("/members")
      } else {
        setError(data.error || "创建成员失败")
      }
    } catch (err) {
      setError("网络错误，请稍后重试")
    } finally {
      setLoading(false)
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

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <Link href="/members" className="text-blue-600 hover:text-blue-700">
            ← 返回成员列表
          </Link>
          <h1 className="mt-4 text-3xl font-bold text-gray-900">新增成员</h1>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-600">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 rounded-lg bg-white p-6 shadow-md">
          {/* 基础数据 */}
          <div>
            <h2 className="mb-4 text-xl font-semibold text-gray-900">基础数据</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  姓名 <span className="text-red-500">*</span>
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
                  性别
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">请选择</option>
                  <option value="男">男</option>
                  <option value="女">女</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    身高 (cm)
                  </label>
                  <input
                    type="number"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                    className="w-full rounded-md border border-gray-300 px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    体重 (kg)
                  </label>
                  <input
                    type="number"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    className="w-full rounded-md border border-gray-300 px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 跑力数据 */}
          <div>
            <h2 className="mb-4 text-xl font-semibold text-gray-900">跑力数据</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  平路基准配速 P0（如 5:30/km）
                </label>
                <input
                  type="text"
                  placeholder="5:30/km"
                  value={formData.flatBaselinePace}
                  onChange={(e) => setFormData({ ...formData, flatBaselinePace: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  跑者跑步能力中"有氧耐力区间"的平均配速（越野赛以有氧强度为主）
                </p>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  最大摄氧量 VO2Max（ml/kg/min）
                </label>
                <input
                  type="number"
                  placeholder="如 50"
                  min="30"
                  max="80"
                  step="1"
                  value={formData.vo2Max}
                  onChange={(e) => setFormData({ ...formData, vo2Max: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  范围：30-80 ml/kg/min，用于计算爬升损耗系数k（VO2Max越高，k越小）
                </p>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  马拉松配速 (如 5:30/km)
                </label>
                <input
                  type="text"
                  placeholder="5:30/km"
                  value={formData.marathonPace}
                  onChange={(e) => setFormData({ ...formData, marathonPace: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  乳酸阈值配速 (如 5:00/km)
                </label>
                <input
                  type="text"
                  placeholder="5:00/km"
                  value={formData.lactateThresholdPace}
                  onChange={(e) => setFormData({ ...formData, lactateThresholdPace: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    静息心率 (bpm)
                  </label>
                  <input
                    type="number"
                    value={formData.restingHeartRate}
                    onChange={(e) =>
                      setFormData({ ...formData, restingHeartRate: e.target.value })
                    }
                    className="w-full rounded-md border border-gray-300 px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    最大心率 (bpm)
                  </label>
                  <input
                    type="number"
                    value={formData.maxHeartRate}
                    onChange={(e) =>
                      setFormData({ ...formData, maxHeartRate: e.target.value })
                    }
                    className="w-full rounded-md border border-gray-300 px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    乳酸阈值 (bpm)
                  </label>
                  <input
                    type="number"
                    value={formData.lactateThresholdHeartRate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        lactateThresholdHeartRate: e.target.value,
                      })
                    }
                    className="w-full rounded-md border border-gray-300 px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 地形复杂度系数 */}
          <div>
            <h2 className="mb-4 text-xl font-semibold text-gray-900">地形复杂度系数（α）</h2>
            <p className="mb-4 text-sm text-gray-600">
              不同地形类型对配速的影响系数（通常取1.1~1.3），系数越大用时越长。默认值都是1，沙地默认值是1.1。
            </p>
            <div className="grid grid-cols-5 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  沙地
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={formData.terrainPaceFactors.sand}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      terrainPaceFactors: {
                        ...formData.terrainPaceFactors,
                        sand: Number(e.target.value),
                      },
                    })
                  }
                  className="w-full rounded-md border border-gray-300 px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  机耕道
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={formData.terrainPaceFactors.farmRoad}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      terrainPaceFactors: {
                        ...formData.terrainPaceFactors,
                        farmRoad: Number(e.target.value),
                      },
                    })
                  }
                  className="w-full rounded-md border border-gray-300 px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  山路
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={formData.terrainPaceFactors.mountainRoad}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      terrainPaceFactors: {
                        ...formData.terrainPaceFactors,
                        mountainRoad: Number(e.target.value),
                      },
                    })
                  }
                  className="w-full rounded-md border border-gray-300 px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  石铺路
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={formData.terrainPaceFactors.stoneRoad}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      terrainPaceFactors: {
                        ...formData.terrainPaceFactors,
                        stoneRoad: Number(e.target.value),
                      },
                    })
                  }
                  className="w-full rounded-md border border-gray-300 px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  台阶
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={formData.terrainPaceFactors.steps}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      terrainPaceFactors: {
                        ...formData.terrainPaceFactors,
                        steps: Number(e.target.value),
                      },
                    })
                  }
                  className="w-full rounded-md border border-gray-300 px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* 补给数据 */}
          <div>
            <h2 className="mb-4 text-xl font-semibold text-gray-900">补给数据</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  喜好的补给类型（多选）
                </label>
                <div className="flex flex-wrap gap-3">
                  {["能量胶", "能量+电解质冲剂", "能量棒"].map((type) => (
                    <label key={type} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.preferredSupplyTypes.includes(type)}
                        onChange={() => handleSupplyTypeChange(type)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{type}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  比赛中抽经情况
                </label>
                <select
                  value={formData.crampFrequency}
                  onChange={(e) => setFormData({ ...formData, crampFrequency: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">请选择</option>
                  <option value="从来没有">从来没有</option>
                  <option value="非常少">非常少</option>
                  <option value="有时">有时</option>
                  <option value="经常">经常</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  比赛日预计出汗量
                </label>
                <select
                  value={formData.expectedSweatRate}
                  onChange={(e) =>
                    setFormData({ ...formData, expectedSweatRate: e.target.value })
                  }
                  className="w-full rounded-md border border-gray-300 px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">请选择</option>
                  <option value="有一点">有一点</option>
                  <option value="多汗">多汗</option>
                  <option value="非常多汗">非常多汗</option>
                  <option value="汗流浃背">汗流浃背</option>
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  注：此字段也可在成绩预测时补充填写
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-lg bg-blue-600 px-6 py-3 text-white font-medium hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? "保存中..." : "保存"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/members")}
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
