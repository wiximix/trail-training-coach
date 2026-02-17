/**
 * 越野跑核心算法单元测试
 *
 * 测试覆盖范围：
 * - 坡度计算算法
 * - 爬升影响值计算算法
 * - 配速计算相关算法
 * - 成绩预测算法
 * - 时间格式化算法
 * - 补给策略计算算法
 */

import { describe, it, expect } from 'vitest';
import {
  // 坡度计算相关
  calculatePer100mElevation,
  calculateSlopePercent,
  // 爬升影响值计算
  calculateElevationFactor,
  // 配速计算相关
  parsePace,
  calculateTrailPace,
  // 成绩预测算法
  calculateElevationLossCoefficient,
  calculateSegmentTime,
  // 时间格式化
  formatTime,
  formatPace,
  // 补给策略计算
  calculateHourlyEnergyNeeds,
  calculateSupplyDosages,
  generateSupplyStrategy,
  // 常量和类型
  DEFAULT_TERRAIN_PACE_FACTORS,
  DEFAULT_ELEVATION_LOSS_COEFFICIENT,
  type TerrainPaceFactors,
  type HourlyEnergyNeeds,
  type SupplyStrategyParams,
  type SupplyDosages,
} from '../trailAlgorithm';

// ============================================================================
// 坡度计算算法测试
// ============================================================================

describe('calculatePer100mElevation - 每100米爬升量计算', () => {
  describe('正常情况测试', () => {
    it('应该正确计算缓上坡', () => {
      // 实例来自代码注释：96米爬升，2.64公里距离
      expect(calculatePer100mElevation(96, 2.64)).toBe(3.64);
    });

    it('应该正确计算陡上坡', () => {
      expect(calculatePer100mElevation(150, 2.0)).toBe(7.5);
    });

    it('应该正确计算下坡', () => {
      // 实例来自代码注释：-50米爬升，2.0公里距离
      expect(calculatePer100mElevation(-50, 2.0)).toBe(-2.5);
    });

    it('应该正确计算平路', () => {
      expect(calculatePer100mElevation(0, 10.0)).toBe(0);
    });

    it('应该处理小数爬升量', () => {
      expect(calculatePer100mElevation(12.5, 1.5)).toBe(0.83);
    });
  });

  describe('边界值测试', () => {
    it('距离为0时应该返回0', () => {
      expect(calculatePer100mElevation(100, 0)).toBe(0);
    });

    it('距离为负数时应该返回0', () => {
      expect(calculatePer100mElevation(100, -5)).toBe(0);
    });

    it('爬升为0时应该返回0', () => {
      expect(calculatePer100mElevation(0, 5.0)).toBe(0);
    });

    it('极小距离应该正确计算', () => {
      // 10米爬升 / (0.1公里 * 10) = 10 / 1 = 10
      expect(calculatePer100mElevation(10, 0.1)).toBe(10);
    });

    it('极大爬升量应该正确计算', () => {
      expect(calculatePer100mElevation(2000, 10)).toBe(20);
    });
  });

  describe('真实越野跑数据测试', () => {
    it('应该计算真实越野跑赛道数据 - 某50公里赛段', () => {
      // 真实数据：5公里爬升300米
      expect(calculatePer100mElevation(300, 5)).toBe(6);
    });

    it('应该计算真实越野跑赛道数据 - 某100公里赛段', () => {
      // 真实数据：10公里爬升800米
      expect(calculatePer100mElevation(800, 10)).toBe(8);
    });
  });
});

describe('calculateSlopePercent - 坡度百分比计算', () => {
  describe('正常情况测试', () => {
    it('应该正确计算上坡百分比', () => {
      // 实例来自代码注释：100米爬升，2.0公里距离
      expect(calculateSlopePercent(100, 2.0)).toBe(5.0);
    });

    it('应该正确计算下坡百分比', () => {
      expect(calculateSlopePercent(-50, 2.0)).toBe(-2.5);
    });

    it('应该正确计算平路', () => {
      expect(calculateSlopePercent(0, 10.0)).toBe(0);
    });
  });

  describe('边界值测试', () => {
    it('距离为0时应该返回0', () => {
      expect(calculateSlopePercent(100, 0)).toBe(0);
    });

    it('距离为负数时应该返回0', () => {
      expect(calculateSlopePercent(100, -5)).toBe(0);
    });

    it('极陡坡度应该正确计算', () => {
      expect(calculateSlopePercent(500, 1)).toBe(50);
    });
  });
});

