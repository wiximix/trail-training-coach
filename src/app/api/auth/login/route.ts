import { NextRequest } from "next/server"
import { userManager } from "@/storage/database"
import { logger } from "@/lib/logger"
import { errorResponse, loggedAsyncHandler } from "@/lib/errorHandler"
import { validateBody } from "@/lib/validation"
import { loginUserSchema } from "@/storage/database/shared/schema"

export async function POST(request: NextRequest) {
  return loggedAsyncHandler("POST", "/api/auth/login", async () => {
    const body = await request.json()

    // 验证输入数据
    const validatedData = validateBody(loginUserSchema, body)

    logger.auth("login_attempt", undefined, { email: validatedData.email })

    // 验证输入数据并登录
    const result = await userManager.login(validatedData)

    logger.auth("login_success", result.user.id)

    // 返回用户信息和 token
    return {
      user: result.user,
      token: result.token,
    }
  }).catch((error) => errorResponse(error))
}
