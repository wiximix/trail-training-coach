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
