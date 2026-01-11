/**
 * 越野跑成绩预测核心算法模块
 *
 * 文件说明：
 * 本文件包含了越野跑成绩预测APP的所有核心计算算法，包括坡度计算、配速计算、
 * 爬升影响、补给策略等。所有算法函数均为纯函数，无副作用，便于复用和测试。
 *
 * 适用场景：
 * - 赛道编辑页面的实时计算
 * - 成绩预测API的后端计算
 * - 复盘页面的数据验证
 * - 任何需要越野跑相关计算的业务场景
 *
 * 修改日志：
 * - 2025-01-15: 初始版本，抽离核心算法逻辑
 * - 2025-01-15: 添加详细注释和类型定义
 */

// ============================================================================
// 类型定义
// ============================================================================

/**
 * 路段类型枚举
 */
export type TerrainType = "沙地" | "机耕道" | "山路" | "石铺路" | "台阶"

/**
 * 路段配速系数接口
 */
export interface TerrainPaceFactors {
  sand: number       // 沙地配速系数
  farmRoad: number  // 机耕道配速系数
  mountainRoad: number  // 山路配速系数
  stoneRoad: number  // 石铺路配速系数
  steps: number     // 台阶配速系数
}

/**
 * 默认路段配速系数
 */
export const DEFAULT_TERRAIN_PACE_FACTORS: TerrainPaceFactors = {
  sand: 1.1,        // 沙地默认系数是1.1
  farmRoad: 1.0,
  mountainRoad: 1.0,
  stoneRoad: 1.0,
  steps: 1.0,
}

/**
 * 补给策略参数接口
 */
export interface SupplyStrategyParams {
  crampFrequency: string          // 抽筋情况
  expectedSweatRate: string       // 预计出汗量
  preferredSupplyTypes: string[]  // 喜好补给类型
  distance: number               // 总距离（km）
}

/**
 * 每小时能量需求接口
 */
export interface HourlyEnergyNeeds {
  carbs: number        // 热量（Kcal/小时）
  water: number        // 水（ml/小时）
  electrolytes: number  // 电解质（mg/小时）
}

/**
 * 补给份数接口
 */
export interface SupplyDosages {
  gelsPerHour: number                // 能量胶每小时份数
  saltsPerHour: number               // 盐丸每小时份数
  electrolytePowderPerHour: number   // 电解质粉每小时份数
}

// ============================================================================
// 路段类型映射
// ============================================================================

/**
 * 路段类型到配速系数key的映射
 * 用于将中文路段类型转换为英文key，方便访问对应的配速系数
 */
export const TERRAIN_TYPE_TO_FACTOR_KEY: Record<TerrainType, keyof TerrainPaceFactors> = {
  "沙地": "sand",
  "机耕道": "farmRoad",
  "山路": "mountainRoad",
  "石铺路": "stoneRoad",
  "台阶": "steps",
}

// ============================================================================
// 坡度计算相关算法
// ============================================================================

/**
 * 计算赛段每100米爬升量（核心坡度指标）
 *
 * 功能描述：
 * 计算每100米的爬升/下降量，是评估坡度的核心指标。正数表示上坡，负数表示下坡。
 *
 * @param {number} segmentElevation - 赛段总爬升量（单位：米，下坡为负数）
 * @param {number} segmentDistance - 赛段距离（单位：公里）
 * @returns {number} 每100米爬升量（保留2位小数，如3.64）
 *
 * 计算逻辑：
 * 每100米爬升 = 爬升量 ÷ (距离 × 10)
 * 因为1公里 = 1000米 = 10个100米段
 *
 * @example
 * // 输入：segmentElevation=96，segmentDistance=2.64
 * // 输出：3.64
 * // 计算：96 ÷ (2.64 × 10) = 96 ÷ 26.4 ≈ 3.64
 *
 * @example
 * // 输入：segmentElevation=-50，segmentDistance=2.0
 * // 输出：-2.50
 * // 计算：-50 ÷ (2.0 × 10) = -50 ÷ 20 = -2.5
 */
export function calculatePer100mElevation(
  segmentElevation: number,
  segmentDistance: number
): number {
  // 边界值处理：距离为0或负数时返回0
  if (segmentDistance <= 0) {
    return 0
  }

  // 计算总共有多少个100米段
  const num100mSegments = segmentDistance * 10

  // 计算每100米爬升量
  const per100mElevation = segmentElevation / num100mSegments

  // 保留2位小数
  return Number(per100mElevation.toFixed(2))
}

