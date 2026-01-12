import { NextRequest, NextResponse } from "next/server"

interface RecognizedCheckpoint {
  distance: number
  elevation: number
  terrainType: "沙地" | "机耕道" | "山路" | "石铺路" | "台阶"
}

// POST /api/recognize-route - 识别路书图片
export async function POST(request: NextRequest) {
  try {
    // 动态导入LLMClient，避免客户端打包问题
    const { LLMClient, Config } = await import("coze-coding-dev-sdk")

    // 初始化LLM客户端
    const config = new Config()
    const client = new LLMClient(config)

    const body = await request.json()
    const { imageUrl } = body

    if (!imageUrl) {
      return NextResponse.json(
        { success: false, error: "缺少图片URL" },
        { status: 400 }
      )
    }

    // 构造识别提示词
    const systemPrompt = `你是一位专业的越野赛道信息识别专家。请从路书图片中识别赛道信息，并以JSON格式返回。

识别要求：
1. 赛道名称：从图片中识别赛道名称
2. CP点数量：统计图片中显示的CP点数量
3. CP点信息：每个CP点的距离（公里）和爬升量（米），以及路面类型
4. 路面类型：从以下选项中选择 - 沙地、机耕道、山路、石铺路、台阶

JSON格式要求：
{
  "name": "赛道名称",
  "cpCount": CP点数量,
  "checkpoints": [
    {
      "id": 1,
      "distance": 距离（公里，保留1位小数）,
      "elevation": 爬升量（米，整数）,
      "terrainType": "路面类型"
    }
  ]
}

注意事项：
- 如果无法识别某个字段，请设置为null
- 距离和爬升量必须为数字
- 路面类型必须从指定选项中选择
- 不要添加任何注释或说明文字，只返回JSON`

    const userPrompt = `请分析这张路书图片，识别赛道信息并以JSON格式返回。`

    const messages = [
      {
        role: "system" as const,
        content: systemPrompt,
      },
      {
        role: "user" as const,
        content: [
          { type: "text" as const, text: userPrompt },
          {
            type: "image_url" as const,
            image_url: {
              url: imageUrl,
              detail: "high" as const,
            },
          },
        ],
      },
    ]

    // 使用视觉模型进行识别
    const response = await client.invoke(messages, {
      model: "doubao-seed-1-6-vision-250815",
      temperature: 0.3,
    })

    // 提取JSON内容
    let jsonMatch = response.content.match(/```json\n?([\s\S]*?)\n?```/)

    if (!jsonMatch) {
      // 尝试直接解析
      jsonMatch = response.content.match(/\{[\s\S]*\}/)
    }

    if (!jsonMatch) {
      return NextResponse.json(
        {
          success: false,
          error: "无法识别路书信息",
          rawResponse: response.content,
        },
        { status: 400 }
      )
    }

    const jsonString = jsonMatch[1] || jsonMatch[0]
    const recognizedData = JSON.parse(jsonString)

    // 验证数据格式
    if (!recognizedData.name || !Array.isArray(recognizedData.checkpoints)) {
      return NextResponse.json(
        {
          success: false,
          error: "识别数据格式不正确",
          recognizedData,
        },
        { status: 400 }
      )
    }

    // 添加默认的downhillDistance字段
    const checkpoints = recognizedData.checkpoints.map((cp: RecognizedCheckpoint, index: number) => ({
      id: index + 1,
      distance: Number(cp.distance) || 0,
      elevation: Number(cp.elevation) || 0,
      downhillDistance: 0,
      terrainType: ["沙地", "机耕道", "山路", "石铺路", "台阶"].includes(cp.terrainType)
        ? (cp.terrainType as RecognizedCheckpoint["terrainType"])
        : "山路",
    }))

    return NextResponse.json({
      success: true,
      data: {
        name: recognizedData.name || "",
        cpCount: recognizedData.cpCount || checkpoints.length,
        checkpoints,
      },
    })
  } catch (error) {
    console.error("识别路书失败:", error)
    return NextResponse.json(
      { success: false, error: "识别路书失败" },
      { status: 500 }
    )
  }
}
