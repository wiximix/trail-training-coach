export const dynamic = "force-dynamic"
import { NextRequest } from "next/server"
import { trailManager } from "@/storage/database"
import { logger } from "@/lib/logger"
import { errorResponse, loggedAsyncHandler, NotFoundError } from "@/lib/errorHandler"
import { parseIdParam, validateBody } from "@/lib/validation"
import { updateTrailSchema } from "@/storage/database/shared/schema"

// GET /api/trails/[id] - 获取单个赛道
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return loggedAsyncHandler("GET", `/api/trails/[id]`, async () => {
    const { id } = await params
    const validatedId = parseIdParam({ id })

    logger.dbOperation("SELECT", "trails", { id: validatedId })

    const trail = await trailManager.getTrailById(validatedId)
    if (!trail) {
      throw new NotFoundError("赛道")
    }
    return trail
  }).catch((error) => errorResponse(error))
}

// PUT /api/trails/[id] - 更新赛道
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return loggedAsyncHandler("PUT", `/api/trails/[id]`, async () => {
    const { id } = await params
    const validatedId = parseIdParam({ id })
    const body = await request.json()

    // 验证输入数据
    const validatedData = validateBody(updateTrailSchema, body)

    logger.dbOperation("UPDATE", "trails", { id: validatedId })

    const trail = await trailManager.updateTrail(validatedId, validatedData)
    if (!trail) {
      throw new NotFoundError("赛道")
    }
    return trail
  }).catch((error) => errorResponse(error))
}

// DELETE /api/trails/[id] - 删除赛道
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return loggedAsyncHandler("DELETE", `/api/trails/[id]`, async () => {
    const { id } = await params
    const validatedId = parseIdParam({ id })

    logger.dbOperation("DELETE", "trails", { id: validatedId })

    const success = await trailManager.deleteTrail(validatedId)
    if (!success) {
      throw new NotFoundError("赛道")
    }
    return { message: "删除成功" }
  }).catch((error) => errorResponse(error))
}
