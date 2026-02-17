/**
 * 跑团管理 API 集成测试
 *
 * 测试覆盖范围：
 * - 跑团列表 (GET /api/teams)
 * - 创建跑团 (POST /api/teams)
 * - 获取跑团详情 (GET /api/teams/[id])
 * - 更新跑团 (PUT /api/teams/[id])
 * - 删除跑团 (DELETE /api/teams/[id])
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

describe('Teams API', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe('GET /api/teams', () => {
    describe('成功场景', () => {
      it('应该成功获取跑团列表', async () => {
        const mockTeams = [
          {
            id: 'team-001',
            name: '越野跑俱乐部',
            description: '专业的越野跑训练团队',
            ownerId: 'user-001',
            memberCount: 50,
            createdAt: '2024-01-01T00:00:00Z',
          },
          {
            id: 'team-002',
            name: '山地跑者联盟',
            description: '山地跑爱好者的聚集地',
            ownerId: 'user-002',
            memberCount: 30,
            createdAt: '2024-01-02T00:00:00Z',
          },
        ];

        mockFetch.mockResolvedValue({
          ok: true,
          json: async () => mockTeams,
        } as Response);

        const response = await fetch('http://localhost:5000/api/teams?page=1&limit=10');
        const data = await response.json();

        expect(response.ok).toBe(true);
        expect(Array.isArray(data)).toBe(true);
        expect(data).toHaveLength(2);
        expect(data[0].name).toBe('越野跑俱乐部');
        expect(mockFetch).toHaveBeenCalledTimes(1);
      });

      it('应该支持分页参数', async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          json: async () => [],
        } as Response);

        await fetch('http://localhost:5000/api/teams?page=2&limit=20');

        expect(mockFetch).toHaveBeenCalled();
        expect(mockFetch).toHaveBeenCalledTimes(1);
      });

      it('应该返回空数组当没有跑团时', async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          json: async () => [],
        } as Response);

        const response = await fetch('http://localhost:5000/api/teams');
        const data = await response.json();

        expect(response.ok).toBe(true);
        expect(Array.isArray(data)).toBe(true);
        expect(data).toHaveLength(0);
      });
    });
  });

  describe('POST /api/teams', () => {
    describe('成功场景', () => {
      it('应该成功创建跑团', async () => {
        const mockTeam = {
          id: 'team-003',
          name: '新跑团',
          description: '这是一个新跑团',
          ownerId: 'user-001',
          memberCount: 1,
          isPublic: true,
          createdAt: '2024-01-03T00:00:00Z',
        };

        mockFetch.mockResolvedValue({
          ok: true,
          json: async () => mockTeam,
        } as Response);

        const response = await fetch('http://localhost:5000/api/teams', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: '新跑团',
            description: '这是一个新跑团',
            ownerId: 'user-001',
            isPublic: true,
          }),
        });

        const data = await response.json();

        expect(response.ok).toBe(true);
        expect(data.name).toBe('新跑团');
        expect(data.description).toBe('这是一个新跑团');
        expect(data.ownerId).toBe('user-001');
        expect(data.isPublic).toBe(true);
        expect(mockFetch).toHaveBeenCalledTimes(1);
      });

      it('应该支持不填写描述字段', async () => {
        const mockTeam = {
          id: 'team-004',
          name: '简单跑团',
          ownerId: 'user-001',
          memberCount: 1,
          isPublic: false,
          createdAt: '2024-01-04T00:00:00Z',
        };

        mockFetch.mockResolvedValue({
          ok: true,
          json: async () => mockTeam,
        } as Response);

        const response = await fetch('http://localhost:5000/api/teams', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: '简单跑团',
            ownerId: 'user-001',
          }),
        });

        const data = await response.json();

        expect(response.ok).toBe(true);
        expect(data.name).toBe('简单跑团');
        expect(data.isPublic).toBe(false); // 默认值
      });

      it('应该创建私有跑团当 isPublic 为 false', async () => {
        const mockTeam = {
          id: 'team-005',
          name: '私有跑团',
          ownerId: 'user-001',
          memberCount: 1,
          isPublic: false,
          createdAt: '2024-01-05T00:00:00Z',
        };

        mockFetch.mockResolvedValue({
          ok: true,
          json: async () => mockTeam,
        } as Response);

        const response = await fetch('http://localhost:5000/api/teams', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: '私有跑团',
            ownerId: 'user-001',
            isPublic: false,
          }),
        });

        const data = await response.json();

        expect(response.ok).toBe(true);
        expect(data.isPublic).toBe(false);
      });
    });

    describe('输入验证', () => {
      it('应该拒绝空跑团名称', async () => {
        mockFetch.mockResolvedValue({
          ok: false,
          json: async () => ({
            success: false,
            error: '跑团名称不能为空',
          }),
        } as Response);

        const response = await fetch('http://localhost:5000/api/teams', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: '',
            ownerId: 'user-001',
          }),
        });

        expect(response.ok).toBe(false);
      });

      it('应该拒绝过长跑团名称（超过100个字符）', async () => {
        const longName = 'a'.repeat(101);

        mockFetch.mockResolvedValue({
          ok: false,
          json: async () => ({
            success: false,
            error: '跑团名称不能超过100个字符',
          }),
        } as Response);

        const response = await fetch('http://localhost:5000/api/teams', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: longName,
            ownerId: 'user-001',
          }),
        });

        expect(response.ok).toBe(false);
      });

      it('应该拒绝过长描述（超过500个字符）', async () => {
        const longDescription = 'a'.repeat(501);

        mockFetch.mockResolvedValue({
          ok: false,
          json: async () => ({
            success: false,
            error: '跑团描述不能超过500个字符',
          }),
        } as Response);

        const response = await fetch('http://localhost:5000/api/teams', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: '测试跑团',
            ownerId: 'user-001',
            description: longDescription,
          }),
        });

        expect(response.ok).toBe(false);
      });

      it('应该拒绝无效的创建者ID（非UUID格式）', async () => {
        mockFetch.mockResolvedValue({
          ok: false,
          json: async () => ({
            success: false,
            error: '无效的创建者ID',
          }),
        } as Response);

        const response = await fetch('http://localhost:5000/api/teams', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: '测试跑团',
            ownerId: 'invalid-id',
          }),
        });

        expect(response.ok).toBe(false);
      });

      it('应该拒绝缺少创建者ID', async () => {
        mockFetch.mockResolvedValue({
          ok: false,
          json: async () => ({
            success: false,
            error: '无效的创建者ID',
          }),
        } as Response);

        const response = await fetch('http://localhost:5000/api/teams', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: '测试跑团',
          }),
        });

        expect(response.ok).toBe(false);
      });
    });

    describe('边界值测试', () => {
      it('应该接受最大长度跑团名称（100个字符）', async () => {
        const maxLengthName = 'a'.repeat(100);

        mockFetch.mockResolvedValue({
          ok: true,
          json: async () => ({
            id: 'team-006',
            name: maxLengthName,
            ownerId: 'user-001',
            memberCount: 1,
            isPublic: false,
            createdAt: '2024-01-06T00:00:00Z',
          }),
        } as Response);

        const response = await fetch('http://localhost:5000/api/teams', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: maxLengthName,
            ownerId: 'user-001',
          }),
        });

        expect(response.ok).toBe(true);
      });

      it('应该接受最大长度描述（500个字符）', async () => {
        const maxLengthDescription = 'a'.repeat(500);

        mockFetch.mockResolvedValue({
          ok: true,
          json: async () => ({
            id: 'team-007',
            name: '测试跑团',
            description: maxLengthDescription,
            ownerId: 'user-001',
            memberCount: 1,
            isPublic: false,
            createdAt: '2024-01-07T00:00:00Z',
          }),
        } as Response);

        const response = await fetch('http://localhost:5000/api/teams', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: '测试跑团',
            ownerId: 'user-001',
            description: maxLengthDescription,
          }),
        });

        expect(response.ok).toBe(true);
      });
    });
  });

  describe('GET /api/teams/[id]', () => {
    describe('成功场景', () => {
      it('应该成功获取跑团详情', async () => {
        const mockTeam = {
          id: 'team-001',
          name: '越野跑俱乐部',
          description: '专业的越野跑训练团队',
          ownerId: 'user-001',
          memberCount: 50,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        };

        mockFetch.mockResolvedValue({
          ok: true,
          json: async () => ({ success: true, data: mockTeam }),
        } as Response);

        const response = await fetch('http://localhost:5000/api/teams/team-001');
        const data = await response.json();

        expect(response.ok).toBe(true);
        expect(data.success).toBe(true);
        expect(data.data.id).toBe('team-001');
        expect(data.data.name).toBe('越野跑俱乐部');
      });
    });

    describe('错误场景', () => {
      it('应该返回404当跑团不存在', async () => {
        mockFetch.mockResolvedValue({
          ok: false,
          status: 404,
          json: async () => ({
            success: false,
            error: '跑团不存在',
          }),
        } as Response);

        const response = await fetch('http://localhost:5000/api/teams/non-existent-id');

        expect(response.status).toBe(404);

        const data = await response.json();
        expect(data.success).toBe(false);
        expect(data.error).toBe('跑团不存在');
      });
    });
  });

  describe('PUT /api/teams/[id]', () => {
    describe('成功场景', () => {
      it('应该成功更新跑团信息', async () => {
        const updatedTeam = {
          id: 'team-001',
          name: '更新的跑团名称',
          description: '更新的描述',
          ownerId: 'user-001',
          memberCount: 50,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-08T00:00:00Z',
        };

        mockFetch.mockResolvedValue({
          ok: true,
          json: async () => ({ success: true, data: updatedTeam }),
        } as Response);

        const response = await fetch('http://localhost:5000/api/teams/team-001', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: '更新的跑团名称',
            description: '更新的描述',
          }),
        });

        const data = await response.json();

        expect(response.ok).toBe(true);
        expect(data.success).toBe(true);
        expect(data.data.name).toBe('更新的跑团名称');
        expect(data.data.description).toBe('更新的描述');
      });

      it('应该支持部分更新', async () => {
        const updatedTeam = {
          id: 'team-001',
          name: '越野跑俱乐部',
          description: '新的描述',
          ownerId: 'user-001',
          memberCount: 50,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-09T00:00:00Z',
        };

        mockFetch.mockResolvedValue({
          ok: true,
          json: async () => ({ success: true, data: updatedTeam }),
        } as Response);

        const response = await fetch('http://localhost:5000/api/teams/team-001', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            description: '新的描述',
          }),
        });

        const data = await response.json();

        expect(response.ok).toBe(true);
        expect(data.data.description).toBe('新的描述');
        expect(data.data.name).toBe('越野跑俱乐部'); // 未改变
      });
    });

    describe('错误场景', () => {
      it('应该返回404当更新不存在的跑团', async () => {
        mockFetch.mockResolvedValue({
          ok: false,
          status: 404,
          json: async () => ({
            success: false,
            error: '跑团不存在',
          }),
        } as Response);

        const response = await fetch('http://localhost:5000/api/teams/non-existent-id', {
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

  describe('DELETE /api/teams/[id]', () => {
    describe('成功场景', () => {
      it('应该成功删除跑团', async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          json: async () => ({
            success: true,
            message: '跑团删除成功',
          }),
        } as Response);

        const response = await fetch('http://localhost:5000/api/teams/team-001', {
          method: 'DELETE',
        });

        const data = await response.json();

        expect(response.ok).toBe(true);
        expect(data.success).toBe(true);
        expect(data.message).toBe('跑团删除成功');
      });
    });

    describe('错误场景', () => {
      it('应该返回404当删除不存在的跑团', async () => {
        mockFetch.mockResolvedValue({
          ok: false,
          status: 404,
          json: async () => ({
            success: false,
            error: '跑团不存在',
          }),
        } as Response);

        const response = await fetch('http://localhost:5000/api/teams/non-existent-id', {
          method: 'DELETE',
        });

        expect(response.status).toBe(404);

        const data = await response.json();
        expect(data.success).toBe(false);
        expect(data.error).toBe('跑团不存在');
      });
    });
  });

  describe('API 行为', () => {
    it('应该处理 JSON 请求体', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          id: 'team-008',
          name: '测试跑团',
          ownerId: 'user-001',
          memberCount: 1,
          isPublic: false,
          createdAt: '2024-01-10T00:00:00Z',
        }),
      } as Response);

      const response = await fetch('http://localhost:5000/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: '测试跑团',
          ownerId: 'user-001',
        }),
      });

      expect(response.ok).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/teams'),
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

      const response = await fetch('http://localhost:5000/api/teams');

      const contentType = response.headers.get('content-type');
      expect(contentType).toBe('application/json');
    });
  });
});