/**
 * 计算坡度百分比
 *
 * 功能描述：
 * 计算赛段的坡度百分比，用于直观展示坡度大小。
 *
 * @param {number} segmentElevation - 赛段总爬升量（单位：米）
 * @param {number} segmentDistance - 赛段距离（单位：公里）
 * @returns {number} 坡度百分比（保留2位小数，如5.43）
 *
 * 计算逻辑：
 * 坡度百分比 = (爬升量 ÷ 距离转米) × 100
 *
 * @example
 * // 输入：segmentElevation=100，segmentDistance=2.0
 * // 输出：5.00
 * // 计算：(100 ÷ 2000) × 100 = 5%
 */
export function calculateSlopePercent(
  segmentElevation: number,
  segmentDistance: number
): number {
  // 边界值处理：距离为0或负数时返回0
  if (segmentDistance <= 0) {
    return 0
  }

  // 将距离转换为米
  const distanceInMeters = segmentDistance * 1000

  // 计算坡度百分比
  const slopePercent = (segmentElevation / distanceInMeters) * 100

  // 保留2位小数
  return Number(slopePercent.toFixed(2))
}

// ============================================================================
// 爬升影响值计算算法
// ============================================================================

/**
 * 计算爬升影响值（核心算法）
 *
 * 功能描述：
 * 基于每100米爬升量计算爬升对配速的影响值。采用分级计算策略，
 * 不同坡度范围应用不同的计算公式。下坡时影响值为负数，表示配速提升。
 *
 * @param {number} per100mElevation - 每100米爬升量（单位：米，可为负数）
 * @returns {number} 爬升影响值（保留2位小数，单位：分钟/公里）
 *
 * 计算逻辑：
 * - 上坡时（≥0）：根据坡度分级计算
 *   - 0~3米：平路/微坡，固定影响 0.1
 *   - 3~8米：缓上坡，线性影响 0.3 × 每100米爬升
 *   - 8~15米：陡上坡，陡坡系数提升 0.4 × 每100米爬升
 *   - >15米：急上坡，急坡大幅增加 0.5 × 每100米爬升
 * - 下坡时（<0）：负值计算，表示配速提升
 *   - 系数在 -0.1 到 -0.2 之间，根据坡度大小动态调整
 *   - 最低限制：不低于 -0.5（避免下坡配速过快）
 *
 * @example
 * // 输入：per100mElevation=3.64（缓上坡）
 * // 输出：1.09
 * // 计算：3.64 在 3~8 米范围内，使用 0.3 × 3.64 ≈ 1.09
 *
 * @example
 * // 输入：per100mElevation=-2.5（下坡）
 * // 输出：-0.38
 * // 计算：|−2.5| = 2.5，2.5 ÷ 10 = 0.25，系数 = −(0.1 + 0.1 × 0.25) = −0.125，最终 = −0.125 × 2.5 = −0.3125 ≈ −0.31
 */
export function calculateElevationFactor(per100mElevation: number): number {
  let elevationFactor: number

  // 判断上下坡
  if (per100mElevation >= 0) {
    // ===== 上坡处理：根据坡度分级计算 =====
    if (per100mElevation <= 3) {
      // 平路/微坡（0~3米）：轻微影响
      elevationFactor = 0.1
    } else if (per100mElevation <= 8) {
      // 缓上坡（3~8米）：缓坡线性影响
      // 公式：0.3 × 每100米爬升
      elevationFactor = 0.3 * per100mElevation
    } else if (per100mElevation <= 15) {
      // 陡上坡（8~15米）：陡坡影响系数提升
      // 公式：0.4 × 每100米爬升
      elevationFactor = 0.4 * per100mElevation
    } else {
      // 急上坡（>15米）：急坡大幅增加配速
      // 公式：0.5 × 每100米爬升
      elevationFactor = 0.5 * per100mElevation
    }
  } else {
    // ===== 下坡处理：负值计算 =====

    // 取绝对值进行计算
    const absElevation = Math.abs(per100mElevation)

    // 下坡配速提升，系数在 -0.1 到 -0.2 之间
    // 根据坡度大小动态调整：坡度越大，系数越接近-0.2
    const slopeRatio = Math.min(absElevation / 10, 1) // 归一化到0~1

    // 计算动态系数：-0.1（最小坡度）到 -0.2（最大坡度）
    elevationFactor = -(0.1 + 0.1 * slopeRatio) * absElevation

    // 最低限制：不低于-0.5（避免下坡配速过快）
    elevationFactor = Math.max(elevationFactor, -0.5)
  }

  // 保留2位小数
  return Number(elevationFactor.toFixed(2))
}

