export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const filePath = join(process.cwd(), 'public', 'uploads', params.path.join('/'))

    // 读取文件
    const fileBuffer = await readFile(filePath)

    // 根据文件扩展名设置 Content-Type
    const extension = params.path[params.path.length - 1].split('.').pop()?.toLowerCase() || ''
    const contentTypeMap: Record<string, string> = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
    }

    const contentType = contentTypeMap[extension] || 'application/octet-stream'

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'File not found' },
      { status: 404 }
    )
  }
}