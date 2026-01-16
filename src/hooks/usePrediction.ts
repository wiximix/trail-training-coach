/**
 * 预测相关的自定义 Hooks
 */

import { useState, useCallback } from "react"
import { predictPerformance } from "@/services"
import type { PredictionRequest, PredictionResult } from "@/types"

export function usePrediction() {
  const [result, setResult] = useState<PredictionResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const predict = useCallback(async (data: PredictionRequest) => {
    setLoading(true)
    setError(null)
    try {
      const response = await predictPerformance(data)
      if (response.success && response.data) {
        setResult(response.data)
        return response.data
      } else {
        throw new Error(response.error || "预测失败")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "预测失败")
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const reset = useCallback(() => {
    setResult(null)
    setError(null)
  }, [])

  return {
    result,
    loading,
    error,
    predict,
    reset,
  }
}
