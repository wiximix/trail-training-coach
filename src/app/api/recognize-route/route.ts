export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from "next/server"
import { logger } from "@/lib/logger"

interface RecognizedCheckpoint {
  distance: number
  elevation: number
  downhillDistance: number
  terrainType: "沙地" | "机耕道" | "山路" | "石铺路" | "台阶"
}

// 动态导入算法函数，避免客户端打包问题
async function loadAlgorithms() {
  const module = await import("@/lib/trailAlgorithm")
  return {
    calculatePer100mElevation: module.calculatePer100mElevation,
    calculateSlopePercent: module.calculateSlopePercent,
    calculateElevationFactor: module.calculateElevationFactor,
  }
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
1. 赛道名称：从图片中识别赛道名称（如果没有明确标注，请根据上下文推断一个合理的名称）
2. CP点数量：统计图片中显示的CP点数量（包括起点、终点和所有中间CP点）
3. CP点信息：每个CP点的距离（公里）、爬升量（米）、下坡距离（米）以及路面类型
4. 路面类型：从以下选项中选择 - 沙地、机耕道、山路、石铺路、台阶（如果无法识别，默认选择"山路"）

JSON格式要求：
{
  "name": "赛道名称",
  "cpCount": CP点数量（整数）,
  "checkpoints": [
    {
      "id": CP点编号（从1开始）,
      "distance": 距离（公里，数字类型，保留1位小数，如5.5）,
      "elevation": 爬升量（米，数字类型，整数，如100）,
      "downhillDistance": 下坡距离（米，数字类型，整数，如50）,
      "terrainType": "路面类型"
    }
  ]
}

重要提示：
- 距离、爬升量和下坡距离必须是纯数字，不能包含单位（如"km"、"米"等）
- 如果图片显示的是累计距离，请转换为每段的增量距离
- 如果图片显示的是累计爬升，请转换为每段的增量爬升
- 下坡距离是指该路段中纯下坡的距离（如果有显示）
- 如果无法识别下坡距离，请设置为0
- 如果无法识别距离或爬升量，请合理推断或设置为0
- checkpoints数组中的id字段必须连续，从1开始
- cpCount必须等于checkpoints数组的长度
- 路面类型必须从以下5个选项中选择：沙地、机耕道、山路、石铺路、台阶
- 只返回纯JSON格式，不要包含任何其他文字、注释或markdown标记`

    const userPrompt = `请仔细分析这张路书图片，提取赛道信息。

识别要点：
1. 找出所有CP点（包括起点、终点和中间检查点）
2. 识别每个CP点的距离（公里）和累计爬升量（米）
3. 识别每个CP点的下坡距离（米），如果路书中有标注下降或下坡信息
4. 如果是累计值，请计算每段的增量值
5. 识别各路段的路面类型（沙地、机耕道、山路、石铺路、台阶）

请严格按照JSON格式返回识别结果。`

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

    // 提取JSON内容（支持多种格式）
    let jsonString = ""

    // 尝试匹配 ```json ... ``` 格式
    let jsonMatch = response.content.match(/```json\n?([\s\S]*?)\n?```/)
    if (jsonMatch) {
      jsonString = jsonMatch[1]
    }

    // 尝试匹配 ``` ... ``` 格式
    if (!jsonString) {
      jsonMatch = response.content.match(/```\n?([\s\S]*?)\n?```/)
      if (jsonMatch) {
        jsonString = jsonMatch[1]
      }
    }

    // 尝试直接匹配 { ... } 格式
    if (!jsonString) {
      jsonMatch = response.content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        jsonString = jsonMatch[0]
      }
    }

    if (!jsonString) {
      return NextResponse.json(
        {
          success: false,
          error: "无法识别路书信息",
          rawResponse: response.content,
        },
        { status: 400 }
      )
    }

    let recognizedData
    try {
      recognizedData = JSON.parse(jsonString)
    } catch (parseError) {
      logger.error("JSON解析失败", { jsonString, parseError })
      return NextResponse.json(
        {
          success: false,
          error: "识别数据格式不正确",
          rawResponse: response.content,
        },
        { status: 400 }
      )
    }

    // 验证数据格式（增强容错）
    if (!Array.isArray(recognizedData.checkpoints) || recognizedData.checkpoints.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "未能识别到CP点信息，请手动输入",
          recognizedData,
        },
        { status: 400 }
      )
    }

    // 确保有赛道名称
    const trailName = recognizedData.name || "未命名赛道"

    // 确保CP点数量正确
    const actualCpCount = recognizedData.checkpoints.length
    const reportedCpCount = recognizedData.cpCount || actualCpCount

    // 如果报告的CP数量和实际不符，使用实际数量
    const cpCount = actualCpCount

    // 加载算法函数
    const {
      calculatePer100mElevation,
      calculateSlopePercent,
      calculateElevationFactor,
    } = await loadAlgorithms()

    // 添加默认的downhillDistance字段，并计算坡度相关字段
    const checkpoints = recognizedData.checkpoints.map((cp: RecognizedCheckpoint, index: number) => {
      const distance = Number(cp.distance) || 0
      const elevation = Number(cp.elevation) || 0
      const downhillDistance = Number(cp.downhillDistance) || 0

      // 计算坡度相关字段
      let per100mElevation = 0
      let slopePercent = 0
      let elevationFactor = 0

      if (distance > 0) {
        per100mElevation = calculatePer100mElevation(elevation, distance)
        slopePercent = calculateSlopePercent(elevation, distance)
        elevationFactor = calculateElevationFactor(per100mElevation)
      }

      return {
        id: index + 1,
        distance,
        elevation,
        downhillDistance,
        terrainType: ["沙地", "机耕道", "山路", "石铺路", "台阶"].includes(cp.terrainType)
          ? (cp.terrainType as RecognizedCheckpoint["terrainType"])
          : "山路",
        per100mElevation,
        slopePercent,
        elevationFactor,
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        name: trailName,
        cpCount: cpCount,
        checkpoints,
      },
    })
  } catch (error) {
    logger.error("识别路书失败", error)
    return NextResponse.json(
      { success: false, error: "识别路书失败" },
      { status: 500 }
    )
  }
}
