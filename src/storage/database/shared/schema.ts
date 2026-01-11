import { pgTable, varchar, integer, text, timestamp, jsonb } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"
import { createSchemaFactory } from "drizzle-zod"
import { z } from "zod"

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
    // 路段配速系数（对不同类型路段的配速影响）
    terrainPaceFactors: jsonb("terrain_pace_factors"), // 路段配速系数
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
export type Member = typeof members.$inferSelect
export type InsertMember = z.infer<typeof insertMemberSchema>
export type UpdateMember = z.infer<typeof updateMemberSchema>

export type Trail = typeof trails.$inferSelect
export type InsertTrail = z.infer<typeof insertTrailSchema>
export type UpdateTrail = z.infer<typeof updateTrailSchema>

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

// 路段配速系数类型定义
export interface TerrainPaceFactors {
  sand: number // 沙地配速系数
  farmRoad: number // 机耕道配速系数
  mountainRoad: number // 山路配速系数
  stoneRoad: number // 石铺路配速系数
  steps: number // 台阶配速系数
}

// 默认路段配速系数
export const defaultTerrainPaceFactors: TerrainPaceFactors = {
  sand: 1.1, // 沙地默认系数是1.1
  farmRoad: 1.0,
  mountainRoad: 1.0,
  stoneRoad: 1.0,
  steps: 1.0,
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




