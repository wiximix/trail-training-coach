import { NextRequest } from "next/server"
import { userManager } from "@/storage/database"
import { logger } from "@/lib/logger"
import { errorResponse, loggedAsyncHandler } from "@/lib/errorHandler"
import { validateBody } from "@/lib/validation"
import { registerUserSchema } from "@/storage/database/shared/schema"

export async function POST(request: NextRequest) {
  return loggedAsyncHandler("POST", "/api/auth/register", async () => {
    const body = await request.json()

    // 验证输入数据
    const validatedData = validateBody(registerUserSchema, body)

    logger.auth("register_attempt", undefined, {
      username: validatedData.username,
      email: validatedData.email,
    })

    // 验证输入数据并注册
    const result = await userManager.register(validatedData)

    logger.auth("register_success", result.user.id)

    // 返回用户信息和 token
    return {
      user: result.user,
      token: result.token,
    }
  }).catch((error) => errorResponse(error))
}
