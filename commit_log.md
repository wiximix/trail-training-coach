# Git Commit 日志

**项目：** trail-training-coach（越野训练教练APP）
**开始记录时间：** 2026-01-11

---

## 使用说明

### 方式 1：使用 git-commit-wrapper.sh（推荐）

```bash
# 交互式提交
./git-commit-wrapper.sh

# 使用 -m 参数指定 commit message
./git-commit-wrapper.sh -m "feat: 添加新功能" "用户需求：实现xxx功能"
```

### 方式 2：使用 git-commit.sh（带提示词输入）

```bash
./git-commit.sh
```

### 方式 3：使用标准 git commit（自动记录）

```bash
git add .
git commit -m "your message"
# post-commit hook 会自动记录到 commit_log.md
```

---

## Commit 日志

| 日期 | Commit Hash | 分支 | 提交信息 | 提示词 | 影响文件 |
|------|-------------|------|----------|--------|----------|
| 2026-01-12 | `443884ce4a87a3f34baa55dc4b4dd8f2d01502fe` | main | feat: 添加跑团功能，支持创建跑团、申请加入、成员管理 | 无 | .next/dev/prerender-manifest.json,.next/dev/server/app-paths-manifest.json,.next/dev/server/middleware-manifest.json,.next/dev/server/next-font-manifest.js,.next/dev/server/next-font-manifest.json,.next/dev/static/chunks/[root-of-the-server]__0f0ba101._.css,.next/dev/static/chunks/[root-of-the-server]__0f0ba101._.css.map,.next/dev/static/chunks/src_app_globals_css_bad6b30c._.single.css,.next/dev/static/chunks/src_app_globals_css_bad6b30c._.single.css.map,.next/dev/trace,.next/dev/types/routes.d.ts,.next/dev/types/validator.ts,src/app/api/teams/[id]/approve/route.ts,src/app/api/teams/[id]/leave/route.ts,src/app/api/teams/[id]/members/[userId]/route.ts,src/app/api/teams/[id]/members/route.ts,src/app/api/teams/[id]/reject/route.ts,src/app/api/teams/[id]/route.ts,src/app/api/teams/my/route.ts,src/app/api/teams/route.ts,src/app/teams/[id]/page.tsx,src/app/teams/new/page.tsx,src/app/teams/page.tsx,src/components/DashboardLayout.tsx,src/storage/database/index.ts,src/storage/database/shared/schema.ts,src/storage/database/teamManager.ts,tsconfig.tsbuildinfo,"workspace/345276205345274200345217221.md" |
| 2026-01-12 | `c7dfcb2ef3f2405c063ccce2f538e45a24023f55` | main | fix: 修复导航栏显示和复盘页面404问题 | 无 | .next/dev/prerender-manifest.json,.next/dev/server/app-paths-manifest.json,.next/dev/server/middleware-manifest.json,.next/dev/server/next-font-manifest.js,.next/dev/server/next-font-manifest.json,.next/dev/static/chunks/[root-of-the-server]__0f0ba101._.css,.next/dev/static/chunks/[root-of-the-server]__0f0ba101._.css.map,.next/dev/static/chunks/src_app_globals_css_bad6b30c._.single.css,.next/dev/static/chunks/src_app_globals_css_bad6b30c._.single.css.map,.next/dev/trace,.next/dev/types/routes.d.ts,.next/dev/types/validator.ts,src/app/predict/page.tsx,src/app/reviews/[id]/page.tsx,src/app/reviews/new/page.tsx,src/app/reviews/page.tsx,src/app/trails/page.tsx,tsconfig.tsbuildinfo |
| 2026-01-12 | `2356b2e715211dbf94406d8188aceeae15d4283c` | main | fix: 修复 child_process 构建错误和 useRouter 运行时错误 | 无 | .next/dev/cache/next-devtools-config.json,.next/dev/fallback-build-manifest.json,.next/dev/logs/next-development.log,.next/dev/prerender-manifest.json,.next/dev/server/app-paths-manifest.json,.next/dev/server/app/page_client-reference-manifest.js,.next/dev/server/middleware-build-manifest.js,.next/dev/server/middleware-manifest.json,.next/dev/server/next-font-manifest.js,.next/dev/server/next-font-manifest.json,.next/dev/server/pages-manifest.json,.next/dev/static/chunks/[root-of-the-server]__0f0ba101._.css,.next/dev/static/chunks/[root-of-the-server]__0f0ba101._.css.map,.next/dev/static/chunks/src_app_globals_css_bad6b30c._.single.css,.next/dev/static/chunks/src_app_globals_css_bad6b30c._.single.css.map,.next/dev/static/chunks/src_app_page_tsx_20f3862f._.js,.next/dev/static/development/_buildManifest.js,.next/dev/trace,src/app/api/auth/forgot-password/route.ts,src/app/api/auth/login/route.ts,src/app/api/auth/register/route.ts,src/app/api/auth/reset-password/route.ts,src/app/api/members/[id]/route.ts,src/app/api/members/route.ts,src/app/api/predict/route.ts,src/app/api/reviews/[id]/route.ts,src/app/api/reviews/route.ts,src/app/api/trails/[id]/route.ts,src/app/api/trails/route.ts,src/app/members/page.tsx,src/lib/auth.ts,src/storage/database/index.ts,src/storage/database/memberManager.ts,src/storage/database/reviewManager.ts,src/storage/database/trailManager.ts,src/storage/database/userManager.ts,tsconfig.tsbuildinfo |
| 2026-01-11 | `26e474b608bd91509c99d74ff83c6b688fbb04c1` | main | feat: 添加身份验证、路由保护、忘记密码和个人中心功能 | 无 | .next/dev/fallback-build-manifest.json,.next/dev/logs/next-development.log,.next/dev/server/app/page.js,.next/dev/server/app/page_client-reference-manifest.js,.next/dev/server/middleware-build-manifest.js,.next/dev/server/middleware-manifest.json,.next/dev/server/next-font-manifest.js,.next/dev/server/next-font-manifest.json,.next/dev/server/pages-manifest.json,.next/dev/static/chunks/src_app_page_tsx_20f3862f._.js,.next/dev/static/development/_buildManifest.js,.next/dev/static/development/_clientMiddlewareManifest.json,.next/dev/types/routes.d.ts,.next/dev/types/validator.ts |
| 2026-01-11 | `b55d04b376beb9d4ed2d3162cb3259a1ba766e27` | main | feat: 添加用户注册和登录功能 | 无 | .next/dev/server/app-paths-manifest.json,.next/dev/static/chunks/[root-of-the-server]__0f0ba101._.css,.next/dev/static/chunks/[root-of-the-server]__0f0ba101._.css.map,.next/dev/static/chunks/src_app_globals_css_bad6b30c._.single.css,.next/dev/static/chunks/src_app_globals_css_bad6b30c._.single.css.map,.next/dev/types/routes.d.ts,.next/dev/types/validator.ts,"workspace/345276205345274200345217221.md" |
| 2026-01-11 | `6313eee0a31a9a7d68a60622d70bcded003bbb2e` | main | feat: 添加用户注册和登录功能 | 无 | drizzle/migrations/0001_create_users_table.sql,package.json,pnpm-lock.yaml,src/app/api/auth/login/route.ts,src/app/api/auth/register/route.ts,src/app/auth/login/page.tsx,src/app/auth/register/page.tsx,src/storage/database/shared/schema.ts,src/storage/database/userManager.ts |
| 2026-01-11 | `999d03b2c7faaada680fd457053f82e46e121f1e` | dev | chore: 更新 commit 日志 | 无 |  |
| 2026-01-11 | `d49a298cafa8db835577dc210048f324a50cb225` | dev | fix: 解决 commit 日志合并冲突 | 无 |  |
| 2026-01-11 | `bcafa7b1f4536910460372ad2d1dc97be4d4d433` | main | chore: 更新 commit 日志 | 无 |  |
| 2026-01-11 | `44f57f0225007f0a6546ca22d7495c39a3e58e5f` | main | chore: 更新 commit 日志 | 无 |  |
| 2026-01-11 | `d28ce95a5701cf1cee7cd642ea4a6460b29507c8` | main | chore: 更新 commit 日志 | 无 |  |
| 2026-01-11 | `784e3435318349930b252ea2323ea397bd4cd681` | main | chore: 更新 commit 日志 | 无 |  |
| 2026-01-11 | `8a5721f453cbe1391766ab96502537f7117ce98b` | main | chore: 更新 commit 日志 | 无 |  |
| 2026-01-11 | `240000c8950b669f4cd8e07f74e7003843a3d0c5` | main | chore: 同步 dev 分支与 main 分支内容 | 无 | .next/dev/logs/next-development.log,.next/dev/prerender-manifest.json,.next/dev/server/app-paths-manifest.json,.next/dev/server/next-font-manifest.js,.next/dev/server/next-font-manifest.js,.next/dev/server/server-reference-manifest.js,.next/dev/server/server-reference-manifest.json,.next/dev/trace,tmp/git_status_report.md |
| 2026-01-11 | `c4ff985506c4330b2c2a0b65582ef666cc8689db` | main | chore: 更新 commit 日志 | 无 |  |
| 2026-01-11 | `9efce48bdfc8ff83360ac88f9d30cdac1bda5453` | main | chore: 更新 package.json，添加越野训练教练APP所需依赖 | 无 | pnpm-lock.yaml |
| 2026-01-11 | `07c8c73f413a4632a55304e04c271bea714cb3ba` | main | Update - 2026-01-11 20:54:55 | 无 |  |
| 2026-01-11 | `2bffddab93e48cc39d8c3fd130506c810d7e82c9` | main | chore: 更新 commit 日志 | 无 |  |
| 2026-01-11 | `884c7041b1aa20db9b9af907d984d922202111e7` | main | docs: 创建 Git Commit 日志系统，支持自动记录每次提交和提示词 | 无 |  |
| 2026-01-11 | `ac605c5ee892c1c2cb5de6cddf91a305f996c7a1` | main | chore: 清理测试文件 | 无 |  |
| 2026-01-11 | `3e0d0fce736e563fb27f76353caf9b8a4e8d2d47` | main | test: 测试 post-commit hook | 无 |  |
| 2026-01-11 | dc40059 | main | Add GitHub upload script | 创建 GitHub 上传脚本，用于自动化部署项目代码到 GitHub 仓库 | upload_to_github.sh |
| 2026-01-11 | 9c79d75 | main | Initial commit | 初始化项目，创建 Next.js 越野训练教练APP的基础结构 | 所有项目文件 |

