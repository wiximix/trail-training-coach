import { NextRequest, NextResponse } from "next/server"
import { userManager } from "@/storage/database/userManager"
import type { LoginUser } from "@/storage/database/shared/schema"

export async function POST(request: NextRequest) {
  try {
    const body: LoginUser = await request.json()

    // 验证输入数据并登录
    const result = await userManager.login(body)

    // 返回用户信息和 token
    return NextResponse.json(
      {
        success: true,
        message: "登录成功",
        data: {
          user: result.user,
          token: result.token,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("登录错误:", error)

    if (error instanceof Error) {
      // 业务逻辑错误（如邮箱或密码错误）
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        { status: 401 }
      )
    }

    // 未知错误
    return NextResponse.json(
      {
        success: false,
        message: "登录失败，请稍后重试",
      },
      { status: 500 }
    )
  }
}
