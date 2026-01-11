import { NextRequest, NextResponse } from "next/server"
import { UserManager } from "@/storage/database/userManager"
import type { RegisterUser } from "@/storage/database/shared/schema"

const userManager = new UserManager()

export async function POST(request: NextRequest) {
  try {
    const body: RegisterUser = await request.json()

    // 验证输入数据
    const result = await userManager.register(body)

    // 返回用户信息和 token
    return NextResponse.json(
      {
        success: true,
        message: "注册成功",
        data: {
          user: result.user,
          token: result.token,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("注册错误:", error)

    if (error instanceof Error) {
      // 业务逻辑错误（如邮箱已存在）
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        { status: 400 }
      )
    }

    // 未知错误
    return NextResponse.json(
      {
        success: false,
        message: "注册失败，请稍后重试",
      },
      { status: 500 }
    )
  }
}
