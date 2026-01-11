import { NextRequest, NextResponse } from "next/server"
import { TeamManager } from "@/storage/database"

const teamManager = new TeamManager()

// GET /api/teams - 获取跑团列表
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const skip = Number(searchParams.get("skip")) || 0
    const limit = Number(searchParams.get("limit")) || 100

    const teams = await teamManager.getTeams({ skip, limit })
    return NextResponse.json({ success: true, data: teams })
  } catch (error) {
    console.error("获取跑团列表失败:", error)
    return NextResponse.json(
      { success: false, error: "获取跑团列表失败" },
      { status: 500 }
    )
  }
}

// POST /api/teams - 创建跑团
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { ownerId } = body

    if (!ownerId) {
      return NextResponse.json(
        { success: false, error: "缺少创建者ID" },
        { status: 400 }
      )
    }

    const team = await teamManager.createTeam(body)
    return NextResponse.json({ success: true, data: team }, { status: 201 })
  } catch (error) {
    console.error("创建跑团失败:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "创建跑团失败",
      },
      { status: 500 }
    )
  }
}