// ============================================================================
// 爬升影响值计算算法测试
// ============================================================================

describe('calculateElevationFactor - 爬升影响值计算', () => {
  describe('上坡计算测试', () => {
    it('平路/微坡（0~3米）应该返回0.1', () => {
      expect(calculateElevationFactor(0)).toBe(0.1);
      expect(calculateElevationFactor(1.5)).toBe(0.1);
      expect(calculateElevationFactor(3)).toBe(0.1);
    });

    it('缓上坡（3~8米）应该使用0.3系数计算', () => {
      expect(calculateElevationFactor(3.64)).toBeCloseTo(1.09);
      expect(calculateElevationFactor(5)).toBe(1.5);
      expect(calculateElevationFactor(8)).toBeCloseTo(2.4);
    });

    it('陡上坡（8~15米）应该使用0.4系数计算', () => {
      expect(calculateElevationFactor(8.5)).toBeCloseTo(3.4);
      expect(calculateElevationFactor(12)).toBe(4.8);
      expect(calculateElevationFactor(15)).toBe(6);
    });

    it('急上坡（>15米）应该使用0.5系数计算', () => {
      expect(calculateElevationFactor(16)).toBe(8);
      expect(calculateElevationFactor(20)).toBe(10);
      expect(calculateElevationFactor(25)).toBe(12.5);
    });
  });

  describe('下坡计算测试', () => {
    it('下坡应该返回负值', () => {
      expect(calculateElevationFactor(-2.5)).toBeLessThan(0);
      expect(calculateElevationFactor(-5)).toBeLessThan(0);
    });

    it('下坡影响值不应低于-0.5', () => {
      expect(calculateElevationFactor(-10)).toBe(-0.5);
      expect(calculateElevationFactor(-20)).toBe(-0.5);
    });

    it('缓下坡应该有较小的负影响值', () => {
      expect(calculateElevationFactor(-1)).toBeCloseTo(-0.11);
    });
  });

  describe('边界值测试', () => {
    it('0值边界应该正确处理', () => {
      expect(calculateElevationFactor(0)).toBe(0.1);
    });

    it('坡度区间边界应该正确处理', () => {
      expect(calculateElevationFactor(3)).toBe(0.1); // 0~3边界
      expect(calculateElevationFactor(3.01)).toBeCloseTo(0.9); // 3~8边界: 0.3 * 3.01 = 0.903
      expect(calculateElevationFactor(8)).toBeCloseTo(2.4); // 3~8边界: 0.3 * 8 = 2.4
      expect(calculateElevationFactor(8.01)).toBeCloseTo(3.2); // 8~15边界: 0.4 * 8.01 = 3.204
      expect(calculateElevationFactor(15)).toBe(6); // 8~15边界: 0.4 * 15 = 6
      expect(calculateElevationFactor(15.01)).toBeCloseTo(7.5); // >15边界: 0.5 * 15.01 = 7.505
    });
  });
});

// ============================================================================
// 配速计算相关算法测试
// ============================================================================

describe('parsePace - 配速字符串解析', () => {
  describe('正常情况测试', () => {
    it('应该正确解析标准配速格式', () => {
      expect(parsePace('5:30/km')).toBe(5.5);
      expect(parsePace('6:00/km')).toBe(6);
      expect(parsePace('4:45/km')).toBe(4.75);
    });

    it('应该正确解析不带单位的配速', () => {
      expect(parsePace('5:30')).toBe(5.5);
      expect(parsePace('6:00')).toBe(6);
    });

    it('应该正确处理整分钟配速', () => {
      expect(parsePace('5:00/km')).toBe(5);
      expect(parsePace('6:00/km')).toBe(6);
    });

    it('应该正确处理带秒的配速', () => {
      expect(parsePace('5:15/km')).toBe(5.25);
      expect(parsePace('5:45/km')).toBe(5.75);
      expect(parsePace('6:30/km')).toBe(6.5);
    });
  });

  describe('边界值测试', () => {
    it('空字符串应该返回默认配速6:00', () => {
      expect(parsePace('')).toBe(6);
    });

    it('undefined应该返回默认配速6:00', () => {
      expect(parsePace(undefined as any)).toBe(6);
    });

    it('null应该返回默认配速6:00', () => {
      expect(parsePace(null as any)).toBe(6);
    });

    it('无效格式应该返回默认配速6:00', () => {
      expect(parsePace('invalid')).toBe(6);
      expect(parsePace('abc')).toBe(6);
    });

    it('极快配速应该正确解析', () => {
      expect(parsePace('2:30/km')).toBe(2.5);
    });

    it('极慢配速应该正确解析', () => {
      expect(parsePace('15:30/km')).toBe(15.5);
    });
  });
});

