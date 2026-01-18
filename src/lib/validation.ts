/**
 * 统一的输入验证工具
 * 提供 API 输入验证的通用 schema 和函数
 */

import { z } from "zod"

/**
 * 分页参数验证 schema
 */
export const paginationSchema = z.object({
  skip: z
    .string()
    .optional()
    .default("0")
    .transform((val) => parseInt(val, 10))
    .pipe(
      z
        .number()
        .int("skip 必须是整数")
        .min(0, "skip 不能为负数")
    ),
  limit: z
    .string()
    .optional()
    .default("100")
    .transform((val) => parseInt(val, 10))
    .pipe(
      z
        .number()
        .int("limit 必须是整数")
        .min(1, "limit 至少为 1")
        .max(1000, "limit 不能超过 1000")
    ),
})

/**
 * 分页参数类型
 */
export type PaginationParams = z.infer<typeof paginationSchema>

/**
 * ID 参数验证 schema
 */
export const idParamSchema = z.object({
  id: z.string().uuid("无效的 ID 格式"),
})

/**
 * 从请求 URL 中提取并验证分页参数
 * @param searchParams URLSearchParams
 * @returns 验证后的分页参数
 */
export function parsePaginationParams(searchParams: URLSearchParams) {
  const params = {
    skip: searchParams.get("skip") || undefined,
    limit: searchParams.get("limit") || undefined,
  }

  return paginationSchema.parse(params)
}

/**
 * 从请求 URL 中提取并验证 ID 参数
 * @param params URL 参数对象
 * @returns 验证后的 ID
 */
export function parseIdParam(params: { id: string }): string {
  return idParamSchema.parse(params).id
}

/**
 * 验证请求体
 * @param schema Zod schema
 * @param body 请求体
 * @returns 验证后的数据
 * @throws ValidationError 验证失败时抛出
 */
export function validateBody<T>(schema: z.ZodSchema<T>, body: unknown): T {
  try {
    return schema.parse(body)
  } catch (error) {
    if (error && typeof error === "object" && "issues" in error) {
      const issues = error.issues as z.ZodIssue[]
      const errorMessages = issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join("; ")

      throw new Error(errorMessages)
    }
    throw error
  }
}

/**
 * 验证查询参数
 * @param schema Zod schema
 * @param searchParams URLSearchParams
 * @returns 验证后的参数
 * @throws ValidationError 验证失败时抛出
 */
export function validateQueryParams<T>(
  schema: z.ZodSchema<T>,
  searchParams: URLSearchParams
): T {
  const params: Record<string, string | undefined> = {}

  // 将 URLSearchParams 转换为对象
  for (const [key, value] of searchParams.entries()) {
    params[key] = value
  }

  try {
    return schema.parse(params)
  } catch (error) {
    if (error && typeof error === "object" && "issues" in error) {
      const issues = error.issues as z.ZodIssue[]
      const errorMessages = issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join("; ")

      throw new Error(errorMessages)
    }
    throw error
  }
}

/**
 * 验证 UUID
 * @param id 待验证的 ID 字符串
 * @returns 验证通过返回 true
 */
export function isValidUUID(id: string): boolean {
  return idParamSchema.shape.id.safeParse(id).success
}

/**
 * 配速格式验证 (MMSS 格式，如 630 表示 6分30秒)
 */
export const paceSchema = z
  .string()
  .regex(/^\d{3,4}$/, "配速格式应为 MMSS（如 630 表示 6分30秒）")
  .refine(
    (val) => {
      const minutes = parseInt(val.slice(0, -2), 10)
      const seconds = parseInt(val.slice(-2), 10)
      return (
        minutes >= 0 &&
        minutes < 100 &&
        seconds >= 0 &&
        seconds < 60
      )
    },
    "配速范围应在 0000 - 9959 之间，秒数应小于 60"
  )

/**
 * CP 点验证 schema
 */
export const checkpointSchema = z.object({
  id: z.number().int().positive("CP点ID必须是正整数"),
  distance: z.number().positive("距离必须为正数"),
  elevation: z.number(),
  downhillDistance: z.number().default(0),
  terrainType: z.enum(["沙地", "机耕道", "山路", "石铺路", "台阶"], {
    message: "地形类型必须是：沙地、机耕道、山路、石铺路、台阶",
  }),
})

/**
 * 地形类型配置验证 schema
 */
export const terrainTypeConfigSchema = z.object({
  name: z
    .string()
    .min(1, "地形类型名称不能为空")
    .max(50, "地形类型名称不能超过50个字符"),
  paceFactor: z
    .string()
    .refine((val) => !isNaN(parseFloat(val)), "配速系数必须是数字")
    .refine((val) => parseFloat(val) > 0, "配速系数必须为正数")
    .transform((val) => parseFloat(val)),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "颜色格式应为 #RRGGBB"),
  icon: z.string().max(50, "图标标识不能超过50个字符").optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
})

/**
 * 跑团角色验证
 */
export const teamRoleSchema = z.enum(["owner", "admin", "member"], {
  message: "角色必须是：owner、admin 或 member",
})

/**
 * 预测参数验证
 */
export const predictionParamsSchema = z.object({
  memberId: z.string().uuid("无效的成员 ID"),
  trailId: z.string().uuid("无效的赛道 ID"),
  planPace: paceSchema.optional(),
  plannedPace: paceSchema.optional(),
  checkpointPaces: z.record(z.string(), z.string()).optional(),
  expectedSweatRate: z.string().optional(),
  customFlatBaselinePace: paceSchema.optional(),
  customElevationLossCoefficient: z
    .number()
    .min(0, "爬升损耗系数不能为负数")
    .max(2, "爬升损耗系数不能超过 2")
    .optional(),
  gelCarbs: z.number().optional(),
  saltElectrolytes: z.number().optional(),
  electrolytePowder: z.number().optional(),
  electrolytePowderCalories: z.number().optional(),
  electrolytePowderWater: z.number().optional(),
})
