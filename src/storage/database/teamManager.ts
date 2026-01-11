import { eq, and, count } from "drizzle-orm"
import { getDb } from "./db"
import {
  teams,
  teamMembers,
  insertTeamSchema,
  updateTeamSchema,
  insertTeamMemberSchema,
  updateTeamMemberSchema,
} from "./shared/schema"
import type {
  Team,
  InsertTeam,
  UpdateTeam,
  TeamMember,
  InsertTeamMember,
  UpdateTeamMember,
} from "./shared/schema"

export class TeamManager {
  // 创建跑团
  async createTeam(data: InsertTeam & { ownerId: string }): Promise<Team> {
    const db = await getDb()
    const validated = insertTeamSchema.parse(data)

    const [team] = await db.insert(teams).values(validated).returning()

    // 自动将创建者添加为 owner 角色
    await this.addTeamMember({
      teamId: team.id,
      userId: validated.ownerId,
      role: "owner",
      status: "approved",
      joinedAt: new Date(),
    })

    // 更新成员数量
    await this.updateMemberCount(team.id)

    return team
  }

  // 获取跑团列表
  async getTeams(options: { skip?: number; limit?: number } = {}): Promise<Team[]> {
    const { skip = 0, limit = 100 } = options
    const db = await getDb()
    return db.select().from(teams).limit(limit).offset(skip)
  }

  // 根据 ID 获取跑团
  async getTeamById(id: string): Promise<Team | null> {
    const db = await getDb()
    const [team] = await db.select().from(teams).where(eq(teams.id, id))
    return team || null
  }

  // 获取用户创建的跑团
  async getTeamsByOwnerId(ownerId: string): Promise<Team[]> {
    const db = await getDb()
    return db.select().from(teams).where(eq(teams.ownerId, ownerId))
  }

  // 更新跑团信息
  async updateTeam(id: string, data: UpdateTeam): Promise<Team | null> {
    const db = await getDb()
    const validated = updateTeamSchema.parse(data)
    const [team] = await db
      .update(teams)
      .set({ ...validated, updatedAt: new Date() })
      .where(eq(teams.id, id))
      .returning()
    return team || null
  }

  // 删除跑团
  async deleteTeam(id: string): Promise<boolean> {
    const db = await getDb()
    // 先删除所有成员关系
    await db.delete(teamMembers).where(eq(teamMembers.teamId, id))
    // 再删除跑团
    const result = await db.delete(teams).where(eq(teams.id, id))
    return (result.rowCount ?? 0) > 0
  }

