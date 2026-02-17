# 测试框架使用指南

## 概述

本项目使用 Vitest 作为测试框架，配合 @testing-library/react 进行 React 组件测试。

## 可用测试命令

```bash
# 运行测试（监听模式，文件变化时自动重新运行）
npm run test

# 运行测试（一次性执行）
npm run test:run

# 运行测试并生成覆盖率报告
npm run test:coverage

# 运行测试 UI 界面
npm run test:ui
```

## 测试配置文件

### vitest.config.ts
主配置文件，包含：
- 测试环境设置（jsdom）
- 测试设置文件路径
- 覆盖率报告配置
- 路径别名配置（@/*）

### vitest.setup.ts
测试环境设置文件，包含：
- @testing-library/jest-dom 配置
- 自动清理（cleanup）
- Next.js 路由模拟
- 浏览器 API 模拟（matchMedia、IntersectionObserver 等）

## 测试文件结构

测试文件应放在 `src/__tests__` 目录下，或者与被测试文件同级，使用 `.test.ts` 或 `.test.tsx` 后缀。

示例：
```
src/
  components/
    Button.tsx
    Button.test.tsx
  utils/
    format.test.ts
  __tests__/
    example.test.tsx
```

## 编写测试用例

### 基本测试示例

```typescript
import { describe, it, expect } from 'vitest';

describe('示例测试套件', () => {
  it('基本断言', () => {
    expect(1 + 1).toBe(2);
  });
});
```

### React 组件测试示例

```typescript
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Button from '@/components/Button';

describe('Button 组件', () => {
  it('渲染按钮文本', () => {
    render(<Button>点击我</Button>);
    expect(screen.getByText('点击我')).toBeInTheDocument();
  });

  it('响应点击事件', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>点击我</Button>);
    screen.getByText('点击我').click();
    expect(handleClick).toHaveBeenCalledOnce();
  });
});
```

## 测试覆盖率目标

- 语句覆盖率（Statements）：80%
- 分支覆盖率（Branches）：80%
- 函数覆盖率（Functions）：80%
- 行覆盖率（Lines）：80%

覆盖率报告会生成在 `coverage/` 目录下。

## 常用断言方法

### 基本断言
- `toBe(value)` - 严格相等
- `toEqual(value)` - 深度相等
- `toContain(item)` - 包含
- `toHaveLength(number)` - 数组长度

### DOM 断言（@testing-library/jest-dom）
- `toBeInTheDocument()` - 元素存在
- `toHaveTextContent(text)` - 包含文本
- `toHaveAttribute(name, value)` - 包含属性
- `toBeDisabled()` - 元素禁用
- `toBeVisible()` - 元素可见

## 模拟（Mocking）

### 函数模拟
```typescript
const mockFn = vi.fn();
mockFn('arg');
expect(mockFn).toHaveBeenCalledWith('arg');
```

### 模块模拟
```typescript
vi.mock('@/utils/api', () => ({
  fetchUser: vi.fn(() => ({ id: 1, name: 'Test' })),
}));
```

## 注意事项

1. 测试文件应以 `.test.ts` 或 `.test.tsx` 结尾
2. 使用描述性的测试名称，清楚表达测试目的
3. 每个测试应该独立，不依赖于其他测试
4. 优先测试用户行为和功能，而非实现细节
5. 保持测试简单明了，易于维护
