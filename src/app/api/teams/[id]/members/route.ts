import { NextRequest, NextResponse } from "next/server"
import { TeamManager } from "@/storage/database"

const teamManager = new TeamManager()

// GET /api/teams/[id]/members - 获取跑团成员列表
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get("status") || undefined

    const members = await teamManager.getTeamMembers(params.id, { status })

    // 获取每个成员的用户信息
    const db = await import("@/storage/database/db").then((m) => m.getDb())
    const { users } = await import("@/storage/database/shared/schema")
    const { eq } = await import("drizzle-orm")

    const membersWithUser = await Promise.all(
      members.map(async (member) => {
        const [user] = await db.select().from(users).where(eq(users.id, member.userId))
        return {
          ...member,
          user: user || null,
        }
      })
    )

    return NextResponse.json({ success: true, data: membersWithUser })
  } catch (error) {
    console.error("获取跑团成员失败:", error)
    return NextResponse.json(
      { success: false, error: "获取跑团成员失败" },
      { status: 500 }
    )
  }
}

// POST /api/teams/[id]/members - 申请加入跑团
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

    const member = await teamManager.applyToTeam(params.id, userId)

    return NextResponse.json(
      { success: true, data: member, message: "申请已提交，请等待审核" },
      { status: 201 }
    )
  } catch (error) {
    console.error("申请加入跑团失败:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "申请加入跑团失败",
      },
      { status: 500 }
    )
  }
}