// ============================================================================
// 配速计算相关算法
// ============================================================================

/**
 * 将配速字符串转换为分钟/公里数值
 *
 * 功能描述：
 * 将 "5:30/km" 格式的配速字符串转换为数值 5.5，便于后续计算。
 *
 * @param {string} paceStr - 配速字符串（格式：如 "5:30/km" 或 "6:00/km"）
 * @returns {number} 配速数值（单位：分钟/公里）
 *
 * 计算逻辑：
 * 配速 = 分钟数 + 秒数 ÷ 60
 *
 * @example
 * // 输入：paceStr="5:30/km"
 * // 输出：5.5
 * // 计算：5 + 30 ÷ 60 = 5.5
 */
export function parsePace(paceStr: string): number {
  // 空值处理：返回默认配速6:00/km
  if (!paceStr) {
    return 6.0
  }

  // 去除可能的 "/km" 后缀
  const cleanPaceStr = paceStr.replace("/km", "")

  // 解析配速字符串
  const parts = cleanPaceStr.split(":")

  // 标准格式：分钟:秒
  if (parts.length === 2) {
    const minutes = Number(parts[0])
    const seconds = Number(parts[1])
    return minutes + seconds / 60
  }

  // 格式错误时返回默认值
  return 6.0
}

/**
 * 计算越野赛配速（核心算法）
 *
 * 功能描述：
 * 基于马拉松配速，考虑爬升、路段类型和配速系数，计算越野赛实际配速。
 *
 * @param {number} marathonPace - 马拉松配速（单位：分钟/公里）
 * @param {number} elevation - 赛段总爬升量（单位：米，下坡为负数）
 * @param {string} terrainType - 路段类型（"沙地" | "机耕道" | "山路" | "石铺路" | "台阶"）
 * @param {TerrainPaceFactors} [terrainPaceFactors] - 路段配速系数（可选）
 * @returns {number} 越野赛配速（单位：分钟/公里）
 *
 * 计算逻辑：
 * 1. 基础配速 = 马拉松配速 + (每100米爬升额外增加1分钟时间的影响)
 * 2. 应用路段配速系数：越野配速 = 基础配速 × 路段系数
 * 3. 下坡配速边界约束：不低于基础配速的7折
 *
 * @example
 * // 输入：marathonPace=6.0, elevation=96, terrainType="山路", terrainPaceFactors={...}
 * // 输出：6.48
 * // 计算：基础配速 = 6.0 + (96 ÷ 100) = 6.96，应用系数后 = 6.96 × 1.0 = 6.96
 */
export function calculateTrailPace(
  marathonPace: number,
  elevation: number,
  terrainType: string,
  terrainPaceFactors?: TerrainPaceFactors
): number {
  // 计算每100米爬升额外增加的时间影响
  const elevationFactor = elevation / 100

  // 基础配速 = 马拉松配速 + 爬升影响
  let trailPace = marathonPace + elevationFactor

  // 应用路段配速系数
  if (terrainPaceFactors && terrainType) {
    const factorKey = TERRAIN_TYPE_TO_FACTOR_KEY[terrainType as TerrainType]
    const factor = factorKey ? terrainPaceFactors[factorKey] || 1.0 : 1.0
    trailPace = trailPace * factor
  }

  // 下坡配速边界约束：不低于基础配速的7折
  if (elevation < 0) {
    const minPace = marathonPace * 0.7
    trailPace = Math.max(trailPace, minPace)
  }

  return trailPace
}

// ============================================================================
// 时间格式化相关算法
// ============================================================================

