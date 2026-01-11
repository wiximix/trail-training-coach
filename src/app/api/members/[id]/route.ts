import { NextRequest, NextResponse } from "next/server"
import { MemberManager } from "@/storage/database"

const memberManager = new MemberManager()

// GET /api/members/[id] - 获取单个成员
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const member = await memberManager.getMemberById(id)
    if (!member) {
      return NextResponse.json(
        { success: false, error: "成员不存在" },
        { status: 404 }
      )
    }
    return NextResponse.json({ success: true, data: member })
  } catch (error) {
    console.error("获取成员失败:", error)
    return NextResponse.json(
      { success: false, error: "获取成员失败" },
      { status: 500 }
    )
  }
}

// PUT /api/members/[id] - 更新成员
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const member = await memberManager.updateMember(id, body)
    if (!member) {
      return NextResponse.json(
        { success: false, error: "成员不存在" },
        { status: 404 }
      )
    }
    return NextResponse.json({ success: true, data: member })
  } catch (error) {
    console.error("更新成员失败:", error)
    return NextResponse.json(
      { success: false, error: "更新成员失败" },
      { status: 500 }
    )
  }
}

// DELETE /api/members/[id] - 删除成员
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const success = await memberManager.deleteMember(id)
    if (!success) {
      return NextResponse.json(
        { success: false, error: "成员不存在" },
        { status: 404 }
      )
    }
    return NextResponse.json({ success: true, message: "删除成功" })
  } catch (error) {
    console.error("删除成员失败:", error)
    return NextResponse.json(
      { success: false, error: "删除成员失败" },
      { status: 500 }
    )
  }
}
