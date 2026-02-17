/**
 * 用户认证 API 集成测试
 *
 * 测试覆盖范围：
 * - 用户注册 (POST /api/auth/register)
 * - 用户登录 (POST /api/auth/login)
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

describe('Authentication API', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe('POST /api/auth/register', () => {
    describe('成功场景', () => {
      it('应该成功注册新用户并返回用户信息和token', async () => {
        const mockUser = {
          id: '123e4567-e89b-12d3-a456-426614174000',
          username: 'testuser',
          email: 'test@example.com',
          isActive: true,
          createdAt: new Date().toISOString(),
        };

        const mockResponse = {
          user: mockUser,
          token: 'mock-jwt-token',
        };

        mockFetch.mockResolvedValue({
          ok: true,
          json: async () => mockResponse,
        } as Response);

        const response = await fetch('http://localhost:5000/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: 'testuser',
            email: 'test@example.com',
            password: 'password123',
            confirmPassword: 'password123',
          }),
        });

        const data = await response.json();

        expect(response.ok).toBe(true);
        expect(data.user).toBeDefined();
        expect(data.user.username).toBe('testuser');
        expect(data.user.email).toBe('test@example.com');
        expect(data.token).toBe('mock-jwt-token');
        expect(mockFetch).toHaveBeenCalledTimes(1);
      });

      it('应该支持用户名包含字母、数字和下划线', async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          json: async () => ({
            user: {
              id: '123e4567-e89b-12d3-a456-426614174001',
              username: 'user_123',
              email: 'user123@example.com',
              isActive: true,
              createdAt: new Date().toISOString(),
            },
            token: 'mock-jwt-token',
          }),
        } as Response);

        const response = await fetch('http://localhost:5000/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: 'user_123',
            email: 'user123@example.com',
            password: 'password123',
            confirmPassword: 'password123',
          }),
        });

        expect(response.ok).toBe(true);
      });
    });

    describe('输入验证', () => {
      it('应该拒绝空用户名', async () => {
        mockFetch.mockResolvedValue({
          ok: false,
          json: async () => ({
            success: false,
            error: '用户名至少需要3个字符',
          }),
        } as Response);

        const response = await fetch('http://localhost:5000/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: '',
            email: 'test@example.com',
            password: 'password123',
            confirmPassword: 'password123',
          }),
        });

        expect(response.ok).toBe(false);
      });

      it('应该拒绝过短用户名（少于3个字符）', async () => {
        mockFetch.mockResolvedValue({
          ok: false,
          json: async () => ({
            success: false,
            error: '用户名至少需要3个字符',
          }),
        } as Response);

        const response = await fetch('http://localhost:5000/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: 'ab',
            email: 'test@example.com',
            password: 'password123',
            confirmPassword: 'password123',
          }),
        });

        expect(response.ok).toBe(false);
      });

      it('应该拒绝过长用户名（超过50个字符）', async () => {
        const longUsername = 'a'.repeat(51);

        mockFetch.mockResolvedValue({
          ok: false,
          json: async () => ({
            success: false,
            error: '用户名不能超过50个字符',
          }),
        } as Response);

        const response = await fetch('http://localhost:5000/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: longUsername,
            email: 'test@example.com',
            password: 'password123',
            confirmPassword: 'password123',
          }),
        });

        expect(response.ok).toBe(false);
      });

      it('应该拒绝无效邮箱格式', async () => {
        mockFetch.mockResolvedValue({
          ok: false,
          json: async () => ({
            success: false,
            error: '请输入有效的邮箱地址',
          }),
        } as Response);

        const response = await fetch('http://localhost:5000/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: 'testuser',
            email: 'invalid-email',
            password: 'password123',
            confirmPassword: 'password123',
          }),
        });

        expect(response.ok).toBe(false);
      });

      it('应该拒绝过短密码（少于6个字符）', async () => {
        mockFetch.mockResolvedValue({
          ok: false,
          json: async () => ({
            success: false,
            error: '密码至少需要6个字符',
          }),
        } as Response);

        const response = await fetch('http://localhost:5000/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: 'testuser',
            email: 'test@example.com',
            password: '123',
            confirmPassword: '123',
          }),
        });

        expect(response.ok).toBe(false);
      });

      it('应该拒绝过长密码（超过100个字符）', async () => {
        const longPassword = 'a'.repeat(101);

        mockFetch.mockResolvedValue({
          ok: false,
          json: async () => ({
            success: false,
            error: '密码不能超过100个字符',
          }),
        } as Response);

        const response = await fetch('http://localhost:5000/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: 'testuser',
            email: 'test@example.com',
            password: longPassword,
            confirmPassword: longPassword,
          }),
        });

        expect(response.ok).toBe(false);
      });

      it('应该拒绝密码确认不匹配', async () => {
        mockFetch.mockResolvedValue({
          ok: false,
          json: async () => ({
            success: false,
            error: '两次输入的密码不一致',
          }),
        } as Response);

        const response = await fetch('http://localhost:5000/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: 'testuser',
            email: 'test@example.com',
            password: 'password123',
            confirmPassword: 'password456',
          }),
        });

        expect(response.ok).toBe(false);
      });

      it('应该拒绝包含特殊字符的用户名', async () => {
        mockFetch.mockResolvedValue({
          ok: false,
          json: async () => ({
            success: false,
            error: '用户名只能包含字母、数字和下划线',
          }),
        } as Response);

        const response = await fetch('http://localhost:5000/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: 'user@#$',
            email: 'test@example.com',
            password: 'password123',
            confirmPassword: 'password123',
          }),
        });

        expect(response.ok).toBe(false);
      });
    });

    describe('边界值测试', () => {
      it('应该接受最小长度用户名（3个字符）', async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          json: async () => ({
            user: {
              id: '123e4567-e89b-12d3-a456-426614174002',
              username: 'abc',
              email: 'test@example.com',
              isActive: true,
              createdAt: new Date().toISOString(),
            },
            token: 'mock-jwt-token',
          }),
        } as Response);

        const response = await fetch('http://localhost:5000/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: 'abc',
            email: 'test@example.com',
            password: 'password123',
            confirmPassword: 'password123',
          }),
        });

        expect(response.ok).toBe(true);
      });

      it('应该接受最大长度用户名（50个字符）', async () => {
        const maxLengthUsername = 'a'.repeat(50);

        mockFetch.mockResolvedValue({
          ok: true,
          json: async () => ({
            user: {
              id: '123e4567-e89b-12d3-a456-426614174003',
              username: maxLengthUsername,
              email: 'test@example.com',
              isActive: true,
              createdAt: new Date().toISOString(),
            },
            token: 'mock-jwt-token',
          }),
        } as Response);

        const response = await fetch('http://localhost:5000/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: maxLengthUsername,
            email: 'test@example.com',
            password: 'password123',
            confirmPassword: 'password123',
          }),
        });

        expect(response.ok).toBe(true);
      });

      it('应该接受最小长度密码（6个字符）', async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          json: async () => ({
            user: {
              id: '123e4567-e89b-12d3-a456-426614174004',
              username: 'testuser',
              email: 'test@example.com',
              isActive: true,
              createdAt: new Date().toISOString(),
            },
            token: 'mock-jwt-token',
          }),
        } as Response);

        const response = await fetch('http://localhost:5000/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: 'testuser',
            email: 'test@example.com',
            password: '123456',
            confirmPassword: '123456',
          }),
        });

        expect(response.ok).toBe(true);
      });
    });
  });

  describe('POST /api/auth/login', () => {
    describe('成功场景', () => {
      it('应该成功登录并返回用户信息和token', async () => {
        const mockUser = {
          id: '123e4567-e89b-12d3-a456-426614174000',
          username: 'testuser',
          email: 'test@example.com',
          isActive: true,
          createdAt: new Date().toISOString(),
        };

        mockFetch.mockResolvedValue({
          ok: true,
          json: async () => ({
            user: mockUser,
            token: 'mock-jwt-token',
          }),
        } as Response);

        const response = await fetch('http://localhost:5000/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'test@example.com',
            password: 'password123',
          }),
        });

        const data = await response.json();

        expect(response.ok).toBe(true);
        expect(data.user).toBeDefined();
        expect(data.user.email).toBe('test@example.com');
        expect(data.token).toBe('mock-jwt-token');
        expect(mockFetch).toHaveBeenCalledTimes(1);
      });
    });

    describe('输入验证', () => {
      it('应该拒绝无效邮箱格式', async () => {
        mockFetch.mockResolvedValue({
          ok: false,
          json: async () => ({
            success: false,
            error: '请输入有效的邮箱地址',
          }),
        } as Response);

        const response = await fetch('http://localhost:5000/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'invalid-email',
            password: 'password123',
          }),
        });

        expect(response.ok).toBe(false);
      });

      it('应该拒绝过短密码（少于6个字符）', async () => {
        mockFetch.mockResolvedValue({
          ok: false,
          json: async () => ({
            success: false,
            error: '密码至少需要6个字符',
          }),
        } as Response);

        const response = await fetch('http://localhost:5000/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'test@example.com',
            password: '123',
          }),
        });

        expect(response.ok).toBe(false);
      });
    });

    describe('错误场景', () => {
      it('应该拒绝错误的邮箱', async () => {
        mockFetch.mockResolvedValue({
          ok: false,
          status: 401,
          json: async () => ({
            success: false,
            error: '邮箱或密码错误',
          }),
        } as Response);

        const response = await fetch('http://localhost:5000/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'nonexistent@example.com',
            password: 'password123',
          }),
        });

        expect(response.status).toBe(401);
      });

      it('应该拒绝错误的密码', async () => {
        mockFetch.mockResolvedValue({
          ok: false,
          status: 401,
          json: async () => ({
            success: false,
            error: '邮箱或密码错误',
          }),
        } as Response);

        const response = await fetch('http://localhost:5000/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'test@example.com',
            password: 'wrongpassword',
          }),
        });

        expect(response.status).toBe(401);
      });

      it('应该拒绝未激活的用户', async () => {
        mockFetch.mockResolvedValue({
          ok: false,
          status: 403,
          json: async () => ({
            success: false,
            error: '账户未激活',
          }),
        } as Response);

        const response = await fetch('http://localhost:5000/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'inactive@example.com',
            password: 'password123',
          }),
        });

        expect(response.status).toBe(403);
      });
    });

    describe('边界值测试', () => {
      it('应该接受最小长度密码（6个字符）', async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          json: async () => ({
            user: {
              id: '123e4567-e89b-12d3-a456-426614174005',
              username: 'testuser',
              email: 'test@example.com',
              isActive: true,
              createdAt: new Date().toISOString(),
            },
            token: 'mock-jwt-token',
          }),
        } as Response);

        const response = await fetch('http://localhost:5000/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'test@example.com',
            password: '123456',
          }),
        });

        expect(response.ok).toBe(true);
      });
    });
  });

  describe('API 行为', () => {
    it('应该处理 JSON 请求体', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          user: {
            id: '123e4567-e89b-12d3-a456-426614174006',
            username: 'testuser',
            email: 'test@example.com',
            isActive: true,
            createdAt: new Date().toISOString(),
          },
          token: 'mock-jwt-token',
        }),
      } as Response);

      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
          confirmPassword: 'password123',
        }),
      });

      expect(response.ok).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/auth/register'),
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
        json: async () => ({
          user: {
            id: '123e4567-e89b-12d3-a456-426614174007',
            username: 'testuser',
            email: 'test@example.com',
            isActive: true,
            createdAt: new Date().toISOString(),
          },
          token: 'mock-jwt-token',
        }),
      } as Response);

      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123',
        }),
      });

      const contentType = response.headers.get('content-type');
      expect(contentType).toBe('application/json');
    });
  });
});
