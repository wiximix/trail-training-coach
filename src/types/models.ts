/**
 * 业务模型类型定义
 */

import type {
  Trail as TrailSchema,
  Member as MemberSchema,
  Review as ReviewSchema,
  Team as TeamSchema,
  TeamMember as TeamMemberSchema,
  User as UserSchema,
  TerrainType as TerrainTypeSchema,
  InsertTrail as InsertTrailSchema,
  InsertMember as InsertMemberSchema,
  InsertReview as InsertReviewSchema,
  InsertTeam as InsertTeamSchema,
  InsertTeamMember as InsertTeamMemberSchema,
  InsertTerrainType as InsertTerrainTypeSchema,
  UpdateTrail as UpdateTrailSchema,
  UpdateMember as UpdateMemberSchema,
  UpdateReview as UpdateReviewSchema,
  UpdateTeam as UpdateTeamSchema,
  UpdateTeamMember as UpdateTeamMemberSchema,
  UpdateTerrainType as UpdateTerrainTypeSchema,
} from "@/storage/database/shared/schema"

// 重新导出数据库类型
export type Trail = TrailSchema
export type Member = MemberSchema
export type Review = ReviewSchema
export type Team = TeamSchema
export type TeamMember = TeamMemberSchema
export type User = UserSchema
export type TerrainType = TerrainTypeSchema

// 导出插入和更新类型
export type InsertTrail = InsertTrailSchema
export type UpdateTrail = UpdateTrailSchema
export type InsertMember = InsertMemberSchema
export type UpdateMember = UpdateMemberSchema
export type InsertReview = InsertReviewSchema
export type UpdateReview = UpdateReviewSchema
export type InsertTeam = InsertTeamSchema
export type UpdateTeam = UpdateTeamSchema
export type InsertTeamMember = InsertTeamMemberSchema
export type UpdateTeamMember = UpdateTeamMemberSchema
export type InsertTerrainType = InsertTerrainTypeSchema
export type UpdateTerrainType = UpdateTerrainTypeSchema

/**
 * CP点（检查点）类型
 */
export interface Checkpoint {
  id: number
  distance: number // 分段距离（km）
  elevation: number // 分段爬升（m）
  downhillDistance?: number // 下坡距离（km）
  terrainType?: string // 地形类型
  per100mElevation?: number // 每100米爬升
  slopePercent?: number // 坡度百分比
  elevationFactor?: number // 爬升影响值
  terrainPaceFactor?: number // 地形配速系数
  sectionTime?: number // 分段用时（秒）
  estimatedTime?: string // 预计用时
  supplyStrategy?: string // 补给策略
  accumulatedDistance?: number // 累计距离
  sectionSupply?: {
    gels: number
    gelCalories: number
    electrolytePowder: number
    electrolytePowderCalories: number
    electrolytePowderWater: number
    electrolytePowderElectrolytes: number
  }
}

/**
 * 预测结果类型
 */
export interface PredictionResult {
  estimatedTime: string
  estimatedPace: string
  flatBaselinePace: string // 平路基准配速P0
  elevationLossCoefficient: number // 爬升损耗系数k（秒/米）
  checkpoints: Checkpoint[]
  overallSupplyStrategy: string[]
  hourlyEnergyNeeds: {
    carbs: number // 热量
    water: number // 水
    electrolytes: number // 电解质
  }
  supplyDosages: {
    gelsPerHour: number
    saltsPerHour: number
    electrolytePowderPerHour: number
  }
  totalEnergyNeeds: {
    carbs: number
    water: number
    electrolytes: number
  }
  totalSupplyDosages?: {
    totalGels: number
    totalSalts: number
    totalElectrolytePowder: number
    totalWater: number
  }
}

/**
 * 预测请求类型
 */
export interface PredictionRequest {
  memberId: string
  trailId: string
  expectedSweatRate?: string
  plannedPace?: string
  checkpointPaces?: Record<number, string>
  customFlatBaselinePace?: string
  customElevationLossCoefficient?: number
  gelCarbs?: number
  saltElectrolytes?: number
  electrolytePowder?: number
  electrolytePowderCalories?: number
  electrolytePowderWater?: number
}

/**
 * 心率区间类型
 */
export interface HeartRateZone {
  name: string
  min: number
  max: number
  color: string
}

/**
 * 补给策略参数
 */
export interface SupplyStrategyParams {
  crampFrequency: string
  expectedSweatRate: string
  preferredSupplyTypes: string[]
  distance: number
}

/**
 * 每小时能量需求
 */
export interface HourlyEnergyNeeds {
  carbs: number
  water: number
  electrolytes: number
}

/**
 * 补给份数
 */
export interface SupplyDosages {
  gelsPerHour: number
  saltsPerHour: number
  electrolytePowderPerHour: number
}

/**
 * 地形配速系数
 */
export type TerrainPaceFactors = Record<string, number>
