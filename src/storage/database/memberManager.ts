import { eq } from "drizzle-orm"
import { getDb } from "./db"
import { members, insertMemberSchema, updateMemberSchema } from "./shared/schema"
import type { Member, InsertMember, UpdateMember } from "./shared/schema"

export class MemberManager {
  async createMember(data: InsertMember): Promise<Member> {
    const db = await getDb()
    const validated = insertMemberSchema.parse(data)
    const [member] = await db.insert(members).values(validated).returning()
    return member
  }

  async getMembers(options: { skip?: number; limit?: number } = {}): Promise<Member[]> {
    const { skip = 0, limit = 100 } = options
    const db = await getDb()
    return db.select().from(members).limit(limit).offset(skip)
  }

  async getMemberById(id: string): Promise<Member | null> {
    const db = await getDb()
    const [member] = await db.select().from(members).where(eq(members.id, id))
    return member || null
  }

  async updateMember(id: string, data: UpdateMember): Promise<Member | null> {
    const db = await getDb()
    const validated = updateMemberSchema.parse(data)
    const [member] = await db
      .update(members)
      .set({ ...validated, updatedAt: new Date() })
      .where(eq(members.id, id))
      .returning()
    return member || null
  }

  async deleteMember(id: string): Promise<boolean> {
    const db = await getDb()
    const result = await db.delete(members).where(eq(members.id, id))
    return (result.rowCount ?? 0) > 0
  }
}
