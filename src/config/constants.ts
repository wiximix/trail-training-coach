/**
 * 应用常量配置
 */

// API 相关
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || "",
  TIMEOUT: 30000, // 30秒
} as const

// 分页
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  DEFAULT_PAGE: 1,
} as const

// 存储相关
export const STORAGE = {
  TOKEN_KEY: "token",
  USER_KEY: "user",
  THEME_KEY: "theme",
} as const

// Cookie 相关
export const COOKIE = {
  TOKEN_NAME: "token",
  MAX_AGE: 60 * 60 * 24 * 7, // 7天
} as const

// 补给类型
export const SUPPLY_TYPES = [
  "能量胶",
  "盐丸",
  "电解质粉",
  "能量棒",
  "香蕉",
  "运动饮料",
] as const

// 抽筋情况
export const CRAMP_FREQUENCY = [
  "不会抽筋",
  "很少抽筋",
  "偶尔抽筋",
  "经常抽筋",
  "总是抽筋",
] as const

// 出汗量
export const SWEAT_RATE = [
  "很少出汗",
  "有一点",
  "正常",
  "比较多",
  "很多汗",
] as const

// 地形类型（默认）
export const DEFAULT_TERRAIN_TYPES = [
  "沙地",
  "机耕道",
  "山路",
  "石铺路",
  "台阶",
] as const

// 地形配速系数（默认）
export const DEFAULT_TERRAIN_PACE_FACTORS = {
  "沙地": 1.1,
  "机耕道": 1.0,
  "山路": 1.0,
  "石铺路": 1.0,
  "台阶": 1.0,
} as const

// 跑团角色
export const TEAM_ROLES = {
  OWNER: "owner",
  ADMIN: "admin",
  MEMBER: "member",
} as const

// 跑团角色显示名称
export const TEAM_ROLE_LABELS = {
  owner: "创建者",
  admin: "管理员",
  member: "成员",
} as const
