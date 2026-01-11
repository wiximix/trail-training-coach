"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  calculateHourlyEnergyNeeds,
  calculateSupplyDosages,
  type SupplyDosages,
  type HourlyEnergyNeeds,
} from "@/lib/trailAlgorithm"

interface Member {
  id: string
  name: string
  marathonPace?: string
  crampFrequency?: string
  expectedSweatRate?: string
  preferredSupplyTypes?: string[]
  weight?: number
}

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

interface PredictionResult {
  estimatedTime: string
  estimatedPace: string
  plannedPace?: string // 计划配速
  checkpoints: Array<{
    id: number
    distance: number
    elevation: number
    downhillDistance?: number
    terrainType?: string
    terrainPaceFactor?: number
    plannedPace?: string // 计划配速
    sectionTime?: number
    estimatedTime: string
    supplyStrategy: string
    accumulatedDistance: number
    sectionSupply?: {
      gels: number
      gelCalories: number
      electrolytePowder: number
      electrolytePowderCalories: number
      electrolytePowderWater: number
      electrolytePowderElectrolytes: number
    }
  }>
  overallSupplyStrategy: string[]
  hourlyEnergyNeeds: {
    carbs: number // 碳水
    water: number // 水
    electrolytes: number // 电解质
  }
  supplyDosages: {
    gelsPerHour: number // 能量胶每小时份数
    saltsPerHour: number // 盐丸每小时份数
    electrolytePowderPerHour: number // 电解质粉每小时份数
  }
  totalEnergyNeeds: {
    carbs: number // 总碳水
    water: number // 总水量
    electrolytes: number // 总电解质
  }
  totalSupplyDosages?: {
    totalGels: number // 总能量胶份数
    totalSalts: number // 总盐丸份数
    totalElectrolytePowder: number // 总电解质粉份数
    totalWater: number // 总水量（ml）
  }
}

