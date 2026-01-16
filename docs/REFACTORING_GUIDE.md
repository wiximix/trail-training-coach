# 越野跑成绩预测APP - 核心算法抽离重构文档

## 一、重构概述

### 1.1 重构目标
将分散在业务代码中的核心算法抽离为独立模块，提高代码复用性、可维护性和可测试性。

### 1.2 重构范围
- **坡度计算算法**：每100米爬升量、坡度百分比计算
- **爬升影响值算法**：基于坡度的分级影响值计算
- **配速计算算法**：越野赛配速计算（考虑爬升、路段类型）
- **时间格式化算法**：分钟数转换为时间字符串
- **补给策略算法**：能量需求、补给份数、补给策略生成

### 1.3 文件结构
```
src/
├── lib/
│   ├── trailAlgorithm.ts          # 核心算法模块（新增）
│   └── __tests__/
│       ├── trailAlgorithm.test.ts  # 单元测试（新增）
│       └── verify.ts               # 验证脚本（新增）
├── app/
│   ├── api/
│   │   └── predict/
│   │       └── route.ts            # 预测API（已重构）
│   └── trails/
│       └── [id]/
│           └── edit/
│               └── page.tsx        # 赛道编辑页面（已重构）
```

---

## 二、核心算法模块说明

### 2.1 模块文件：`src/lib/trailAlgorithm.ts`

#### 2.1.1 导出的算法函数
```typescript
// 坡度计算相关
export function calculatePer100mElevation(segmentElevation: number, segmentDistance: number): number
export function calculateSlopePercent(segmentElevation: number, segmentDistance: number): number

// 爬升影响值计算
export function calculateElevationFactor(per100mElevation: number): number

// 配速计算相关
export function parsePace(paceStr: string): number
export function calculateTrailPace(marathonPace: number, elevation: number, terrainType: string, terrainPaceFactors?: TerrainPaceFactors): number
export function formatTime(totalMinutes: number): string
export function formatPace(paceMinutes: number): string

// 补给策略计算
export function calculateHourlyEnergyNeeds(expectedSweatRate: string, weight?: number | null): HourlyEnergyNeeds
export function calculateSupplyDosages(hourlyEnergyNeeds: HourlyEnergyNeeds, gelCarbs?: number, saltElectrolytes?: number, electrolytePowder?: number): SupplyDosages
export function generateSupplyStrategy(params: SupplyStrategyParams): string[]

// 工具函数和常量
export const DEFAULT_TERRAIN_PACE_FACTORS: TerrainPaceFactors
export const TERRAIN_TYPE_TO_FACTOR_KEY: Record<TerrainType, keyof TerrainPaceFactors>
export type TerrainType
export type TerrainPaceFactors
export type HourlyEnergyNeeds
export type SupplyDosages
export type SupplyStrategyParams
```

#### 2.1.2 算法函数特点
- ✅ **纯函数**：无副作用，输入输出明确
- ✅ **边界值处理**：处理距离为0、配速为空等异常场景
- ✅ **详细注释**：函数级别、关键行均有中文注释
- ✅ **示例丰富**：每个函数都包含使用示例

---

## 三、业务代码调用示例

### 3.1 赛道编辑页面调用示例

#### 重构前（算法嵌入在业务代码中）
```typescript
// src/app/trails/[id]/edit/page.tsx

// 算法代码直接嵌入在组件中（35行代码）
const calculateElevationFactor = (per100mElevation: number): number => {
  let elevationFactor
  if (per100mElevation >= 0) {
    if (per100mElevation <= 3) {
      elevationFactor = 0.1
    } else if (per100mElevation <= 8) {
      elevationFactor = 0.3 * per100mElevation
    }
    // ... 省略其他逻辑
  } else {
    const absElevation = Math.abs(per100mElevation)
    const slopeRatio = Math.min(absElevation / 10, 1)
    elevationFactor = -(0.1 + 0.1 * slopeRatio) * absElevation
    elevationFactor = Math.max(elevationFactor, -0.5)
  }
  return Number(elevationFactor.toFixed(2))
}

// 使用算法
const per100mElevation = elevation / (distance * 10)
const elevationFactor = calculateElevationFactor(per100mElevation)
```