/**
 * 将分钟数转换为 HH:MM:SS 格式字符串
 *
 * 功能描述：
 * 将累计的分钟数转换为标准的时间格式字符串，便于展示。
 *
 * @param {number} totalMinutes - 总分钟数（可为小数，如 125.5）
 * @returns {string} HH:MM:SS 格式的时间字符串（如 "02:05:30"）
 *
 * 计算逻辑：
 * - 小时数 = floor(分钟数 ÷ 60)
 * - 分钟数 = floor(分钟数 mod 60)
 * - 秒数 = floor(小数部分 × 60)
 *
 * @example
 * // 输入：totalMinutes=125.5
 * // 输出："02:05:30"
 * // 计算：125.5 ÷ 60 = 2.0916... → 2小时，余5.5分钟
 * //       5.5分钟 = 5分30秒
 * //       最终格式：02:05:30
 */
export function formatTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60)
  const minutes = Math.floor(totalMinutes % 60)
  const seconds = Math.floor((totalMinutes % 1) * 60)

  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
}

/**
 * 将分钟数转换为配速字符串
 *
 * 功能描述：
 * 将分钟数值转换为 "MM:SS/km" 格式的配速字符串。
 *
 * @param {number} paceMinutes - 配速（单位：分钟/公里）
 * @returns {string} 配速字符串（如 "6:30/km"）
 *
 * @example
 * // 输入：paceMinutes=6.5
 * // 输出："6:30/km"
 */
export function formatPace(paceMinutes: number): string {
  const minutes = Math.floor(paceMinutes)
  const seconds = Math.floor((paceMinutes % 1) * 60)

  return `${minutes}:${seconds.toString().padStart(2, "0")}/km`
}

// ============================================================================
// 补给策略计算算法
// ============================================================================

/**
 * 计算每小时能量需求
 *
 * 功能描述：
 * 根据跑者的体重和出汗情况，计算每小时需要补充的碳水、水和电解质量。
 *
 * @param {string} expectedSweatRate - 预计出汗量（"有一点" | "多汗" | "非常多汗" | "汗流浃背"）
 * @param {number} [weight] - 跑者体重（单位：kg，可选）
 * @returns {HourlyEnergyNeeds} 每小时能量需求
 *
 * 计算逻辑：
 * - 热量需求：体重 × 4Kcal（每公斤体重每小时约4Kcal热量）
 * - 水和电解质需求：根据出汗量分级调整
 *   - 有一点：水500ml，电解质400mg
 *   - 多汗：水600ml，电解质600mg
 *   - 非常多汗：水700ml，电解质700mg
 *   - 汗流浃背：水800ml，电解质800mg
 *
 * @example
 * // 输入：expectedSweatRate="多汗", weight=70
 * // 输出：{ carbs: 280, water: 600, electrolytes: 600 }
 * // 计算：热量 = 70 × 4 = 280Kcal，水和电解质根据"多汗"设定
 */
export function calculateHourlyEnergyNeeds(
  expectedSweatRate: string,
  weight?: number | null
): HourlyEnergyNeeds {
  // 基础能量需求（默认值：有一点）
  let waterPerHour = 500      // 基础500ml/小时
  let electrolytesPerHour = 400  // 基础400mg/小时

  // 根据出汗量调整水和电解质需求
  if (expectedSweatRate === "汗流浃背") {
    waterPerHour = 800
    electrolytesPerHour = 800
  } else if (expectedSweatRate === "非常多汗") {
    waterPerHour = 700
    electrolytesPerHour = 700
  } else if (expectedSweatRate === "多汗") {
    waterPerHour = 600
    electrolytesPerHour = 600
  }

  // 根据体重调整热量需求（每公斤体重每小时约4Kcal热量）
  const caloriesPerHour = weight ? Math.round(weight * 4) : 240

  return {
    carbs: caloriesPerHour,
    water: waterPerHour,
    electrolytes: electrolytesPerHour,
  }
}

