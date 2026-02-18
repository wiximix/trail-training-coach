export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from "next/server"
import { teamManager } from "@/storage/database"
import { logger } from "@/lib/logger"

// GET /api/teams/my - 获取我的跑团列表
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "缺少用户ID" },
        { status: 400 }
      )
    }

    const status = searchParams.get("status") || undefined
    const role = searchParams.get("role") || undefined

    const userTeams = await teamManager.getUserTeams(userId, {
      status,
      role,
    })

    return NextResponse.json({ success: true, data: userTeams })
  } catch (error) {
    logger.error("获取我的跑团失败", error)
    return NextResponse.json(
      { success: false, error: "获取我的跑团失败" },
      { status: 500 }
    )
  }
}
