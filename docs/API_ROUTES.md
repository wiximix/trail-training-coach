# API 路由文档

本文档详细说明了越野训练教练 APP 的所有 API 接口。

**Base URL**: `/api`

**认证方式**: 所有受保护的接口都需要在请求头中携带 JWT Token

```bash
Authorization: Bearer {token}
```

**通用响应格式**：

成功响应：
```json
{
  "success": true,
  "data": {},
  "message": "操作成功"
}
```

失败响应：
```json
{
  "success": false,
  "error": "错误信息",
  "message": "错误描述"
}
```

---

## 目录

- [认证 API](#认证-api)
- [成员管理 API](#成员管理-api)
- [赛道管理 API](#赛道管理-api)
- [成绩预测 API](#成绩预测-api)
- [训练复盘 API](#训练复盘-api)
- [跑团管理 API](#跑团管理-api)
- [地形类型 API](#地形类型-api)
- [文件上传 API](#文件上传-api)

---

## 认证 API

### 1. 用户注册

**接口**: `POST /api/auth/register`

**描述**: 创建新用户账户

**请求体**:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "张三"
}
```

**字段说明**:
- `email` (string, required): 邮箱地址，需唯一
- `password` (string, required): 密码，最少 6 位
- `name` (string, required): 用户名

**响应**:
```json
{
  "success": true,
  "message": "注册成功",
  "data": {
    "user": {
      "id": "1",
      "email": "user@example.com",
      "name": "张三",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

---

### 2. 用户登录

**接口**: `POST /api/auth/login`

**描述**: 用户登录并获取 JWT Token

**请求体**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**字段说明**:
- `email` (string, required): 邮箱地址
- `password` (string, required): 密码

**响应**:
```json
{
  "success": true,
  "message": "登录成功",
  "data": {
    "user": {
      "id": "1",
      "email": "user@example.com",
      "name": "张三"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**错误响应** (401):
```json
{
  "success": false,
  "message": "邮箱或密码错误"
}
```

---

### 3. 忘记密码

**接口**: `POST /api/auth/forgot-password`

**描述**: 请求密码重置链接

**请求体**:
```json
{
  "email": "user@example.com"
}
```

**字段说明**:
- `email` (string, required): 邮箱地址

**响应**:
```json
{
  "success": true,
  "message": "密码重置邮件已发送"
}
```

---

### 4. 重置密码

**接口**: `POST /api/auth/reset-password`

**描述**: 使用重置 token 重置密码

**请求体**:
```json
{
  "token": "reset-token-here",
  "newPassword": "newPassword123"
}
```

**字段说明**:
- `token` (string, required): 密码重置 token
- `newPassword` (string, required): 新密码，最少 6 位

**响应**:
```json
{
  "success": true,
  "message": "密码重置成功"
}
```

---

## 成员管理 API

### 1. 获取成员列表

**接口**: `GET /api/members`

**描述**: 获取所有成员列表（支持分页）

**查询参数**:
- `skip` (number, optional): 跳过记录数，默认 0
- `limit` (number, optional): 返回记录数，默认 100

**请求示例**:
```
GET /api/members?skip=0&limit=10
```

**响应**:
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "张三",
      "age": 30,
      "weight": 70,
      "vo2Max": 45,
      "flatBaselinePace": 6.5,
      "marathonPace": "6:30/km",
      "crampFrequency": "从来没有",
      "expectedSweatRate": "有一点",
      "preferredSupplyTypes": ["能量胶", "电解质粉"]
    }
  ]
}
```

---

### 2. 获取单个成员

**接口**: `GET /api/members/{id}`

**描述**: 根据成员 ID 获取详细信息

**路径参数**:
- `id` (string, required): 成员 ID

**请求示例**:
```
GET /api/members/1
```

**响应**:
```json
{
  "success": true,
  "data": {
    "id": "1",
    "name": "张三",
    "age": 30,
    "weight": 70,
    "vo2Max": 45,
    "flatBaselinePace": 6.5,
    "marathonPace": "6:30/km",
    "crampFrequency": "从来没有",
    "expectedSweatRate": "有一点",
    "preferredSupplyTypes": ["能量胶", "电解质粉"],
    "heartRateZones": [
      {
        "zone": "Z1",
        "name": "轻松跑",
        "range": "110-130",
        "color": "#22c55e"
      }
    ]
  }
}
```

---

### 3. 创建成员

**接口**: `POST /api/members`

**描述**: 创建新成员

**请求体**:
```json
{
  "name": "李四",
  "age": 25,
  "weight": 65,
  "vo2Max": 50,
  "flatBaselinePace": 6.0,
  "marathonPace": "6:00/km",
  "crampFrequency": "很少",
  "expectedSweatRate": "中等",
  "preferredSupplyTypes": ["能量胶", "盐丸"]
}
```

**字段说明**:
- `name` (string, required): 姓名
- `age` (number, optional): 年龄
- `weight` (number, required): 体重（kg）
- `vo2Max` (number, required): 最大摄氧量
- `flatBaselinePace` (number, required): 平路基准配速（分钟/公里）
- `marathonPace` (string, optional): 马拉松配速
- `crampFrequency` (string, optional): 抽筋频率
- `expectedSweatRate` (string, optional): 预期出汗率
- `preferredSupplyTypes` (string[], optional): 偏好补给类型

**响应**:
```json
{
  "success": true,
  "data": {
    "id": "2",
    "name": "李四",
    "age": 25,
    "weight": 65,
    "vo2Max": 50,
    "flatBaselinePace": 6.0,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### 4. 更新成员

**接口**: `PUT /api/members/{id}`

**描述**: 更新成员信息

**路径参数**:
- `id` (string, required): 成员 ID

**请求体**: (同创建成员)

**请求示例**:
```
PUT /api/members/1
```

**响应**:
```json
{
  "success": true,
  "data": {
    "id": "1",
    "name": "张三",
    "age": 31,
    "weight": 68,
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### 5. 删除成员

**接口**: `DELETE /api/members/{id}`

**描述**: 删除成员

**路径参数**:
- `id` (string, required): 成员 ID

**请求示例**:
```
DELETE /api/members/1
```

**响应**:
```json
{
  "success": true,
  "message": "成员删除成功"
}
```

---

## 赛道管理 API

### 1. 获取赛道列表

**接口**: `GET /api/trails`

**描述**: 获取所有赛道列表（支持分页）

**查询参数**:
- `skip` (number, optional): 跳过记录数，默认 0
- `limit` (number, optional): 返回记录数，默认 100

**请求示例**:
```
GET /api/trails?skip=0&limit=10
```

**响应**:
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "北京越野50km",
      "description": "北京西山越野跑",
      "totalDistance": 50,
      "totalElevation": 2500,
      "image": "https://example.com/image.jpg",
      "checkpoints": [
        {
          "id": 1,
          "name": "CP1",
          "distance": 10,
          "elevation": 500,
          "downhillDistance": 2,
          "terrainType": "山地"
        }
      ]
    }
  ]
}
```

---

### 2. 获取单个赛道

**接口**: `GET /api/trails/{id}`

**描述**: 根据赛道 ID 获取详细信息

**路径参数**:
- `id` (string, required): 赛道 ID

**请求示例**:
```
GET /api/trails/1
```

**响应**: (同获取赛道列表单个对象)

---

### 3. 创建赛道

**接口**: `POST /api/trails`

**描述**: 创建新赛道

**请求体**:
```json
{
  "name": "天津越野30km",
  "description": "天津蓟州越野跑",
  "totalDistance": 30,
  "totalElevation": 1500,
  "image": "https://example.com/image.jpg",
  "checkpoints": [
    {
      "name": "CP1",
      "distance": 10,
      "elevation": 500,
      "downhillDistance": 2,
      "terrainType": "山地"
    }
  ]
}
```

**字段说明**:
- `name` (string, required): 赛道名称
- `description` (string, optional): 赛道描述
- `totalDistance` (number, required): 总距离（km）
- `totalElevation` (number, required): 总爬升（米）
- `image` (string, optional): 赛道图片 URL
- `checkpoints` (array, required): CP 点数组
  - `name` (string, required): CP 点名称
  - `distance` (number, required): 分段距离（km）
  - `elevation` (number, required): 分段爬升（米）
  - `downhillDistance` (number, optional): 下坡距离（km）
  - `terrainType` (string, optional): 地形类型

**响应**:
```json
{
  "success": true,
  "data": {
    "id": "2",
    "name": "天津越野30km",
    "totalDistance": 30,
    "totalElevation": 1500,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### 4. 更新赛道

**接口**: `PUT /api/trails/{id}`

**描述**: 更新赛道信息

**路径参数**:
- `id` (string, required): 赛道 ID

**请求体**: (同创建赛道)

**请求示例**:
```
PUT /api/trails/1
```

**响应**: (同创建赛道)

---

### 5. 删除赛道

**接口**: `DELETE /api/trails/{id}`

**描述**: 删除赛道

**路径参数**:
- `id` (string, required): 赛道 ID

**请求示例**:
```
DELETE /api/trails/1
```

**响应**:
```json
{
  "success": true,
  "message": "赛道删除成功"
}
```

---

## 成绩预测 API

### 1. 预测成绩和补给策略

**接口**: `POST /api/predict`

**描述**: 根据成员和赛道数据预测成绩，并生成补给策略

**请求体**:
```json
{
  "memberId": "1",
  "trailId": "1",
  "expectedSweatRate": "中等",
  "plannedPace": "630",
  "checkpointPaces": {
    "1": "600",
    "2": "630"
  },
  "customFlatBaselinePace": "600",
  "customElevationLossCoefficient": 0.8,
  "gelCarbs": 25,
  "saltElectrolytes": 200,
  "electrolytePowder": 300,
  "electrolytePowderCalories": 100,
  "electrolytePowderWater": 500
}
```

**字段说明**:
- `memberId` (string, required): 成员 ID
- `trailId` (string, required): 赛道 ID
- `expectedSweatRate` (string, optional): 预期出汗率（"从来没有", "有一点", "中等", "很多", "极多"）
- `plannedPace` (string, optional): 计划配速（MMSS 格式，如 "630" 表示 6分30秒）
- `checkpointPaces` (object, optional): 每个 CP 点的独立计划配速
  - key: CP 点 ID
  - value: 计划配速（MMSS 格式）
- `customFlatBaselinePace` (string, optional): 自定义平路基准配速 P0（MMSS 格式）
- `customElevationLossCoefficient` (number, optional): 自定义爬升损耗系数 k（秒/米）
- `gelCarbs` (number, optional): 能量胶碳水含量（g）
- `saltElectrolytes` (number, optional): 盐丸电解质含量（mg）
- `electrolytePowder` (number, optional): 电解质粉含量（mg）
- `electrolytePowderCalories` (number, optional): 电解质粉热量（kcal）
- `electrolytePowderWater` (number, optional): 电解质粉冲水量（ml）

**响应**:
```json
{
  "success": true,
  "data": {
    "estimatedTime": "5:30:00",
    "estimatedPace": "6:36/km",
    "flatBaselinePace": "6:00/km",
    "elevationLossCoefficient": 0.8,
    "checkpoints": [
      {
        "id": 1,
        "distance": 10,
        "elevation": 500,
        "downhillDistance": 2,
        "terrainType": "山地",
        "terrainPaceFactor": 1.2,
        "sectionTime": 72,
        "estimatedTime": "1:12:00",
        "supplyStrategy": "补给 1 个能量胶，250ml 水",
        "accumulatedDistance": 10,
        "sectionSupply": {
          "gels": 1,
          "gelCalories": 25,
          "electrolytePowder": 0,
          "electrolytePowderCalories": 0,
          "electrolytePowderWater": 0,
          "electrolytePowderElectrolytes": 0
        }
      }
    ],
    "overallSupplyStrategy": [
      "建议每 10-15 公里补给一次",
      "根据出汗率调整补水量",
      "注意补充电解质"
    ],
    "hourlyEnergyNeeds": {
      "carbs": 280,
      "water": 600,
      "electrolytes": 400
    },
    "supplyDosages": {
      "gelsPerHour": 1.5,
      "saltsPerHour": 1,
      "electrolytePowderPerHour": 0.5
    },
    "totalEnergyNeeds": {
      "carbs": 1400,
      "water": 3000,
      "electrolytes": 2000
    },
    "totalSupplyDosages": {
      "totalGels": 8,
      "totalSalts": 5,
      "totalElectrolytePowder": 3,
      "totalWater": 3000
    }
  }
}
```

**预测算法说明**:

采用公式：Ti = (Di × P0 + Ei × k) × α

其中：
- Ti：分段用时（分钟）
- Di：分段距离（公里）
- P0：平路基准配速（分钟/公里）
- Ei：分段爬升（米）
- k：爬升损耗系数（基于 VO2Max 计算，或使用自定义值）
- α：地形复杂度系数（从 terrain_types 表读取）

---

### 2. 路书识别

**接口**: `POST /api/recognize-route`

**描述**: 使用大语言模型识别路书图片，提取赛道数据

**请求体**:
```json
{
  "imageUrl": "https://example.com/route-book.jpg"
}
```

**字段说明**:
- `imageUrl` (string, required): 路书图片 URL

**响应**:
```json
{
  "success": true,
  "data": {
    "name": "北京越野50km",
    "description": "从北京西山公园出发，经过多个景点...",
    "totalDistance": 50,
    "totalElevation": 2500,
    "checkpoints": [
      {
        "name": "CP1",
        "distance": 10,
        "elevation": 500,
        "downhillDistance": 2,
        "terrainType": "山地"
      }
    ]
  }
}
```

---

## 训练复盘 API

### 1. 获取复盘列表

**接口**: `GET /api/reviews`

**描述**: 获取所有训练复盘记录（支持分页）

**查询参数**:
- `skip` (number, optional): 跳过记录数，默认 0
- `limit` (number, optional): 返回记录数，默认 100
- `memberId` (string, optional): 按成员 ID 过滤
- `trailId` (string, optional): 按赛道 ID 过滤

**请求示例**:
```
GET /api/reviews?skip=0&limit=10&memberId=1
```

**响应**:
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "memberId": "1",
      "memberName": "张三",
      "trailId": "1",
      "trailName": "北京越野50km",
      "actualTime": "5:45:00",
      "actualDistance": 50,
      "notes": "整体状态不错，后程略有疲劳",
      "snapshot": {
        "predictedTime": "5:30:00",
        "supplyStrategy": []
      },
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### 2. 获取单个复盘

**接口**: `GET /api/reviews/{id}`

**描述**: 根据复盘 ID 获取详细信息

**路径参数**:
- `id` (string, required): 复盘 ID

**请求示例**:
```
GET /api/reviews/1
```

**响应**: (同获取复盘列表单个对象)

---

### 3. 创建复盘

**接口**: `POST /api/reviews`

**描述**: 创建新的训练复盘记录

**请求体**:
```json
{
  "memberId": "1",
  "trailId": "1",
  "actualTime": "5:45:00",
  "actualDistance": 50,
  "notes": "整体状态不错，后程略有疲劳",
  "snapshot": {
    "predictedTime": "5:30:00",
    "supplyStrategy": [],
    "checkpoints": []
  }
}
```

**字段说明**:
- `memberId` (string, required): 成员 ID
- `trailId` (string, required): 赛道 ID
- `actualTime` (string, required): 实际用时
- `actualDistance` (number, required): 实际距离（km）
- `notes` (string, optional): 复盘笔记
- `snapshot` (object, required): 预测快照数据

**响应**:
```json
{
  "success": true,
  "data": {
    "id": "1",
    "memberId": "1",
    "trailId": "1",
    "actualTime": "5:45:00",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### 4. 更新复盘

**接口**: `PUT /api/reviews/{id}`

**描述**: 更新复盘记录

**路径参数**:
- `id` (string, required): 复盘 ID

**请求体**: (同创建复盘)

**请求示例**:
```
PUT /api/reviews/1
```

**响应**: (同创建复盘)

---

### 5. 删除复盘

**接口**: `DELETE /api/reviews/{id}`

**描述**: 删除复盘记录

**路径参数**:
- `id` (string, required): 复盘 ID

**请求示例**:
```
DELETE /api/reviews/1
```

**响应**:
```json
{
  "success": true,
  "message": "复盘删除成功"
}
```

---

## 跑团管理 API

### 1. 获取跑团列表

**接口**: `GET /api/teams`

**描述**: 获取所有跑团列表（支持分页）

**查询参数**:
- `skip` (number, optional): 跳过记录数，默认 0
- `limit` (number, optional): 返回记录数，默认 100

**请求示例**:
```
GET /api/teams?skip=0&limit=10
```

**响应**:
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "北京越野跑团",
      "description": "热爱越野跑的团队",
      "ownerId": "1",
      "ownerName": "张三",
      "memberCount": 15,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### 2. 获取单个跑团

**接口**: `GET /api/teams/{id}`

**描述**: 根据跑团 ID 获取详细信息

**路径参数**:
- `id` (string, required): 跑团 ID

**请求示例**:
```
GET /api/teams/1
```

**响应**:
```json
{
  "success": true,
  "data": {
    "id": "1",
    "name": "北京越野跑团",
    "description": "热爱越野跑的团队",
    "ownerId": "1",
    "ownerName": "张三",
    "members": [
      {
        "userId": "2",
        "userName": "李四",
        "role": "Admin"
      }
    ],
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### 3. 创建跑团

**接口**: `POST /api/teams`

**描述**: 创建新跑团

**请求体**:
```json
{
  "name": "天津越野跑团",
  "description": "天津地区越野跑爱好者"
}
```

**字段说明**:
- `name` (string, required): 跑团名称
- `description` (string, optional): 跑团描述

**响应**:
```json
{
  "success": true,
  "data": {
    "id": "2",
    "name": "天津越野跑团",
    "description": "天津地区越野跑爱好者",
    "ownerId": "1",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### 4. 更新跑团

**接口**: `PUT /api/teams/{id}`

**描述**: 更新跑团信息（仅 Owner 和 Admin）

**路径参数**:
- `id` (string, required): 跑团 ID

**请求体**: (同创建跑团)

**请求示例**:
```
PUT /api/teams/1
```

**响应**: (同创建跑团)

---

### 5. 删除跑团

**接口**: `DELETE /api/teams/{id}`

**描述**: 删除跑团（仅 Owner）

**路径参数**:
- `id` (string, required): 跑团 ID

**请求示例**:
```
DELETE /api/teams/1
```

**响应**:
```json
{
  "success": true,
  "message": "跑团删除成功"
}
```

---

### 6. 获取我的跑团

**接口**: `GET /api/teams/my`

**描述**: 获取当前用户加入的所有跑团

**响应**:
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "北京越野跑团",
      "role": "Member",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### 7. 加入跑团

**接口**: `POST /api/teams/{id}/members`

**描述**: 申请加入跑团

**路径参数**:
- `id` (string, required): 跑团 ID

**请求示例**:
```
POST /api/teams/1/members
```

**响应**:
```json
{
  "success": true,
  "message": "已提交加入申请"
}
```

---

### 8. 审批加入申请

**接口**: `POST /api/teams/{teamId}/members/{userId}/approve`

**描述**: 审批用户加入跑团申请（仅 Owner 和 Admin）

**路径参数**:
- `teamId` (string, required): 跑团 ID
- `userId` (string, required): 用户 ID

**请求示例**:
```
POST /api/teams/1/members/2/approve
```

**响应**:
```json
{
  "success": true,
  "message": "用户已加入跑团"
}
```

---

### 9. 拒绝加入申请

**接口**: `POST /api/teams/{teamId}/members/{userId}/reject`

**描述**: 拒绝用户加入跑团申请（仅 Owner 和 Admin）

**路径参数**:
- `teamId` (string, required): 跑团 ID
- `userId` (string, required): 用户 ID

**请求示例**:
```
POST /api/teams/1/members/2/reject
```

**响应**:
```json
{
  "success": true,
  "message": "已拒绝加入申请"
}
```

---

### 10. 离开跑团

**接口**: `POST /api/teams/{id}/leave`

**描述**: 离开跑团

**路径参数**:
- `id` (string, required): 跑团 ID

**请求示例**:
```
POST /api/teams/1/leave
```

**响应**:
```json
{
  "success": true,
  "message": "已离开跑团"
}
```

---

### 11. 移除成员

**接口**: `DELETE /api/teams/{teamId}/members/{userId}`

**描述**: 从跑团中移除成员（仅 Owner 和 Admin）

**路径参数**:
- `teamId` (string, required): 跑团 ID
- `userId` (string, required): 用户 ID

**请求示例**:
```
DELETE /api/teams/1/members/2
```

**响应**:
```json
{
  "success": true,
  "message": "成员已移除"
}
```

---

### 12. 更新成员角色

**接口**: `PUT /api/teams/{teamId}/members/{userId}`

**描述**: 更新跑团成员角色（仅 Owner）

**路径参数**:
- `teamId` (string, required): 跑团 ID
- `userId` (string, required): 用户 ID

**请求体**:
```json
{
  "role": "Admin"
}
```

**字段说明**:
- `role` (string, required): 角色（"Owner", "Admin", "Member"）

**请求示例**:
```
PUT /api/teams/1/members/2
```

**响应**:
```json
{
  "success": true,
  "data": {
    "userId": "2",
    "role": "Admin"
  }
}
```

---

## 地形类型 API

### 1. 获取地形类型列表

**接口**: `GET /api/terrain-types`

**描述**: 获取所有地形类型配置

**查询参数**:
- `skip` (number, optional): 跳过记录数，默认 0
- `limit` (number, optional): 返回记录数，默认 100
- `isActive` (boolean, optional): 是否只显示启用的地形类型

**请求示例**:
```
GET /api/terrain-types?isActive=true
```

**响应**:
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "平地",
      "description": "平坦路面",
      "paceFactor": 1.0,
      "isActive": true
    },
    {
      "id": "2",
      "name": "山地",
      "description": "山地越野",
      "paceFactor": 1.2,
      "isActive": true
    }
  ]
}
```

---

### 2. 获取单个地形类型

**接口**: `GET /api/terrain-types/{id}`

**描述**: 根据地形类型 ID 获取详细信息

**路径参数**:
- `id` (string, required): 地形类型 ID

**请求示例**:
```
GET /api/terrain-types/1
```

**响应**: (同获取地形类型列表单个对象)

---

### 3. 创建地形类型

**接口**: `POST /api/terrain-types`

**描述**: 创建新地形类型

**请求体**:
```json
{
  "name": "沼泽",
  "description": "沼泽湿地",
  "paceFactor": 1.5,
  "isActive": true
}
```

**字段说明**:
- `name` (string, required): 地形类型名称
- `description` (string, optional): 地形类型描述
- `paceFactor` (number, required): 配速系数（影响用时计算）
- `isActive` (boolean, required): 是否启用

**响应**:
```json
{
  "success": true,
  "data": {
    "id": "3",
    "name": "沼泽",
    "paceFactor": 1.5,
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### 4. 更新地形类型

**接口**: `PUT /api/terrain-types/{id}`

**描述**: 更新地形类型

**路径参数**:
- `id` (string, required): 地形类型 ID

**请求体**: (同创建地形类型)

**请求示例**:
```
PUT /api/terrain-types/1
```

**响应**: (同创建地形类型)

---

### 5. 删除地形类型

**接口**: `DELETE /api/terrain-types/{id}`

**描述**: 删除地形类型

**路径参数**:
- `id` (string, required): 地形类型 ID

**请求示例**:
```
DELETE /api/terrain-types/1
```

**响应**:
```json
{
  "success": true,
  "message": "地形类型删除成功"
}
```

---

## 文件上传 API

### 1. 上传文件

**接口**: `POST /api/upload`

**描述**: 上传文件到对象存储

**请求体**: `multipart/form-data`

**请求示例**:
```bash
curl -X POST http://localhost:5000/api/upload \
  -H "Authorization: Bearer {token}" \
  -F "file=@image.jpg"
```

**字段说明**:
- `file` (file, required): 要上传的文件

**响应**:
```json
{
  "success": true,
  "data": {
    "url": "https://s3.example.com/bucket/abc123.jpg",
    "filename": "abc123.jpg",
    "size": 123456
  }
}
```

**错误响应** (400):
```json
{
  "success": false,
  "error": "未找到上传文件"
}
```

**错误响应** (500):
```json
{
  "success": false,
  "error": "文件上传失败"
}
```

---

## 错误代码

所有 API 可能返回的 HTTP 状态码：

- `200 OK`: 请求成功
- `201 Created`: 资源创建成功
- `400 Bad Request`: 请求参数错误
- `401 Unauthorized`: 未认证或认证失败
- `403 Forbidden`: 无权限访问
- `404 Not Found`: 资源不存在
- `500 Internal Server Error`: 服务器内部错误

---

## 数据验证

所有 API 都会验证输入数据的格式和有效性：

- 必填字段不能为空
- 邮箱格式必须正确
- 密码最少 6 位
- 数值类型字段必须在合理范围内
- 日期时间格式必须符合 ISO 8601 标准

如果验证失败，API 会返回 `400 Bad Request` 状态码和详细的错误信息。

---

## 速率限制

为了保护服务器稳定性，API 实施了速率限制：

- 每个用户每分钟最多 60 次请求
- 超出限制将返回 `429 Too Many Requests`

---

## WebSocket (未来功能)

计划在未来版本中引入 WebSocket 支持，用于实时数据推送：

- 实时成绩预测更新
- 训练数据同步
- 跑团消息通知

---

## 更新日志

- **v1.0.0** (2024-01-01): 初始版本，包含所有核心 API
- **v1.1.0** (2024-01-15): 添加地形类型 API 和路书识别功能
- **v1.2.0** (2024-01-16): 优化预测算法，支持自定义参数

---

## 技术支持

如有任何问题或建议，请通过以下方式联系：

- GitHub Issues: [提交问题](https://github.com/wiximix/trail-training-coach/issues)
- 邮箱: support@example.com
