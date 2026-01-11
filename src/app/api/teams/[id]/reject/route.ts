import { NextRequest, NextResponse } from "next/server"
import { TeamManager } from "@/storage/database"

const teamManager = new TeamManager()

// POST /api/teams/[id]/reject - 拒绝申请
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "缺少用户ID" },
        { status: 400 }
      )
    }

    const member = await teamManager.rejectApplication(params.id, userId)

    if (!member) {
      return NextResponse.json(
        { success: false, error: "申请不存在或已处理" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: member, message: "申请已拒绝" })
  } catch (error) {
    console.error("拒绝申请失败:", error)
    return NextResponse.json(
      { success: false, error: "拒绝申请失败" },
      { status: 500 }
    )
  }
}
