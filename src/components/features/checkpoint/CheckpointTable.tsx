"use client"

import { useState } from "react"

export interface Checkpoint {
  id: number
  distance: number
  elevation: number
  downhillDistance?: number
  terrainType?: string
  terrainPaceFactor?: number
  sectionTime?: number
  estimatedTime: string
  supplyStrategy?: string
  accumulatedDistance?: number
  sectionSupply?: {
    gels?: number
    gelCalories?: number
    electrolytePowder?: number
    electrolytePowderCalories?: number
    electrolytePowderWater?: number
    electrolytePowderElectrolytes?: number
  }
}

interface CheckpointTableProps {
  checkpoints: Checkpoint[]
  editable?: boolean
  showPrediction?: boolean
  showCustomP0?: boolean
  showCustomK?: boolean
  checkpointP0s?: Record<number, string>
  checkpointKs?: Record<number, string>
  onCheckpointP0Change?: (id: number, value: string) => void
  onCheckpointKChange?: (id: number, value: string) => void
  onCheckpointChange?: (index: number, field: string, value: number | string) => void
  recalcTimes?: Record<number, string>
  recalculateWithCustomParams?: (id: number, result: any, p0: number, k: number) => number
  getEffectiveP0?: (id: number, result: any) => number
  getEffectiveK?: (id: number, result: any) => number
  predictionResult?: any
  customFlatBaselinePace?: string
}

