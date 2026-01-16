# 部署指南

本文档详细说明了越野训练教练 APP 的部署流程、环境配置和运维指南。

## 目录

- [部署方式](#部署方式)
- [环境准备](#环境准备)
- [环境配置](#环境配置)
- [数据库配置](#数据库配置)
- [本地部署](#本地部署)
- [Docker 部署](#docker-部署)
- [云平台部署](#云平台部署)
- [监控与日志](#监控与日志)
- [备份与恢复](#备份与恢复)
- [常见问题](#常见问题)

---

## 部署方式

本项目支持以下部署方式：

1. **本地部署** - 适合开发和测试环境
2. **Docker 部署** - 推荐生产环境，便于容器化管理
3. **云平台部署** - 支持 Vercel、Railway 等平台

---

## 环境准备

### 系统要求

- **操作系统**: Linux (Ubuntu 20.04+ 推荐)、macOS 或 Windows (WSL2)
- **Node.js**: 20.0.0 或更高版本
- **PostgreSQL**: 14.0 或更高版本
- **pnpm**: 8.0.0 或更高版本
- **内存**: 最低 2GB，推荐 4GB 以上
- **磁盘空间**: 最低 10GB，推荐 20GB 以上

### 安装 Node.js

#### Linux (Ubuntu)

```bash
# 使用 NodeSource 仓库安装
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 验证安装
node -v
npm -v
```

#### macOS

```bash
# 使用 Homebrew 安装
brew install node@20

# 验证安装
node -v
npm -v
```

#### Windows

从 [Node.js 官网](https://nodejs.org/) 下载并安装最新 LTS 版本。

### 安装 pnpm

```bash
# 使用 npm 安装
npm install -g pnpm

# 验证安装
pnpm -v
```

### 安装 PostgreSQL

#### Linux (Ubuntu)

```bash
# 安装 PostgreSQL
sudo apt-get update
sudo apt-get install -y postgresql postgresql-contrib

# 启动服务
sudo systemctl start postgresql
sudo systemctl enable postgresql

# 验证安装
sudo -u postgres psql --version
```

#### macOS

```bash
# 使用 Homebrew 安装
brew install postgresql@14

# 启动服务
brew services start postgresql@14

# 验证安装
psql --version
```

#### Windows

从 [PostgreSQL 官网](https://www.postgresql.org/download/windows/) 下载并安装。

### 创建数据库

```bash
# 切换到 postgres 用户
sudo -u postgres psql

# 在 psql 中执行以下命令
CREATE DATABASE trail_training_coach;
CREATE USER trail_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE trail_training_coach TO trail_user;
\q
```

---

## 环境配置

### 环境变量配置

复制环境变量模板：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```env
# 数据库配置
DATABASE_URL=postgresql://trail_user:your_secure_password@localhost:5432/trail_training_coach

# JWT 密钥（生产环境必须使用强密钥）
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# 对象存储配置（可选）
S3_ACCESS_KEY_ID=your-access-key
S3_SECRET_ACCESS_KEY=your-secret-key
S3_REGION=us-east-1
S3_BUCKET=your-bucket-name

# 域名配置
NEXT_PUBLIC_DOMAIN=your-domain.com
NEXT_PUBLIC_URL=https://your-domain.com
NEXT_PUBLIC_APP_URL=https://your-domain.com

# 应用配置
NODE_ENV=production
PORT=5000

# Coze SDK 配置（如果使用）
COZE_API_KEY=your-coze-api-key
COZE_API_URL=https://api.coze.com
```

### 安全建议

1. **JWT_SECRET** - 使用至少 32 个字符的强随机字符串
2. **数据库密码** - 使用强密码，包含大小写字母、数字和特殊字符
3. **S3 密钥** - 限制访问权限，使用 IAM 角色而非访问密钥
4. **环境变量** - 不要将 `.env` 文件提交到版本控制

生成强随机密钥：

```bash
# 生成 JWT 密钥
openssl rand -base64 32

# 生成数据库密码
openssl rand -base64 24
```

---

## 数据库配置

### 初始化数据库

#### 使用 Dr ORM 迁移

```bash
# 生成迁移文件（如果修改了 schema）
pnpm db:generate

# 应用迁移
pnpm db:push
```

或使用迁移文件：

```bash
pnpm db:migrate
```

#### 使用 SQL 脚本

如果手动创建表，可以执行 `drizzle/migrations` 目录下的 SQL 文件：

```bash
psql -U trail_user -d trail_training_coach -f drizzle/migrations/0000_init.sql
```

### 数据库优化

#### 创建索引（可选）

```sql
-- 为常用查询字段创建索引
CREATE INDEX idx_members_vo2max ON members(vo2max);
CREATE INDEX idx_trails_distance ON trails(total_distance);
CREATE INDEX idx_reviews_created ON reviews(created_at);
CREATE INDEX idx_team_members_team ON team_members(team_id);
```

#### 配置连接池

在 `DATABASE_URL` 中配置连接池参数：

```env
DATABASE_URL=postgresql://user:pass@host:5432/db?connection_limit=10&pool_timeout=20
```

---

## 本地部署

### 开发环境

1. **克隆仓库**

```bash
git clone https://github.com/wiximix/trail-training-coach.git
cd trail-training-coach
```

2. **安装依赖**

```bash
pnpm install
```

3. **配置环境变量**

```bash
cp .env.example .env
# 编辑 .env 文件
```

4. **初始化数据库**

```bash
pnpm db:push
```

5. **启动开发服务器**

```bash
pnpm dev
```

应用将在 `http://localhost:5000` 启动。

### 生产环境

1. **构建项目**

```bash
pnpm build
```

2. **启动生产服务器**

```bash
pnpm start
```

或使用 PM2 进行进程管理：

```bash
# 安装 PM2
npm install -g pm2

# 启动应用
pm2 start npm --name "trail-coach" -- start

# 设置开机自启
pm2 startup
pm2 save
```

3. **配置反向代理（Nginx）**

创建 Nginx 配置文件 `/etc/nginx/sites-available/trail-coach`：

```nginx
upstream trail_coach {
    server 127.0.0.1:5000;
}

server {
    listen 80;
    server_name your-domain.com;

    # 重定向到 HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    # SSL 证书配置
    ssl_certificate /path/to/ssl/cert.pem;
    ssl_certificate_key /path/to/ssl/key.pem;

    # SSL 安全配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    location / {
        proxy_pass http://trail_coach;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

启用配置：

```bash
sudo ln -s /etc/nginx/sites-available/trail-coach /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 使用 Coze CLI

开发环境：

```bash
coze dev
```

生产环境：

```bash
# 构建
coze build

# 启动
coze start
```

---

## Docker 部署

### 创建 Dockerfile

在项目根目录创建 `Dockerfile`：

```dockerfile
# 使用官方 Node.js 20 镜像作为基础镜像
FROM node:20-alpine AS base

# 安装依赖阶段
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# 复制依赖文件
COPY package.json pnpm-lock.yaml ./

# 安装 pnpm
RUN npm install -g pnpm

# 安装依赖
RUN pnpm install --frozen-lockfile

# 构建阶段
FROM base AS builder
WORKDIR /app

# 复制依赖
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 设置环境变量
ENV NEXT_TELEMETRY_DISABLED=1

# 构建应用
RUN pnpm build

# 运行阶段
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# 创建非 root 用户
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 复制构建产物
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# 设置权限
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 5000

ENV PORT=5000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

### 创建 docker-compose.yml

在项目根目录创建 `docker-compose.yml`：

```yaml
version: '3.8'

services:
  # PostgreSQL 数据库
  db:
    image: postgres:14-alpine
    container_name: trail-coach-db
    environment:
      POSTGRES_USER: trail_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: trail_training_coach
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U trail_user"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Next.js 应用
  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: trail-coach-app
    environment:
      DATABASE_URL: postgresql://trail_user:${DB_PASSWORD}@db:5432/trail_training_coach
      JWT_SECRET: ${JWT_SECRET}
      NODE_ENV: production
      NEXT_PUBLIC_DOMAIN: ${NEXT_PUBLIC_DOMAIN}
      NEXT_PUBLIC_URL: ${NEXT_PUBLIC_URL}
      NEXT_PUBLIC_APP_URL: ${NEXT_PUBLIC_APP_URL}
    ports:
      - "5000:5000"
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped

volumes:
  postgres_data:
```

### 构建 and 运行

1. **构建镜像**

```bash
docker-compose build
```

2. **启动服务**

```bash
docker-compose up -d
```

3. **查看日志**

```bash
docker-compose logs -f app
```

4. **停止服务**

```bash
docker-compose down
```

5. **初始化数据库**

```bash
# 进入应用容器
docker-compose exec app sh

# 运行迁移
pnpm db:push

# 退出容器
exit
```

### 使用 Docker 镜像仓库

推送到 Docker Hub：

```bash
# 登录 Docker Hub
docker login

# 标记镜像
docker tag trail-training-coach-app username/trail-coach:latest

# 推送镜像
docker push username/trail-coach:latest
```

从 Docker Hub 拉取：

```yaml
services:
  app:
    image: username/trail-coach:latest
    # ... 其他配置
```

---

## 云平台部署

### Vercel 部署

1. **准备项目**

确保项目已推送到 GitHub。

2. **导入项目**

- 登录 [Vercel](https://vercel.com)
- 点击 "Add New Project"
- 导入 GitHub 仓库

3. **配置环境变量**

在 Vercel 项目设置中添加以下环境变量：

- `DATABASE_URL`
- `JWT_SECRET`
- `S3_ACCESS_KEY_ID` (如果使用对象存储)
- `S3_SECRET_ACCESS_KEY`
- `NEXT_PUBLIC_DOMAIN`
- `NEXT_PUBLIC_URL`
- `NEXT_PUBLIC_APP_URL`

4. **部署**

Vercel 会自动检测 Next.js 项目并进行部署。

### Railway 部署

1. **创建新项目**

- 登录 [Railway](https://railway.app)
- 点击 "New Project"

2. **添加 PostgreSQL 数据库**

- 选择 "Database"
- 选择 "PostgreSQL"

3. **添加应用**

- 选择 "Repo from GitHub"
- 选择项目仓库

4. **配置环境变量**

Railway 会自动从 PostgreSQL 数据库获取 `DATABASE_URL`。

手动添加其他环境变量。

5. **部署**

Railway 会自动部署项目。

### 其他云平台

#### AWS EC2

1. **启动 EC2 实例** (Ubuntu 20.04)
2. **安装依赖** (Node.js, PostgreSQL, Nginx)
3. **克隆项目**
4. **配置环境变量**
5. **初始化数据库**
6. **启动应用**
7. **配置反向代理**

#### Google Cloud Platform (GCP)

使用 Google App Engine 或 Cloud Run：

```bash
# 安装 Google Cloud SDK
gcloud app deploy

# 或使用 Cloud Run
gcloud run deploy trail-coach --source .
```

#### Azure

使用 Azure App Service 或 Container Instances：

```bash
# 使用 Azure CLI
az webapp up --name trail-coach --resource-group myResourceGroup
```

---

## 监控与日志

### 应用日志

查看应用日志：

```bash
# 本地部署
pm2 logs trail-coach

# Docker 部署
docker-compose logs -f app

# 云平台
# 查看平台提供的日志功能
```

### 数据库日志

查看 PostgreSQL 日志：

```bash
# 本地安装
sudo tail -f /var/log/postgresql/postgresql-14-main.log

# Docker
docker-compose logs -f db
```

### 性能监控

使用 PM2 监控：

```bash
# 监控 CPU 和内存
pm2 monit

# 查看详细信息
pm2 show trail-coach
```

### 错误追踪

推荐集成错误追踪服务：

- **Sentry**: 实时错误追踪和性能监控
- **LogRocket**: 用户会话回放
- **New Relic**: 全栈性能监控

---

## 备份与恢复

### 数据库备份

#### 手动备份

```bash
# 备份数据库
pg_dump -U trail_user -d trail_training_coach > backup_$(date +%Y%m%d).sql

# 压缩备份
gzip backup_$(date +%Y%m%d).sql
```

#### 自动备份脚本

创建 `scripts/backup.sh`：

```bash
#!/bin/bash

BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
FILENAME="trail_coach_${DATE}.sql"

# 创建备份目录
mkdir -p $BACKUP_DIR

# 备份数据库
pg_dump -U trail_user -d trail_training_coach > $BACKUP_DIR/$FILENAME

# 压缩
gzip $BACKUP_DIR/$FILENAME

# 删除 7 天前的备份
find $BACKUP_DIR -name "trail_coach_*.sql.gz" -mtime +7 -delete

echo "Backup completed: $BACKUP_DIR/${FILENAME}.gz"
```

设置定时任务：

```bash
# 编辑 crontab
crontab -e

# 每天凌晨 2 点备份
0 2 * * * /path/to/scripts/backup.sh >> /var/log/backup.log 2>&1
```

#### Docker 备份

```bash
# 备份容器中的数据库
docker-compose exec db pg_dump -U trail_user trail_training_coach > backup.sql
```

### 数据库恢复

#### 从备份恢复

```bash
# 解压备份
gunzip backup_20240101.sql.gz

# 恢复数据库
psql -U trail_user -d trail_training_coach < backup_20240101.sql
```

#### Docker 恢复

```bash
# 恢复到容器
docker-compose exec -T db psql -U trail_user trail_training_coach < backup.sql
```

### 文件备份

如果使用对象存储，建议配置对象存储的版本控制和生命周期策略。

---

## 常见问题

### 1. 数据库连接失败

**问题**: `Error: Connection refused`

**解决方案**:
- 检查 PostgreSQL 服务是否运行
- 验证 `DATABASE_URL` 配置是否正确
- 检查防火墙规则

```bash
# 检查 PostgreSQL 状态
sudo systemctl status postgresql

# 测试连接
psql -U trail_user -d trail_training_coach -h localhost
```

### 2. 端口被占用

**问题**: `Error: Port 5000 is already in use`

**解决方案**:
```bash
# 查找占用端口的进程
lsof -i :5000

# 或使用 netstat
netstat -tuln | grep 5000

# 杀死进程
kill -9 <PID>
```

### 3. 内存不足

**问题**: 应用因内存不足而崩溃

**解决方案**:
- 增加服务器内存
- 配置 Node.js 内存限制

```bash
# 设置内存限制
NODE_OPTIONS="--max-old-space-size=4096" pnpm start
```

### 4. 构建失败

**问题**: `pnpm build` 失败

**解决方案**:
```bash
# 清理缓存
rm -rf .next
rm -rf node_modules
rm pnpm-lock.yaml

# 重新安装依赖
pnpm install

# 重新构建
pnpm build
```

### 5. JWT 验证失败

**问题**: `Error: Invalid token`

**解决方案**:
- 确保 `JWT_SECRET` 在前后端配置一致
- 检查 token 是否过期
- 验证 token 格式是否正确

### 6. Docker 容器无法启动

**问题**: Docker 容器启动失败

**解决方案**:
```bash
# 查看容器日志
docker-compose logs app

# 检查配置
docker-compose config

# 重建容器
docker-compose down
docker-compose up -d --build
```

### 7. SSL 证书问题

**问题**: HTTPS 无法访问

**解决方案**:
```bash
# 使用 Let's Encrypt 获取免费证书
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo certbot renew --dry-run
```

---

## 安全加固

### 1. 防火墙配置

使用 UFW 配置防火墙：

```bash
# 启用 UFW
sudo ufw enable

# 允许 SSH
sudo ufw allow 22

# 允许 HTTP/HTTPS
sudo ufw allow 80
sudo ufw allow 443

# 拒绝其他端口
sudo ufw default deny incoming
sudo ufw default allow outgoing

# 查看状态
sudo ufw status
```

### 2. SSL/TLS 配置

使用 Let's Encrypt 免费证书：

```bash
# 安装 Certbot
sudo apt-get install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d your-domain.com
```

### 3. 安全头配置

在 `next.config.ts` 中添加安全头：

```typescript
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          }
        ]
      }
    ]
  }
}
```

---

## 性能优化

### 1. 数据库优化

- 创建适当的索引
- 定期清理无用数据
- 配置连接池

### 2. 应用优化

- 启用 Next.js 的静态生成
- 使用 CDN 加速静态资源
- 实现缓存策略

### 3. 服务器优化

- 使用 Nginx 作为反向代理
- 启用 Gzip 压缩
- 配置负载均衡（多实例）

---

## 更新与维护

### 更新应用

```bash
# 拉取最新代码
git pull origin main

# 更新依赖
pnpm install

# 重新构建
pnpm build

# 重启服务
pm2 restart trail-coach
```

### 数据库迁移

```bash
# 生成迁移文件
pnpm db:generate

# 应用迁移
pnpm db:migrate
```

---

## 支持

如有部署相关问题，请通过以下方式寻求帮助：

- GitHub Issues: [提交问题](https://github.com/wiximix/trail-training-coach/issues)
- 邮箱: support@example.com
- 文档: [API 文档](./API_ROUTES.md) | [README](./README.md)

---

**注意**: 本文档会随着项目更新而不断完善，建议定期查看最新版本。
