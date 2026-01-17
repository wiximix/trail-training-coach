# 表单组件

本目录包含项目中的表单组件，封装常用的表单输入逻辑和验证。

## 目录结构

```
components/forms/
├── README.md           # 本文档
├── MemberForm.tsx      # 成员表单组件
├── TrailForm.tsx       # 赛道表单组件
├── TeamForm.tsx        # 跑团表单组件
├── LoginForm.tsx       # 登录表单组件
├── RegisterForm.tsx    # 注册表单组件
└── index.ts            # 统一导出
```

## 使用示例

```tsx
import { MemberForm } from '@/components/forms'

<MemberForm
  onSubmit={handleSubmit}
  initialData={member}
  mode="edit"
/>
```

## 表单组件特性

- **统一样式**: 所有表单组件使用统一的样式规范
- **表单验证**: 集成 Zod 进行表单验证
- **错误处理**: 统一的错误提示机制
- **响应式设计**: 支持移动端和桌面端
- **深色模式**: 完整支持深色模式
