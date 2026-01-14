import { NextRequest, NextResponse } from "next/server"
import { teamManager } from "@/storage/database"

// DELETE /api/teams/[id]/members/[userId] - 移除成员
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    const { id, userId } = await params
    const success = await teamManager.removeMember(id, userId)

    if (!success) {
      return NextResponse.json(
        { success: false, error: "移除成员失败" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, message: "成员已移除" })
  } catch (error) {
    console.error("移除成员失败:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "移除成员失败",
      },
      { status: 500 }
    )
  }
}