describe('calculateTrailPace - 越野赛配速计算', () => {
  describe('正常情况测试', () => {
    it('应该正确计算山路配速', () => {
      // 实例来自代码注释
      const result = calculateTrailPace(6.0, 96, '山路', { '山路': 1.0 });
      expect(result).toBe(6.96);
    });

    it('应该正确计算沙地配速（应用系数）', () => {
      const result = calculateTrailPace(6.0, 96, '沙地', DEFAULT_TERRAIN_PACE_FACTORS);
      expect(result).toBeCloseTo(7.66);
    });

    it('应该使用默认地形系数', () => {
      const result = calculateTrailPace(6.0, 96, '未知地形', undefined);
      expect(result).toBeCloseTo(6.96);
    });
  });

  describe('下坡配速约束测试', () => {
    it('下坡配速不应低于基础配速的7折', () => {
      const result = calculateTrailPace(6.0, -200, '山路', { '山路': 1.0 });
      const minPace = 6.0 * 0.7;
      expect(result).toBeGreaterThanOrEqual(minPace);
    });

    it('下坡配速应该等于基础配速的7折（当计算值更低时）', () => {
      const result = calculateTrailPace(6.0, -500, '山路', { '山路': 1.0 });
      // 计算值: 6.0 + (-500/100) = 1.0，取7折后 = 4.2
      // 由于浮点数精度问题，使用近似比较
      expect(result).toBeCloseTo(4.2);
    });
  });

  describe('边界值测试', () => {
    it('0爬升应该返回马拉松配速', () => {
      const result = calculateTrailPace(5.5, 0, '山路', { '山路': 1.0 });
      expect(result).toBe(5.5);
    });

    it('极小爬升应该正确计算', () => {
      const result = calculateTrailPace(6.0, 10, '山路', { '山路': 1.0 });
      expect(result).toBe(6.1);
    });

    it('极大爬升应该正确计算', () => {
      const result = calculateTrailPace(6.0, 1000, '山路', { '山路': 1.0 });
      expect(result).toBe(16);
    });
  });

  describe('真实越野跑数据测试', () => {
    it('应该计算真实越野跑配速 - 50公里比赛', () => {
      // 真实场景：马拉松配速5:30，累计爬升1500米
      // 计算: (5.5 + 1500/100) * 1.1 = 20.5 * 1.1 = 22.55
      const result = calculateTrailPace(5.5, 1500, '山路', { '山路': 1.1 });
      expect(result).toBeCloseTo(22.55);
    });

    it('应该计算真实越野跑配速 - 100公里比赛', () => {
      // 真实场景：马拉松配速6:00，累计爬升5000米
      // 计算: (6.0 + 5000/100) * 1.1 = 56 * 1.1 = 61.6
      const result = calculateTrailPace(6.0, 5000, '山路', { '山路': 1.1 });
      expect(result).toBeCloseTo(61.6);
    });
  });
});

// ============================================================================
// 成绩预测算法测试
// ============================================================================

