import { NextRequest, NextResponse } from "next/server"
import { teamManager } from "@/storage/database"

// POST /api/teams/[id]/approve - 审批申请（通过）
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

    const member = await teamManager.approveApplication(id, userId)

    if (!member) {
      return NextResponse.json(
        { success: false, error: "申请不存在或已处理" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: member, message: "申请已通过" })
  } catch (error) {
    console.error("审批申请失败:", error)
    return NextResponse.json(
      { success: false, error: "审批申请失败" },
      { status: 500 }
    )
  }
}
