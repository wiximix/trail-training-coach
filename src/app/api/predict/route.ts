import { NextRequest, NextResponse } from "next/server"
import { MemberManager, TrailManager } from "@/storage/database"

const memberManager = new MemberManager()
const trailManager = new TrailManager()

interface PredictionRequest {
  memberId: string
  trailId: string
  expectedSweatRate?: string
  plannedPace?: string // 计划配速
  checkpointPaces?: Record<number, string> // 每个CP的独立计划配速
  gelCarbs?: number // 能量胶碳水含量
  saltElectrolytes?: number // 盐丸电解质含量
  electrolytePowder?: number // 电解质粉含量
  electrolytePowderCalories?: number // 电解质粉热量
  electrolytePowderWater?: number // 电解质粉冲水量
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
    accumulatedDistance: number // 累计距离
    sectionSupply?: { // 分段补给
      gels: number // 能量胶份数
      gelCalories: number // 能量胶热量
      electrolytePowder: number // 电解质粉份数
      electrolytePowderCalories: number // 电解质粉热量
      electrolytePowderWater: number // 电解质粉水量
      electrolytePowderElectrolytes: number // 电解质粉电解质含量
    }
  }>
  overallSupplyStrategy: string[]
  hourlyEnergyNeeds?: {
    carbs: number // 热量
    water: number // 水
    electrolytes: number // 电解质
  }
  supplyDosages?: {
    gelsPerHour: number // 能量胶每小时份数
    saltsPerHour: number // 盐丸每小时份数
    electrolytePowderPerHour: number // 电解质粉每小时份数
  }
  totalEnergyNeeds?: {
    carbs: number // 总热量
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

// POST /api/predict - 预测成绩和补给策略
export async function POST(request: NextRequest) {
  try {
    const body: PredictionRequest = await request.json()
    const {
      memberId,
      trailId,
      expectedSweatRate,
      plannedPace,
      checkpointPaces,
      gelCarbs,
      saltElectrolytes,
      electrolytePowder,
      electrolytePowderCalories,
      electrolytePowderWater,
    } = body

    // 获取成员数据
    const member = await memberManager.getMemberById(memberId)
    if (!member) {
      return NextResponse.json(
        { success: false, error: "成员不存在" },
        { status: 404 }
      )
    }

    // 获取赛道数据
    const trail = await trailManager.getTrailById(trailId)
    if (!trail) {
      return NextResponse.json(
        { success: false, error: "赛道不存在" },
        { status: 404 }
      )
    }

    const marathonPace = parsePace(member.marathonPace || "6:00/km")
    const checkpoints = trail.checkpoints as any[]
    const terrainPaceFactors = member.terrainPaceFactors as any

    // 计算总距离和总爬升
    const totalDistance = checkpoints.reduce((sum, cp) => sum + cp.distance, 0)
    const totalElevation = checkpoints.reduce((sum, cp) => sum + cp.elevation, 0)

    // 生成补给策略
    const overallSupplyStrategy = generateSupplyStrategy({
      crampFrequency: member.crampFrequency || "从来没有",
      expectedSweatRate: expectedSweatRate || member.expectedSweatRate || "有一点",
      preferredSupplyTypes: (member.preferredSupplyTypes as string[]) || [],
      distance: totalDistance,
    })

    // 计算每小时能量需求
    const hourlyEnergyNeeds = calculateHourlyEnergyNeeds(
      expectedSweatRate || member.expectedSweatRate || "有一点",
      member.weight
    )

    // 计算补给份数
    const supplyDosages = calculateSupplyDosages(
      hourlyEnergyNeeds,
      gelCarbs,
      saltElectrolytes,
      electrolytePowder
    )

    // 解析计划配速（如果提供）
    const plannedPaceMinutes = plannedPace ? parsePace(plannedPace) : null

    // 计算每个CP点的时间和补给策略
    let accumulatedDistance = 0
    let accumulatedTime = 0
    let lastSupplyDistance = 0 // 上次补给点的累计距离
    const checkpointResults = checkpoints.map((cp) => {
      accumulatedDistance += cp.distance

      // 计算爬升等效距离（m）= 爬升（m）* 10，转换为km
      const elevationEquivalentDistance = cp.elevation * 10 / 1000 // 转换为km

      // 获取路段配速系数
      let terrainFactor = 1.0
      if (terrainPaceFactors && cp.terrainType) {
        const factorKey = TERRAIN_TYPE_TO_FACTOR_KEY[cp.terrainType as keyof typeof TERRAIN_TYPE_TO_FACTOR_KEY]
        terrainFactor = factorKey ? terrainPaceFactors[factorKey] || 1.0 : 1.0
      }

      // 计算算法配速（仅用于回退）
      const sectionPace = parsePace(member.marathonPace || "6:00/km")

      // 优先使用CP的独立计划配速，如果没有则使用全局计划配速，最后使用算法配速
      const cpPlannedPace = checkpointPaces?.[cp.id]
      const cpPlannedPaceMinutes = cpPlannedPace ? parsePace(cpPlannedPace) : null
      const actualSectionPace = cpPlannedPaceMinutes ?? plannedPaceMinutes ?? sectionPace

      // 分段用时 = (本段距离 + 爬升等效距离) * 计划配速 * 路段系数
      const sectionTime = (cp.distance + elevationEquivalentDistance) * actualSectionPace * terrainFactor
      accumulatedTime += sectionTime

      const isSupplyPoint = accumulatedDistance % 5 < 2.5

      // 计算该CP点的补给内容
      let sectionSupply = undefined
      if (isSupplyPoint) {
        const distanceSinceLastSupply = accumulatedDistance - lastSupplyDistance
        const sectionDurationInHours = sectionTime / 60

        // 计算该分段需要的能量、水、电解质
        const sectionCarbs = hourlyEnergyNeeds.carbs * sectionDurationInHours
        const sectionWater = hourlyEnergyNeeds.water * sectionDurationInHours
        const sectionElectrolytes = hourlyEnergyNeeds.electrolytes * sectionDurationInHours

        // 计算补给份数
        let gels = 0, gelCalories = 0
        if (gelCarbs && gelCarbs > 0) {
          gels = Math.ceil(sectionCarbs / gelCarbs * 10) / 10
          gelCalories = gels * gelCarbs
        }

        let electrolytePowderSupply = 0, electrolytePowderCalories = 0, electrolytePowderWaterSupply = 0, electrolytePowderElectrolytes = 0
        if (electrolytePowder && electrolytePowder > 0) {
          electrolytePowderSupply = Math.ceil(sectionElectrolytes / electrolytePowder * 10) / 10
          electrolytePowderCalories = electrolytePowderSupply * (electrolytePowderCalories || 0)
          electrolytePowderWaterSupply = electrolytePowderSupply * (electrolytePowderWater || 0)
          electrolytePowderElectrolytes = electrolytePowderSupply * electrolytePowder
        }

        sectionSupply = {
          gels: Number(gels.toFixed(2)),
          gelCalories: Number(gelCalories.toFixed(0)),
          electrolytePowder: Number(electrolytePowderSupply.toFixed(2)),
          electrolytePowderCalories: Number(electrolytePowderCalories.toFixed(0)),
          electrolytePowderWater: Number(electrolytePowderWaterSupply.toFixed(0)),
          electrolytePowderElectrolytes: Number(electrolytePowderElectrolytes.toFixed(0)),
        }

        lastSupplyDistance = accumulatedDistance
      }

      return {
        id: cp.id,
        distance: Number(cp.distance.toFixed(2)),
        elevation: Number(cp.elevation.toFixed(2)),
        downhillDistance: cp.downhillDistance ? Number(cp.downhillDistance.toFixed(2)) : undefined,
        terrainType: cp.terrainType || "未知",
        terrainPaceFactor: Number(terrainFactor.toFixed(2)),
        plannedPace: cpPlannedPace || plannedPace || undefined, // 计划配速（优先使用CP独立配速）
        sectionTime: Number(sectionTime.toFixed(2)),
        estimatedTime: formatTime(accumulatedTime),
        supplyStrategy: isSupplyPoint ? "补给点" : "通过点",
        accumulatedDistance: Number(accumulatedDistance.toFixed(2)),
        sectionSupply,
      }
    })

    // 计算总时间
    const totalDurationInHours = accumulatedTime / 60

    // 计算总需求量
    const totalEnergyNeeds = {
      carbs: Math.round(hourlyEnergyNeeds.carbs * totalDurationInHours),
      water: Math.round(hourlyEnergyNeeds.water * totalDurationInHours),
      electrolytes: Math.round(hourlyEnergyNeeds.electrolytes * totalDurationInHours),
    }

    // 计算总补给份数（从所有补给点汇总）
    const totalSupplyDosages = checkpointResults.reduce((acc, cp) => {
      if (cp.sectionSupply) {
        acc.totalGels += cp.sectionSupply.gels || 0
        acc.totalElectrolytePowder += cp.sectionSupply.electrolytePowder || 0
        acc.totalWater += cp.sectionSupply.electrolytePowderWater || 0
      }
      return acc
    }, { totalGels: 0, totalSalts: 0, totalElectrolytePowder: 0, totalWater: 0 })

    // 计算总盐丸份数（通过电解质需求和盐丸含量计算）
    if (saltElectrolytes && saltElectrolytes > 0) {
      totalSupplyDosages.totalSalts = Math.ceil(totalEnergyNeeds.electrolytes / saltElectrolytes * 10) / 10
    }

    // 四舍五入
    totalSupplyDosages.totalGels = Number(totalSupplyDosages.totalGels.toFixed(2))
    totalSupplyDosages.totalSalts = Number(totalSupplyDosages.totalSalts.toFixed(2))
    totalSupplyDosages.totalElectrolytePowder = Number(totalSupplyDosages.totalElectrolytePowder.toFixed(2))
    totalSupplyDosages.totalWater = Number(totalSupplyDosages.totalWater.toFixed(0))

    const result: PredictionResult = {
      estimatedTime: formatTime(accumulatedTime),
      estimatedPace: formatPace(accumulatedTime / totalDistance),
      plannedPace: plannedPace || undefined, // 计划配速
      checkpoints: checkpointResults,
      overallSupplyStrategy,
      hourlyEnergyNeeds,
      supplyDosages,
      totalEnergyNeeds,
      totalSupplyDosages,
    }

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error("预测失败:", error)
    return NextResponse.json(
      { success: false, error: "预测失败" },
      { status: 500 }
    )
  }
}
