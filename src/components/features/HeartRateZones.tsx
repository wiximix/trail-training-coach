/**
 * 储备心率区间显示组件
 */

import { calculateHRRZones } from "@/lib/heartRate"

interface HeartRateZonesProps {
  restingHeartRate: number
  maxHeartRate: number
  colSpan?: number
}

export function HeartRateZones({
  restingHeartRate,
  maxHeartRate,
  colSpan,
}: HeartRateZonesProps) {
  const hrrZones = calculateHRRZones(restingHeartRate, maxHeartRate)

  return (
    <tr>
      <td colSpan={colSpan}>
        <div className="bg-gray-50 p-4">
          <h4 className="mb-3 font-semibold text-gray-900">
            储备心率区间 (HRR)
          </h4>
          <div className="grid gap-2 md:grid-cols-5">
            {Object.values(hrrZones).map((zone) => (
              <div
                key={zone.name}
                className={`rounded p-2 text-xs ${zone.color}`}
              >
                <div className="font-medium">{zone.name}</div>
                <div className="mt-1">
                  {zone.min} - {zone.max} bpm
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 text-xs text-gray-600">
            静息心率: {restingHeartRate} bpm | 最大心率: {maxHeartRate} bpm
          </div>
        </div>
      </td>
    </tr>
  )
}
