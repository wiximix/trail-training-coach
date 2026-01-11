import { NextRequest, NextResponse } from "next/server"
import { trailManager } from "@/storage/database"

// GET /api/trails - 获取赛道列表
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const skip = Number(searchParams.get("skip")) || 0
    const limit = Number(searchParams.get("limit")) || 100

    const trails = await trailManager.getTrails({ skip, limit })
    return NextResponse.json({ success: true, data: trails })
  } catch (error) {
    console.error("获取赛道列表失败:", error)
    return NextResponse.json(
      { success: false, error: "获取赛道列表失败" },
      { status: 500 }
    )
  }
}

// POST /api/trails - 创建赛道
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const trail = await trailManager.createTrail(body)
    return NextResponse.json({ success: true, data: trail }, { status: 201 })
  } catch (error) {
    console.error("创建赛道失败:", error)
    return NextResponse.json(
      { success: false, error: "创建赛道失败" },
      { status: 500 }
    )
  }
}
