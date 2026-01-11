import { getDb } from "coze-coding-dev-sdk"

// 数据库连接单例
let dbInstance: any = null
let initPromise: Promise<any> | null = null

export async function getDbInstance(): Promise<any> {
  // 如果已经初始化，直接返回
  if (dbInstance) {
    return dbInstance
  }

  // 如果正在初始化，等待初始化完成
  if (initPromise) {
    return initPromise
  }

  // 创建初始化Promise
  initPromise = getDb().then(db => {
    dbInstance = db
    initPromise = null
    return db
  })

  return initPromise
}

// 导出别名，保持向后兼容
export { getDbInstance as getDb }
