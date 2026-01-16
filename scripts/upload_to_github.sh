#!/bin/bash

# ============================================================
# 上传当前项目到 GitHub 脚本
# ============================================================

# 配置变量（从环境变量读取）
GITHUB_TOKEN="${GITHUB_TOKEN}"
GITHUB_USERNAME="${GITHUB_USERNAME:-wiximix}"
GITHUB_REPO="${GITHUB_REPO:-https://github.com/wiximix/trail-training-coach.git}"

set -e  # 遇到错误立即退出

# 检查必需的环境变量
if [ -z "$GITHUB_TOKEN" ]; then
    echo "错误：未设置 GITHUB_TOKEN 环境变量"
    echo "请使用以下方式设置："
    echo "  export GITHUB_TOKEN=\"your_token_here\""
    echo ""
    echo "然后执行："
    echo "  bash upload_to_github.sh"
    exit 1
fi

echo "========================================"
echo "开始上传到 GitHub"
echo "========================================"
echo "仓库地址：$GITHUB_REPO"
echo "用户：$GITHUB_USERNAME"
echo "========================================"

# 检查是否已经初始化 Git 仓库
if [ ! -d ".git" ]; then
    echo "正在初始化 Git 仓库..."
    git init
    echo "Git 仓库初始化完成"
else
    echo "Git 仓库已存在"
fi

# 配置用户信息
git config user.name "$GITHUB_USERNAME"
git config user.email "${GITHUB_USERNAME}@users.noreply.github.com"

# 检查远程仓库
if git remote get-url origin > /dev/null 2>&1; then
    echo "更新远程仓库地址..."
    git remote set-url origin "$GITHUB_REPO"
else
    echo "添加远程仓库..."
    git remote add origin "$GITHUB_REPO"
fi

# 使用 Token 进行认证
REPO_WITH_TOKEN="https://${GITHUB_TOKEN}@$(echo $GITHUB_REPO | sed 's|https://||')"

# 添加所有文件
echo "添加所有文件..."
git add .

# 检查是否有变更
if git diff --cached --quiet; then
    echo "没有变更需要提交"
    exit 0
fi

# 提交变更
echo "提交变更..."
COMMIT_MSG="Update - $(date '+%Y-%m-%d %H:%M:%S')"
git commit -m "$COMMIT_MSG"
echo "提交完成"

# 推送到 GitHub
echo "推送到 GitHub..."

# 推送到 main 分支（或 master 分支）
if git show-ref --verify --quiet refs/heads/main 2>/dev/null; then
    BRANCH="main"
elif git show-ref --verify --quiet refs/heads/master 2>/dev/null; then
    BRANCH="master"
else
    BRANCH="main"
    git branch -M main
fi

git push "$REPO_WITH_TOKEN" "$BRANCH"

echo "========================================"
echo "上传成功！"
echo "========================================"