describe('calculateElevationLossCoefficient - 爬升损耗系数计算', () => {
  describe('正常情况测试', () => {
    it('应该计算中等水平跑者（VO2Max=50）的损耗系数', () => {
      // 实例来自代码注释
      expect(calculateElevationLossCoefficient(50)).toBe(12);
    });

    it('应该计算高水平跑者（VO2Max=70）的损耗系数', () => {
      expect(calculateElevationLossCoefficient(70)).toBe(4);
    });

    it('应该计算精英水平跑者（VO2Max=80）的损耗系数', () => {
      expect(calculateElevationLossCoefficient(80)).toBe(0);
    });

    it('应该计算低水平跑者（VO2Max=30）的损耗系数', () => {
      expect(calculateElevationLossCoefficient(30)).toBe(20);
    });
  });

  describe('边界值测试', () => {
    it('无VO2Max数据应该返回默认值', () => {
      expect(calculateElevationLossCoefficient(undefined)).toBe(DEFAULT_ELEVATION_LOSS_COEFFICIENT);
      expect(calculateElevationLossCoefficient(null)).toBe(DEFAULT_ELEVATION_LOSS_COEFFICIENT);
    });

    it('VO2Max低于30应该被限制为30', () => {
      // VO2Max=20 被限制为30: k = 20 - (30-30)*0.4 = 20
      // 但是实际上代码中用 !vo2Max 检查，20 是 truthy，所以会进入计算逻辑
      // clampedVO2Max = Math.max(30, Math.min(80, 20)) = 30
      // k = 20 - (30-30)*0.4 = 20
      // 等等，让我重新检查代码...
      // 代码是: if (!vo2Max) return DEFAULT_ELEVATION_LOSS_COEFFICIENT (12)
      // 20 是 truthy，所以不会返回默认值
      // clampedVO2Max = 30, k = 20 - 0 = 20
      // 但是函数最后做了 Number(k.toFixed(2)) = 20.00
      // 问题是我的测试期望值错了
      expect(calculateElevationLossCoefficient(20)).toBe(20);

      // 但是对于 0，!vo2Max 是 true，会返回默认值 12
      expect(calculateElevationLossCoefficient(0)).toBe(DEFAULT_ELEVATION_LOSS_COEFFICIENT);

      // 对于负数，!vo2Max 是 false（负数是 truthy），会被限制为 30
      expect(calculateElevationLossCoefficient(-10)).toBe(20);
    });

    it('VO2Max高于80应该被限制为80', () => {
      expect(calculateElevationLossCoefficient(90)).toBe(0);
      expect(calculateElevationLossCoefficient(100)).toBe(0);
    });

    it('VO2Max边界值应该正确计算', () => {
      expect(calculateElevationLossCoefficient(30)).toBe(20);
      expect(calculateElevationLossCoefficient(80)).toBe(0);
    });
  });

  describe('中间值测试', () => {
    it('VO2Max=40应该正确计算', () => {
      expect(calculateElevationLossCoefficient(40)).toBe(16);
    });

    it('VO2Max=60应该正确计算', () => {
      expect(calculateElevationLossCoefficient(60)).toBe(8);
    });
  });
});

