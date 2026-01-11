import { eq } from "drizzle-orm"
import { getDb } from "./db"
import { reviews, insertReviewSchema, updateReviewSchema } from "./shared/schema"
import type { Review, InsertReview, UpdateReview } from "./shared/schema"

export class ReviewManager {
  async createReview(data: InsertReview): Promise<Review> {
    const db = await getDb()
    const validated = insertReviewSchema.parse(data)
    const [review] = await db.insert(reviews).values(validated).returning()
    return review
  }

  async getReviews(options: { skip?: number; limit?: number } = {}): Promise<Review[]> {
    const { skip = 0, limit = 100 } = options
    const db = await getDb()
    return db.select().from(reviews).orderBy((reviews: any) => reviews.trainingDate).limit(limit).offset(skip)
  }

  async getReviewsByMemberId(memberId: string): Promise<Review[]> {
    const db = await getDb()
    return db.select().from(reviews).where(eq(reviews.memberId, memberId)).orderBy((reviews: any) => reviews.trainingDate)
  }

  async getReviewsByTrailId(trailId: string): Promise<Review[]> {
    const db = await getDb()
    return db.select().from(reviews).where(eq(reviews.trailId, trailId)).orderBy((reviews: any) => reviews.trainingDate)
  }

  async getReviewById(id: string): Promise<Review | null> {
    const db = await getDb()
    const [review] = await db.select().from(reviews).where(eq(reviews.id, id))
    return review || null
  }

  async updateReview(id: string, data: UpdateReview): Promise<Review | null> {
    const db = await getDb()
    const validated = updateReviewSchema.parse(data)
    const [review] = await db
      .update(reviews)
      .set({ ...validated, updatedAt: new Date() })
      .where(eq(reviews.id, id))
      .returning()
    return review || null
  }

  async deleteReview(id: string): Promise<boolean> {
    const db = await getDb()
    const result = await db.delete(reviews).where(eq(reviews.id, id))
    return (result.rowCount ?? 0) > 0
  }
}