#### 重构后（引入算法模块）
```typescript
// src/app/trails/[id]/edit/page.tsx

// 1. 引入算法模块
import {
  calculatePer100mElevation,
  calculateSlopePercent,
  calculateElevationFactor,
} from "@/lib/trailAlgorithm"

// 2. 使用算法函数（简洁清晰）
const per100mElevation = calculatePer100mElevation(elevation, distance)
const slopePercent = calculateSlopePercent(elevation, distance)
const elevationFactor = calculateElevationFactor(per100mElevation)
```

**改造对比：**
- ❌ 重构前：35行算法代码嵌入在组件中，难以复用
- ✅ 重构后：3行函数调用，算法逻辑完全独立

---

### 3.2 预测API调用示例

#### 重构前（算法代码分散在API文件中）
```typescript
// src/app/api/predict/route.ts

// 路段类型映射（重复定义）
const terrainTypeToFactorKey = {
  "沙地": "sand",
  "机耕道": "farmRoad",
  // ...
}

// 每个算法都是独立函数（约100行代码）
function calculatePer100mElevation(distance: number, elevation: number): number {
  if (distance <= 0) return 0
  const num100mSegments = distance * 10
  return elevation / num100mSegments
}

function calculateElevationFactor(per100mElevation: number): number {
  // ... 35行算法代码
}

function calculateHourlyEnergyNeeds(expectedSweatRate: string, weight: number | null) {
  // ... 20行算法代码
}

// ... 更多算法函数
```

#### 重构后（统一引入算法模块）
```typescript
// src/app/api/predict/route.ts

// 1. 统一引入所有需要的算法函数
import {
  parsePace,
  calculatePer100mElevation,
  calculateElevationFactor,
  calculateTrailPace,
  calculateHourlyEnergyNeeds,
  calculateSupplyDosages,
  generateSupplyStrategy,
  formatTime,
  formatPace,
  TERRAIN_TYPE_TO_FACTOR_KEY,
  type TerrainPaceFactors,
} from "@/lib/trailAlgorithm"

// 2. 直接使用算法函数
const marathonPace = parsePace(member.marathonPace || "6:00/km")
const per100mElevation = calculatePer100mElevation(cp.distance, cp.elevation)
const elevationFactor = calculateElevationFactor(per100mElevation)
const sectionPace = calculateTrailPace(marathonPace, cp.elevation, cp.terrainType || "山路", terrainPaceFactors)
const hourlyEnergyNeeds = calculateHourlyEnergyNeeds(expectedSweatRate, member.weight)
const estimatedTime = formatTime(accumulatedTime)
```

**改造对比：**
- ❌ 重构前：约150行算法代码分散在API文件中
- ✅ 重构后：统一引入，代码清晰，易于维护

---

## 四、算法复用说明

### 4.1 不同页面/接口如何复用核心算法

| 场景 | 使用的算法函数 | 调用示例 |
|------|--------------|---------|
| **赛道编辑页面** | `calculatePer100mElevation`<br>`calculateSlopePercent`<br>`calculateElevationFactor` | 实时计算坡度和爬升影响，并在表格中展示 |
| **成绩预测API** | `parsePace`<br>`calculatePer100mElevation`<br>`calculateElevationFactor`<br>`calculateTrailPace`<br>`calculateHourlyEnergyNeeds`<br>`calculateSupplyDosages`<br>`generateSupplyStrategy`<br>`formatTime`<br>`formatPace` | 完整的成绩预测和补给策略计算 |
| **复盘页面**（未来扩展） | `calculateTrailPace`<br>`formatTime`<br>`calculateHourlyEnergyNeeds` | 对比预测和实际成绩，分析偏差原因 |
| **数据验证工具** | 所有算法函数 | 确保输入数据的合理性和一致性 |

### 4.2 复用优势

#### 优势1：算法一致性
```typescript
// 场景：修改爬升影响值计算公式
// 重构前：需要同步修改3个文件
// - src/app/trails/[id]/edit/page.tsx
// - src/app/api/predict/route.ts
// - 其他使用该算法的文件

// 重构后：只需修改1个文件
// - src/lib/trailAlgorithm.ts

// 所有使用该算法的地方自动更新，保证一致性
```

#### 优势2：便于测试
```typescript
// 可以独立测试每个算法函数，无需依赖业务逻辑
import { calculateElevationFactor } from "@/lib/trailAlgorithm"

test("缓上坡应正确计算影响值", () => {
  expect(calculateElevationFactor(5.0)).toBe(1.5)
})
```