describe('calculateSegmentTime - 分段用时计算（核心预测算法）', () => {
  describe('正常情况测试', () => {
    it('应该正确计算分段用时 - 实例1', () => {
      // 实例来自代码注释
      const result = calculateSegmentTime(5.0, 6.0, 100, 12, 1.1);
      expect(result).toBe(55);
    });

    it('应该正确计算分段用时 - 实例2', () => {
      // 实例来自代码注释
      const result = calculateSegmentTime(10.0, 5.5, 50, 4, 1.0);
      expect(result).toBeCloseTo(58.33);
    });

    it('应该使用默认爬升损耗系数', () => {
      const result = calculateSegmentTime(5.0, 6.0, 100, undefined, 1.0);
      expect(result).toBeCloseTo(50);
    });

    it('应该使用默认地形复杂度系数', () => {
      const result = calculateSegmentTime(5.0, 6.0, 100, 12, undefined);
      expect(result).toBeCloseTo(50);
    });
  });

  describe('边界值测试', () => {
    it('0爬升应该只计算平路时间', () => {
      const result = calculateSegmentTime(10.0, 6.0, 0, 12, 1.0);
      expect(result).toBe(60);
    });

    it('0地形系数应该使用默认值1.0', () => {
      // 由于代码使用 alpha = terrainComplexityFactor || 1.0
      // 传入0会使用默认值1.0，而不是0
      const result = calculateSegmentTime(10.0, 6.0, 100, 12, 0);
      expect(result).toBeCloseTo(80); // (10×6 + 100×12/60) × 1 = (60+20) × 1 = 80
    });

    it('极小距离应该正确计算', () => {
      const result = calculateSegmentTime(0.5, 6.0, 50, 12, 1.0);
      // 平路时间 = 0.5 × 6 = 3
      // 爬升损耗 = 50 × 12 / 60 = 10
      // 基础时间 = 3 + 10 = 13
      // 分段用时 = 13 × 1.0 = 13
      expect(result).toBeCloseTo(13);
    });

    it('极大距离应该正确计算', () => {
      const result = calculateSegmentTime(50.0, 6.0, 1000, 12, 1.0);
      // 平路时间 = 50 × 6 = 300
      // 爬升损耗 = 1000 × 12 / 60 = 200
      // 基础时间 = 300 + 200 = 500
      // 分段用时 = 500 × 1.0 = 500
      expect(result).toBeCloseTo(500);
    });
  });

  describe('真实越野跑数据测试', () => {
    it('应该计算真实50公里比赛的分段时间', () => {
      // 真实场景：10公里，基准配速5:30，爬升300米，中等跑者
      // 平路时间 = 10 × 5.5 = 55
      // 爬升损耗 = 300 × 12 / 60 = 60
      // 基础时间 = 55 + 60 = 115
      // 分段用时 = 115 × 1.1 = 126.5
      const result = calculateSegmentTime(10.0, 5.5, 300, 12, 1.1);
      expect(result).toBeCloseTo(126.5);
    });

    it('应该计算真实100公里比赛的分段时间', () => {
      // 真实场景：20公里，基准配速6:00，爬升1000米，中等跑者
      // 平路时间 = 20 × 6 = 120
      // 爬升损耗 = 1000 × 12 / 60 = 200
      // 基础时间 = 120 + 200 = 320
      // 分段用时 = 320 × 1.2 = 384
      const result = calculateSegmentTime(20.0, 6.0, 1000, 12, 1.2);
      expect(result).toBeCloseTo(384);
    });

    it('应该计算精英跑者的分段时间', () => {
      // 真实场景：10公里，基准配速4:30，爬升300米，精英跑者（k=4）
      // 平路时间 = 10 × 4.5 = 45
      // 爬升损耗 = 300 × 4 / 60 = 20
      // 基础时间 = 45 + 20 = 65
      // 分段用时 = 65 × 1.1 = 71.5
      const result = calculateSegmentTime(10.0, 4.5, 300, 4, 1.1);
      expect(result).toBeCloseTo(71.5);
    });

    it('应该计算初学者的分段时间', () => {
      // 真实场景：10公里，基准配速7:00，爬升300米，初学者（k=20）
      // 平路时间 = 10 × 7 = 70
      // 爬升损耗 = 300 × 20 / 60 = 100
      // 基础时间 = 70 + 100 = 170
      // 分段用时 = 170 × 1.2 = 204
      const result = calculateSegmentTime(10.0, 7.0, 300, 20, 1.2);
      expect(result).toBeCloseTo(204);
    });
  });

  describe('不同地形复杂度测试', () => {
    it('平路地形（系数1.0）应该正确计算', () => {
      const result = calculateSegmentTime(10.0, 6.0, 500, 12, 1.0);
      // 平路时间 = 10 × 6 = 60
      // 爬升损耗 = 500 × 12 / 60 = 100
      // 基础时间 = 60 + 100 = 160
      // 分段用时 = 160 × 1.0 = 160
      expect(result).toBeCloseTo(160);
    });

    it('简单地形（系数1.1）应该正确计算', () => {
      const result = calculateSegmentTime(10.0, 6.0, 500, 12, 1.1);
      // 基础时间 = 160
      // 分段用时 = 160 × 1.1 = 176
      expect(result).toBeCloseTo(176);
    });

    it('复杂地形（系数1.3）应该正确计算', () => {
      const result = calculateSegmentTime(10.0, 6.0, 500, 12, 1.3);
      // 基础时间 = 160
      // 分段用时 = 160 × 1.3 = 208
      expect(result).toBeCloseTo(208);
    });

    it('极端地形（系数1.5）应该正确计算', () => {
      const result = calculateSegmentTime(10.0, 6.0, 500, 12, 1.5);
      // 基础时间 = 160
      // 分段用时 = 160 × 1.5 = 240
      expect(result).toBeCloseTo(240);
    });
  });
});

// ============================================================================
// 时间格式化算法测试
// ============================================================================

describe('formatTime - 时间格式化', () => {
  describe('正常情况测试', () => {
    it('应该正确格式化时间 - 实例1', () => {
      // 实例来自代码注释
      expect(formatTime(125.5)).toBe('02:05:30');
    });

    it('应该正确格式化整分钟', () => {
      expect(formatTime(60)).toBe('01:00:00');
      expect(formatTime(120)).toBe('02:00:00');
    });

    it('应该正确格式化带小数的分钟', () => {
      expect(formatTime(65.25)).toBe('01:05:15');
      expect(formatTime(90.5)).toBe('01:30:30');
    });
  });

  describe('边界值测试', () => {
    it('0分钟应该返回00:00:00', () => {
      expect(formatTime(0)).toBe('00:00:00');
    });

    it('小于1分钟应该正确格式化', () => {
      expect(formatTime(0.5)).toBe('00:00:30');
      expect(formatTime(0.25)).toBe('00:00:15');
    });

    it('超过24小时应该正确格式化', () => {
      expect(formatTime(1500)).toBe('25:00:00');
      expect(formatTime(1440)).toBe('24:00:00');
    });

    it('极小值应该正确格式化', () => {
      expect(formatTime(0.01)).toBe('00:00:00'); // 向下取整
    });
  });
});

