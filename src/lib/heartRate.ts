/**
 * 心率区间相关计算函数
 */

import type { HeartRateZone } from "@/types"

/**
 * 计算储备心率区间
 *
 * @param restingHeartRate - 静息心率
 * @param maxHeartRate - 最大心率
 * @returns 心率区间对象
 */
export function calculateHRRZones(
  restingHeartRate: number,
  maxHeartRate: number
): Record<string, HeartRateZone> {
  const hrr = maxHeartRate - restingHeartRate

  return {
    zone1: {
      name: "Zone 1 (恢复)",
      min: restingHeartRate + Math.round(hrr * 0.5),
      max: restingHeartRate + Math.round(hrr * 0.6),
      color: "bg-gray-100 text-gray-800",
    },
    zone2: {
      name: "Zone 2 (有氧基础)",
      min: restingHeartRate + Math.round(hrr * 0.6),
      max: restingHeartRate + Math.round(hrr * 0.7),
      color: "bg-green-100 text-green-800",
    },
    zone3: {
      name: "Zone 3 (有氧)",
      min: restingHeartRate + Math.round(hrr * 0.7),
      max: restingHeartRate + Math.round(hrr * 0.8),
      color: "bg-blue-100 text-blue-800",
    },
    zone4: {
      name: "Zone 4 (无氧)",
      min: restingHeartRate + Math.round(hrr * 0.8),
      max: restingHeartRate + Math.round(hrr * 0.9),
      color: "bg-orange-100 text-orange-800",
    },
    zone5: {
      name: "Zone 5 (最大摄氧量)",
      min: restingHeartRate + Math.round(hrr * 0.9),
      max: maxHeartRate,
      color: "bg-red-100 text-red-800",
    },
  }
}
