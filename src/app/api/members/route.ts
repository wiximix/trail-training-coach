import { NextRequest } from "next/server"
import { memberManager } from "@/storage/database"
import { logger } from "@/lib/logger"
import { errorResponse, loggedAsyncHandler, successResponse } from "@/lib/errorHandler"
import { parsePaginationParams, validateBody } from "@/lib/validation"
import { insertMemberSchema } from "@/storage/database/shared/schema"

export const dynamic = 'force-dynamic'

// GET /api/members - 获取成员列表
export async function GET(request: NextRequest) {
  return loggedAsyncHandler("GET", "/api/members", async () => {
    const pagination = parsePaginationParams(request.nextUrl.searchParams)

    logger.dbOperation("SELECT", "members", { pagination })

    const members = await memberManager.getMembers(pagination)
    return members
  }).catch((error) => errorResponse(error))
}

// POST /api/members - 创建成员
export async function POST(request: NextRequest) {
  return loggedAsyncHandler("POST", "/api/members", async () => {
    const body = await request.json()

    // 验证输入数据
    const validatedData = validateBody(insertMemberSchema, body)

    logger.dbOperation("INSERT", "members", {
      name: validatedData.name,
    })

    const member = await memberManager.createMember(validatedData)
    return member
  }).catch((error) => errorResponse(error))
}
