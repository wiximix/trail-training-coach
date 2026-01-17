import { NextRequest } from "next/server"
import { teamManager } from "@/storage/database"
import { logger } from "@/lib/logger"
import { errorResponse, loggedAsyncHandler } from "@/lib/errorHandler"
import { parsePaginationParams } from "@/lib/validation"
import { z } from "zod"

// 创建跑团的验证 schema
const createTeamSchema = z.object({
  name: z.string().min(1, "跑团名称不能为空").max(100, "跑团名称不能超过100个字符"),
  description: z.string().max(500, "跑团描述不能超过500个字符").optional(),
  ownerId: z.string().uuid("无效的创建者ID"),
  isPublic: z.boolean().default(false),
})

// GET /api/teams - 获取跑团列表
export async function GET(request: NextRequest) {
  return loggedAsyncHandler("GET", "/api/teams", async () => {
    const pagination = parsePaginationParams(request.nextUrl.searchParams)

    logger.dbOperation("SELECT", "teams", { pagination })

    const teams = await teamManager.getTeams(pagination)
    return teams
  }).catch((error) => errorResponse(error))
}

// POST /api/teams - 创建跑团
export async function POST(request: NextRequest) {
  return loggedAsyncHandler("POST", "/api/teams", async () => {
    const body = await request.json()

    // 验证输入数据
    const validatedData = createTeamSchema.parse(body)

    logger.dbOperation("INSERT", "teams", {
      name: validatedData.name,
      ownerId: validatedData.ownerId,
    })

    const team = await teamManager.createTeam(validatedData)
    return team
  }).catch((error) => errorResponse(error))
}
