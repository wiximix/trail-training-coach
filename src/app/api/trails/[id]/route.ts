import { NextRequest, NextResponse } from "next/server"
import { trailManager } from "@/storage/database"

// GET /api/trails/[id] - 获取单个赛道
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const trail = await trailManager.getTrailById(id)
    if (!trail) {
      return NextResponse.json(
        { success: false, error: "赛道不存在" },
        { status: 404 }
      )
    }
    return NextResponse.json({ success: true, data: trail })
  } catch (error) {
    console.error("获取赛道失败:", error)
    return NextResponse.json(
      { success: false, error: "获取赛道失败" },
      { status: 500 }
    )
  }
}

// PUT /api/trails/[id] - 更新赛道
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    console.log("更新赛道，ID:", id, "数据:", JSON.stringify(body, null, 2))
    const trail = await trailManager.updateTrail(id, body)
    if (!trail) {
      return NextResponse.json(
        { success: false, error: "赛道不存在" },
        { status: 404 }
      )
    }
    return NextResponse.json({ success: true, data: trail })
  } catch (error) {
    console.error("更新赛道失败:", error)
    // 提取更详细的错误信息
    const errorMessage = error instanceof Error ? error.message : "更新赛道失败"
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    )
  }
}

// DELETE /api/trails/[id] - 删除赛道
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const success = await trailManager.deleteTrail(id)
    if (!success) {
      return NextResponse.json(
        { success: false, error: "赛道不存在" },
        { status: 404 }
      )
    }
    return NextResponse.json({ success: true, message: "删除成功" })
  } catch (error) {
    console.error("删除赛道失败:", error)
    return NextResponse.json(
      { success: false, error: "删除赛道失败" },
      { status: 500 }
    )
  }
}
