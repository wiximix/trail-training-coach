import { NextRequest, NextResponse } from "next/server"
import { ReviewManager } from "@/storage/database"

const reviewManager = new ReviewManager()

// GET /api/reviews/[id] - 获取单个复盘记录
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const review = await reviewManager.getReviewById(id)
    if (!review) {
      return NextResponse.json(
        { success: false, error: "复盘记录不存在" },
        { status: 404 }
      )
    }
    return NextResponse.json({ success: true, data: review })
  } catch (error) {
    console.error("获取复盘记录失败:", error)
    return NextResponse.json(
      { success: false, error: "获取复盘记录失败" },
      { status: 500 }
    )
  }
}

// PUT /api/reviews/[id] - 更新复盘记录
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const review = await reviewManager.updateReview(id, body)
    if (!review) {
      return NextResponse.json(
        { success: false, error: "复盘记录不存在" },
        { status: 404 }
      )
    }
    return NextResponse.json({ success: true, data: review })
  } catch (error) {
    console.error("更新复盘记录失败:", error)
    return NextResponse.json(
      { success: false, error: "更新复盘记录失败" },
      { status: 500 }
    )
  }
}

// DELETE /api/reviews/[id] - 删除复盘记录
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const success = await reviewManager.deleteReview(id)
    if (!success) {
      return NextResponse.json(
        { success: false, error: "复盘记录不存在" },
        { status: 404 }
      )
    }
    return NextResponse.json({ success: true, message: "删除成功" })
  } catch (error) {
    console.error("删除复盘记录失败:", error)
    return NextResponse.json(
      { success: false, error: "删除复盘记录失败" },
      { status: 500 }
    )
  }
}
