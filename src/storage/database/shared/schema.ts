import { pgTable, varchar, integer, text, timestamp, jsonb, boolean } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"
import { createSchemaFactory } from "drizzle-zod"
import { z } from "zod"

// 用户表
export const users = pgTable(
  "users",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    username: varchar("username", { length: 50 }).notNull().unique(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    passwordHash: varchar("password_hash", { length: 255 }).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  }
)

// 成员表
export const members = pgTable(
  "members",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    // 基础数据
    name: varchar("name", { length: 100 }).notNull(),
    height: integer("height"), // 身高（cm）
    weight: integer("weight"), // 体重（kg）
    gender: varchar("gender", { length: 10 }), // 性别
    // 跑力数据
    restingHeartRate: integer("resting_heart_rate"), // 静息心率
    maxHeartRate: integer("max_heart_rate"), // 最大心率
    lactateThresholdHeartRate: integer("lactate_threshold_heart_rate"), // 乳酸阈值心率
    lactateThresholdPace: varchar("lactate_threshold_pace", { length: 20 }), // 乳酸阈值配速 (如 "5:00/km")
    marathonPace: varchar("marathon_pace", { length: 20 }), // 马拉松配速 (如 "5:30/km")
    vo2Max: integer("vo2_max"), // 最大摄氧量（ml/kg/min），用于计算爬升损耗系数
    flatBaselinePace: varchar("flat_baseline_pace", { length: 20 }), // 平路基准配速P0（如 "5:30/km"），有氧耐力区间的平均配速
    // 路段配速系数（对不同类型路段的配速影响）
    terrainPaceFactors: jsonb("terrain_pace_factors"), // 地形复杂度系数（α）
    // 补给数据
    preferredSupplyTypes: jsonb("preferred_supply_types"), // 喜好补给类型 - 多选（数组）
    crampFrequency: varchar("cramp_frequency", { length: 20 }), // 比赛中抽经情况 - 单选
    expectedSweatRate: varchar("expected_sweat_rate", { length: 20 }), // 比赛日预计出汗量 - 单选
    // 时间戳
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  }
)

// 赛道表
export const trails = pgTable(
  "trails",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    name: varchar("name", { length: 200 }).notNull(),
    cpCount: integer("cp_count").notNull(), // CP点数量
    checkpoints: jsonb("checkpoints").notNull(), // 每节点长度和爬升量（JSON数组）
    routeMapKey: text("route_map_key"), // 路书图片的对象存储Key
    routeMapUrl: text("route_map_url"), // 路书图片的访问URL（用于临时展示）
    // 时间戳
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  }
)

// 使用 createSchemaFactory 配置 date coercion
const { createInsertSchema: createCoercedInsertSchema } = createSchemaFactory({
  coerce: { date: true },
})

// 用户相关的 Zod schemas
export const insertUserSchema = createCoercedInsertSchema(users).omit({
  id: true,
  passwordHash: true,
  createdAt: true,
  updatedAt: true,
})

export const loginUserSchema = z.object({
  email: z.string().email("请输入有效的邮箱地址"),
  password: z.string().min(6, "密码至少需要6个字符"),
})

export const registerUserSchema = z.object({
  username: z.string()
    .min(3, "用户名至少需要3个字符")
    .max(50, "用户名不能超过50个字符")
    .regex(/^[a-zA-Z0-9_]+$/, "用户名只能包含字母、数字和下划线"),
  email: z.string().email("请输入有效的邮箱地址"),
  password: z.string()
    .min(6, "密码至少需要6个字符")
    .max(100, "密码不能超过100个字符"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "两次输入的密码不一致",
  path: ["confirmPassword"],
})

// 成员相关的 Zod schemas
export const insertMemberSchema = createCoercedInsertSchema(members).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

export const updateMemberSchema = createCoercedInsertSchema(members)
  .omit({
    id: true,
    createdAt: true,
  })
  .partial()

// 赛道相关的 Zod schemas
export const insertTrailSchema = createCoercedInsertSchema(trails).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

export const updateTrailSchema = createCoercedInsertSchema(trails)
  .omit({
    id: true,
    createdAt: true,
  })
  .partial()

// TypeScript types
export type User = typeof users.$inferSelect
export type InsertUser = z.infer<typeof insertUserSchema>
export type LoginUser = z.infer<typeof loginUserSchema>
export type RegisterUser = z.infer<typeof registerUserSchema>

export type Member = typeof members.$inferSelect
export type InsertMember = z.infer<typeof insertMemberSchema>
export type UpdateMember = z.infer<typeof updateMemberSchema>

export type Trail = typeof trails.$inferSelect
export type InsertTrail = z.infer<typeof insertTrailSchema>
export type UpdateTrail = z.infer<typeof updateTrailSchema>

export type TerrainType = typeof terrainTypes.$inferSelect
export type InsertTerrainType = z.infer<typeof insertTerrainTypeSchema>
export type UpdateTerrainType = z.infer<typeof updateTerrainTypeSchema>

// Checkpoint 类型定义
export interface Checkpoint {
  id: number
  distance: number // 长度（km）
  elevation: number // 爬升量（m）
  downhillDistance: number // 下坡距离（m）
  terrainType: "沙地" | "机耕道" | "山路" | "石铺路" | "台阶" // 路段类型
  per100mElevation?: number // 每100米爬升量（m/100m）
  slopePercent?: number // 坡度百分比（%）
  elevationFactor?: number // 爬升影响值（分钟/公里）
}

// 地形类型配置表（全局设置）
export const terrainTypes = pgTable(
  "terrain_types",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    name: varchar("name", { length: 50 }).notNull().unique(), // 地形类型名称（如"沙地"、"机耕道"）
    paceFactor: text("pace_factor").notNull(), // 地形复杂度系数α（存储为字符串以支持精确小数）
    color: varchar("color", { length: 7 }).notNull(), // 颜色值（如"#F59E0B"）
    icon: varchar("icon", { length: 50 }), // 图标标识（可选）
    isActive: boolean("is_active").default(true).notNull(), // 是否启用
    sortOrder: integer("sort_order").default(0).notNull(), // 排序序号
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  }
)