export default function PredictPage() {
  const router = useRouter()
  const [members, setMembers] = useState<Member[]>([])
  const [trails, setTrails] = useState<Trail[]>([])
  const [loading, setLoading] = useState(true)
  const [predicting, setPredicting] = useState(false)
  const [error, setError] = useState("")
  const [result, setResult] = useState<PredictionResult | null>(null)
  const [checkpointPaces, setCheckpointPaces] = useState<Record<number, string>>({}) // 存储每个CP的计划配速（MMSS格式）
  const [localCheckpointResults, setLocalCheckpointResults] = useState<any[]>([]) // 本地计算的分段结果
  const [sidebarExpanded, setSidebarExpanded] = useState(true) // 侧边栏展开状态

  const [selectedMemberId, setSelectedMemberId] = useState("")
  const [selectedTrailId, setSelectedTrailId] = useState("")
  const [expectedSweatRate, setExpectedSweatRate] = useState("")
  const [plannedPace, setPlannedPace] = useState("") // 计划配速（MMSS格式）

  // 补给含量输入
  const [gelCarbs, setGelCarbs] = useState("100")
  const [saltElectrolytes, setSaltElectrolytes] = useState("200")
  const [electrolytePowder, setElectrolytePowder] = useState("300")
  const [electrolytePowderCalories, setElectrolytePowderCalories] = useState("50")
  const [electrolytePowderWater, setElectrolytePowderWater] = useState("500")

  // 动态计算的能量需求和补给份数
  const [dynamicHourlyEnergyNeeds, setDynamicHourlyEnergyNeeds] = useState<HourlyEnergyNeeds | null>(null)
  const [dynamicSupplyDosages, setDynamicSupplyDosages] = useState<SupplyDosages | null>(null)

  // 监听全局计划配速变化，实时更新分段用时
  useEffect(() => {
    if (result && plannedPace) {
      const updatedCheckpoints = recalculateSectionTimes(
        checkpointPaces,
        result.checkpoints,
        plannedPace
      )
      setLocalCheckpointResults(updatedCheckpoints)
    }
  }, [plannedPace])

  // 监听expectedSweatRate变化，动态更新每小时能量需求
  useEffect(() => {
    if (!selectedMemberId) return

    const member = members.find(m => m.id === selectedMemberId)
    if (!member) return

    // 使用当前expectedSweatRate（优先级高于成员默认值）
    const currentSweatRate = expectedSweatRate || member.expectedSweatRate || "有一点"

    // 计算每小时能量需求
    const hourlyNeeds = calculateHourlyEnergyNeeds(currentSweatRate, member.weight)
    setDynamicHourlyEnergyNeeds(hourlyNeeds)
  }, [expectedSweatRate, selectedMemberId, members])

  // 监听补给含量和每小时能量需求变化，动态计算每小时补给份数
  useEffect(() => {
    if (!dynamicHourlyEnergyNeeds) return

    const supplyDosages = calculateSupplyDosages(
      dynamicHourlyEnergyNeeds,
      gelCarbs ? Number(gelCarbs) : undefined,
      saltElectrolytes ? Number(saltElectrolytes) : undefined,
      electrolytePowder ? Number(electrolytePowder) : undefined
    )
    setDynamicSupplyDosages(supplyDosages)
  }, [dynamicHourlyEnergyNeeds, gelCarbs, saltElectrolytes, electrolytePowder])

  // MMSS格式转分钟（例如：630 -> 6.5分钟）
  const mmssToMinutes = (mmss: string): number => {
    const num = parseInt(mmss, 10)
    if (isNaN(num)) return 0
    const minutes = Math.floor(num / 100)
    const seconds = num % 100
    return minutes + seconds / 60
  }

  // 分钟转MMSS格式（例如：6.5 -> "630"）
  const minutesToMMSS = (minutes: number): string => {
    const mins = Math.floor(minutes)
    const secs = Math.round((minutes - mins) * 60)
    return `${mins}${secs.toString().padStart(2, '0')}`
  }

  // 实时计算分段用时和预计时间
  const recalculateSectionTimes = (currentCheckpointPaces: Record<number, string>, originalCheckpoints: any[], originalPlannedPace: string) => {
    let accumulatedTime = 0
    const updatedCheckpoints = originalCheckpoints.map((cp, index) => {
      // 获取CP的计划配速（优先级：CP独立 > 全局）
      const cpPaceMMSS = currentCheckpointPaces[cp.id] || originalPlannedPace
      const sectionPaceMinutes = cpPaceMMSS ? mmssToMinutes(cpPaceMMSS) : null

      if (!sectionPaceMinutes) {
        // 如果没有计划配速，使用原来的sectionTime
        accumulatedTime += (cp.sectionTime || 0)
        return { ...cp }
      }

      // 计算爬升等效距离（m）= 爬升（m）* 10，转换为km
      const elevationEquivalentDistance = cp.elevation * 10 / 1000

      // 获取路段配速系数
      const terrainFactor = cp.terrainPaceFactor || 1.0

      // 分段用时 = (本段距离 + 爬升等效距离) * 计划配速 * 路段系数
      const sectionTime = (cp.distance + elevationEquivalentDistance) * sectionPaceMinutes * terrainFactor
      accumulatedTime += sectionTime

      // 转换累计时间为时间格式
      const totalHours = Math.floor(accumulatedTime / 60)
      const totalMinutes = Math.floor(accumulatedTime % 60)
      const totalSeconds = Math.round((accumulatedTime % 1) * 60)
      const estimatedTime = `${totalHours.toString().padStart(2, '0')}:${totalMinutes.toString().padStart(2, '0')}:${totalSeconds.toString().padStart(2, '0')}`

      return {
        ...cp,
        sectionTime: Number(sectionTime.toFixed(1)),
        estimatedTime
      }
    })

    return updatedCheckpoints
  }

  // 处理CP计划配速修改
  const handleCheckpointPaceChange = (cpId: number, value: string) => {
    const updatedPaces = { ...checkpointPaces, [cpId]: value }
    setCheckpointPaces(updatedPaces)

    // 实时重新计算
    if (result) {
      const updatedCheckpoints = recalculateSectionTimes(
        updatedPaces,
        result.checkpoints,
        plannedPace || ""
      )
      setLocalCheckpointResults(updatedCheckpoints)
    }
  }

  // 应用全局计划配速到所有CP点
  const handleApplyGlobalPace = () => {
    if (!plannedPace || !result) {
      return
    }

    // 创建一个新的checkpointPaces对象，所有CP都使用全局计划配速
    const updatedPaces: Record<number, string> = {}
    result.checkpoints.forEach((cp) => {
      updatedPaces[cp.id] = plannedPace
    })

    setCheckpointPaces(updatedPaces)

    // 实时重新计算
    const updatedCheckpoints = recalculateSectionTimes(
      updatedPaces,
      result.checkpoints,
      plannedPace
    )
    setLocalCheckpointResults(updatedCheckpoints)
  }

  // 获取实际配速（用于tooltip显示）
  const getActualPaceForTooltip = (cp: any): string => {
    // 优先使用用户输入的CP计划配速
    if (checkpointPaces[cp.id]) {
      const mins = Math.floor(parseInt(checkpointPaces[cp.id]) / 100)
      const secs = parseInt(checkpointPaces[cp.id]) % 100
      return `${mins}分${secs}秒/公里`
    }
    // 其次使用全局计划配速
    if (plannedPace) {
      const mins = Math.floor(parseInt(plannedPace) / 100)
      const secs = parseInt(plannedPace) % 100
      return `${mins}分${secs}秒/公里`
    }
    // 最后使用后端返回的计划配速
    if (cp.plannedPace) {
      // 后端返回的是 "6:30/km" 格式，可以解析为 "6分30秒/公里"
      const match = cp.plannedPace.match(/(\d+):(\d+)/)
      if (match) {
        return `${match[1]}分${match[2]}秒/公里`
      }
    }
    return "算法预测配速"
  }

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [membersRes, trailsRes] = await Promise.all([
        fetch("/api/members"),
        fetch("/api/trails"),
      ])

      const membersData = await membersRes.json()
      const trailsData = await trailsRes.json()

      if (membersData.success && trailsData.success) {
        setMembers(membersData.data)
        setTrails(trailsData.data)
      } else {
        setError("加载数据失败")
      }
    } catch (err) {
      setError("网络错误，请稍后重试")
    } finally {
      setLoading(false)
    }
  }

  const handlePredict = async () => {
    if (!selectedMemberId || !selectedTrailId) {
      setError("请选择成员和赛道")
      return
    }

    setError("")
    setPredicting(true)
    setResult(null)

    try {
      // 将MMSS格式转换为标准格式（如"630" -> "6:30/km"）
      const convertPaceToStandard = (mmss: string): string => {
        if (!mmss) return ""
        const minutes = mmssToMinutes(mmss)
        const mins = Math.floor(minutes)
        const secs = Math.round((minutes - mins) * 60)
        return `${mins}:${secs.toString().padStart(2, '0')}/km`
      }

      // 转换全局计划配速
      const standardPlannedPace = plannedPace ? convertPaceToStandard(plannedPace) : undefined

      // 转换每个CP的计划配速
      const standardCheckpointPaces: Record<number, string> = {}
      Object.entries(checkpointPaces).forEach(([cpId, pace]) => {
        if (pace) {
          standardCheckpointPaces[parseInt(cpId)] = convertPaceToStandard(pace)
        }
      })

      const response = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId: selectedMemberId,
          trailId: selectedTrailId,
          expectedSweatRate: expectedSweatRate || undefined,
          plannedPace: standardPlannedPace,
          checkpointPaces: Object.keys(standardCheckpointPaces).length > 0 ? standardCheckpointPaces : undefined,
          gelCarbs: gelCarbs ? Number(gelCarbs) : undefined,
          saltElectrolytes: saltElectrolytes ? Number(saltElectrolytes) : undefined,
          electrolytePowder: electrolytePowder ? Number(electrolytePowder) : undefined,
          electrolytePowderCalories: electrolytePowderCalories ? Number(electrolytePowderCalories) : undefined,
          electrolytePowderWater: electrolytePowderWater ? Number(electrolytePowderWater) : undefined,
        }),
      })

      const data = await response.json()
      if (data.success) {
        setResult(data.data)
        // 初始化每个CP的计划配速（转换为MMSS格式）
        const initialPaces: Record<number, string> = {}
        data.data.checkpoints.forEach((cp: any) => {
          // 如果CP有独立计划配速，使用它；否则使用全局计划配速
          const paceToConvert = cp.plannedPace || data.data.plannedPace || ""
          if (paceToConvert) {
            // 从"6:30/km"转换为"630"
            const match = paceToConvert.match(/(\d+):(\d+)/)
            if (match) {
              initialPaces[cp.id] = `${match[1]}${match[2]}`
            }
          } else {
            initialPaces[cp.id] = ""
          }
        })
        setCheckpointPaces(initialPaces)
        setLocalCheckpointResults(data.data.checkpoints)
      } else {
        setError(data.error || "预测失败")
      }
    } catch (err) {
      setError("网络错误，请稍后重试")
    } finally {
      setPredicting(false)
    }
  }

  const handleMemberChange = (memberId: string) => {
    setSelectedMemberId(memberId)
    const member = members.find((m) => m.id === memberId)
    if (member?.expectedSweatRate) {
      setExpectedSweatRate(member.expectedSweatRate)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="mx-auto max-w-4xl">
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
    <div className="min-h-screen bg-gray-50">
      {/* 侧边栏 */}
      <aside
        className={`
          fixed left-0 top-0 h-full bg-white shadow-lg transition-all duration-300 z-50 overflow-y-auto
          ${sidebarExpanded ? 'w-80' : 'w-0'}
        `}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">预测参数</h2>
            <button
              onClick={() => setSidebarExpanded(false)}
              className="p-2 hover:bg-gray-100 rounded-lg"
              title="收起侧边栏"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                选择成员 <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedMemberId}
                onChange={(e) => handleMemberChange(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">请选择成员</option>
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name} {member.marathonPace ? `(${member.marathonPace})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                选择赛道 <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedTrailId}
                onChange={(e) => setSelectedTrailId(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">请选择赛道</option>
                {trails.map((trail) => {
                  const totalDistance = trail.checkpoints
                    .reduce((sum, cp) => sum + cp.distance, 0)
                    .toFixed(1)
                  const totalElevation = trail.checkpoints
                    .reduce((sum, cp) => sum + cp.elevation, 0)
                    .toFixed(0)
                  return (
                    <option key={trail.id} value={trail.id}>
                      {trail.name} ({totalDistance}km / {totalElevation}m)
                    </option>
                  )
                })}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                比赛日预计出汗量
              </label>
              <select
                value={expectedSweatRate}
                onChange={(e) => setExpectedSweatRate(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">使用成员数据中的默认值</option>
                <option value="有一点">有一点</option>
                <option value="多汗">多汗</option>
                <option value="非常多汗">非常多汗</option>
                <option value="汗流浃背">汗流浃背</option>
              </select>
              <p className="mt-1 text-xs text-gray-500">
                如果不选择，将使用成员数据中的默认值
              </p>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                计划配速
              </label>
              <input
                type="text"
                value={plannedPace}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '') // 只允许数字
                  setPlannedPace(value)
                }}
                className="w-full rounded-md border border-gray-300 px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                placeholder="例如: 630 代表 6分30秒"
              />
              <p className="mt-1 text-xs text-gray-500">
                输入目标配速，格式为MMSS（如630代表6分30秒每公里）。留空则使用预测配速
              </p>
            </div>

            <div>
              <h3 className="mb-2 text-sm font-medium text-gray-700">补给含量（选填）</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600">
                      能量胶碳水含量 (Kcal)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={gelCarbs}
                      onChange={(e) => setGelCarbs(e.target.value)}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                      placeholder="100"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600">
                      盐丸电解质含量 (mg)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={saltElectrolytes}
                      onChange={(e) => setSaltElectrolytes(e.target.value)}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                      placeholder="200"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600">
                      电解质粉电解质含量 (mg)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={electrolytePowder}
                      onChange={(e) => setElectrolytePowder(e.target.value)}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                      placeholder="300"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600">
                      电解质粉热量 (Kcal/份)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={electrolytePowderCalories}
                      onChange={(e) => setElectrolytePowderCalories(e.target.value)}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                      placeholder="50"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600">
                      电解质粉冲水量 (ml/份)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={electrolytePowderWater}
                      onChange={(e) => setElectrolytePowderWater(e.target.value)}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                      placeholder="500"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={handlePredict}
                disabled={predicting}
                className="rounded-lg bg-purple-600 px-6 py-3 text-white font-medium hover:bg-purple-700 disabled:bg-gray-400"
              >
                {predicting ? "预测中..." : "开始预测"}
              </button>
              <button
                onClick={handleApplyGlobalPace}
                disabled={!result || !plannedPace}
                className="rounded-lg bg-green-600 px-6 py-3 text-white font-medium hover:bg-green-700 disabled:bg-gray-400"
              >
                应用计划配速
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* 主内容区域 */}
      <main className={`transition-all duration-300 ${sidebarExpanded ? 'ml-80' : 'ml-0'}`}>
        <div className="p-8">
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={() => setSidebarExpanded(!sidebarExpanded)}
                className="p-2 hover:bg-gray-100 rounded-lg"
                title={sidebarExpanded ? "收起侧边栏" : "展开侧边栏"}
              >
                {sidebarExpanded ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                  </svg>
                )}
              </button>
              <Link href="/" className="text-blue-600 hover:text-blue-700">
                ← 返回首页
              </Link>
            </div>
            <h1 className="mt-4 text-3xl font-bold text-gray-900">成绩预测</h1>
            <p className="mt-2 text-gray-600">
              根据跑者的体能数据和赛道信息，智能预测比赛成绩和补给策略
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-600">{error}</div>
          )}

          {result && (
            <div className="space-y-6">
              <div className="rounded-lg bg-white p-6 shadow-md">
                <h2 className="mb-6 text-xl font-semibold text-gray-900">预测结果</h2>

                <div className="mb-6">
                  <h3 className="mb-4 font-semibold text-gray-900">预计完成时间</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-lg bg-blue-50 p-4">
                      <h4 className="mb-2 font-medium text-gray-900">预计完赛时间</h4>
                      <p className="text-3xl font-bold text-blue-600">{result.estimatedTime}</p>
                    </div>
                    <div className="rounded-lg bg-green-50 p-4">
                      <h4 className="mb-2 font-medium text-gray-900">预计平均配速</h4>
                      <p className="text-3xl font-bold text-green-600">{result.estimatedPace}</p>
                      <p className="text-xs text-gray-500 mt-1">分钟/KM</p>
                    </div>
                  </div>
                </div>

                {result.totalEnergyNeeds && (
                  <div className="mb-6">
                    <h3 className="mb-4 font-semibold text-gray-900">总能量需求</h3>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="rounded-lg bg-orange-100 p-4">
                        <h4 className="mb-2 text-sm font-medium text-gray-700">总热量</h4>
                        <p className="text-2xl font-bold text-orange-700">{result.totalEnergyNeeds.carbs}</p>
                        <p className="text-xs text-gray-500">Kcal</p>
                      </div>
                      <div className="rounded-lg bg-blue-100 p-4">
                        <h4 className="mb-2 text-sm font-medium text-gray-700">总水量</h4>
                        <p className="text-2xl font-bold text-blue-700">{result.totalEnergyNeeds.water}</p>
                        <p className="text-xs text-gray-500">ml</p>
                      </div>
                      <div className="rounded-lg bg-green-100 p-4">
                        <h4 className="mb-2 text-sm font-medium text-gray-700">总电解质</h4>
                        <p className="text-2xl font-bold text-green-700">{result.totalEnergyNeeds.electrolytes}</p>
                        <p className="text-xs text-gray-500">mg</p>
                      </div>
                    </div>
                    {result.totalSupplyDosages && (
                      <div className="grid grid-cols-4 gap-3">
                        <div className="rounded-lg bg-purple-100 p-3">
                          <h4 className="mb-1 text-xs font-medium text-gray-700">能量胶</h4>
                          <p className="text-xl font-bold text-purple-700">{result.totalSupplyDosages.totalGels}</p>
                          <p className="text-xs text-gray-500">支</p>
                        </div>
                        <div className="rounded-lg bg-blue-100 p-3">
                          <h4 className="mb-1 text-xs font-medium text-gray-700">水</h4>
                          <p className="text-xl font-bold text-blue-700">{result.totalSupplyDosages.totalWater}</p>
                          <p className="text-xs text-gray-500">ml</p>
                        </div>
                        <div className="rounded-lg bg-teal-100 p-3">
                          <h4 className="mb-1 text-xs font-medium text-gray-700">电解质水</h4>
                          <p className="text-xl font-bold text-teal-700">{result.totalSupplyDosages.totalElectrolytePowder}</p>
                          <p className="text-xs text-gray-500">份</p>
                        </div>
                        <div className="rounded-lg bg-pink-100 p-3">
                          <h4 className="mb-1 text-xs font-medium text-gray-700">盐丸</h4>
                          <p className="text-xl font-bold text-pink-700">{result.totalSupplyDosages.totalSalts}</p>
                          <p className="text-xs text-gray-500">粒</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 显示动态计算的每小时能量需求 */}
                {(dynamicHourlyEnergyNeeds || result.hourlyEnergyNeeds) && (
                  <div className="mb-6">
                    <h3 className="mb-4 font-semibold text-gray-900">每小时能量需求</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="rounded-lg bg-orange-50 p-4">
                        <h4 className="mb-2 text-sm font-medium text-gray-700">热量</h4>
                        <p className="text-2xl font-bold text-orange-600">{dynamicHourlyEnergyNeeds?.carbs || result.hourlyEnergyNeeds.carbs}</p>
                        <p className="text-xs text-gray-500">Kcal/小时</p>
                      </div>
                      <div className="rounded-lg bg-blue-50 p-4">
                        <h4 className="mb-2 text-sm font-medium text-gray-700">水</h4>
                        <p className="text-2xl font-bold text-blue-600">{dynamicHourlyEnergyNeeds?.water || result.hourlyEnergyNeeds.water}</p>
                        <p className="text-xs text-gray-500">ml/小时</p>
                      </div>
                      <div className="rounded-lg bg-green-50 p-4">
                        <h4 className="mb-2 text-sm font-medium text-gray-700">电解质</h4>
                        <p className="text-2xl font-bold text-green-600">{dynamicHourlyEnergyNeeds?.electrolytes || result.hourlyEnergyNeeds.electrolytes}</p>
                        <p className="text-xs text-gray-500">mg/小时</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 显示动态计算的每小时补给份数 */}
                {(dynamicSupplyDosages || result.supplyDosages) && (
                  <div className="mb-6">
                    <h3 className="mb-4 font-semibold text-gray-900">每小时补给份数</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="rounded-lg bg-purple-50 p-4">
                        <h4 className="mb-2 text-sm font-medium text-gray-700">能量胶</h4>
                        <p className="text-2xl font-bold text-purple-600">{dynamicSupplyDosages?.gelsPerHour || result.supplyDosages.gelsPerHour}</p>
                        <p className="text-xs text-gray-500">支/小时</p>
                      </div>
                      <div className="rounded-lg bg-pink-50 p-4">
                        <h4 className="mb-2 text-sm font-medium text-gray-700">盐丸</h4>
                        <p className="text-2xl font-bold text-pink-600">{dynamicSupplyDosages?.saltsPerHour || result.supplyDosages.saltsPerHour}</p>
                        <p className="text-xs text-gray-500">粒/小时</p>
                      </div>
                      <div className="rounded-lg bg-teal-50 p-4">
                        <h4 className="mb-2 text-sm font-medium text-gray-700">电解质粉</h4>
                        <p className="text-2xl font-bold text-teal-600">{dynamicSupplyDosages?.electrolytePowderPerHour || result.supplyDosages.electrolytePowderPerHour}</p>
                        <p className="text-xs text-gray-500">份/小时</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="mb-4 font-semibold text-gray-900">补给策略</h3>
                  <ul className="space-y-2">
                    {result.overallSupplyStrategy.map((strategy, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 rounded-lg bg-yellow-50 p-3"
                      >
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-yellow-200 text-xs font-medium text-yellow-800">
                          {index + 1}
                        </span>
                        <span className="text-sm text-gray-700">{strategy}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mb-6">
                  <h3 className="mb-4 font-semibold text-gray-900">CP点预计时间及补给</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                            CP点
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                            累计距离
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                            本段距离
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                            爬升
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                            下坡
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                            路段类型
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                            路段系数
                          </th>
                          <th
                            className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 cursor-help"
                            title="计算公式：分段用时(分钟) = (本段距离(km) + 爬升等效距离(km)) × 计划配速(分钟/km) × 路段系数&#10;爬升等效距离(km) = 爬升(m) × 10 ÷ 1000"
                          >
                            分段用时(分钟) ⚡
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                            计划配速
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                            预计时间
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                            补给详情
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {result.checkpoints.map((cp) => (
                          <tr key={cp.id}>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {cp.supplyStrategy === "补给点" ? (
                                <span className="rounded-full bg-blue-100 px-2 py-1 text-blue-800">
                                  CP{cp.id}（补给）
                                </span>
                              ) : (
                                <span className="text-gray-600">CP{cp.id}</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">{cp.accumulatedDistance} km</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{cp.distance} km</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{cp.elevation} m</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{cp.downhillDistance || 0} m</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{cp.terrainType || "未知"}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{cp.terrainPaceFactor?.toFixed(2) || "1.00"}</td>
                            <td
                              className="px-4 py-3 text-sm text-gray-600 cursor-help"
                              title={`分段用时 = (${cp.distance}km + ${(cp.elevation * 10 / 1000).toFixed(3)}km) × ${getActualPaceForTooltip(cp)} × ${cp.terrainPaceFactor?.toFixed(2) || "1.00"}`}
                            >
                              {localCheckpointResults[cp.id - 1]?.sectionTime?.toFixed(1) || cp.sectionTime?.toFixed(1) || "0.0"}
                            </td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                              <input
                                type="text"
                                value={checkpointPaces[cp.id] || ""}
                                onBlur={(e) => handleCheckpointPaceChange(cp.id, e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.currentTarget.blur()
                                  }
                                }}
                                onChange={(e) => {
                                  const value = e.target.value.replace(/\D/g, '') // 只允许数字
                                  setCheckpointPaces({ ...checkpointPaces, [cp.id]: value })
                                }}
                                className="w-24 rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="如630"
                              />
                            </td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                              {localCheckpointResults[cp.id - 1]?.estimatedTime || cp.estimatedTime}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {cp.sectionSupply ? (
                                <div className="space-y-1">
                                  {cp.sectionSupply.gels > 0 && (
                                    <div className="text-xs">
                                      <span className="font-medium">{cp.sectionSupply.gels}份能量胶</span>
                                      <span className="text-gray-500">（{cp.sectionSupply.gelCalories}Kcal）</span>
                                    </div>
                                  )}
                                  {cp.sectionSupply.electrolytePowder > 0 && (
                                    <div className="text-xs">
                                      <span className="font-medium">{cp.sectionSupply.electrolytePowder.toFixed(2)}份电解质</span>
                                      <span className="text-gray-500">
                                        （{cp.sectionSupply.electrolytePowderCalories}Kcal， {cp.sectionSupply.electrolytePowderWater}ml， {cp.sectionSupply.electrolytePowderElectrolytes}mg）
                                      </span>
                                    </div>
                                  )}
                                  {!cp.sectionSupply.gels && !cp.sectionSupply.electrolytePowder && (
                                    <span className="text-xs text-gray-400">暂无补给数据</span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-xs text-gray-400">-</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    onClick={() => {
                      // 保存预测数据到localStorage，跳转到复盘页面
                      const reviewData = {
                        memberId: selectedMemberId,
                        trailId: selectedTrailId,
                        predictedData: result,
                        member: members.find(m => m.id === selectedMemberId),
                        trail: trails.find(t => t.id === selectedTrailId),
                      }
                      localStorage.setItem('pendingReview', JSON.stringify(reviewData))
                      router.push(`/reviews/new`)
                    }}
                    className="w-full rounded-lg bg-purple-600 px-6 py-3 text-white font-medium hover:bg-purple-700"
                  >
                    开始复盘
                  </button>
                </div>
              </div>
            </div>
          )}

          {!result && (
            <div className="rounded-lg bg-white p-12 shadow-md text-center">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className="text-lg text-gray-600">请在左侧选择预测参数并点击"开始预测"</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
