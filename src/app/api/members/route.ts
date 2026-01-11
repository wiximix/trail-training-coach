import { NextRequest, NextResponse } from "next/server"
import { MemberManager } from "@/storage/database"

const memberManager = new MemberManager()

// GET /api/members - 获取成员列表
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const skip = Number(searchParams.get("skip")) || 0
    const limit = Number(searchParams.get("limit")) || 100

    const members = await memberManager.getMembers({ skip, limit })
    return NextResponse.json({ success: true, data: members })
  } catch (error) {
    console.error("获取成员列表失败:", error)
    return NextResponse.json(
      { success: false, error: "获取成员列表失败" },
      { status: 500 }
    )
  }
}

// POST /api/members - 创建成员
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const member = await memberManager.createMember(body)
    return NextResponse.json({ success: true, data: member }, { status: 201 })
  } catch (error) {
    console.error("创建成员失败:", error)
    return NextResponse.json(
      { success: false, error: "创建成员失败" },
      { status: 500 }
    )
  }
}
