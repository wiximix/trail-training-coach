import { NextRequest, NextResponse } from "next/server"
import { S3Storage } from "coze-coding-dev-sdk"

// 初始化对象存储
const storage = new S3Storage({
  endpointUrl: process.env.COZE_BUCKET_ENDPOINT_URL,
  accessKey: "",
  secretKey: "",
  bucketName: process.env.COZE_BUCKET_NAME,
  region: "cn-beijing",
})

// POST /api/upload - 上传路书图片
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json(
        { success: false, error: "未选择文件" },
        { status: 400 }
      )
    }

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

    // 将文件转换为Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // 上传到对象存储
    const fileName = `route-maps/${Date.now()}_${file.name}`
    const fileKey = await storage.uploadFile({
      fileContent: buffer,
      fileName: fileName,
      contentType: file.type,
    })

    // 生成临时访问URL（有效期7天）
    const signedUrl = await storage.generatePresignedUrl({
      key: fileKey,
      expireTime: 604800, // 7天 = 7 * 24 * 3600
    })

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
    console.error("上传路书图片失败:", error)
    return NextResponse.json(
      { success: false, error: "上传路书图片失败" },
      { status: 500 }
    )
  }
}
