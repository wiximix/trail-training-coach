export const dynamic = "force-dynamic"
import { NextRequest } from "next/server"
import { memberManager } from "@/storage/database"
import { logger } from "@/lib/logger"
import { errorResponse, loggedAsyncHandler, NotFoundError } from "@/lib/errorHandler"
import { parseIdParam, validateBody } from "@/lib/validation"
import { updateMemberSchema } from "@/storage/database/shared/schema"

// GET /api/members/[id] - 获取单个成员
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return loggedAsyncHandler("GET", `/api/members/[id]`, async () => {
    const { id } = await params
    const validatedId = parseIdParam({ id })

    logger.dbOperation("SELECT", "members", { id: validatedId })

    const member = await memberManager.getMemberById(validatedId)
    if (!member) {
      throw new NotFoundError("成员")
    }
    return member
  }).catch((error) => errorResponse(error))
}

// PUT /api/members/[id] - 更新成员
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return loggedAsyncHandler("PUT", `/api/members/[id]`, async () => {
    const { id } = await params
    const validatedId = parseIdParam({ id })
    const body = await request.json()

    // 验证输入数据
    const validatedData = validateBody(updateMemberSchema, body)

    logger.dbOperation("UPDATE", "members", { id: validatedId })

    const member = await memberManager.updateMember(validatedId, validatedData)
    if (!member) {
      throw new NotFoundError("成员")
    }
    return member
  }).catch((error) => errorResponse(error))
}

// DELETE /api/members/[id] - 删除成员
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return loggedAsyncHandler("DELETE", `/api/members/[id]`, async () => {
    const { id } = await params
    const validatedId = parseIdParam({ id })

    logger.dbOperation("DELETE", "members", { id: validatedId })

    const success = await memberManager.deleteMember(validatedId)
    if (!success) {
      throw new NotFoundError("成员")
    }
    return { message: "删除成功" }
  }).catch((error) => errorResponse(error))
}
