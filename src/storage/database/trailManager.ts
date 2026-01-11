import { eq } from "drizzle-orm"
import { getDb } from "./db"
import { trails, insertTrailSchema, updateTrailSchema } from "./shared/schema"
import type { Trail, InsertTrail, UpdateTrail } from "./shared/schema"

export class TrailManager {
  async createTrail(data: InsertTrail): Promise<Trail> {
    const db = await getDb()
    const validated = insertTrailSchema.parse(data)
    const [trail] = await db.insert(trails).values(validated).returning()
    return trail
  }

  async getTrails(options: { skip?: number; limit?: number } = {}): Promise<Trail[]> {
    const { skip = 0, limit = 100 } = options
    const db = await getDb()
    return db.select().from(trails).limit(limit).offset(skip)
  }

  async getTrailById(id: string): Promise<Trail | null> {
    const db = await getDb()
    const [trail] = await db.select().from(trails).where(eq(trails.id, id))
    return trail || null
  }

  async updateTrail(id: string, data: UpdateTrail): Promise<Trail | null> {
    const db = await getDb()
    const validated = updateTrailSchema.parse(data)
    const [trail] = await db
      .update(trails)
      .set({ ...validated, updatedAt: new Date() })
      .where(eq(trails.id, id))
      .returning()
    return trail || null
  }

  async deleteTrail(id: string): Promise<boolean> {
    const db = await getDb()
    const result = await db.delete(trails).where(eq(trails.id, id))
    return (result.rowCount ?? 0) > 0
  }
}

export const trailManager = new TrailManager()