  // 更新成员数量
  async updateMemberCount(teamId: string): Promise<void> {
    const db = await getDb()
    const [result] = await db
      .select({ count: count() })
      .from(teamMembers)
      .where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.status, "approved")))

    await db
      .update(teams)
      .set({ memberCount: Number(result?.count || 0) })
      .where(eq(teams.id, teamId))
  }

  // 添加成员到跑团
  async addTeamMember(data: InsertTeamMember): Promise<TeamMember> {
    const db = await getDb()
    const validated = insertTeamMemberSchema.parse(data)
    const [member] = await db.insert(teamMembers).values(validated).returning()

    // 更新成员数量
    if (validated.status === "approved") {
      await this.updateMemberCount(validated.teamId)
    }

    return member
  }

  // 申请加入跑团
  async applyToTeam(teamId: string, userId: string): Promise<TeamMember> {
    const db = await getDb()

    // 检查是否已经申请过
    const existing = await this.getTeamMember(teamId, userId)
    if (existing) {
      if (existing.status === "pending") {
        throw new Error("你已经申请过该跑团，请等待审核")
      }
      if (existing.status === "approved") {
        throw new Error("你已经是该跑团成员")
      }
      if (existing.status === "rejected") {
        throw new Error("你的申请已被拒绝，请联系跑团管理员")
      }
      if (existing.status === "left") {
        // 如果之前退出过，可以重新申请
        await db.delete(teamMembers).where(eq(teamMembers.id, existing.id))
      }
    }

    const [member] = await db
      .insert(teamMembers)
      .values({
        teamId,
        userId,
        role: "member",
        status: "pending",
      })
      .returning()

    return member
  }

  // 获取跑团成员
  async getTeamMember(teamId: string, userId: string): Promise<TeamMember | null> {
    const db = await getDb()
    const [member] = await db
      .select()
      .from(teamMembers)
      .where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, userId)))
    return member || null
  }

  // 获取跑团的所有成员
  async getTeamMembers(teamId: string, options: { status?: string } = {}): Promise<TeamMember[]> {
    const { status } = options
    const db = await getDb()

    if (status) {
      return db
        .select()
        .from(teamMembers)
        .where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.status, status)))
    }

    return db.select().from(teamMembers).where(eq(teamMembers.teamId, teamId))
  }

  // 获取用户的跑团列表（包含成员关系）
  async getUserTeams(
    userId: string,
    options: { status?: string; role?: string } = {}
  ): Promise<Array<{ team: Team; member: TeamMember }>> {
    const db = await getDb()
    const { status, role } = options

    let conditions = [eq(teamMembers.userId, userId)]

    if (status) {
      conditions.push(eq(teamMembers.status, status))
    }
    if (role) {
      conditions.push(eq(teamMembers.role, role))
    }

    const members = await db
      .select()
      .from(teamMembers)
      .where(and(...conditions))

    const results: Array<{ team: Team; member: TeamMember }> = []

    for (const member of members) {
      const team = await this.getTeamById(member.teamId)
      if (team) {
        results.push({ team, member })
      }
    }

    return results
  }

  // 审批申请
  async approveApplication(teamId: string, userId: string): Promise<TeamMember | null> {
    const db = await getDb()
    const [member] = await db
      .update(teamMembers)
      .set({
        status: "approved",
        joinedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(teamMembers.teamId, teamId),
          eq(teamMembers.userId, userId),
          eq(teamMembers.status, "pending")
        )
      )
      .returning()

    if (member) {
      await this.updateMemberCount(teamId)
    }

    return member || null
  }

  // 拒绝申请
  async rejectApplication(teamId: string, userId: string): Promise<TeamMember | null> {
    const db = await getDb()
    const [member] = await db
      .update(teamMembers)
      .set({
        status: "rejected",
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(teamMembers.teamId, teamId),
          eq(teamMembers.userId, userId),
          eq(teamMembers.status, "pending")
        )
      )
      .returning()

    return member || null
  }

  // 移除成员（仅 owner 或 admin）
  async removeMember(teamId: string, userId: string): Promise<boolean> {
    const db = await getDb()
    const member = await this.getTeamMember(teamId, userId)

    if (!member) return false
    if (member.role === "owner") throw new Error("不能移除跑团创建者")

    const result = await db
      .delete(teamMembers)
      .where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, userId)))

    await this.updateMemberCount(teamId)

    return (result.rowCount ?? 0) > 0
  }

  // 退出跑团
  async leaveTeam(teamId: string, userId: string): Promise<boolean> {
    const db = await getDb()
    const member = await this.getTeamMember(teamId, userId)

    if (!member) return false
    if (member.role === "owner") throw new Error("跑团创建者不能退出跑团")

    const result = await db
      .update(teamMembers)
      .set({
        status: "left",
        updatedAt: new Date(),
      })
      .where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, userId)))

    await this.updateMemberCount(teamId)

    return (result.rowCount ?? 0) > 0
  }

  // 更新成员角色（仅 owner）
  async updateMemberRole(teamId: string, userId: string, role: string): Promise<TeamMember | null> {
    const db = await getDb()
    const [member] = await db
      .update(teamMembers)
      .set({
        role,
        updatedAt: new Date(),
      })
      .where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, userId)))
      .returning()

    return member || null
  }

  // 检查用户是否是跑团管理员（owner 或 admin）
  async isAdmin(teamId: string, userId: string): Promise<boolean> {
    const member = await this.getTeamMember(teamId, userId)
    return member !== null && member.status === "approved" && (member.role === "owner" || member.role === "admin")
  }

  // 检查用户是否是跑团创建者
  async isOwner(teamId: string, userId: string): Promise<boolean> {
    const member = await this.getTeamMember(teamId, userId)
    return member !== null && member.status === "approved" && member.role === "owner"
  }

  // 检查用户是否是跑团成员
  async isMember(teamId: string, userId: string): Promise<boolean> {
    const member = await this.getTeamMember(teamId, userId)
    return member !== null && member.status === "approved"
  }
}
