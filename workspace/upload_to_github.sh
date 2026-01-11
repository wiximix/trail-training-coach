#!/bin/bash

# ============================================================
# 上传 projects 文件夹到 GitHub 脚本
# ============================================================
# 使用说明：
# 1. 首先设置环境变量（推荐方式）：
#    export GITHUB_TOKEN="your_token_here"
#    export GITHUB_USERNAME="wiximix"
#    export GITHUB_REPO="https://github.com/wiximix/trail-training-coach.git"
#
# 2. 然后执行脚本：
#    bash upload_to_github.sh
#
# 3. 或者一次性执行（不推荐，仅用于测试）：
#    GITHUB_TOKEN="your_token" GITHUB_USERNAME="wiximix" GITHUB_REPO="https://github.com/wiximix/trail-training-coach.git" bash upload_to_github.sh
# ============================================================

set -e  # 遇到错误立即退出

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 检查必需的环境变量
if [ -z "$GITHUB_TOKEN" ]; then
    echo -e "${RED}错误：未设置 GITHUB_TOKEN 环境变量${NC}"
    echo -e "${YELLOW}请使用以下方式设置：${NC}"
    echo "  export GITHUB_TOKEN=\"your_token_here\""
    exit 1
fi

if [ -z "$GITHUB_USERNAME" ]; then
    echo -e "${RED}错误：未设置 GITHUB_USERNAME 环境变量${NC}"
    echo -e "${YELLOW}请使用以下方式设置：${NC}"
    echo "  export GITHUB_USERNAME=\"wiximix\""
    exit 1
fi

if [ -z "$GITHUB_REPO" ]; then
    echo -e "${RED}错误：未设置 GITHUB_REPO 环境变量${NC}"
    echo -e "${YELLOW}请使用以下方式设置：${NC}"
    echo "  export GITHUB_REPO=\"https://github.com/wiximix/trail-training-coach.git\""
    exit 1
fi

# 进入工作目录
cd /workspace

# 检查 projects 文件夹是否存在
if [ ! -d "projects" ]; then
    echo -e "${RED}错误：projects 文件夹不存在${NC}"
    exit 1
fi

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}开始上传 projects 到 GitHub${NC}"
echo -e "${GREEN}========================================${NC}"

# 检查是否已经初始化 Git 仓库
if [ ! -d ".git" ]; then
    echo -e "${YELLOW}正在初始化 Git 仓库...${NC}"
    git init
    echo -e "${GREEN}Git 仓库初始化完成${NC}"
else
    echo -e "${GREEN}Git 仓库已存在${NC}"
fi

# 配置用户信息
git config user.name "$GITHUB_USERNAME"
git config user.email "${GITHUB_USERNAME}@users.noreply.github.com"

# 检查远程仓库
if git remote get-url origin > /dev/null 2>&1; then
    echo -e "${YELLOW}更新远程仓库地址...${NC}"
    git remote set-url origin "$GITHUB_REPO"
else
    echo -e "${YELLOW}添加远程仓库...${NC}"
    git remote add origin "$GITHUB_REPO"
fi

# 使用 Token 进行认证
REPO_WITH_TOKEN="https://${GITHUB_TOKEN}@$(echo $GITHUB_REPO | sed 's|https://||')"

# 添加 projects 文件夹
echo -e "${YELLOW}添加 projects 文件夹...${NC}"
git add projects/

# 检查是否有变更
if git diff --cached --quiet; then
    echo -e "${YELLOW}没有变更需要提交${NC}"
else
    # 提交变更
    echo -e "${YELLOW}提交变更...${NC}"
    COMMIT_MSG="Upload projects folder - $(date '+%Y-%m-%d %H:%M:%S')"
    git commit -m "$COMMIT_MSG"
    echo -e "${GREEN}提交完成${NC}"

    # 推送到 GitHub
    echo -e "${YELLOW}推送到 GitHub...${NC}"
    echo -e "${YELLOW}仓库地址：${GITHUB_REPO}${NC}"
    
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
    
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}上传成功！${NC}"
    echo -e "${GREEN}========================================${NC}"
fi
