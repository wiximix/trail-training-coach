# 越野训练教练APP (Trail Training Coach)

一个功能完善的越野跑训练教练系统，帮助跑团和个人越野跑爱好者进行科学训练、成绩预测、数据分析及跑团管理。

## 功能特性

### 核心功能

- **成员数据管理**
  - 成员档案管理，包括基本信息、运动数据、心率区间等
  - 支持最大摄氧量(VO2Max)和平路基准配速(P0)记录
  - 实时数据更新和历史记录追踪

- **赛道数据管理**
  - 赛道信息录入与管理
  - 支持路书图片识别，自动提取赛道数据（距离、爬升、下坡等）
  - 分段管理和CP点设置
  - 赛道缩略图预览与放大查看

- **成绩预测与补给策略**
  - 基于储备心率(HRR)动态计算5个训练强度区间
  - 采用先进算法预测完赛时间：Ti = (Di × P0 + Ei × k) × α
  - 支持自定义平路基准配速和爬升损耗系数
  - 实时计算分段用时和预计完成时间
  - 能量需求计算（基于体重：体重 × 4Kcal/小时）
  - 智能补给策略推荐

- **训练复盘**
  - 完整的复盘记录系统
  - 快照模式保存预测时的完整数据
  - 支持训练成果分析与对比

- **跑团管理**
  - 跑团创建与加入
  - 角色权限模型：Owner（创建者）、Admin（管理员）、Member（成员）
  - 申请审批流程
  - 跑团成员管理

### 用户体验

- 暗色/亮色主题切换，支持系统偏好自动检测
- 响应式设计，适配多种设备
- 直观的侧边栏导航和参数设置
- 实时数据计算与反馈

## 技术栈

### 前端框架
- **Next.js 16** (App Router) - React 全栈框架
- **React 19** - UI 库
- **TypeScript 5** - 类型安全

### 样式与UI
- **Tailwind CSS 4** - 原子化 CSS 框架
- **shadcn/ui** - 高质量 React 组件库
- **Lucide React** - 图标库
- **Recharts** - 数据可视化

### 后端与数据库
- **Next.js API Routes** - 服务端 API
- **PostgreSQL** - 关系型数据库
- **Drizzle ORM** - 类型安全的 ORM

### 认证与安全
- **bcryptjs** - 密码哈希加密
- **jose** - JWT token 生成与验证
- **Next.js Middleware** - 路由保护

### 数据处理
- **Zod** - 数据验证
- **React Hook Form** - 表单管理
- **date-fns** - 日期处理

### 集成服务
- **Coze Coding SDK** - 对象存储(S3)和大语言模型(LLM)
- **AWS S3 SDK** - 对象存储客户端

## 快速开始

### 前置要求

- Node.js 20+
- PostgreSQL 数据库
- pnpm 包管理器

### 安装步骤

1. **克隆仓库**
```bash
git clone https://github.com/wiximix/trail-training-coach.git
cd trail-training-coach
```

2. **安装依赖**
```bash
pnpm install
```

3. **配置环境变量**

复制环境变量模板并配置：
```bash
cp .env.example .env
```

编辑 `.env` 文件，配置以下变量：
```env
# 数据库配置
DATABASE_URL=postgresql://user:password@localhost:5432/trail_training_coach

# JWT 密钥（生产环境必须使用强密钥）
JWT_SECRET=your-secret-key-here

# 对象存储配置（可选）
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=
S3_REGION=
S3_BUCKET=

# 域名配置
NEXT_PUBLIC_DOMAIN=your-domain.com
NEXT_PUBLIC_URL=https://your-domain.com
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

4. **初始化数据库**

运行数据库迁移：
```bash
pnpm db:push
```

或使用迁移文件：
```bash
pnpm db:migrate
```

5. **启动开发服务器**
```bash
pnpm dev
```

访问 `http://localhost:5000` 即可使用应用。

## 项目结构

```
trail-training-coach/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API 路由
│   │   │   ├── auth/          # 认证相关 API
│   │   │   ├── members/       # 成员管理 API
│   │   │   ├── trails/        # 赛道管理 API
│   │   │   ├── predict/       # 成绩预测 API
│   │   │   ├── reviews/       # 训练复盘 API
│   │   │   ├── teams/         # 跑团管理 API
│   │   │   └── upload/        # 文件上传 API
│   │   ├── auth/              # 认证页面
│   │   ├── members/           # 成员管理页面
│   │   ├── trails/            # 赛道管理页面
│   │   ├── predict/           # 成绩预测页面
│   │   ├── reviews/           # 训练复盘页面
│   │   ├── teams/             # 跑团管理页面
│   │   ├── settings/          # 设置页面
│   │   ├── layout.tsx         # 根布局
│   │   └── globals.css        # 全局样式
│   ├── components/            # React 组件
│   │   ├── features/          # 功能组件
│   │   │   ├── auth/          # 认证组件
│   │   │   ├── layout/        # 布局组件
│   │   │   └── theme/         # 主题组件
│   │   └── ui/                # 基础 UI 组件
│   ├── config/                # 配置文件
│   │   ├── navigation.ts      # 导航配置
│   │   ├── constants.ts       # 常量定义
│   │   └── theme.ts           # 主题配置
│   ├── hooks/                 # 自定义 Hooks
│   │   ├── useAuth.ts         # 认证 Hook
│   │   ├── useMembers.ts      # 成员 Hook
│   │   ├── useTrails.ts       # 赛道 Hook
│   │   ├── usePrediction.ts   # 预测 Hook
│   │   └── useTeams.ts        # 跑团 Hook
│   ├── services/              # API 服务
│   │   ├── apiClient.ts       # API 客户端
│   │   ├── authService.ts     # 认证服务
│   │   ├── memberService.ts   # 成员服务
│   │   ├── trailService.ts     # 赛道服务
│   │   └── ...                # 其他服务
│   ├── storage/               # 数据存储
│   │   └── database/          # 数据库管理
│   │       ├── userManager.ts
│   │       ├── memberManager.ts
│   │       ├── trailManager.ts
│   │       └── ...            # 其他 Manager
│   ├── types/                 # TypeScript 类型定义
│   │   ├── auth.ts
│   │   ├── api.ts
│   │   └── models.ts
│   └── lib/                   # 工具函数
│       ├── utils.ts
│       ├── heartRate.ts       # 心率计算
│       └── trailAlgorithm.ts  # 赛道算法
├── drizzle/                   # Drizzle 迁移文件
├── public/                    # 静态资源
├── .env.example               # 环境变量模板
├── .coze                      # Coze 配置
├── package.json
└── tsconfig.json
```