#### 优势3：文档化和维护
```typescript
// 每个算法函数都有详细的文档注释
/**
 * 计算爬升影响值（核心算法）
 * @param {number} per100mElevation - 每100米爬升量
 * @returns {number} 爬升影响值
 * @example
 * // 输入：per100mElevation=5.0
 * // 输出：1.5
 */
export function calculateElevationFactor(per100mElevation: number): number {
  // ...
}
```

---

## 五、改造前后代码对比

### 5.1 代码行数对比

| 文件 | 重构前 | 重构后 | 减少 |
|------|--------|--------|------|
| `src/app/trails/[id]/edit/page.tsx` | ~450行 | ~415行 | -35行 |
| `src/app/api/predict/route.ts` | ~350行 | ~250行 | -100行 |
| **新增** | - | `src/lib/trailAlgorithm.ts` | +550行 |
| **新增** | - | `src/lib/__tests__/trailAlgorithm.test.ts` | +250行 |
| **总计** | ~800行 | ~1465行 | +665行 |

**说明：**
- 虽然总行数增加，但算法代码从业务文件中完全抽离
- 业务代码更简洁，可读性和可维护性显著提升
- 新增的测试文件保证了算法的正确性

### 5.2 代码质量对比

| 维度 | 重构前 | 重构后 |
|------|--------|--------|
| **算法复用性** | ❌ 算法分散，难以复用 | ✅ 统一模块，易于复用 |
| **可测试性** | ❌ 需要依赖业务逻辑测试 | ✅ 独立函数，易于测试 |
| **可维护性** | ❌ 修改需要同步多处 | ✅ 修改一处，全局生效 |
| **文档完整性** | ❌ 缺少文档注释 | ✅ 详细中文注释和示例 |
| **类型安全** | ⚠️ 部分缺少类型 | ✅ 完整的TypeScript类型定义 |

---

## 六、验证和测试

### 6.1 算法验证结果
运行 `npx tsx src/lib/__tests__/verify.ts`，所有测试通过：

```
=== 越野跑成绩预测核心算法验证 ===

1. 坡度计算测试
  ✅ calculatePer100mElevation(96, 2.64): 3.64 期望: 3.64
  ✅ calculateSlopePercent(100, 2.0): 5 期望: 5.0

2. 爬升影响值计算测试
  ✅ 平路/微坡 (2.0m): 0.1 期望: 0.1
  ✅ 缓上坡 (5.0m): 1.5 期望: 1.5
  ✅ 陡上坡 (10.0m): 4 期望: 4.0
  ✅ 急上坡 (20.0m): 10 期望: 10.0
  ✅ 下坡 (-5.0m): -0.5 期望: 负值且 >= -0.5

3. 配速计算测试
  ✅ parsePace('5:30/km'): 5.5 期望: 5.5
  ✅ calculateTrailPace(6.0, 100, '山路'): 7 期望: ~7.0
  ✅ calculateTrailPace(6.0, -100, '山路'): 5 期望: >= 4.2

4. 时间格式化测试
  ✅ formatTime(125.5): 02:05:30 期望: 02:05:30
  ✅ formatPace(5.5): 5:30/km 期望: 5:30/km

5. 补给策略测试
  ✅ calculateHourlyEnergyNeeds('多汗', 70): 正确
  ✅ calculateSupplyDosages(...): 正确
  ✅ generateSupplyStrategy(...): 正确

=== 验证完成 ===
```

### 6.2 类型检查
```bash
npx tsc --noEmit
# ✅ 无类型错误
```

---

## 七、后续优化建议

### 7.1 短期优化
- [ ] 添加更多边界值测试用例
- [ ] 考虑添加算法性能基准测试
- [ ] 补充算法使用示例文档

### 7.2 长期优化
- [ ] 考虑将算法模块发布为独立的npm包
- [ ] 添加算法可视化工具（坡度分析图表）
- [ ] 支持更多自定义参数配置

---

## 八、总结

本次重构成功将越野跑成绩预测的核心算法抽离为独立模块，实现了：

✅ **算法复用**：所有算法函数可在不同页面/接口中复用
✅ **代码解耦**：业务逻辑与计算逻辑完全分离
✅ **易于测试**：每个算法函数均可独立测试
✅ **文档完善**：详细的中文注释和使用示例
✅ **类型安全**：完整的TypeScript类型定义

重构后的代码结构更清晰，可维护性显著提升，为后续功能扩展奠定了良好的基础。
