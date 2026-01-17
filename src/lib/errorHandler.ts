/**
 * 统一的错误处理类和函数
 * 提供标准化的错误类型和处理逻辑
 */

import { logger } from "./logger"
import { NextResponse } from "next/server"

/**
 * 应用错误类型
 * 继承自 Error 类，包含状态码和错误代码
 */
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string,
    public details?: any
  ) {
    super(message)
    this.name = "AppError"

    // 保持正确的原型链
    Object.setPrototypeOf(this, AppError.prototype)

    // 记录错误日志
    logger.error("AppError created", {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      code: this.code,
      details: this.details,
    })
  }
}

/**
 * 认证错误
 */
export class AuthError extends AppError {
  constructor(message: string = "认证失败", code?: string) {
    super(message, 401, code)
    this.name = "AuthError"
  }
}

/**
 * 授权错误
 */
export class AuthorizationError extends AppError {
  constructor(message: string = "权限不足", code?: string) {
    super(message, 403, code)
    this.name = "AuthorizationError"
  }
}

/**
 * 资源未找到错误
 */
export class NotFoundError extends AppError {
  constructor(resource: string = "资源") {
    super(`${resource}不存在`, 404, "NOT_FOUND")
    this.name = "NotFoundError"
  }
}

/**
 * 验证错误
 */
export class ValidationError extends AppError {
  constructor(message: string = "输入验证失败", details?: any) {
    super(message, 400, "VALIDATION_ERROR", details)
    this.name = "ValidationError"
  }
}

/**
 * 业务逻辑错误
 */
export class BusinessError extends AppError {
  constructor(message: string, code?: string) {
    super(message, 400, code || "BUSINESS_ERROR")
    this.name = "BusinessError"
  }
}

/**
 * 数据库错误
 */
export class DatabaseError extends AppError {
  constructor(message: string = "数据库操作失败", details?: any) {
    super(message, 500, "DATABASE_ERROR", details)
    this.name = "DatabaseError"
  }
}

/**
 * 处理 API 错误
 * 将各种错误类型转换为统一的错误响应格式
 *
 * @param error 错误对象
 * @returns 标准化的错误信息对象
 */
export function handleApiError(
  error: unknown
): { message: string; statusCode: number; code?: string } {
  // 应用错误
  if (error instanceof AppError) {
    return {
      message: error.message,
      statusCode: error.statusCode,
      code: error.code,
    }
  }

  // Zod 验证错误
  if (error && typeof error === "object" && "issues" in error) {
    logger.error("Zod 验证错误", error)
    return {
      message: "输入数据格式错误",
      statusCode: 400,
      code: "VALIDATION_ERROR",
    }
  }

  // 标准 Error
  if (error instanceof Error) {
    logger.error("未处理的错误", error)
    // 生产环境不暴露详细错误信息
    if (process.env.NODE_ENV === "production") {
      return {
        message: "服务器内部错误",
        statusCode: 500,
      }
    }
    return {
      message: error.message,
      statusCode: 500,
    }
  }

  // 未知错误
  logger.error("未知类型错误", error)
  return {
    message: "服务器内部错误",
    statusCode: 500,
  }
}

/**
 * 创建成功响应
 * @param data 响应数据
 * @param status HTTP 状态码（默认 200）
 * @returns NextResponse 对象
 */
export function successResponse<T>(
  data: T,
  status: number = 200
): NextResponse<{ success: true; data: T }> {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status }
  )
}

/**
 * 创建错误响应
 * @param error 错误对象或错误消息
 * @param status HTTP 状态码（可选，如果传入 AppError 则使用其状态码）
 * @returns NextResponse 对象
 */
export function errorResponse(
  error: unknown,
  status?: number
): NextResponse<{ success: false; error: string; code?: string }> {
  const { message, statusCode, code } = handleApiError(error)

  logger.error("API Error Response", {
    message,
    statusCode,
    code,
  })

  return NextResponse.json(
    {
      success: false,
      error: message,
      code,
    },
    { status: status || statusCode }
  )
}

/**
 * 异步请求包装器
 * 统一处理异步请求的错误和响应
 *
 * @param handler 异步处理函数
 * @returns NextResponse
 */
export function asyncHandler<T>(
  handler: () => Promise<T>
): Promise<NextResponse<{ success: true; data: T } | { success: false; error: string; code?: string }>> {
  return handler()
    .then((data) => successResponse(data))
    .catch((error) => errorResponse(error))
}

/**
 * 带日志的异步请求包装器
 * 在执行前后记录日志
 *
 * @param method HTTP 方法
 * @param path 请求路径
 * @param handler 异步处理函数
 * @returns NextResponse
 */
export async function loggedAsyncHandler<T>(
  method: string,
  path: string,
  handler: () => Promise<T>
): Promise<NextResponse> {
  const startTime = Date.now()
  const userId = getUserIdFromContext()

  logger.apiRequest(method, path, userId)

  try {
    const data = await handler()
    const duration = Date.now() - startTime

    logger.apiResponse(method, path, 200, duration)

    return successResponse(data)
  } catch (error) {
    const duration = Date.now() - startTime
    const { message, statusCode } = handleApiError(error)

    logger.apiResponse(method, path, statusCode, duration, { error: message })

    return errorResponse(error)
  }
}

/**
 * 从上下文中获取用户 ID
 * 这个函数需要根据实际的认证方式实现
 */
function getUserIdFromContext(): string | undefined {
  // TODO: 从请求上下文中获取用户 ID
  // 当前实现从 headers 中读取
  return undefined
}
