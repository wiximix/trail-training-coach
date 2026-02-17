import { NextRequest, NextResponse } from "next/server"
import { userManager } from "@/storage/database"
import { jwtVerify } from "jose"
import { eq } from "drizzle-orm"
import { getDb } from "@/storage/database/db"
import { users } from "@/storage/database/shared/schema"
import { logger } from "@/lib/logger"

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key-change-this-in-production"
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, password } = body

    if (!token || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "缺少必要参数",
        },
        { status: 400 }
      )
    }

    // 验证 token
    const { payload } = await jwtVerify(token, JWT_SECRET)

    if (payload.type !== "reset") {
      return NextResponse.json(
        {
          success: false,
          message: "无效的令牌",
        },
        { status: 400 }
      )
    }

    const userId = payload.userId as string

    // 获取数据库连接
    const db = await getDb()

    // 加密新密码
    const bcrypt = await import("bcryptjs")
    const passwordHash = await bcrypt.hash(password, 10)

    // 更新用户密码
    await db
      .update(users)
      .set({
        passwordHash,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))

    return NextResponse.json({
      success: true,
      message: "密码重置成功，请使用新密码登录",
    })
  } catch (error) {
    logger.error("重置密码错误", error)

    if (error instanceof Error && error.name === "JWTExpired") {
      return NextResponse.json(
        {
          success: false,
          message: "重置链接已过期，请重新申请",
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        message: "重置密码失败，请稍后重试",
      },
      { status: 500 }
    )
  }
}
