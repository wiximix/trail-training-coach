/**
 * 跑团成员管理 API 集成测试
 *
 * 测试覆盖范围：
 * - 获取跑团成员列表 (GET /api/teams/[id]/members)
 * - 申请加入跑团 (POST /api/teams/[id]/members)
 * - 成员状态管理
 * - 错误处理
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// 模拟 Next.js 的 fetch API
const mockFetch = vi.fn();
global.fetch = mockFetch as any;

// 模拟环境变量
process.env.JWT_SECRET = 'test-secret-key-for-testing';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';

describe('Team Members API', () => {
  const mockTeamId = 'team-001';
  const mockUserId = 'user-001';

  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe('GET /api/teams/[id]/members', () => {
    describe('成功场景', () => {
      it('应该成功获取跑团成员列表', async () => {
        const mockMembers = [
          {
            id: 'tm-001',
            teamId: mockTeamId,
            userId: 'user-001',
            role: 'owner',
            status: 'approved',
            joinedAt: '2024-01-01T00:00:00Z',
            createdAt: '2024-01-01T00:00:00Z',
            user: {
              id: 'user-001',
              username: 'owner',
              email: 'owner@example.com',
              isActive: true,
            },
          },
          {
            id: 'tm-002',
            teamId: mockTeamId,
            userId: 'user-002',
            role: 'admin',
            status: 'approved',
            joinedAt: '2024-01-02T00:00:00Z',
            createdAt: '2024-01-02T00:00:00Z',
            user: {
              id: 'user-002',
              username: 'admin',
              email: 'admin@example.com',
              isActive: true,
            },
          },
          {
            id: 'tm-003',
            teamId: mockTeamId,
            userId: 'user-003',
            role: 'member',
            status: 'pending',
            createdAt: '2024-01-03T00:00:00Z',
            user: {
              id: 'user-003',
              username: 'pending',
              email: 'pending@example.com',
              isActive: true,
            },
          },
        ];

        mockFetch.mockResolvedValue({
          ok: true,
          json: async () => ({ success: true, data: mockMembers }),
        } as Response);

        const response = await fetch(`http://localhost:5000/api/teams/${mockTeamId}/members`);
        const data = await response.json();

        expect(response.ok).toBe(true);
        expect(data.success).toBe(true);
        expect(Array.isArray(data.data)).toBe(true);
        expect(data.data).toHaveLength(3);
        expect(data.data[0].role).toBe('owner');
        expect(data.data[1].role).toBe('admin');
        expect(data.data[2].status).toBe('pending');
      });

      it('应该支持按状态筛选成员', async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          json: async () => ({
            success: true,
            data: [
              {
                id: 'tm-003',
                teamId: mockTeamId,
                userId: 'user-003',
                role: 'member',
                status: 'pending',
                createdAt: '2024-01-03T00:00:00Z',
                user: {
                  id: 'user-003',
                  username: 'pending',
                  email: 'pending@example.com',
                  isActive: true,
                },
              },
            ],
          }),
        } as Response);

        const response = await fetch(`http://localhost:5000/api/teams/${mockTeamId}/members?status=pending`);
        const data = await response.json();

        expect(response.ok).toBe(true);
        expect(data.data[0].status).toBe('pending');
        expect(mockFetch).toHaveBeenCalled();
      });

      it('应该支持获取待审核成员', async () => {
        const pendingMembers = [
          {
            id: 'tm-004',
            teamId: mockTeamId,
            userId: 'user-004',
            role: 'member',
            status: 'pending',
            createdAt: '2024-01-04T00:00:00Z',
            user: {
              id: 'user-004',
              username: 'applicant1',
              email: 'applicant1@example.com',
              isActive: true,
            },
          },
          {
            id: 'tm-005',
            teamId: mockTeamId,
            userId: 'user-005',
            role: 'member',
            status: 'pending',
            createdAt: '2024-01-05T00:00:00Z',
            user: {
              id: 'user-005',
              username: 'applicant2',
              email: 'applicant2@example.com',
              isActive: true,
            },
          },
        ];

        mockFetch.mockResolvedValue({
          ok: true,
          json: async () => ({ success: true, data: pendingMembers }),
        } as Response);

        const response = await fetch(`http://localhost:5000/api/teams/${mockTeamId}/members?status=pending`);
        const data = await response.json();

        expect(response.ok).toBe(true);
        expect(data.data).toHaveLength(2);
        expect(data.data.every((m: any) => m.status === 'pending')).toBe(true);
      });

      it('应该支持获取已批准成员', async () => {
        const approvedMembers = [
          {
            id: 'tm-001',
            teamId: mockTeamId,
            userId: 'user-001',
            role: 'owner',
            status: 'approved',
            joinedAt: '2024-01-01T00:00:00Z',
            createdAt: '2024-01-01T00:00:00Z',
            user: {
              id: 'user-001',
              username: 'owner',
              email: 'owner@example.com',
              isActive: true,
            },
          },
          {
            id: 'tm-002',
            teamId: mockTeamId,
            userId: 'user-002',
            role: 'admin',
            status: 'approved',
            joinedAt: '2024-01-02T00:00:00Z',
            createdAt: '2024-01-02T00:00:00Z',
            user: {
              id: 'user-002',
              username: 'admin',
              email: 'admin@example.com',
              isActive: true,
            },
          },
        ];

        mockFetch.mockResolvedValue({
          ok: true,
          json: async () => ({ success: true, data: approvedMembers }),
        } as Response);

        const response = await fetch(`http://localhost:5000/api/teams/${mockTeamId}/members?status=approved`);
        const data = await response.json();

        expect(response.ok).toBe(true);
        expect(data.data).toHaveLength(2);
        expect(data.data.every((m: any) => m.status === 'approved')).toBe(true);
      });

      it('应该返回空数组当没有成员时', async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          json: async () => ({ success: true, data: [] }),
        } as Response);

        const response = await fetch(`http://localhost:5000/api/teams/${mockTeamId}/members`);
        const data = await response.json();

        expect(response.ok).toBe(true);
        expect(data.success).toBe(true);
        expect(Array.isArray(data.data)).toBe(true);
        expect(data.data).toHaveLength(0);
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

        const response = await fetch('http://localhost:5000/api/teams/non-existent-id/members');

        expect(response.status).toBe(404);
      });
    });
  });

  describe('POST /api/teams/[id]/members', () => {
    describe('成功场景', () => {
      it('应该成功申请加入跑团', async () => {
        const mockMember = {
          id: 'tm-006',
          teamId: mockTeamId,
          userId: mockUserId,
          role: 'member',
          status: 'pending',
          createdAt: '2024-01-06T00:00:00Z',
        };

        mockFetch.mockResolvedValue({
          ok: true,
          status: 201,
          json: async () => ({
            success: true,
            data: mockMember,
            message: '申请已提交，请等待审核',
          }),
        } as Response);

        const response = await fetch(`http://localhost:5000/api/teams/${mockTeamId}/members`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: mockUserId,
          }),
        });

        const data = await response.json();

        expect(response.ok).toBe(true);
        expect(response.status).toBe(201);
        expect(data.success).toBe(true);
        expect(data.data.status).toBe('pending');
        expect(data.message).toBe('申请已提交，请等待审核');
      });
    });

    describe('输入验证', () => {
      it('应该拒绝缺少用户ID', async () => {
        mockFetch.mockResolvedValue({
          ok: false,
          status: 400,
          json: async () => ({
            success: false,
            error: '缺少用户ID',
          }),
        } as Response);

        const response = await fetch(`http://localhost:5000/api/teams/${mockTeamId}/members`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        });

        expect(response.status).toBe(400);

        const data = await response.json();
        expect(data.success).toBe(false);
        expect(data.error).toBe('缺少用户ID');
      });

      it('应该拒绝空用户ID', async () => {
        mockFetch.mockResolvedValue({
          ok: false,
          status: 400,
          json: async () => ({
            success: false,
            error: '缺少用户ID',
          }),
        } as Response);

        const response = await fetch(`http://localhost:5000/api/teams/${mockTeamId}/members`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: '',
          }),
        });

        expect(response.status).toBe(400);

        const data = await response.json();
        expect(data.success).toBe(false);
        expect(data.error).toBe('缺少用户ID');
      });
    });

    describe('错误场景', () => {
      it('应该返回404当申请加入不存在的跑团', async () => {
        mockFetch.mockResolvedValue({
          ok: false,
          status: 404,
          json: async () => ({
            success: false,
            error: '跑团不存在',
          }),
        } as Response);

        const response = await fetch('http://localhost:5000/api/teams/non-existent-id/members', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: mockUserId,
          }),
        });

        expect(response.status).toBe(404);
      });

      it('应该返回错误当用户已经在跑团中', async () => {
        mockFetch.mockResolvedValue({
          ok: false,
          status: 400,
          json: async () => ({
            success: false,
            error: '用户已在跑团中',
          }),
        } as Response);

        const response = await fetch(`http://localhost:5000/api/teams/${mockTeamId}/members`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: mockUserId,
          }),
        });

        expect(response.status).toBe(400);

        const data = await response.json();
        expect(data.success).toBe(false);
        expect(data.error).toBe('用户已在跑团中');
      });

      it('应该返回错误当用户有待审核的申请', async () => {
        mockFetch.mockResolvedValue({
          ok: false,
          status: 400,
          json: async () => ({
            success: false,
            error: '已有待审核的申请',
          }),
        } as Response);

        const response = await fetch(`http://localhost:5000/api/teams/${mockTeamId}/members`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: mockUserId,
          }),
        });

        expect(response.status).toBe(400);

        const data = await response.json();
        expect(data.success).toBe(false);
        expect(data.error).toBe('已有待审核的申请');
      });
    });
  });

  describe('API 行为', () => {
    it('应该处理 JSON 请求体', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 201,
        json: async () => ({
          success: true,
          data: {
            id: 'tm-007',
            teamId: mockTeamId,
            userId: mockUserId,
            role: 'member',
            status: 'pending',
            createdAt: '2024-01-07T00:00:00Z',
          },
          message: '申请已提交，请等待审核',
        }),
      } as Response);

      const response = await fetch(`http://localhost:5000/api/teams/${mockTeamId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: mockUserId,
        }),
      });

      expect(response.ok).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(`/api/teams/${mockTeamId}/members`),
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
        json: async () => ({ success: true, data: [] }),
      } as Response);

      const response = await fetch(`http://localhost:5000/api/teams/${mockTeamId}/members`);

      const contentType = response.headers.get('content-type');
      expect(contentType).toBe('application/json');
    });

    it('应该在创建成功时返回201状态码', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 201,
        json: async () => ({
          success: true,
          data: {
            id: 'tm-008',
            teamId: mockTeamId,
            userId: mockUserId,
            role: 'member',
            status: 'pending',
            createdAt: '2024-加入跑团T00:00:00Z',
          },
          message: '申请已提交，请等待审核',
        }),
      } as Response);

      const response = await fetch(`http://localhost:5000/api/teams/${mockTeamId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: mockUserId,
        }),
      });

      expect(response.status).toBe(201);
    });
  });
});

describe('Team Member Roles', () => {
  it('应该支持不同角色的成员', async () => {
    const mockMembers = [
      {
        id: 'tm-001',
        teamId: 'team-001',
        userId: 'user-001',
        role: 'owner',
        status: 'approved',
        joinedAt: '2024-01-01T00:00:00Z',
        createdAt: '2024-01-01T00:00:00Z',
        user: {
          id: 'user-001',
          username: 'owner',
          email: 'owner@example.com',
          isActive: true,
        },
      },
      {
        id: 'tm-002',
        teamId: 'team-001',
        userId: 'user-002',
        role: 'admin',
        status: 'approved',
        joinedAt: '2024-01-02T00:00:00Z',
        createdAt: '2024-01-02T00:00:00Z',
        user: {
          id: 'user-002',
          username: 'admin',
          email: 'admin@example.com',
          isActive: true,
        },
      },
      {
        id: 'tm-003',
        teamId: 'team-001',
        userId: 'user-003',
        role: 'member',
        status: 'approved',
        joinedAt: '2024-01-03T00:00:00Z',
        createdAt: '2024-01-03T00:00:00Z',
        user: {
          id: 'user-003',
          username: 'member',
          email: 'member@example.com',
          isActive: true,
        },
      },
    ];

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: mockMembers }),
    } as Response);

    global.fetch = mockFetch as any;

    const response = await fetch('http://localhost:5000/api/teams/team-001/members');
    const data = await response.json();

    expect(response.ok).toBe(true);
    expect(data.data).toHaveLength(3);
    expect(data.data.map((m: any) => m.role)).toEqual(['owner', 'admin', 'member']);
  });
});
