/**
 * 预测相关 API 服务
 */

import { post } from "./apiClient"
import type {
  ApiResponse,
  PredictionRequest,
  PredictionResult,
} from "@/types"

/**
 * 执行成绩预测
 */
export function predictPerformance(
  data: PredictionRequest
): Promise<ApiResponse<PredictionResult>> {
  return post<PredictionResult>("/api/predict", data)
}
