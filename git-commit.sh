#!/bin/bash

# ============================================================
# 自定义 Git Commit 脚本 - 自动记录 commit 日志
# ============================================================

set -e

# 获取当前日期
DATE=$(date '+%Y-%m-%d %H:%M:%S')

# 获取当前分支
BRANCH=$(git branch --show-current)

# 获取当前时间戳
TIMESTAMP=$(date '+%Y-%m-%d')

# 提示用户输入 commit message
echo "========================================"
echo "Git Commit - 自动记录日志"
echo "========================================"
echo "当前分支: $BRANCH"
echo "当前时间: $DATE"
echo ""

# 检查是否有暂存的文件
if git diff --cached --quiet; then
    echo "错误: 没有暂存的文件"
    echo "请先使用 'git add <files>' 暂存文件"
    exit 1
fi

echo "已暂存的文件："
git diff --cached --name-only
echo ""

# 输入 commit message
read -p "请输入 commit message: " COMMIT_MSG

# 输入提示词（可选）
echo ""
read -p "请输入提示词（可选，直接回车跳过）: " PROMPT

# 如果没有输入 commit message，使用默认值
if [ -z "$COMMIT_MSG" ]; then
    COMMIT_MSG="Update - $(date '+%Y-%m-%d %H:%M:%S')"
fi

# 执行 git commit
echo ""
echo "正在提交..."
git commit -m "$COMMIT_MSG"

# 获取最新的 commit hash
COMMIT_HASH=$(git rev-parse HEAD)

# 获取影响文件列表
FILES=$(git show --name-only --pretty=format: "$COMMIT_HASH" | grep -v "^$" | grep -v "^commit" | tail -n +2 | tr '\n' ', ' | sed 's/,$//')

# 更新 commit_log.md
echo "正在更新 commit 日志..."

# 添加到详细记录部分
TEMP_FILE=$(mktemp)
{
    echo "### $TIMESTAMP"
    echo ""
    echo "**Commit Hash:** \`$COMMIT_HASH\`"
    echo "**分支:** $BRANCH"
    echo "**时间:** $DATE"
    echo "**提交信息:** $COMMIT_MSG"
    if [ -n "$PROMPT" ]; then
        echo "**提示词:** $PROMPT"
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
    echo "| $TIMESTAMP | \`$COMMIT_HASH\` | $BRANCH | $COMMIT_MSG | ${PROMPT:-无} | $FILES |"
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
echo "========================================"
echo "Commit 完成！"
echo "========================================"
echo "Commit Hash: $COMMIT_HASH"
echo "Commit Message: $COMMIT_MSG"
echo ""
echo "已自动更新 commit_log.md"
echo "========================================"
