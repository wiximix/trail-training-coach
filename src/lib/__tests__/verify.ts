/**
 * 算法验证脚本
 * 手动验证核心算法的正确性
 */

import {
  calculatePer100mElevation,
  calculateSlopePercent,
  calculateElevationFactor,
  parsePace,
  calculateTrailPace,
  formatTime,
  formatPace,
  calculateHourlyEnergyNeeds,
  calculateSupplyDosages,
  generateSupplyStrategy,
  DEFAULT_TERRAIN_PACE_FACTORS,
} from "../trailAlgorithm"

console.log("=== 越野跑成绩预测核心算法验证 ===\n")

// 1. 验证坡度计算
console.log("1. 坡度计算测试")
console.log("  calculatePer100mElevation(96, 2.64):", calculatePer100mElevation(96, 2.64), "期望: 3.64")
console.log("  calculateSlopePercent(100, 2.0):", calculateSlopePercent(100, 2.0), "期望: 5.0")
console.log()

// 2. 验证爬升影响值计算
console.log("2. 爬升影响值计算测试")
console.log("  平路/微坡 (2.0m):", calculateElevationFactor(2.0), "期望: 0.1")
console.log("  缓上坡 (5.0m):", calculateElevationFactor(5.0), "期望: 1.5")
console.log("  陡上坡 (10.0m):", calculateElevationFactor(10.0), "期望: 4.0")
console.log("  急上坡 (20.0m):", calculateElevationFactor(20.0), "期望: 10.0")
console.log("  下坡 (-5.0m):", calculateElevationFactor(-5.0), "期望: 负值且 >= -0.5")
console.log()

// 3. 验证配速计算
console.log("3. 配速计算测试")
console.log("  parsePace('5:30/km'):", parsePace("5:30/km"), "期望: 5.5")
console.log("  calculateTrailPace(6.0, 100, '山路'):", calculateTrailPace(6.0, 100, "山路"), "期望: ~7.0")
console.log("  calculateTrailPace(6.0, -100, '山路'):", calculateTrailPace(6.0, -100, "山路"), "期望: >= 4.2")
console.log()

// 4. 验证时间格式化
console.log("4. 时间格式化测试")
console.log("  formatTime(125.5):", formatTime(125.5), "期望: 02:05:30")
console.log("  formatPace(5.5):", formatPace(5.5), "期望: 5:30/km")
console.log()

// 5. 验证补给策略
console.log("5. 补给策略测试")
const hourlyNeeds = calculateHourlyEnergyNeeds("多汗", 70)
console.log("  calculateHourlyEnergyNeeds('多汗', 70):", hourlyNeeds)
console.log("    期望: carbs=70, water=600, electrolytes=600")
console.log()

const supplyDosages = calculateSupplyDosages(hourlyNeeds, 100, 200, 300)
console.log("  calculateSupplyDosages(...):", supplyDosages)
console.log("    期望: gelsPerHour≈0.7, saltsPerHour=3.0, electrolytePowderPerHour≈2.0")
console.log()

const strategy = generateSupplyStrategy({
  crampFrequency: "有时",
  expectedSweatRate: "多汗",
  preferredSupplyTypes: ["能量胶"],
  distance: 50,
})
console.log("  generateSupplyStrategy(...):", strategy)
console.log("    期望: 包含补水、电解质、能量胶建议")
console.log()

console.log("=== 验证完成 ===")
