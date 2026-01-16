# 项目目录结构重构总结

## 重构完成时间
2025-01-XX

## 重构概述
本次重构主要针对项目目录结构进行了全面优化，按照最佳实践重新组织代码，提升可维护性、可扩展性和团队协作效率。

## 新增目录结构

### 1. `/src/components/ui/`
- **用途**: 存放 shadcn/ui 基础组件
- **说明**: shadcn/ui 组件已预装在项目中，本目录用于统一管理
- **文件**:
  - `README.md` - 使用说明文档

### 2. `/src/components/features/`
- **用途**: 按业务功能组织组件
- **子目录**:
  - `/auth/` - 认证相关组件（AuthGuard）
  - `/layout/` - 布局相关组件（DashboardLayout）
  - `/theme/` - 主题相关组件（ThemeToggle）

### 3. `/src/types/`
- **用途**: 集中管理所有类型定义
- **文件**:
  - `auth.ts` - 认证相关类型（AuthUser, LoginRequest等）
  - `api.ts` - API通用类型（ApiResponse, ApiError等）
  - `models.ts` - 业务模型类型（Member, Trail, PredictionResult等）
  - `index.ts` - 统一导出所有类型

### 4. `/src/services/`
- **用途**: API 客户端封装，提供统一的接口调用方式
- **文件**:
  - `apiClient.ts` - 基础API客户端（封装fetch、错误处理）
  - `authService.ts` - 认证服务
  - `memberService.ts` - 成员管理服务
  - `trailService.ts` - 赛道管理服务
  - `teamService.ts` - 跑团管理服务
  - `predictionService.ts` - 预测服务
  - `reviewService.ts` - 复盘服务
  - `terrainTypeService.ts` - 地形类型服务
  - `index.ts` - 统一导出所有服务

**主要特性**:
- 统一的请求封装和错误处理
- 自动添加 Authorization token
- 类型安全的 API 调用
- 支持文件上传

### 5. `/src/hooks/`
- **用途**: 自定义 React Hooks，封装通用逻辑
- **文件**:
  - `useMembers.ts` - 成员管理相关Hooks
  - `useTrails.ts` - 赛道管理相关Hooks
  - `useTeams.ts` - 跑团管理相关Hooks
  - `useAuth.ts` - 认证相关Hooks
  - `usePrediction.ts` - 预测相关Hooks
  - `useLocalStorage.ts` - localStorage操作Hook
  - `index.ts` - 统一导出所有Hooks

**主要特性**:
- 自动管理加载状态
- 统一错误处理
- 提供增删改查操作
- 支持分页参数

### 6. `/src/config/`
- **用途**: 集中管理配置文件
- **文件**:
  - `navigation.ts` - 导航配置（导航项、受保护路径等）
  - `constants.ts` - 应用常量（API配置、补给类型、跑团角色等）
  - `theme.ts` - 主题配置（主题类型、系统主题检测等）
  - `index.ts` - 统一导出所有配置

## 重构内容详细说明

### 组件重组
将原有组件按功能分类移至 `components/features/` 目录：
- `AuthGuard.tsx` → `components/features/auth/`
- `DashboardLayout.tsx` → `components/features/layout/`
- `ThemeToggle.tsx` → `components/features/theme/`

**更新的文件数量**: 11个页面组件
**更新的导入路径**: 从 `@/components/*` 改为 `@/components/features/*`

### 类型定义集中
从各个分散的文件中抽取类型定义到 `types/` 目录：
- 从 `lib/auth.ts` 抽取认证类型
- 从页面组件抽取业务模型类型
- 从 schema.ts 重新导出数据库类型

**收益**:
- 类型定义统一管理，便于维护
- 避免类型定义重复
- 改善代码可读性

### API 客户端封装
创建统一的 API 客户端，替代原有的直接 fetch 调用：
- 自动处理 token 添加
- 统一错误处理
- 类型安全的请求和响应
- 支持文件上传

**收益**:
- 减少重复代码
- 统一请求格式
- 便于后续添加拦截器、缓存等功能

