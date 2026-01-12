import { NextRequest, NextResponse } from "next/server"
import { TeamManager } from "@/storage/database"

const teamManager = new TeamManager()

// GET /api/teams/[id] - 获取跑团详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const team = await teamManager.getTeamById(id)

    if (!team) {
      return NextResponse.json(
        { success: false, error: "跑团不存在" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: team })
  } catch (error) {
    console.error("获取跑团详情失败:", error)
    return NextResponse.json(
      { success: false, error: "获取跑团详情失败" },
      { status: 500 }
    )
  }
}

// PUT /api/teams/[id] - 更新跑团
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const team = await teamManager.updateTeam(id, body)

    if (!team) {
      return NextResponse.json(
        { success: false, error: "跑团不存在" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: team })
  } catch (error) {
    console.error("更新跑团失败:", error)
    return NextResponse.json(
      { success: false, error: "更新跑团失败" },
      { status: 500 }
    )
  }
}

// DELETE /api/teams/[id] - 删除跑团
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const success = await teamManager.deleteTeam(id)

    if (!success) {
      return NextResponse.json(
        { success: false, error: "跑团不存在" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, message: "跑团删除成功" })
  } catch (error) {
    console.error("删除跑团失败:", error)
    return NextResponse.json(
      { success: false, error: "删除跑团失败" },
      { status: 500 }
    )
  }
}
