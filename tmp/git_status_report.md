# Git 分支同步报告

## 当前状态

### 本地分支
- **main** 分支：c4ff9855 chore: 更新 commit 日志（当前分支）
- **dev** 分支：c4ff9855 chore: 更新 commit 日志（已与 main 同步）
- **master** 分支：83529818（追踪 origin/master）

### 远程分支
- **origin/main**：落后于本地 main 分支
- **origin/dev**：落后于本地 dev 分支
- **origin/master**：最新提交 83529818

## 已完成工作

✅ 本地 dev 和 main 分支内容已同步
✅ dev 分支已创建并切换
✅ 两个分支指向同一提交（c4ff9855）

## 待推送的提交

本地 main 分支有以下提交需要推送到远程仓库：
1. c4ff9855 chore: 更新 commit 日志
2. 9efce48b chore: 更新 package.json，添加越野训练教练APP所需依赖
3. 5852a80c chore: 从 git 仓库中移除 node_modules
4. e522c640 Update - 2026-01-11 20:54:55
5. 9c5dd189 chore: 更新 commit 日志
6. f2748fa0 docs: 创建 Git Commit 日志系统，支持自动记录每次提交和提示词

## 推送方案

### 方案 1：使用 GITHUB_TOKEN（推荐）

```bash
# 设置 GitHub Token
export GITHUB_TOKEN="your_personal_access_token_here"

# 推送 main 分支
git push -u origin main

# 推送 dev 分支
git checkout dev
git push -u origin dev
```

### 方案 2：使用 upload_to_github.sh 脚本

```bash
# 设置 GitHub Token
export GITHUB_TOKEN="your_personal_access_token_here"

# 使用脚本推送
bash upload_to_github.sh
```

### 方案 3：配置 SSH 密钥

1. 生成 SSH 密钥：
   ```bash
   ssh-keygen -t ed25519 -C "your_email@example.com"
   ```

2. 添加公钥到 GitHub：
   - 复制 `~/.ssh/id_ed25519.pub` 内容
   - 在 GitHub 设置中添加 SSH 密钥

3. 更改远程 URL 为 SSH：
   ```bash
   git remote set-url origin git@github.com:wiximix/trail-training-coach.git
   git push -u origin main
   ```

## 注意事项

- .next 目录下的文件已被 Git 追踪，建议从历史记录中移除以避免提交构建缓存
- 如果遇到文件大小超过 100MB 的限制，可以参考 restore_history.sh 脚本中的 filter-branch 命令
