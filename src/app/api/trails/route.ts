import { NextRequest } from "next/server"
import { trailManager } from "@/storage/database"
import { logger } from "@/lib/logger"
import { errorResponse, loggedAsyncHandler } from "@/lib/errorHandler"
import { parsePaginationParams, validateBody } from "@/lib/validation"
import { insertTrailSchema } from "@/storage/database/shared/schema"

// GET /api/trails - 获取赛道列表
export async function GET(request: NextRequest) {
  return loggedAsyncHandler("GET", "/api/trails", async () => {
    const pagination = parsePaginationParams(request.nextUrl.searchParams)

    logger.dbOperation("SELECT", "trails", { pagination })

    const trails = await trailManager.getTrails(pagination)
    return trails
  }).catch((error) => errorResponse(error))
}

// POST /api/trails - 创建赛道
export async function POST(request: NextRequest) {
  return loggedAsyncHandler("POST", "/api/trails", async () => {
    const body = await request.json()

    // 验证输入数据
    const validatedData = validateBody(insertTrailSchema, body)

    logger.dbOperation("INSERT", "trails", {
      name: validatedData.name,
      cpCount: validatedData.cpCount,
    })

    const trail = await trailManager.createTrail(validatedData)
    return trail
  }).catch((error) => errorResponse(error))
}
