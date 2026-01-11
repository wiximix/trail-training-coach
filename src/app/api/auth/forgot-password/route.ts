import { NextRequest, NextResponse } from "next/server"
import { userManager } from "@/storage/database/userManager"
import { SignJWT } from "jose"

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key-change-this-in-production"
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          message: "请提供邮箱地址",
        },
        { status: 400 }
      )
    }

    // 检查用户是否存在
    const user = await userManager.getUserByEmail(email)
    if (!user) {
      // 为了安全，即使用户不存在也返回成功消息
      return NextResponse.json({
        success: true,
        message: "如果该邮箱已注册，您将收到密码重置邮件",
      })
    }

    // 生成重置密码 token（有效期 30 分钟）
    const resetToken = await new SignJWT({ userId: user.id, type: "reset" })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("30m")
      .sign(JWT_SECRET)

    // 在实际应用中，这里应该发送邮件
    // 由于这是演示环境，我们返回重置链接
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:5000"}/auth/reset-password?token=${resetToken}`

    // 返回重置链接（仅用于演示）
    return NextResponse.json({
      success: true,
      message: "密码重置链接已生成（演示模式，实际应用中应通过邮件发送）",
      data: {
        email: email,
        resetLink: resetLink,
      },
    })
  } catch (error) {
    console.error("忘记密码错误:", error)
    return NextResponse.json(
      {
        success: false,
        message: "处理请求失败，请稍后重试",
      },
      { status: 500 }
    )
  }
}