describe('formatPace - 配速格式化', () => {
  describe('正常情况测试', () => {
    it('应该正确格式化配速 - 实例1', () => {
      expect(formatPace(6.5)).toBe('6:30/km');
    });

    it('应该正确格式化整分钟配速', () => {
      expect(formatPace(5)).toBe('5:00/km');
      expect(formatPace(6)).toBe('6:00/km');
    });

    it('应该正确格式化带秒的配速', () => {
      expect(formatPace(4.25)).toBe('4:15/km');
      expect(formatPace(5.75)).toBe('5:45/km');
    });
  });

  describe('边界值测试', () => {
    it('极快配速应该正确格式化', () => {
      expect(formatPace(2.5)).toBe('2:30/km');
    });

    it('极慢配速应该正确格式化', () => {
      expect(formatPace(15.5)).toBe('15:30/km');
      expect(formatPace(20.83)).toBe('20:49/km');
    });
  });
});

// ============================================================================
// 补给策略计算算法测试
// ============================================================================

describe('calculateHourlyEnergyNeeds - 每小时能量需求计算', () => {
  describe('正常情况测试', () => {
    it('应该正确计算多汗情况的需求', () => {
      // 实例来自代码注释
      const result = calculateHourlyEnergyNeeds('多汗', 70);
      expect(result).toEqual({
        carbs: 280,
        water: 600,
        electrolytes: 600,
      });
    });

    it('应该正确计算有一点情况的需求', () => {
      const result = calculateHourlyEnergyNeeds('有一点', 60);
      expect(result).toEqual({
        carbs: 240,
        water: 500,
        electrolytes: 400,
      });
    });

    it('应该正确计算汗流浃背情况的需求', () => {
      const result = calculateHourlyEnergyNeeds('汗流浃背', 75);
      expect(result).toEqual({
        carbs: 300,
        water: 800,
        electrolytes: 800,
      });
    });

    it('应该正确计算非常多汗情况的需求', () => {
      const result = calculateHourlyEnergyNeeds('非常多汗', 65);
      expect(result).toEqual({
        carbs: 260,
        water: 700,
        electrolytes: 700,
      });
    });
  });

  describe('边界值测试', () => {
    it('无体重数据应该使用默认热量需求', () => {
      const result = calculateHourlyEnergyNeeds('多汗');
      expect(result.carbs).toBe(240); // 默认60kg
      expect(result.water).toBe(600);
    });

    it('极小体重应该正确计算', () => {
      const result = calculateHourlyEnergyNeeds('多汗', 40);
      expect(result.carbs).toBe(160);
    });

    it('极大体重应该正确计算', () => {
      const result = calculateHourlyEnergyNeeds('多汗', 120);
      expect(result.carbs).toBe(480);
    });
  });

  describe('真实越野跑数据测试', () => {
    it('应该计算真实跑者的补给需求 - 轻量跑者', () => {
      const result = calculateHourlyEnergyNeeds('多汗', 55);
      expect(result.carbs).toBe(220);
      expect(result.water).toBe(600);
      expect(result.electrolytes).toBe(600);
    });

    it('应该计算真实跑者的补给需求 - 标准跑者', () => {
      const result = calculateHourlyEnergyNeeds('汗流浃背', 70);
      expect(result.carbs).toBe(280);
      expect(result.water).toBe(800);
      expect(result.electrolytes).toBe(800);
    });

    it('应该计算真实跑者的补给需求 - 重型跑者', () => {
      const result = calculateHourlyEnergyNeeds('非常多汗', 90);
      expect(result.carbs).toBe(360);
      expect(result.water).toBe(700);
      expect(result.electrolytes).toBe(700);
    });
  });
});

