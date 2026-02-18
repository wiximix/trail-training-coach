export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from "next/server"
import { teamManager } from "@/storage/database"
import { logger } from "@/lib/logger"

// POST /api/teams/[id]/leave - 退出跑团
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "缺少用户ID" },
        { status: 400 }
      )
    }

    const success = await teamManager.leaveTeam(id, userId)

    if (!success) {
      return NextResponse.json(
        { success: false, error: "退出失败，你可能不是该跑团成员" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, message: "已退出跑团" })
  } catch (error) {
    logger.error("退出跑团失败", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "退出跑团失败",
      },
      { status: 500 }
    )
  }
}
