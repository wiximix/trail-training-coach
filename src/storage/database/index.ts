// 导出类型
export type { Member, InsertMember, UpdateMember } from "./shared/schema"
export type { Trail, InsertTrail, UpdateTrail } from "./shared/schema"
export type { Review, InsertReview, UpdateReview } from "./shared/schema"
export type { Team, InsertTeam, UpdateTeam } from "./shared/schema"
export type { TeamMember, InsertTeamMember, UpdateTeamMember } from "./shared/schema"
export type { TerrainType, InsertTerrainType, UpdateTerrainType } from "./shared/schema"

// 导出单例实例
export { memberManager } from "./memberManager"
export { trailManager } from "./trailManager"
export { reviewManager } from "./reviewManager"
export { teamManager } from "./teamManager"
export { userManager } from "./userManager"
export { getDb } from "./db"
