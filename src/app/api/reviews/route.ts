import { NextRequest, NextResponse } from "next/server"
import { ReviewManager } from "@/storage/database"

const reviewManager = new ReviewManager()

// GET /api/reviews - 获取复盘列表
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const skip = Number(searchParams.get("skip")) || 0
    const limit = Number(searchParams.get("limit")) || 100
    const memberId = searchParams.get("memberId")
    const trailId = searchParams.get("trailId")

    let reviews
    if (memberId) {
      reviews = await reviewManager.getReviewsByMemberId(memberId)
    } else if (trailId) {
      reviews = await reviewManager.getReviewsByTrailId(trailId)
    } else {
      reviews = await reviewManager.getReviews({ skip, limit })
    }

    return NextResponse.json({ success: true, data: reviews })
  } catch (error) {
    console.error("获取复盘列表失败:", error)
    return NextResponse.json(
      { success: false, error: "获取复盘列表失败" },
      { status: 500 }
    )
  }
}

// POST /api/reviews - 创建复盘记录
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const review = await reviewManager.createReview(body)
    return NextResponse.json({ success: true, data: review }, { status: 201 })
  } catch (error) {
    console.error("创建复盘记录失败:", error)
    return NextResponse.json(
      { success: false, error: "创建复盘记录失败" },
      { status: 500 }
    )
  }
}