/**
 * 计算补给份数
 *
 * 功能描述：
 * 根据每小时能量需求和补给品的营养含量，计算每小时需要补充的补给份数。
 *
 * @param {HourlyEnergyNeeds} hourlyEnergyNeeds - 每小时能量需求
 * @param {number} [gelCarbs] - 能量胶碳水含量（单位：g，可选）
 * @param {number} [saltElectrolytes] - 盐丸电解质含量（单位：mg，可选）
 * @param {number} [electrolytePowder] - 电解质粉电解质含量（单位：mg，可选）
 * @returns {SupplyDosages} 每小时补给份数
 *
 * 计算逻辑：
 * - 能量胶份数 = ceil(每小时碳水需求 ÷ 能量胶碳水含量)
 * - 盐丸份数 = ceil(每小时电解质需求 ÷ 盐丸电解质含量)
 * - 电解质粉份数 = ceil(每小时电解质需求 ÷ 电解质粉电解质含量)
 *
 * @example
 * // 输入：hourlyEnergyNeeds={ carbs: 70, water: 600, electrolytes: 600 }, gelCarbs=100, saltElectrolytes=200
 * // 输出：{ gelsPerHour: 0.7, saltsPerHour: 3, electrolytePowderPerHour: 0 }
 * // 计算：能量胶 = 70 ÷ 100 = 0.7，盐丸 = 600 ÷ 200 = 3
 */
export function calculateSupplyDosages(
  hourlyEnergyNeeds: HourlyEnergyNeeds,
  gelCarbs?: number,
  saltElectrolytes?: number,
  electrolytePowder?: number
): SupplyDosages {
  // 能量胶份数（基于碳水含量）
  const gelsPerHour = gelCarbs && gelCarbs > 0
    ? Math.ceil(hourlyEnergyNeeds.carbs / gelCarbs * 10) / 10
    : 0

  // 盐丸份数（基于电解质含量）
  const saltsPerHour = saltElectrolytes && saltElectrolytes > 0
    ? Math.ceil(hourlyEnergyNeeds.electrolytes / saltElectrolytes * 10) / 10
    : 0

  // 电解质粉份数（基于电解质含量）
  const electrolytePowderPerHour = electrolytePowder && electrolytePowder > 0
    ? Math.ceil(hourlyEnergyNeeds.electrolytes / electrolytePowder * 10) / 10
    : 0

  return {
    gelsPerHour,
    saltsPerHour,
    electrolytePowderPerHour,
  }
}

/**
 * 生成补给策略文本
 *
 * 功能描述：
 * 根据跑者的个人数据，生成个性化的补给策略建议文本。
 *
 * @param {SupplyStrategyParams} params - 补给策略参数
 * @returns {string[]} 补给策略文本数组
 *
 * 计算逻辑：
 * 1. 根据出汗量调整补水频率
 * 2. 根据抽筋情况调整电解质补充
 * 3. 根据喜好补给类型添加补充建议
 *
 * @example
 * // 输入：{ crampFrequency: "有时", expectedSweatRate: "多汗", preferredSupplyTypes: ["能量胶"], distance: 50 }
 * // 输出：["每5-6公里补水100-150ml", "每补给点额外补充1-2粒盐丸", "能量胶每40-45分钟补充一支"]
 */
export function generateSupplyStrategy(params: SupplyStrategyParams): string[] {
  const {
    crampFrequency,
    expectedSweatRate,
    preferredSupplyTypes,
    distance,
  } = params

  const strategies: string[] = []

  // ===== 根据出汗量调整补水频率 =====
  if (expectedSweatRate === "汗流浃背") {
    strategies.push("每3-4公里补水200-250ml")
  } else if (expectedSweatRate === "非常多汗") {
    strategies.push("每4-5公里补水150-200ml")
  } else if (expectedSweatRate === "多汗") {
    strategies.push("每5-6公里补水100-150ml")
  } else {
    // 有一点或默认情况
    strategies.push("每6-8公里补水100ml")
  }

  // ===== 根据抽筋情况调整电解质补充 =====
  if (crampFrequency === "经常" || crampFrequency === "有时") {
    strategies.push("每补给点额外补充1-2粒盐丸")
    strategies.push("使用电解质冲剂替代部分纯水")
  }

  // ===== 根据喜好的补给类型添加建议 =====
  if (preferredSupplyTypes.includes("能量胶")) {
    strategies.push("能量胶每40-45分钟补充一支")
  }
  if (preferredSupplyTypes.includes("能量棒")) {
    strategies.push("能量棒每1.5-2小时补充一根")
  }
  if (preferredSupplyTypes.includes("能量+电解质冲剂")) {
    strategies.push("每补给点补充150-200ml电解质冲剂")
  }

  return strategies
}
