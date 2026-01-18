"use client"

import { Flame, Droplets, Activity } from "lucide-react"

export interface HourlyEnergyNeeds {
  carbs: number // 碳水
  water: number // 水
  electrolytes: number // 电解质
}

export interface SupplyDosages {
  gelsPerHour: number // 能量胶每小时份数
  saltsPerHour: number // 盐丸每小时份数
  electrolytePowderPerHour: number // 电解质粉每小时份数
}

export interface TotalSupplyDosages {
  totalGels: number // 总能量胶份数
  totalSalts: number // 总盐丸份数
  totalElectrolytePowder: number // 总电解质粉份数
  totalWater: number // 总水量
}

export interface TotalEnergyNeeds {
  carbs: number
  water: number
  electrolytes: number
}

export interface SupplyCalculatorProps {
  hourlyEnergyNeeds?: HourlyEnergyNeeds
  dynamicHourlyEnergyNeeds?: HourlyEnergyNeeds
  supplyDosages?: SupplyDosages
  dynamicSupplyDosages?: SupplyDosages
  totalEnergyNeeds?: TotalEnergyNeeds
  totalSupplyDosages?: TotalSupplyDosages
}

export default function SupplyCalculator({
  hourlyEnergyNeeds,
  dynamicHourlyEnergyNeeds,
  supplyDosages,
  dynamicSupplyDosages,
  totalEnergyNeeds,
  totalSupplyDosages,
}: SupplyCalculatorProps) {
  const effectiveHourlyEnergyNeeds = dynamicHourlyEnergyNeeds || hourlyEnergyNeeds
  const effectiveSupplyDosages = dynamicSupplyDosages || supplyDosages

  return (
    <div className="space-y-6">
      {/* 每小时能量需求 */}
      {effectiveHourlyEnergyNeeds && (
        <div>
          <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">每小时能量需求</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-lg bg-orange-50 dark:bg-orange-900/20 p-4">
              <div className="mb-2 flex items-center gap-2">
                <Flame className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200">热量</h4>
              </div>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{effectiveHourlyEnergyNeeds.carbs}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Kcal/小时</p>
            </div>
            <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-4">
              <div className="mb-2 flex items-center gap-2">
                <Droplets className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200">水</h4>
              </div>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{effectiveHourlyEnergyNeeds.water}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">ml/小时</p>
            </div>
            <div className="rounded-lg bg-green-50 dark:bg-green-900/20 p-4">
              <div className="mb-2 flex items-center gap-2">
                <Activity className="h-5 w-5 text-green-600 dark:text-green-400" />
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200">电解质</h4>
              </div>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{effectiveHourlyEnergyNeeds.electrolytes}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">mg/小时</p>
            </div>
          </div>
        </div>
      )}

      {/* 每小时补给份数 */}
      {effectiveSupplyDosages && (
        <div>
          <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">每小时补给份数</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-lg bg-purple-50 dark:bg-purple-900/20 p-4">
              <h4 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">能量胶</h4>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{effectiveSupplyDosages.gelsPerHour}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">支/小时</p>
            </div>
            <div className="rounded-lg bg-pink-50 dark:bg-pink-900/20 p-4">
              <h4 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">盐丸</h4>
              <p className="text-2xl font-bold text-pink-600 dark:text-pink-400">{effectiveSupplyDosages.saltsPerHour}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">粒/小时</p>
            </div>
            <div className="rounded-lg bg-teal-50 dark:bg-teal-900/20 p-4">
              <h4 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">电解质粉</h4>
              <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">{effectiveSupplyDosages.electrolytePowderPerHour}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">份/小时</p>
            </div>
          </div>
        </div>
      )}

      {/* 总能量需求 */}
      {totalEnergyNeeds && (
        <div>
          <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">总能量需求</h3>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="rounded-lg bg-orange-100 dark:bg-orange-900/20 p-4">
              <div className="mb-2 flex items-center gap-2">
                <Flame className="h-5 w-5 text-orange-700 dark:text-orange-400" />
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200">总热量</h4>
              </div>
              <p className="text-2xl font-bold text-orange-700 dark:text-orange-400">{totalEnergyNeeds.carbs}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Kcal</p>
            </div>
            <div className="rounded-lg bg-blue-100 dark:bg-blue-900/20 p-4">
              <div className="mb-2 flex items-center gap-2">
                <Droplets className="h-5 w-5 text-blue-700 dark:text-blue-400" />
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200">总水量</h4>
              </div>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{totalEnergyNeeds.water}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">ml</p>
            </div>
            <div className="rounded-lg bg-green-100 dark:bg-green-900/20 p-4">
              <div className="mb-2 flex items-center gap-2">
                <Activity className="h-5 w-5 text-green-700 dark:text-green-400" />
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200">总电解质</h4>
              </div>
              <p className="text-2xl font-bold text-green-700 dark:text-green-400">{totalEnergyNeeds.electrolytes}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">mg</p>
            </div>
          </div>
        </div>
      )}

      {/* 总补给份数 */}
      {totalSupplyDosages && (
        <div>
          <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">总补给份数</h3>
          <div className="grid grid-cols-4 gap-3">
            <div className="rounded-lg bg-purple-100 dark:bg-purple-900/20 p-3">
              <h4 className="mb-1 text-xs font-medium text-gray-700 dark:text-gray-200">能量胶</h4>
              <p className="text-xl font-bold text-purple-700 dark:text-purple-400">{totalSupplyDosages.totalGels}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">支</p>
            </div>
            <div className="rounded-lg bg-blue-100 dark:bg-blue-900/20 p-3">
              <h4 className="mb-1 text-xs font-medium text-gray-700 dark:text-gray-200">水</h4>
              <p className="text-xl font-bold text-blue-700 dark:text-blue-400">{totalSupplyDosages.totalWater}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">ml</p>
            </div>
            <div className="rounded-lg bg-teal-100 dark:bg-teal-900/20 p-3">
              <h4 className="mb-1 text-xs font-medium text-gray-700 dark:text-gray-200">电解质水</h4>
              <p className="text-xl font-bold text-teal-700 dark:text-teal-400">{totalSupplyDosages.totalElectrolytePowder}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">份</p>
            </div>
            <div className="rounded-lg bg-pink-100 dark:bg-pink-900/20 p-3">
              <h4 className="mb-1 text-xs font-medium text-gray-700 dark:text-gray-200">盐丸</h4>
              <p className="text-xl font-bold text-pink-700 dark:text-pink-400">{totalSupplyDosages.totalSalts}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">粒</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
