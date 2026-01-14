# UI 组件目录

本目录用于存放 **shadcn/ui** 基础组件。

## 说明

本项目使用 Next.js + shadcn/ui 技术栈，shadcn/ui 组件库已预装在项目中。

## 已安装的组件

shadcn/ui 组件默认安装在项目根目录的 `src/components/ui/` 目录下。

## 添加新组件

使用以下命令添加新的 shadcn/ui 组件：

```bash
npx shadcn@latest add <component-name>
```

例如：
```bash
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add card
```

## 组件使用

在代码中导入组件：

```tsx
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
```

## 文档

更多组件信息请参考：https://ui.shadcn.com
