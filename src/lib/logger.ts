/**
 * 统一的日志处理类
 * 提供标准化的日志输出格式，便于日志收集和分析
 */

enum LogLevel {
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
  DEBUG = "DEBUG",
}

/**
 * 日志级别优先级
 */
const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  [LogLevel.DEBUG]: 0,
  [LogLevel.INFO]: 1,
  [LogLevel.WARN]: 2,
  [LogLevel.ERROR]: 3,
}

/**
 * 根据环境变量获取当前日志级别
 */
function getCurrentLogLevel(): LogLevel {
  const env = process.env.NODE_ENV || "development"
  const logLevel = process.env.LOG_LEVEL

  if (logLevel && logLevel in LOG_LEVEL_PRIORITY) {
    return logLevel as LogLevel
  }

  // 默认配置
  if (env === "production") {
    return LogLevel.INFO
  }
  if (env === "test") {
    return LogLevel.WARN
  }
  return LogLevel.DEBUG
}

/**
 * Logger 类
 * 提供统一的日志输出接口
 */
class Logger {
  private currentLogLevel: LogLevel

  constructor() {
    this.currentLogLevel = getCurrentLogLevel()
  }

  /**
   * 检查是否应该输出指定级别的日志
   */
  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[this.currentLogLevel]
  }
  /**
   * 格式化日志消息
   * @param level 日志级别
   * @param message 日志消息
   * @param meta 附加元数据
   * @returns 格式化后的日志字符串
   */
  private format(level: LogLevel, message: string, meta?: any): string {
    const timestamp = new Date().toISOString()
    const metaStr = meta ? ` | ${JSON.stringify(meta)}` : ""
    return `[${timestamp}] [${level}] ${message}${metaStr}`
  }

  /**
   * 输出 INFO 级别日志
   * @param message 日志消息
   * @param meta 附加元数据
   */
  info(message: string, meta?: any): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.log(this.format(LogLevel.INFO, message, meta))
    }
  }

  /**
   * 输出 WARN 级别日志
   * @param message 日志消息
   * @param meta 附加元数据
   */
  warn(message: string, meta?: any): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(this.format(LogLevel.WARN, message, meta))
    }
  }

  /**
   * 输出 ERROR 级别日志
   * @param message 日志消息
   * @param error 错误对象或附加元数据
   */
  error(message: string, error?: Error | any): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(this.format(LogLevel.ERROR, message, error))
    }
  }

  /**
   * 输出 DEBUG 级别日志
   * @param message 日志消息
   * @param meta 附加元数据
   */
  debug(message: string, meta?: any): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.log(this.format(LogLevel.DEBUG, message, meta))
    }
  }

  /**
   * 记录 API 请求日志
   * @param method HTTP 方法
   * @param path 请求路径
   * @param userId 用户 ID（可选）
   * @param meta 附加元数据
   */
  apiRequest(method: string, path: string, userId?: string, meta?: any): void {
    this.info(`${method} ${path}`, { userId, ...meta })
  }

  /**
   * 记录 API 响应日志
   * @param method HTTP 方法
   * @param path 请求路径
   * @param status 响应状态码
   * @param duration 请求耗时（毫秒）
   * @param meta 附加元数据
   */
  apiResponse(
    method: string,
    path: string,
    status: number,
    duration: number,
    meta?: any
  ): void {
    const message = `${method} ${path} - ${status} (${duration}ms)`
    if (status >= 500) {
      this.error(message, meta)
    } else {
      this.info(message, meta)
    }
  }

  /**
   * 记录数据库操作日志
   * @param operation 操作类型（SELECT, INSERT, UPDATE, DELETE）
   * @param table 表名
   * @param meta 附加元数据
   */
  dbOperation(operation: string, table: string, meta?: any): void {
    this.debug(`DB ${operation} ${table}`, meta)
  }

  /**
   * 记录认证相关日志
   * @param action 动作（login, logout, register, verify）
   * @param userId 用户 ID（可选）
   * @param meta 附加元数据
   */
  auth(action: string, userId?: string, meta?: any): void {
    this.info(`AUTH: ${action}`, { userId, ...meta })
  }

  /**
   * 记录业务错误
   * @param context 错误上下文
   * @param error 错误对象
   */
  businessError(context: string, error: Error): void {
    this.error(`Business Error: ${context}`, {
      name: error.name,
      message: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    })
  }
}

// 导出单例实例
export const logger = new Logger()