---

## 详细记录

### 2026-01-11

#### Commit: dc40059

**Commit Hash:** `dc40059`
**分支:** main
**时间:** 2026-01-11 14:51:30
**提交信息:** Add GitHub upload script
**提示词:** 创建 GitHub 上传脚本，用于自动化部署项目代码到 GitHub 仓库
**影响文件:** upload_to_github.sh

---

#### Commit: 9c79d75

**Commit Hash:** `9c79d75`
**分支:** main
**时间:** 2026-01-11
**提交信息:** Initial commit
**提示词:** 初始化项目，创建 Next.js 越野训练教练APP的基础结构
**影响文件:** 所有项目文件

---

### 历史记录（master 分支）

#### Commit: 8352981

**Commit Hash:** `8352981`
**分支:** master
**时间:** 2026-01-11 14:42:04
**提交信息:** Remove .git from projects folder and re-add files
**提示词:** 修复上传问题，删除 projects/.git 目录后重新添加实际文件内容
**影响文件:** projects/ 目录下所有文件

---

#### Commit: b34b4ea

**Commit Hash:** `b34b4ea`
**分支:** master
**时间:** 2026-01-11 14:41:57
**提交信息:** Upload projects folder
**提示词:** 首次上传 projects 文件夹到 GitHub 仓库
**影响文件:** projects/

---
