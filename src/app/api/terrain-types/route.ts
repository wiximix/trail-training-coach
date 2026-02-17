import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/storage/database"
import { terrainTypes, insertTerrainTypeSchema } from "@/storage/database/shared/schema"
import { eq } from "drizzle-orm"
import { logger } from "@/lib/logger"

// GET /api/terrain-types - 获取所有地形类型
export async function GET(request: NextRequest) {
  try {
    const db = await getDb()

    const searchParams = request.nextUrl.searchParams
    const includeInactive = searchParams.get("includeInactive") === "true"

    const query = db
      .select()
      .from(terrainTypes)

    if (!includeInactive) {
      query.where(eq(terrainTypes.isActive, true))
    }

    const results = await query.orderBy(terrainTypes.sortOrder)

    return NextResponse.json({
      success: true,
      data: results,
    })
  } catch (error) {
    logger.error("获取地形类型失败", error)
    return NextResponse.json(
      {
        success: false,
        error: "获取地形类型失败",
      },
      { status: 500 }
    )
  }
}

// POST /api/terrain-types - 创建新的地形类型
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // 验证请求数据
    const validatedData = insertTerrainTypeSchema.parse(body)

    const db = await getDb()

    const [newTerrainType] = await db
      .insert(terrainTypes)
      .values(validatedData)
      .returning()

    return NextResponse.json({
      success: true,
      data: newTerrainType,
    })
  } catch (error: any) {
    logger.error("创建地形类型失败", error)
    if (error.name === "ZodError") {
      return NextResponse.json(
        {
          success: false,
          error: "请求数据格式错误",
          details: error.errors,
        },
        { status: 400 }
      )
    }
    return NextResponse.json(
      {
        success: false,
        error: "创建地形类型失败",
      },
      { status: 500 }
    )
  }
}
