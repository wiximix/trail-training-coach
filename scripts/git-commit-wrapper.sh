#!/bin/bash

# ============================================================
# Git Commit Wrapper - 带日志记录的 commit 脚本
# ============================================================

set -e

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 获取当前信息
DATE=$(date '+%Y-%m-%d %H:%M:%S')
BRANCH=$(git branch --show-current)
TIMESTAMP=$(date '+%Y-%m-%d')

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Git Commit - 自动记录日志${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "当前分支: ${YELLOW}$BRANCH${NC}"
echo -e "当前时间: ${YELLOW}$DATE${NC}"
echo ""

# 检查是否有暂存的文件
if git diff --cached --quiet; then
    echo -e "${RED}错误: 没有暂存的文件${NC}"
    echo -e "${YELLOW}请先使用 'git add <files>' 暂存文件${NC}"
    echo ""
    echo "常用命令："
    echo "  git add .              # 添加所有文件"
    echo "  git add <filename>     # 添加指定文件"
    echo "  git status             # 查看状态"
    exit 1
fi

echo -e "${YELLOW}已暂存的文件：${NC}"
git diff --cached --name-only
echo ""

# 检查是否使用 -m 参数
if [ "$1" = "-m" ] && [ -n "$2" ]; then
    COMMIT_MSG="$2"
    # 剩余的参数作为提示词
    shift 2
    PROMPT="$*"
else
    # 交互式输入
    read -p "请输入 commit message: " COMMIT_MSG

    # 输入提示词（可选）
    echo ""
    read -p "请输入提示词（可选，直接回车跳过）: " PROMPT
fi

# 如果没有输入 commit message，使用默认值
if [ -z "$COMMIT_MSG" ]; then
    COMMIT_MSG="Update - $DATE"
fi

# 执行 git commit
echo ""
echo -e "${YELLOW}正在提交...${NC}"
git commit -m "$COMMIT_MSG"

# 获取最新的 commit hash
COMMIT_HASH=$(git rev-parse HEAD)

# 获取影响文件列表
FILES=$(git show --name-only --pretty=format: "$COMMIT_HASH" | grep -v "^$" | grep -v "^commit" | tail -n +2 | tr '\n' ', ' | sed 's/,$//')

# 更新 commit_log.md
echo -e "${YELLOW}正在更新 commit 日志...${NC}"

# 添加到详细记录部分
TEMP_FILE=$(mktemp)
{
    echo "### $(date '+%Y-%m-%d')"
    echo ""
    echo "**Commit Hash:** \`$COMMIT_HASH\`"
    echo "**分支:** $BRANCH"
    echo "**时间:** $DATE"
    echo "**提交信息:** $COMMIT_MSG"
    if [ -n "$PROMPT" ]; then
        echo "**提示词:** $PROMPT"
    else
        echo "**提示词:** 无"
    fi
    echo "**影响文件:** $FILES"
    echo ""
    echo "---"
    echo ""
    cat commit_log.md
} > "$TEMP_FILE"
mv "$TEMP_FILE" commit_log.md

# 添加到表格
TEMP_FILE=$(mktemp)
{
    # 读取表格头部
    head -n 1 commit_log.md
    echo ""

    # 添加新行
    echo "| $(date '+%Y-%m-%d') | \`$COMMIT_HASH\` | $BRANCH | $COMMIT_MSG | ${PROMPT:-无} | $FILES |"
    echo ""

    # 读取表格分隔符
    head -n 2 commit_log.md | tail -n 1
    echo ""

    # 读取表格之后的旧数据
    tail -n +3 commit_log.md
} > "$TEMP_FILE"
mv "$TEMP_FILE" commit_log.md

# 再次 commit 日志文件的更新
git add commit_log.md
git commit --amend --no-edit

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Commit 完成！${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "Commit Hash: ${YELLOW}$COMMIT_HASH${NC}"
echo -e "Commit Message: ${YELLOW}$COMMIT_MSG${NC}"
echo ""
echo -e "${GREEN}已自动更新 commit_log.md${NC}"
echo -e "${GREEN}========================================${NC}"