describe('calculateSupplyDosages - 补给份数计算', () => {
  describe('正常情况测试', () => {
    it('应该正确计算补给份数 - 实例1', () => {
      // 实例来自代码注释
      const hourlyNeeds: HourlyEnergyNeeds = {
        carbs: 70,
        water: 600,
        electrolytes: 600,
      };
      const result = calculateSupplyDosages(hourlyNeeds, 100, 200);
      expect(result.gelsPerHour).toBe(0.7);
      expect(result.saltsPerHour).toBe(3);
    });

    it('应该正确计算能量胶份数', () => {
      const hourlyNeeds: HourlyEnergyNeeds = {
        carbs: 280,
        water: 600,
        electrolytes: 600,
      };
      const result = calculateSupplyDosages(hourlyNeeds, 100, 200);
      expect(result.gelsPerHour).toBe(2.8);
    });

    it('应该正确计算盐丸份数', () => {
      const hourlyNeeds: HourlyEnergyNeeds = {
        carbs: 280,
        water: 600,
        electrolytes: 800,
      };
      const result = calculateSupplyDosages(hourlyNeeds, 100, 400);
      expect(result.saltsPerHour).toBe(2);
    });
  });

  describe('边界值测试', () => {
    it('无补给品含量应该返回0', () => {
      const hourlyNeeds: HourlyEnergyNeeds = {
        carbs: 280,
        water: 600,
        electrolytes: 600,
      };
      const result = calculateSupplyDosages(hourlyNeeds);
      expect(result.gelsPerHour).toBe(0);
      expect(result.saltsPerHour).toBe(0);
      expect(result.electrolytePowderPerHour).toBe(0);
    });

    it('补给品含量为0应该返回0', () => {
      const hourlyNeeds: HourlyEnergyNeeds = {
        carbs: 280,
        water: 600,
        electrolytes: 600,
      };
      const result = calculateSupplyDosages(hourlyNeeds, 0, 0);
      expect(result.gelsPerHour).toBe(0);
      expect(result.saltsPerHour).toBe(0);
    });

    it('负值补给品含量应该返回0', () => {
      const hourlyNeeds: HourlyEnergyNeeds = {
        carbs: 280,
        water: 600,
        electrolytes: 600,
      };
      const result = calculateSupplyDosages(hourlyNeeds, -100, -200);
      expect(result.gelsPerHour).toBe(0);
      expect(result.saltsPerHour).toBe(0);
    });

    it('电解质粉份数应该正确计算', () => {
      const hourlyNeeds: HourlyEnergyNeeds = {
        carbs: 280,
        water: 600,
        electrolytes: 800,
      };
      const result = calculateSupplyDosages(hourlyNeeds, 100, 200, 400);
      expect(result.electrolytePowderPerHour).toBe(2);
    });
  });

  describe('真实补给品数据测试', () => {
    it('应该计算能量胶（70g碳水）的补给份数', () => {
      const hourlyNeeds: HourlyEnergyNeeds = {
        carbs: 280,
        water: 600,
        electrolytes: 600,
      };
      const result = calculateSupplyDosages(hourlyNeeds, 70, 200);
      expect(result.gelsPerHour).toBe(4);
    });

    it('应该计算盐丸（500mg电解质）的补给份数', () => {
      const hourlyNeeds: HourlyEnergyNeeds = {
        carbs: 280,
        water: 600,
        electrolytes: 800,
      };
      const result = calculateSupplyDosages(hourlyNeeds, 100, 500);
      expect(result.saltsPerHour).toBe(1.6);
    });

    it('应该计算电解质粉（1000mg电解质）的补给份数', () => {
      const hourlyNeeds: HourlyEnergyNeeds = {
        carbs: 280,
        water: 800,
        electrolytes: 800,
      };
      const result = calculateSupplyDosages(hourlyNeeds, 100, 200, 1000);
      expect(result.electrolytePowderPerHour).toBe(0.8);
    });
  });
});

