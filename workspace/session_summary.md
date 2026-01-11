# 会话摘要 - 越野训练教练 APP

**日期：** 2026-01-11
**项目：** trail-training-coach（越野训练教练APP）

---

## 项目概述

基于 Next.js 16 + React 19 + TypeScript + Tailwind CSS 4 + PostgreSQL + Drizzle ORM 的越野训练教练APP，包含成员管理、赛道管理、成绩预测和复盘功能。

---

## 本次会话完成的工作

### 1. 创建 GitHub 上传脚本

**文件路径：** `/workspace/upload_to_github.sh`

**功能：**
- 从环境变量读取配置（避免 Token 硬编码）
- 自动检测并初始化 Git 仓库
- 智能分支检测（支持 main/master 分支）
- 完整的错误处理和提示信息

**使用方法：**
```bash
cd /workspace
export GITHUB_TOKEN="your_token"
export GITHUB_USERNAME="wiximix"
export GITHUB_REPO="https://github.com/wiximix/trail-training-coach.git"
bash upload_to_github.sh
```

---

### 2. 上传项目到 GitHub

**仓库地址：** https://github.com/wiximix/trail-training-coach.git

**解决的问题：**
- projects 文件夹内嵌 .git 目录导致被当作子模块（gitlink）提交
- 删除 projects/.git 目录后，重新添加所有实际文件内容

**上传统计：**
- 45 个文件已上传
- 6438 行代码
- 包含完整的 Next.js 越野训练教练 APP 代码

---

### 3. 项目内上传脚本

**文件路径：** `/workspace/projects/upload_to_github.sh`

**特性：**
- 从环境变量读取配置
- 自动检测并初始化 Git 仓库
- 智能分支检测（支持 main/master 分支）
- 完整的错误处理和提示信息

---

### 4. 推送所有分支到 GitHub

**推送的分支：**
1. **main**（主分支）
   - Commit: dc40059 - Add GitHub upload script
   - Commit: 9c79d75 - Initial commit

2. **dev**（开发分支）
   - Commit: dc40059 - Add GitHub upload script
   - Commit: 9c79d75 - Initial commit

3. **List**（本地分支）
   - Commit: dc40059 - Add GitHub upload script
   - Commit: 9c79d75 - Initial commit

4. **list**（本地分支）
   - Commit: dc40059 - Add GitHub upload script
   - Commit: 9c79d75 - Initial commit

5. **master**（历史分支）
   - Commit: 8352981 - Remove .git from projects folder and re-add files
   - Commit: b34b4ea - Upload projects folder

---

### 5. 分支管理

**设置 main 为默认分支：**
```bash
curl -X PATCH \
  -H "Authorization: token YOUR_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/wiximix/trail-training-coach \
  -d '{"default_branch":"main"}'
```

**删除的分支：**
- 本地：List, list, dev
- 远程：List, list, master

**最终分支状态：**
- 本地：main（当前分支）
- 远程：main（默认分支）, dev

---

### 6. Git 历史记录恢复

**创建恢复脚本：** `/workspace/projects/restore_history.sh`

**恢复内容：**
- 创建本地 master 分支，追踪 origin/master
- 恢复了之前删除的 .git 目录的所有历史记录
- 提供了查看和恢复历史代码的方法

**当前分支结构：**
```
* dc40059 (main) Add GitHub upload script
* 9c79d75 Initial commit
* 8352981 (master) Remove .git from projects folder and re-add files
* b34b4ea Upload projects folder
```

---

## 重要命令记录

### Git 操作

```bash
# 初始化 Git 仓库
cd /workspace/projects
git init

# 添加远程仓库
git remote add origin https://github.com/wiximix/trail-training-coach.git

# 推送所有分支
git push --all origin

# 删除远程分支
git push origin --delete branch_name

# 设置默认分支（GitHub API）
curl -X PATCH \
  -H "Authorization: token YOUR_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/OWNER/REPO \
  -d '{"default_branch":"main"}'

# 查看所有分支
git branch -a

# 查看提交历史
git log --oneline --graph --all --decorate

# 切换分支
git checkout branch_name

# 从远程分支创建本地分支
git checkout -b branch_name origin/branch_name
```

---

## 项目结构

```
/workspace/projects/
├── .coze
├── .cozeproj/
│   └── scripts/
│       ├── deploy_build.sh
│       ├── deploy_run.sh
│       ├── dev_build.sh
│       └── dev_run.sh
├── .git/
├── .gitignore
├── .next/
├── node_modules/
├── package.json
├── pnpm-lock.yaml
├── postcss.config.mjs
├── tsconfig.json
├── tsconfig.tsbuildinfo
├── upload_to_github.sh          # GitHub 上传脚本
├── restore_history.sh          # 历史恢复脚本
├── next.config.ts
├── next-env.d.ts
├── eslint.config.mjs
└── src/
    ├── app/
    │   ├── api/
    │   │   ├── members/
    │   │   ├── trails/
    │   │   ├── reviews/
    │   │   └── predict/
    │   ├── layout.tsx
    │   ├── page.tsx
    │   ├── members/
    │   ├── trails/
    │   ├── predict/
    │   └── reviews/
    └── lib/
        └── trailAlgorithm.ts
```

---

## 环境配置

**Node.js 版本：** 24
**包管理器：** pnpm

**安装依赖：**
```bash
pnpm install
```

**启动开发服务：**
```bash
pnpm dev
# 或
bash .cozeproj/scripts/dev_run.sh
```

**服务端口：** 5000

---

## 数据库配置

- 数据库类型：PostgreSQL
- ORM：Drizzle
- 连接配置：`src/storage/database/db.ts`

---

## 核心算法文件

**文件路径：** `src/lib/trailAlgorithm.ts`

**功能：**
- 基于储备心率(HRR)动态计算5个训练强度区间
- 分级动态计算爬升影响值
- 能量需求计算
- 补给策略计算

---

## 关键技术决策

1. 使用 localStorage 传递预测数据到复盘页面
2. 实现数据库连接单例模式以优化性能
3. 采用分级动态计算爬升影响值（4级系数）
4. 能量需求计算从碳水改为热量：体重 × 4Kcal/小时
5. 分段用时计算：(本段距离 + 爬升等效距离) × 计划配速 × 路段系数

---

## GitHub 仓库信息

**仓库地址：** https://github.com/wiximix/trail-training-coach.git
**默认分支：** main
**所有者：** wiximix
**可见性：** public

---

## 待办事项

- [ ] 继续完善越野训练教练 APP 的功能
- [ ] 优化前端 UI/UX
- [ ] 添加更多训练分析功能
- [ ] 完善单元测试覆盖

---

## 备注

- 所有 Git 操作均使用 Token 认证
- Token 通过环境变量传递，避免硬编码
- 注意安全，不要在公共代码仓库中暴露敏感信息
