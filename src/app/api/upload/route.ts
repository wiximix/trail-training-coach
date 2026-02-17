import { NextRequest, NextResponse } from "next/server"
import { logger } from "@/lib/logger"

// POST /api/upload - 上传路书图片
export async function POST(request: NextRequest) {
  try {
    // 动态导入S3Storage，避免客户端打包问题
    const { S3Storage } = await import("coze-coding-dev-sdk")

    // 初始化对象存储
    const storage = new S3Storage({
      endpointUrl: process.env.COZE_BUCKET_ENDPOINT_URL,
      accessKey: "",
      secretKey: "",
      bucketName: process.env.COZE_BUCKET_NAME,
      region: "cn-beijing",
    })

    logger.info("开始处理上传请求")
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json(
        { success: false, error: "未选择文件" },
        { status: 400 }
      )
    }

    logger.debug("文件信息", {
      name: file.name,
      type: file.type,
      size: file.size,
    })

    // 验证文件类型
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: "仅支持上传 JPG、PNG、WebP、GIF 格式的图片" },
        { status: 400 }
      )
    }

    // 验证文件大小（最大10MB）
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: "图片大小不能超过10MB" },
        { status: 400 }
      )
    }

    logger.debug("开始转换文件为Buffer")
    // 将文件转换为Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    logger.debug("开始上传到对象存储")
    logger.debug("对象存储配置", {
      endpointUrl: process.env.COZE_BUCKET_ENDPOINT_URL,
      bucketName: process.env.COZE_BUCKET_NAME,
    })

    // 生成安全的文件名：移除非法字符，只保留字母、数字、点、下划线、短横
    const originalFileName = file.name
    const fileExtension = originalFileName.substring(originalFileName.lastIndexOf('.'))
    const timestamp = Date.now()

    // 只使用时间戳和随机数作为文件名，避免中文字符问题
    const randomSuffix = Math.random().toString(36).substring(2, 8)
    const safeFileName = `route-map-${timestamp}-${randomSuffix}${fileExtension}`

    // 上传到对象存储
    const fileName = `route-maps/${safeFileName}`
    logger.debug("文件名", { fileName })
    logger.debug("原始文件名", { originalFileName })

    const fileKey = await storage.uploadFile({
      fileContent: buffer,
      fileName: fileName,
      contentType: file.type,
    })

    logger.info("上传成功", { fileKey })

    // 生成临时访问URL（有效期7天）
    logger.debug("生成签名URL")
    const signedUrl = await storage.generatePresignedUrl({
      key: fileKey,
      expireTime: 604800, // 7天 = 7 * 24 * 3600
    })

    logger.debug("生成签名URL成功")

    return NextResponse.json({
      success: true,
      data: {
        fileKey,
        fileName,
        signedUrl,
        fileType: file.type,
        fileSize: file.size,
      },
    })
  } catch (error) {
    logger.error("上传路书图片失败", error)
    return NextResponse.json(
      { success: false, error: "上传路书图片失败" },
      { status: 500 }
    )
  }
}
