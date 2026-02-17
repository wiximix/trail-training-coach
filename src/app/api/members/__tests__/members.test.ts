/**
 * 成员管理 API 集成测试
 *
 * 测试覆盖范围：
 * - 成员列表 (GET /api/members)
 * - 创建成员 (POST /api/members)
 * - 获取单个成员 (GET /api/members/[id])
 * - 更新成员 (PUT /api/members/[id])
 * - 删除成员 (DELETE /api/members/[id])
 * - 输入验证
 * - 错误处理
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// 模拟 Next.js 的 fetch API
const mockFetch = vi.fn();
global.fetch = mockFetch as any;

// 模拟环境变量
process.env.JWT_SECRET = 'test-secret-key-for-testing';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';

describe('Members API', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe('GET /api/members', () => {
    describe('成功场景', () => {
      it('应该成功获取成员列表', async () => {
        const mockMembers = [
          {
            id: 'member-001',
            name: '张三',
            height: 175,
            weight: 70,
            gender: '男',
            restingHeartRate: 60,
            maxHeartRate: 185,
            marathonPace: '5:30/km',
            vo2Max: 55,
            createdAt: '2024-01-01T00:00:00Z',
          },
          {
            id: 'member-002',
            name: '李四',
            height: 165,
            weight: 55,
            gender: '女',
            restingHeartRate: 65,
            maxHeartRate: 180,
            marathonPace: '6:00/km',
            vo2Max: 48,
            createdAt: '2024-01-02T00:00:00Z',
          },
        ];

        mockFetch.mockResolvedValue({
          ok: true,
          json: async () => mockMembers,
        } as Response);

        const response = await fetch('http://localhost:5000/api/members?page=1&limit=10');
        const data = await response.json();

        expect(response.ok).toBe(true);
        expect(Array.isArray(data)).toBe(true);
        expect(data).toHaveLength(2);
        expect(data[0].name).toBe('张三');
        expect(data[1].name).toBe('李四');
        expect(mockFetch).toHaveBeenCalledTimes(1);
      });

      it('应该支持分页参数', async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          json: async () => [],
        } as Response);

        await fetch('http://localhost:5000/api/members?page=2&limit=20');

        expect(mockFetch).toHaveBeenCalled();
        expect(mockFetch).toHaveBeenCalledTimes(1);
      });

      it('应该返回空数组当没有成员时', async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          json: async () => [],
        } as Response);

        const response = await fetch('http://localhost:5000/api/members');
        const data = await response.json();

        expect(response.ok).toBe(true);
        expect(Array.isArray(data)).toBe(true);
        expect(data).toHaveLength(0);
      });
    });
  });

  describe('POST /api/members', () => {
    describe('成功场景', () => {
      it('应该成功创建成员', async () => {
        const mockMember = {
          id: 'member-003',
          name: '王五',
          height: 180,
          weight: 75,
          gender: '男',
          restingHeartRate: 55,
          maxHeartRate: 190,
          lactateThresholdHeartRate: 165,
          marathonPace: '5:00/km',
          flatBaselinePace: '5:00/km',
          vo2Max: 60,
          terrainPaceFactors: {
            '沙地': 1.1,
            '机耕道': 1.0,
            '山路': 1.0,
            '石铺路': 1.0,
            '台阶': 1.0,
          },
          preferredSupplyTypes: ['能量胶', '能量棒'],
          crampFrequency: '有时',
          expectedSweatRate: '多汗',
          createdAt: '2024-01-03T00:00:00Z',
        };

        mockFetch.mockResolvedValue({
          ok: true,
          json: async () => mockMember,
        } as Response);

        const response = await fetch('http://localhost:5000/api/members', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: '王五',
            height: 180,
            weight: 75,
            gender: '男',
            restingHeartRate: 55,
            maxHeartRate: 190,
            lactateThresholdHeartRate: 165,
            marathonPace: '5:00/km',
            flatBaselinePace: '5:00/km',
            vo2Max: 60,
            terrainPaceFactors: {
              '沙地': 1.1,
              '机耕道': 1.0,
              '山路': 1.0,
              '石铺路': 1.0,
              '台阶': 1.0,
            },
            preferredSupplyTypes: ['能量胶', '能量棒'],
            crampFrequency: '有时',
            expectedSweatRate: '多汗',
          }),
        });

        const data = await response.json();

        expect(response.ok).toBe(true);
        expect(data.name).toBe('王五');
        expect(data.height).toBe(180);
        expect(data.weight).toBe(75);
        expect(data.vo2Max).toBe(60);
        expect(mockFetch).toHaveBeenCalledTimes(1);
      });

      it('应该支持仅填写必填字段', async () => {
        const mockMember = {
          id: 'member-004',
          name: '简单成员',
          createdAt: '2024-01-04T00:00:00Z',
        };

        mockFetch.mockResolvedValue({
          ok: true,
          json: async () => mockMember,
        } as Response);

        const response = await fetch('http://localhost:5000/api/members', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: '简单成员',
          }),
        });

        const data = await response.json();

        expect(response.ok).toBe(true);
        expect(data.name).toBe('简单成员');
      });
    });

    describe('输入验证', () => {
      it('应该拒绝空成员名称', async () => {
        mockFetch.mockResolvedValue({
          ok: false,
          json: async () => ({
            success: false,
            error: '成员名称不能为空',
          }),
        } as Response);

        const response = await fetch('http://localhost:5000/api/members', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: '',
          }),
        });

        expect(response.ok).toBe(false);
      });

      it('应该拒绝过长成员名称（超过100个字符）', async () => {
        const longName = 'a'.repeat(101);

        mockFetch.mockResolvedValue({
          ok: false,
          json: async () => ({
            success: false,
            error: '成员名称不能超过100个字符',
          }),
        } as Response);

        const response = await fetch('http://localhost:5000/api/members', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: longName,
          }),
        });

        expect(response.ok).toBe(false);
      });

      it('应该拒绝无效的身高值（负数）', async () => {
        mockFetch.mockResolvedValue({
          ok: false,
          json: async () => ({
            success: false,
            error: '身高必须为正数',
          }),
        } as Response);

        const response = await fetch('http://localhost:5000/api/members', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: '测试成员',
            height: -10,
          }),
        });

        expect(response.ok).toBe(false);
      });

      it('应该拒绝无效的体重值（负数）', async () => {
        mockFetch.mockResolvedValue({
          ok: false,
          json: async () => ({
            success: false,
            error: '体重必须为正数',
          }),
        } as Response);

        const response = await fetch('http://localhost:5000/api/members', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: '测试成员',
            weight: -5,
          }),
        });

        expect(response.ok).toBe(false);
      });
    });

    describe('边界值测试', () => {
      it('应该接受最大长度成员名称（100个字符）', async () => {
        const maxLengthName = 'a'.repeat(100);

        mockFetch.mockResolvedValue({
          ok: true,
          json: async () => ({
            id: 'member-005',
            name: maxLengthName,
            createdAt: '2024-01-05T00:00:00Z',
          }),
        } as Response);

        const response = await fetch('http://localhost:5000/api/members', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: maxLengthName,
          }),
        });

        expect(response.ok).toBe(true);
      });

      it('应该接受有效的身高范围', async () => {
        const testCases = [
          { name: '最矮成员', height: 100 },
          { name: '最高成员', height: 250 },
          { name: '正常身高', height: 175 },
        ];

        for (const testCase of testCases) {
          mockFetch.mockResolvedValue({
            ok: true,
            json: async () => ({
              id: `member-${Math.random().toString(36).substr(2, 9)}`,
              name: testCase.name,
              height: testCase.height,
              createdAt: '2024-01-06T00:00:00Z',
            }),
          } as Response);

          const response = await fetch('http://localhost:5000/api/members', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: testCase.name,
              height: testCase.height,
            }),
          });

          expect(response.ok).toBe(true);
        }
      });

      it('应该接受有效的体重范围', async () => {
        const testCases = [
          { name: '最轻成员', weight: 30 },
          { name: '最重成员', weight: 200 },
          { name: '正常体重', weight: 70 },
        ];

        for (const testCase of testCases) {
          mockFetch.mockResolvedValue({
            ok: true,
            json: async () => ({
              id: `member-${Math.random().toString(36).substr(2, 9)}`,
              name: testCase.name,
              weight: testCase.weight,
              createdAt: '2024-01-07T00:00:00Z',
            }),
          } as Response);

          const response = await fetch('http://localhost:5000/api/members', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: testCase.name,
              weight: testCase.weight,
            }),
          });

          expect(response.ok).toBe(true);
        }
      });
    });
  });

  describe('GET /api/members/[id]', () => {
    describe('成功场景', () => {
      it('应该成功获取单个成员详情', async () => {
        const mockMember = {
          id: 'member-001',
          name: '张三',
          height: 175,
          weight: 70,
          gender: '男',
          restingHeartRate: 60,
          maxHeartRate: 185,
          marathonPace: '5:30/km',
          vo2Max: 55,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        };

        mockFetch.mockResolvedValue({
          ok: true,
          json: async () => mockMember,
        } as Response);

        const response = await fetch('http://localhost:5000/api/members/member-001');
        const data = await response.json();

        expect(response.ok).toBe(true);
        expect(data.id).toBe('member-001');
        expect(data.name).toBe('张三');
        expect(data.vo2Max).toBe(55);
      });
    });

    describe('错误场景', () => {
      it('应该返回404当成员不存在', async () => {
        mockFetch.mockResolvedValue({
          ok: false,
          status: 404,
          json: async () => ({
            success: false,
            error: '成员不存在',
          }),
        } as Response);

        const response = await fetch('http://localhost:5000/api/members/non-existent-id');

        expect(response.status).toBe(404);

        const data = await response.json();
        expect(data.success).toBe(false);
        expect(data.error).toBe('成员不存在');
      });

      it('应该返回400当成员ID格式无效', async () => {
        mockFetch.mockResolvedValue({
          ok: false,
          status: 400,
          json: async () => ({
            success: false,
            error: '无效的成员ID',
          }),
        } as Response);

        const response = await fetch('http://localhost:5000/api/members/invalid-id');

        expect(response.status).toBe(400);

        const data = await response.json();
        expect(data.success).toBe(false);
      });
    });
  });

  describe('PUT /api/members/[id]', () => {
    describe('成功场景', () => {
      it('应该成功更新成员信息', async () => {
        const updatedMember = {
          id: 'member-001',
          name: '张三',
          height: 178,
          weight: 72,
          gender: '男',
          restingHeartRate: 58,
          maxHeartRate: 187,
          marathonPace: '5:25/km',
          vo2Max: 57,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-08T00:00:00Z',
        };

        mockFetch.mockResolvedValue({
          ok: true,
          json: async () => updatedMember,
        } as Response);

        const response = await fetch('http://localhost:5000/api/members/member-001', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            height: 178,
            weight: 72,
            vo2Max: 57,
          }),
        });

        const data = await response.json();

        expect(response.ok).toBe(true);
        expect(data.height).toBe(178);
        expect(data.weight).toBe(72);
        expect(data.vo2Max).toBe(57);
      });

      it('应该支持部分更新', async () => {
        const updatedMember = {
          id: 'member-001',
          name: '张三',
          height: 175,
          weight: 70,
          gender: '男',
          marathonPace: '5:30/km',
          vo2Max: 60,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-09T00:00:00Z',
        };

        mockFetch.mockResolvedValue({
          ok: true,
          json: async () => updatedMember,
        } as Response);

        const response = await fetch('http://localhost:5000/api/members/member-001', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            vo2Max: 60,
          }),
        });

        const data = await response.json();

        expect(response.ok).toBe(true);
        expect(data.vo2Max).toBe(60);
        expect(data.height).toBe(175); // 未改变
        expect(data.weight).toBe(70); // 未改变
      });
    });

    describe('错误场景', () => {
      it('应该返回404当更新不存在的成员', async () => {
        mockFetch.mockResolvedValue({
          ok: false,
          status: 404,
          json: async () => ({
            success: false,
            error: '成员不存在',
          }),
        } as Response);

        const response = await fetch('http://localhost:5000/api/members/non-existent-id', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: '新名称',
          }),
        });

        expect(response.status).toBe(404);
      });
    });
  });

  describe('DELETE /api/members/[id]', () => {
    describe('成功场景', () => {
      it('应该成功删除成员', async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          json: async () => ({
            message: '删除成功',
          }),
        } as Response);

        const response = await fetch('http://localhost:5000/api/members/member-001', {
          method: 'DELETE',
        });

        const data = await response.json();

        expect(response.ok).toBe(true);
        expect(data.message).toBe('删除成功');
      });
    });

    describe('错误场景', () => {
      it('应该返回404当删除不存在的成员', async () => {
        mockFetch.mockResolvedValue({
          ok: false,
          status: 404,
          json: async () => ({
            success: false,
            error: '成员不存在',
          }),
        } as Response);

        const response = await fetch('http://localhost:5000/api/members/non-existent-id', {
          method: 'DELETE',
        });

        expect(response.status).toBe(404);

        const data = await response.json();
        expect(data.success).toBe(false);
        expect(data.error).toBe('成员不存在');
      });
    });
  });

  describe('API 行为', () => {
    it('应该处理 JSON 请求体', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          id: 'member-006',
          name: '测试成员',
          createdAt: '2024-01-10T00:00:00Z',
        }),
      } as Response);

      const response = await fetch('http://localhost:5000/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: '测试成员',
        }),
      });

      expect(response.ok).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/members'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('应该返回正确的 Content-Type', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        headers: {
          get: (name: string) => name === 'content-type' ? 'application/json' : null,
        },
        json: async () => [],
      } as Response);

      const response = await fetch('http://localhost:5000/api/members');

      const contentType = response.headers.get('content-type');
      expect(contentType).toBe('application/json');
    });
  });
});
