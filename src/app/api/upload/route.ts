import { NextRequest, NextResponse } from "next/server"

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

    console.log("开始处理上传请求")
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json(
        { success: false, error: "未选择文件" },
        { status: 400 }
      )
    }

    console.log("文件信息:", {
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

    console.log("开始转换文件为Buffer")
    // 将文件转换为Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    console.log("开始上传到对象存储")
    console.log("对象存储配置:", {
      endpointUrl: process.env.COZE_BUCKET_ENDPOINT_URL,
      bucketName: process.env.COZE_BUCKET_NAME,
    })

    // 上传到对象存储
    const fileName = `route-maps/${Date.now()}_${file.name}`
    console.log("文件名:", fileName)

    const fileKey = await storage.uploadFile({
      fileContent: buffer,
      fileName: fileName,
      contentType: file.type,
    })

    console.log("上传成功，fileKey:", fileKey)

    // 生成临时访问URL（有效期7天）
    console.log("生成签名URL")
    const signedUrl = await storage.generatePresignedUrl({
      key: fileKey,
      expireTime: 604800, // 7天 = 7 * 24 * 3600
    })

    console.log("生成签名URL成功")

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
    console.error("错误详情:", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })
    return NextResponse.json(
      { success: false, error: "上传路书图片失败" },
      { status: 500 }
    )
  }
}