### 自定义 Hooks
封装常用的业务逻辑为自定义 Hooks：
- `useMembers` - 提供成员列表的增删改查
- `useTrails` - 提供赛道列表的增删改查
- `useTeams` - 提供跑团列表的增删改查
- `useAuth` - 提供认证状态管理
- `usePrediction` - 提供预测功能
- `useLocalStorage` - 提供localStorage操作

**收益**:
- 逻辑复用
- 减少组件复杂度
- 统一状态管理

### 配置集中管理
将分散在代码中的配置集中到 `config/` 目录：
- 导航配置（路由、受保护路径）
- 常量配置（补给类型、抽筋情况、跑团角色等）
- 主题配置

**收益**:
- 配置统一管理
- 便于修改和维护
- 避免硬编码

## 验证结果

### TypeScript 编译检查
✅ 通过 - `npx tsc --noEmit` 无错误

### 修复的问题
1. **ApiError 类型问题**: 将 ApiError 从 `import type` 改为普通导入
2. **HeadersInit 类型问题**: 将 headers 类型从 `HeadersInit` 改为 `Record<string, string>`
3. **类型导出缺失**: 在 `types/models.ts` 中添加缺失的 Insert 和 Update 类型导出
4. **导入路径更新**: 更新所有组件的导入路径

## 使用示例

### 使用服务层
```tsx
// 引入服务
import { getMembers, createMember } from "@/services"

// 获取成员列表
const response = await getMembers({ skip: 0, limit: 20 })
if (response.success) {
  console.log(response.data)
}

// 创建成员
const newMember = await createMember({
  name: "张三",
  gender: "男",
  weight: 70
})
```

### 使用自定义 Hooks
```tsx
import { useMembers } from "@/hooks"

function MemberList() {
  const { members, loading, error, addMember } = useMembers()

  if (loading) return <div>加载中...</div>
  if (error) return <div>{error}</div>

  return (
    <div>
      {members.map(member => (
        <div key={member.id}>{member.name}</div>
      ))}
    </div>
  )
}
```

### 使用类型
```tsx
import type { Member, PredictionResult } from "@/types"
import type { AuthUser, LoginRequest } from "@/types"
```

### 使用配置
```tsx
import { NAV_ITEMS, PROTECTED_PATHS } from "@/config/navigation"
import { SUPPLY_TYPES, TEAM_ROLES } from "@/config/constants"
```

## 后续优化建议

### 高优先级
1. **添加单元测试**: 为 services 和 hooks 添加测试覆盖
2. **性能优化**: 添加请求缓存、防抖、节流等优化
3. **错误边界**: 添加 React Error Boundary 组件

### 中优先级
1. **组件库完善**: 创建更多可复用的业务组件
2. **表单验证**: 统一表单验证逻辑
3. **状态管理**: 考虑引入 Zustand 或 Jotai 进行全局状态管理

### 低优先级
1. **文档完善**: 为每个模块添加详细文档
2. **国际化**: 添加 i18n 支持
3. **性能监控**: 添加性能监控和日志上报

## 迁移指南

### 对于开发者
1. **导入路径变化**:
   - 组件: `@/components/*` → `@/components/features/*`
   - 类型: 从页面组件中抽取到 `@/types`
   - 服务: 直接使用 `@/services` 中的服务方法
   - Hooks: 使用 `@/hooks` 中的自定义 Hooks

2. **新增功能**:
   - 优先使用 services 层进行 API 调用
   - 优先使用自定义 Hooks 封装业务逻辑
   - 类型定义从 `@/types` 导入

3. **配置修改**:
   - 修改路由配置: 编辑 `src/config/navigation.ts`
   - 修改常量配置: 编辑 `src/config/constants.ts`

### 代码审查要点
1. 检查是否使用了正确的导入路径
2. 确保类型定义从 `@/types` 导入
3. 优先使用 services 和 hooks，避免直接 fetch
4. 遵循新的目录结构规范

## 总结

本次重构成功实现了以下目标：
✅ 建立清晰的目录结构
✅ 提升代码可维护性和可扩展性
✅ 减少代码重复，提高复用性
✅ 统一开发模式和规范
✅ 通过 TypeScript 编译检查

项目现在具有更好的架构基础，为后续功能开发和团队协作提供了有力支持。