## 开发指南

### 代码规范

- 使用 TypeScript 编写所有代码
- 遵循 ESLint 规则
- 组件采用函数式组件
- 使用自定义 Hooks 封装业务逻辑
- API 请求统一使用 services 层封装

### 数据库操作

使用 Drizzle ORM 进行数据库操作：

```typescript
// 示例：创建新成员
import { memberManager } from '@/storage/database';

const newMember = await memberManager.create({
  name: '张三',
  age: 30,
  weight: 70,
  vo2Max: 45,
  flatBaselinePace: 6.5, // 分钟/公里
});
```

### API 路由开发

所有 API 路由位于 `src/app/api` 目录下：

```typescript
// 示例：GET /api/members
import { NextRequest, NextResponse } from 'next/server';
import { memberManager } from '@/storage/database';

export async function GET() {
  const members = await memberManager.getAll();
  return NextResponse.json({ data: members });
}
```

### 组件开发

使用 shadcn/ui 组件库：

```typescript
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function MyComponent() {
  return (
    <div>
      <Input placeholder="输入内容" />
      <Button>提交</Button>
    </div>
  );
}
```

## 数据库架构

主要数据表：

- **users** - 用户账户
- **members** - 成员档案
- **trails** - 赛道信息
- **trail_segments** - 赛道分段
- **reviews** - 训练复盘记录
- **teams** - 跑团
- **team_members** - 跑团成员关系
- **terrain_types** - 地形类型配置

详细的数据库架构和字段说明，请参考 `drizzle/schema.ts`。

## 核心算法

### 心率区间计算

基于储备心率(HRR)计算5个训练强度区间：

- Z1（轻松跑）：60-70% HRR
- Z2（有氧耐力）：70-80% HRR
- Z3（乳酸阈值）：80-90% HRR
- Z4（无氧耐力）：90-95% HRR
- Z5（最大摄氧量）：95-100% HRR

### 成绩预测算法

采用公式：Ti = (Di × P0 + Ei × k) × α

其中：
- Ti：分段用时（分钟）
- Di：分段距离（公里）
- P0：平路基准配速（分钟/公里）
- Ei：分段爬升（米）
- k：爬升损耗系数（基于 VO2Max 计算）
- α：地形复杂度系数（从 terrain_types 表读取）

详细的算法实现请参考 `src/lib/trailAlgorithm.ts`。

## API 文档

详细的 API 路由文档请参考 [API_ROUTES.md](./API_ROUTES.md)。

主要 API 分类：

- 认证 API：`/api/auth/*`
- 成员管理：`/api/members/*`
- 赛道管理：`/api/trails/*`
- 成绩预测：`/api/predict`
- 训练复盘：`/api/reviews/*`
- 跑团管理：`/api/teams/*`
- 文件上传：`/api/upload`

## 部署

详细的部署指南请参考 [DEPLOYMENT.md](./DEPLOYMENT.md)。

### 生产环境构建

```bash
# 构建生产版本
pnpm build

# 启动生产服务器
pnpm start
```

### 使用 Coze CLI

```bash
# 开发环境
coze dev

# 构建
coze build

# 启动生产环境
coze start
```

## 常见问题

### 数据库连接失败

检查 `DATABASE_URL` 是否正确配置，确保 PostgreSQL 服务正在运行。

### JWT 验证失败

确保 `JWT_SECRET` 在前后端配置一致，并且 token 未过期。

### 文件上传失败

检查对象存储配置是否正确，确保存储桶存在且有读写权限。

## 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'feat: Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

提交信息请遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范。

## 许可证

本项目采用 MIT 许可证。

## 联系方式

如有问题或建议，请通过以下方式联系：

- GitHub Issues：[提交问题](https://github.com/wiximix/trail-training-coach/issues)
- 邮箱：wix.wang@outlook.com

## 致谢

感谢所有为本项目做出贡献的开发者！

---

**注意**：本项目仅供学习和交流使用，请勿用于商业目的。