export default function CheckpointTable({
  checkpoints,
  editable = false,
  showPrediction = false,
  showCustomP0 = false,
  showCustomK = false,
  checkpointP0s,
  checkpointKs,
  onCheckpointP0Change,
  onCheckpointKChange,
  onCheckpointChange,
  recalcTimes,
  recalculateWithCustomParams,
  getEffectiveP0,
  getEffectiveK,
  predictionResult,
  customFlatBaselinePace,
}: CheckpointTableProps) {
  const parseMMSSPace = (pace: string): number => {
    if (!pace) return 6.0
    const cleaned = pace.replace(/[:/]/g, '').padStart(4, '0')
    const minutes = parseInt(cleaned.substring(0, 2))
    const seconds = parseInt(cleaned.substring(2, 4))
    return minutes + seconds / 60
  }

  const formatMinutesToMMSS = (minutes: number): string => {
    const mins = Math.floor(minutes)
    const secs = Math.round((minutes - mins) * 60)
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-300">
              CP点
            </th>
            {showPrediction && (
              <>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-300">
                  累计距离
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-300">
                  分段距离 Di (km)
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-300">
                  分段爬升 Ei (m)
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-300">
                  下坡
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-300">
                  地形类型
                </th>
                {showPrediction && (
                  <>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-300">
                      地形复杂度系数 α
                    </th>
                    {showCustomP0 && (
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-300">
                        平路基准配速 P0
                      </th>
                    )}
                    {showCustomK && (
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-300">
                        爬升损耗系数 k
                      </th>
                    )}
                    <th
                      className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-300 cursor-help"
                      title="计算公式：Ti = (Di × P0 + Ei × k) × α&#10;Ti: 分段用时（分钟）&#10;Di: 分段距离（km）&#10;P0: 平路基准配速（分钟/km）&#10;Ei: 分段爬升（m）&#10;k: 爬升损耗系数（秒/米）&#10;α: 地形复杂度系数"
                    >
                      分段用时(分钟) ⚡
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-300">
                      预计时间
                    </th>
                  </>
                )}
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-300">
                  补给详情
                </th>
              </>
            )}
            {!showPrediction && (
              <>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-300">
                  距离 (km)
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-300">
                  爬升 (m)
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-300">
                  下坡 (m)
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-300">
                  地形类型
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-300">
                  坡度 (%)
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-300">
                  每100m爬升 (m)
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-300">
                  爬升影响
                </th>
              </>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
          {checkpoints.map((cp, index) => (
            <tr key={cp.id}>
              <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                {cp.supplyStrategy === "补给点" ? (
                  <span className="rounded-full bg-blue-100 dark:bg-blue-900/30 px-2 py-1 text-blue-800 dark:text-blue-300">
                    CP{cp.id}（补给）
                  </span>
                ) : (
                  <span className="text-gray-600 dark:text-gray-400">CP{cp.id}</span>
                )}
              </td>
              {showPrediction && (
                <>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{cp.accumulatedDistance} km</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{cp.distance} km</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{cp.elevation} m</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{cp.downhillDistance || 0} m</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{cp.terrainType || "未知"}</td>
                  {showPrediction && (
                    <>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{cp.terrainPaceFactor?.toFixed(2) || "1.00"}</td>
                      {showCustomP0 && onCheckpointP0Change && (
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={checkpointP0s?.[cp.id] || (customFlatBaselinePace ? customFlatBaselinePace : formatMinutesToMMSS(parseMMSSPace(predictionResult?.flatBaselinePace?.replace(/[:/]/g, '') || 6.0)))}
                            onChange={(e) => onCheckpointP0Change(cp.id, e.target.value.replace(/\D/g, ''))}
                            className="w-20 rounded border border-gray-300 dark:border-gray-600 px-2 py-1 text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            placeholder="MMSS"
                            maxLength={4}
                          />
                        </td>
                      )}
                      {showCustomK && onCheckpointKChange && (
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            value={checkpointKs?.[cp.id] || predictionResult?.elevationLossCoefficient || 1.2}
                            onChange={(e) => onCheckpointKChange(cp.id, e.target.value)}
                            className="w-16 rounded border border-gray-300 dark:border-gray-600 px-2 py-1 text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            placeholder="秒/米"
                          />
                        </td>
                      )}
                      {recalculateWithCustomParams && getEffectiveP0 && getEffectiveK && recalcTimes && (
                        <>
                          <td
                            className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 cursor-help"
                            title={`分段用时 = (${cp.distance}km × ${getEffectiveP0(cp.id, predictionResult).toFixed(2)} + ${cp.elevation}m × ${getEffectiveK(cp.id, predictionResult)}s/m ÷ 60s) × ${cp.terrainPaceFactor?.toFixed(2) || "1.00"}`}
                          >
                            {recalculateWithCustomParams(cp.id, predictionResult, getEffectiveP0(cp.id, predictionResult), getEffectiveK(cp.id, predictionResult)).toFixed(1)}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                            {recalcTimes[cp.id] || cp.estimatedTime}
                          </td>
                        </>
                      )}
                    </>
                  )}
                </>
              )}
              {!showPrediction && (
                <>
                  <td className="px-4 py-3">
                    {editable && onCheckpointChange ? (
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={cp.distance}
                        onChange={(e) => onCheckpointChange(index, 'distance', parseFloat(e.target.value) || 0)}
                        className="w-24 rounded border border-gray-300 dark:border-gray-600 px-2 py-1 text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    ) : (
                      <span className="text-sm text-gray-600 dark:text-gray-400">{cp.distance}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {editable && onCheckpointChange ? (
                      <input
                        type="number"
                        step="10"
                        value={cp.elevation}
                        onChange={(e) => onCheckpointChange(index, 'elevation', parseInt(e.target.value) || 0)}
                        className="w-20 rounded border border-gray-300 dark:border-gray-600 px-2 py-1 text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    ) : (
                      <span className="text-sm text-gray-600 dark:text-gray-400">{cp.elevation}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {editable && onCheckpointChange ? (
                      <input
                        type="number"
                        step="10"
                        min="0"
                        value={cp.downhillDistance || 0}
                        onChange={(e) => onCheckpointChange(index, 'downhillDistance', parseInt(e.target.value) || 0)}
                        className="w-20 rounded border border-gray-300 dark:border-gray-600 px-2 py-1 text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    ) : (
                      <span className="text-sm text-gray-600 dark:text-gray-400">{cp.downhillDistance || 0}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {editable && onCheckpointChange ? (
                      <select
                        value={cp.terrainType || "山路"}
                        onChange={(e) => onCheckpointChange(index, 'terrainType', e.target.value)}
                        className="w-24 rounded border border-gray-300 dark:border-gray-600 px-2 py-1 text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="沙地">沙地</option>
                        <option value="机耕道">机耕道</option>
                        <option value="山路">山路</option>
                        <option value="石铺路">石铺路</option>
                        <option value="台阶">台阶</option>
                      </select>
                    ) : (
                      <span className="text-sm text-gray-600 dark:text-gray-400">{cp.terrainType || "未知"}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                    {(cp as any).slopePercent?.toFixed(2) || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                    {(cp as any).per100mElevation?.toFixed(2) || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                    {(cp as any).elevationFactor?.toFixed(2) || "-"}
                  </td>
                </>
              )}
              <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                {cp.sectionSupply ? (
                  <div className="space-y-1">
                    {cp.sectionSupply.gels > 0 && (
                      <div className="text-xs">
                        <span className="font-medium">{cp.sectionSupply.gels}份能量胶</span>
                        <span className="text-gray-500 dark:text-gray-400">（{cp.sectionSupply.gelCalories}Kcal）</span>
                      </div>
                    )}
                    {cp.sectionSupply.electrolytePowder > 0 && (
                      <div className="text-xs">
                        <span className="font-medium">{cp.sectionSupply.electrolytePowder.toFixed(2)}份电解质</span>
                        <span className="text-gray-500 dark:text-gray-400">
                          （{cp.sectionSupply.electrolytePowderCalories}Kcal， {cp.sectionSupply.electrolytePowderWater}ml， {cp.sectionSupply.electrolytePowderElectrolytes}mg）
                        </span>
                      </div>
                    )}
                    {!cp.sectionSupply.gels && !cp.sectionSupply.electrolytePowder && (
                      <span className="text-xs text-gray-400 dark:text-gray-500">暂无补给数据</span>
                    )}
                  </div>
                ) : (
                  <span className="text-xs text-gray-400 dark:text-gray-500">-</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