// 地形类型配置相关的 Zod schemas
export const insertTerrainTypeSchema = createCoercedInsertSchema(terrainTypes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

export const updateTerrainTypeSchema = createCoercedInsertSchema(terrainTypes)
  .omit({
    id: true,
    createdAt: true,
  })
  .partial()

// 路段配速系数类型定义（从数据库动态获取）
export interface TerrainPaceFactors {
  [key: string]: number // 地形类型名称 -> 配速系数
}

// 默认路段配速系数（用于初始化）
export const defaultTerrainPaceFactors: TerrainPaceFactors = {
  "沙地": 1.1, // 沙地默认系数是1.1
  "机耕道": 1.0,
  "山路": 1.0,
  "石铺路": 1.0,
  "台阶": 1.0,
}

// 复盘记录表
export const reviews = pgTable(
  "reviews",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    memberId: varchar("member_id", { length: 36 }).notNull(), // 成员ID
    trailId: varchar("trail_id", { length: 36 }).notNull(), // 赛道ID
    trainingDate: timestamp("training_date", { withTimezone: true }).notNull(), // 训练日期
    // 预测数据（快照）
    predictedTime: text("predicted_time").notNull(), // 预测完赛时间
    predictedPace: text("predicted_pace").notNull(), // 预测配速
    predictedCheckpoints: jsonb("predicted_checkpoints").notNull(), // 预测的CP点数据
    predictedHourlyEnergyNeeds: jsonb("predicted_hourly_energy_needs"), // 预测的每小时能量需求
    predictedSupplyDosages: jsonb("predicted_supply_dosages"), // 预测的补给份数
    // 实际数据
    actualTime: text("actual_time"), // 实际完赛时间
    actualPace: text("actual_pace"), // 实际配速
    actualCheckpoints: jsonb("actual_checkpoints"), // 实际CP点数据
    // 补给情况
    totalWaterIntake: integer("total_water_intake"), // 总补水量（ml）
    totalCaloriesIntake: integer("total_calories_intake"), // 总热量摄入（Kcal）
    totalElectrolytesIntake: integer("total_electrolytes_intake"), // 总电解质摄入（mg）
    // 备注
    notes: text("notes"), // 备注信息
    // 时间戳
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  }
)

// 复盘记录CP点实际数据
export interface ReviewCheckpoint {
  id: number
  distance: number
  elevation: number
  downhillDistance: number
  terrainType: string
  predictedTime: string
  actualTime: string
  averageHeartRate?: number
  maxHeartRate?: number
  waterIntake?: number
  caloriesIntake?: number
  electrolytesIntake?: number
  notes?: string
}

// 复盘记录相关的 Zod schemas
export const insertReviewSchema = createCoercedInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

export const updateReviewSchema = createCoercedInsertSchema(reviews)
  .omit({
    id: true,
    createdAt: true,
  })
  .partial()

// TypeScript types
export type Review = typeof reviews.$inferSelect
export type InsertReview = z.infer<typeof insertReviewSchema>
export type UpdateReview = z.infer<typeof updateReviewSchema>

// 跑团表
export const teams = pgTable(
  "teams",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    name: varchar("name", { length: 100 }).notNull(), // 跑团名称
    description: text("description"), // 跑团描述
    ownerId: varchar("owner_id", { length: 36 }).notNull(), // 创建者ID
    memberCount: integer("member_count").default(0), // 成员数量
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  }
)

// 跑团成员关系表
export const teamMembers = pgTable(
  "team_members",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    teamId: varchar("team_id", { length: 36 }).notNull(), // 跑团ID
    userId: varchar("user_id", { length: 36 }).notNull(), // 用户ID
    role: varchar("role", { length: 20 }).default("member"), // 角色: owner, admin, member
    status: varchar("status", { length: 20 }).default("pending"), // 状态: pending, approved, rejected, left
    joinedAt: timestamp("joined_at", { withTimezone: true }), // 加入时间
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  }
)

// 跑团相关的 Zod schemas
export const insertTeamSchema = createCoercedInsertSchema(teams).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

export const updateTeamSchema = createCoercedInsertSchema(teams)
  .omit({
    id: true,
    createdAt: true,
  })
  .partial()

export const insertTeamMemberSchema = createCoercedInsertSchema(teamMembers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

export const updateTeamMemberSchema = createCoercedInsertSchema(teamMembers)
  .omit({
    id: true,
    createdAt: true,
  })
  .partial()

// TypeScript types
export type Team = typeof teams.$inferSelect
export type InsertTeam = z.infer<typeof insertTeamSchema>
export type UpdateTeam = z.infer<typeof updateTeamSchema>

export type TeamMember = typeof teamMembers.$inferSelect
export type InsertTeamMember = z.infer<typeof insertTeamMemberSchema>
export type UpdateTeamMember = z.infer<typeof updateTeamMemberSchema>



