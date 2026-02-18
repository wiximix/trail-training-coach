export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from "next/server"
import { logger } from "@/lib/logger"
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

// 确保上传目录存在
const uploadDir = join(process.cwd(), 'public', 'uploads')
const ensureUploadDir = async () => {
  try {
    await mkdir(uploadDir, { recursive: true })
  } catch (error) {
    // 目录已存在或其他错误
    if ((error as any).code !== 'EEXIST') {
      throw error
    }
  }
}

// POST /api/upload - 上传路书图片
export async function POST(request: NextRequest) {
  try {
    await ensureUploadDir()

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

    logger.debug("开始保存文件到本地")

    // 生成安全的文件名：移除非法字符，只保留字母、数字、点、下划线、短横
    const originalFileName = file.name
    const fileExtension = originalFileName.substring(originalFileName.lastIndexOf('.'))
    const timestamp = Date.now()

    // 使用时间戳和随机数作为文件名，避免中文字符问题
    const randomSuffix = Math.random().toString(36).substring(2, 8)
    const safeFileName = `route-map-${timestamp}-${randomSuffix}${fileExtension}`

    // 保存到本地
    const fileName = `uploads/${safeFileName}`
    const filePath = join(uploadDir, safeFileName)
    logger.debug("文件名", { fileName })
    logger.debug("原始文件名", { originalFileName })

    // 写入文件
    await writeFile(filePath, buffer)

    logger.info("上传成功", { fileName })

    // 生成访问URL
    const signedUrl = `/uploads/${safeFileName}`
    logger.debug("生成访问URL成功", { signedUrl })

    return NextResponse.json({
      success: true,
      data: {
        fileKey: safeFileName,
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