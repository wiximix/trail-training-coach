import { describe, it, expect } from 'vitest';

describe('示例测试', () => {
  it('基本算术测试', () => {
    expect(1 + 1).toBe(2);
  });

  it('字符串测试', () => {
    expect('hello').toContain('ell');
  });

  it('数组测试', () => {
    const arr = [1, 2, 3];
    expect(arr).toHaveLength(3);
    expect(arr).toContain(2);
  });
});