describe('generateSupplyStrategy - 补给策略生成', () => {
  describe('正常情况测试', () => {
    it('应该生成完整的补给策略', () => {
      // 实例来自代码注释
      const params: SupplyStrategyParams = {
        crampFrequency: '有时',
        expectedSweatRate: '多汗',
        preferredSupplyTypes: ['能量胶'],
        distance: 50,
      };
      const result = generateSupplyStrategy(params);
      expect(result).toContain('每5-6公里补水100-150ml');
      expect(result).toContain('每补给点额外补充1-2粒盐丸');
      expect(result).toContain('能量胶每40-45分钟补充一支');
    });

    it('应该根据出汗量生成补水策略', () => {
      const params: SupplyStrategyParams = {
        crampFrequency: '从不',
        expectedSweatRate: '汗流浃背',
        preferredSupplyTypes: [],
        distance: 50,
      };
      const result = generateSupplyStrategy(params);
      expect(result).toContain('每3-4公里补水200-250ml');
    });

    it('应该根据抽筋情况生成电解质策略', () => {
      const params: SupplyStrategyParams = {
        crampFrequency: '经常',
        expectedSweatRate: '有一点',
        preferredSupplyTypes: [],
        distance: 50,
      };
      const result = generateSupplyStrategy(params);
      expect(result).toContain('每补给点额外补充1-2粒盐丸');
      expect(result).toContain('使用电解质冲剂替代部分纯水');
    });

    it('应该根据喜好补给类型生成建议', () => {
      const params: SupplyStrategyParams = {
        crampFrequency: '从不',
        expectedSweatRate: '有一点',
        preferredSupplyTypes: ['能量胶', '能量棒', '能量+电解质冲剂'],
        distance: 50,
      };
      const result = generateSupplyStrategy(params);
      expect(result).toContain('能量胶每40-45分钟补充一支');
      expect(result).toContain('能量棒每1.5-2小时补充一根');
      expect(result).toContain('每补给点补充150-200ml电解质冲剂');
    });
  });

  describe('边界值测试', () => {
    it('无抽筋应该不生成盐丸建议', () => {
      const params: SupplyStrategyParams = {
        crampFrequency: '从不',
        expectedSweatRate: '多汗',
        preferredSupplyTypes: ['能量胶'],
        distance: 50,
      };
      const result = generateSupplyStrategy(params);
      expect(result).not.toContain('盐丸');
      expect(result).not.toContain('电解质冲剂');
    });

    it('无喜好补给类型应该不生成补给建议', () => {
      const params: SupplyStrategyParams = {
        crampFrequency: '从不',
        expectedSweatRate: '多汗',
        preferredSupplyTypes: [],
        distance: 50,
      };
      const result = generateSupplyStrategy(params);
      expect(result).not.toContain('能量胶');
      expect(result).not.toContain('能量棒');
      expect(result).not.toContain('电解质冲剂');
    });

    it('未知出汗量应该使用默认补水策略', () => {
      const params: SupplyStrategyParams = {
        crampFrequency: '从不',
        expectedSweatRate: '未知',
        preferredSupplyTypes: [],
        distance: 50,
      };
      const result = generateSupplyStrategy(params);
      expect(result).toContain('每6-8公里补水100ml');
    });
  });

  describe('真实越野跑场景测试', () => {
    it('应该生成50公里比赛的补给策略', () => {
      const params: SupplyStrategyParams = {
        crampFrequency: '有时',
        expectedSweatRate: '多汗',
        preferredSupplyTypes: ['能量胶', '能量+电解质冲剂'],
        distance: 50,
      };
      const result = generateSupplyStrategy(params);
      expect(result.length).toBeGreaterThan(0);
      expect(result.some(s => s.includes('补水'))).toBe(true);
      expect(result.some(s => s.includes('盐丸'))).toBe(true);
    });

    it('应该生成100公里比赛的补给策略', () => {
      const params: SupplyStrategyParams = {
        crampFrequency: '经常',
        expectedSweatRate: '汗流浃背',
        preferredSupplyTypes: ['能量棒', '能量胶'],
        distance: 100,
      };
      const result = generateSupplyStrategy(params);
      expect(result.length).toBeGreaterThan(0);
      expect(result.some(s => s.includes('补水'))).toBe(true);
      expect(result.some(s => s.includes('盐丸'))).toBe(true);
      expect(result.some(s => s.includes('能量胶'))).toBe(true);
      expect(result.some(s => s.includes('能量棒'))).toBe(true);
    });

    it('应该生成短距离比赛的补给策略', () => {
      const params: SupplyStrategyParams = {
        crampFrequency: '从不',
        expectedSweatRate: '有一点',
        preferredSupplyTypes: [],
        distance: 10,
      };
      const result = generateSupplyStrategy(params);
      expect(result.length).toBeGreaterThan(0);
      expect(result.some(s => s.includes('补水'))).toBe(true);
    });
  });
});
