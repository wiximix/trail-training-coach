import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/storage/database"
import { terrainTypes, updateTerrainTypeSchema } from "@/storage/database/shared/schema"
import { eq } from "drizzle-orm"

// PATCH /api/terrain-types/[id] - 更新地形类型
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    // 验证请求数据
    const validatedData = updateTerrainTypeSchema.parse(body)

    const db = await getDb()

    const [updatedTerrainType] = await db
      .update(terrainTypes)
      .set({
        ...validatedData,
        updatedAt: new Date(),
      })
      .where(eq(terrainTypes.id, id))
      .returning()

    if (!updatedTerrainType) {
      return NextResponse.json(
        {
          success: false,
          error: "地形类型不存在",
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: updatedTerrainType,
    })
  } catch (error: any) {
    console.error("更新地形类型失败:", error)
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
        error: "更新地形类型失败",
      },
      { status: 500 }
    )
  }
}

// DELETE /api/terrain-types/[id] - 删除地形类型
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const db = await getDb()

    const [deletedTerrainType] = await db
      .delete(terrainTypes)
      .where(eq(terrainTypes.id, id))
      .returning()

    if (!deletedTerrainType) {
      return NextResponse.json(
        {
          success: false,
          error: "地形类型不存在",
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: deletedTerrainType,
    })
  } catch (error) {
    console.error("删除地形类型失败:", error)
    return NextResponse.json(
      {
        success: false,
        error: "删除地形类型失败",
      },
      { status: 500 }
    )
  }
}
