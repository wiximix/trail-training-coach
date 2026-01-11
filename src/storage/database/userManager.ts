import { eq } from "drizzle-orm"
import { getDb } from "./db"
import { users, insertUserSchema, loginUserSchema, registerUserSchema } from "./shared/schema"
import type { User, InsertUser, LoginUser, RegisterUser } from "./shared/schema"
import * as bcrypt from "bcryptjs"
import { SignJWT, jwtVerify } from "jose"

// JWT 密钥（在生产环境中应该从环境变量读取）
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key-change-this-in-production")

export class UserManager {
  // 注册用户
  async register(data: RegisterUser): Promise<{ user: Omit<User, "passwordHash">; token: string }> {
    const db = await getDb()
    const validated = registerUserSchema.parse(data)

    // 检查邮箱是否已存在
    const existingByEmail = await this.getUserByEmail(validated.email)
    if (existingByEmail) {
      throw new Error("该邮箱已被注册")
    }

    // 检查用户名是否已存在
    const existingByUsername = await this.getUserByUsername(validated.username)
    if (existingByUsername) {
      throw new Error("该用户名已被使用")
    }

    // 加密密码
    const passwordHash = await bcrypt.hash(validated.password, 10)

    // 创建用户
    const [user] = await db
      .insert(users)
      .values({
        username: validated.username,
        email: validated.email,
        passwordHash,
      })
      .returning()

    // 生成 JWT token
    const token = await this.generateToken(user.id)

    // 返回用户信息（不包含密码哈希）
    const { passwordHash: _, ...userWithoutPassword } = user

    return { user: userWithoutPassword, token }
  }

  // 登录用户
  async login(data: LoginUser): Promise<{ user: Omit<User, "passwordHash">; token: string }> {
    const db = await getDb()
    const validated = loginUserSchema.parse(data)

    // 查找用户
    const user = await this.getUserByEmail(validated.email)
    if (!user) {
      throw new Error("邮箱或密码错误")
    }

    // 验证密码
    const isValidPassword = await bcrypt.compare(validated.password, user.passwordHash)
    if (!isValidPassword) {
      throw new Error("邮箱或密码错误")
    }

    // 检查用户是否激活
    if (!user.isActive) {
      throw new Error("账户已被禁用")
    }

    // 生成 JWT token
    const token = await this.generateToken(user.id)

    // 返回用户信息（不包含密码哈希）
    const { passwordHash: _, ...userWithoutPassword } = user

    return { user: userWithoutPassword, token }
  }

  // 根据 ID 获取用户
  async getUserById(id: string): Promise<Omit<User, "passwordHash"> | null> {
    const db = await getDb()
    const [user] = await db.select().from(users).where(eq(users.id, id))
    if (!user) return null

    const { passwordHash: _, ...userWithoutPassword } = user
    return userWithoutPassword
  }

  // 根据邮箱获取用户
  async getUserByEmail(email: string): Promise<User | null> {
    const db = await getDb()
    const [user] = await db.select().from(users).where(eq(users.email, email))
    return user || null
  }

  // 根据用户名获取用户
  async getUserByUsername(username: string): Promise<User | null> {
    const db = await getDb()
    const [user] = await db.select().from(users).where(eq(users.username, username))
    return user || null
  }

  // 验证 JWT token
  async verifyToken(token: string): Promise<{ userId: string } | null> {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET)
      return { userId: payload.userId as string }
    } catch (error) {
      return null
    }
  }

  // 生成 JWT token
  private async generateToken(userId: string): Promise<string> {
    return await new SignJWT({ userId })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(JWT_SECRET)
  }

  // 获取所有用户（管理员功能）
  async getUsers(options: { skip?: number; limit?: number } = {}): Promise<Omit<User, "passwordHash">[]> {
    const { skip = 0, limit = 100 } = options
    const db = await getDb()
    const userList = await db.select().from(users).limit(limit).offset(skip)
    return userList.map(({ passwordHash: _, ...user }) => user)
  }
}

export const userManager = new UserManager()
