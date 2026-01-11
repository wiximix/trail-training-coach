#!/bin/bash

# ============================================================
# 测试 Git Commit Wrapper 脚本
# ============================================================

set -e

echo "测试 Git Commit Wrapper 脚本..."
echo ""

cd /workspace/projects

# 检查脚本是否存在
if [ ! -f "git-commit-wrapper.sh" ]; then
    echo "错误：git-commit-wrapper.sh 不存在"
    exit 1
fi

# 检查脚本是否有执行权限
if [ ! -x "git-commit-wrapper.sh" ]; then
    echo "添加执行权限..."
    chmod +x git-commit-wrapper.sh
fi

# 检查 commit_log.md 是否存在
if [ ! -f "commit_log.md" ]; then
    echo "错误：commit_log.md 不存在"
    exit 1
fi

echo "✓ 所有文件检查通过"
echo ""
echo "当前 Git 状态："
git status --short
echo ""

# 检查是否有暂存的文件
if git diff --cached --quiet; then
    echo "没有暂存的文件，无法测试提交"
    echo ""
    echo "使用方法："
    echo "  1. 添加文件：git add <filename>"
    echo "  2. 提交：./git-commit-wrapper.sh -m \"message\" \"prompt\""
    echo ""
    echo "或使用标准 git commit（自动 hook）："
    echo "  1. 添加文件：git add <filename>"
    echo "  2. 提交：git commit -m \"message\""
    exit 0
fi

echo "有暂存的文件，可以测试提交"
echo ""
echo "测试命令："
echo "  ./git-commit-wrapper.sh -m \"test: 测试 commit 日志系统\" \"测试脚本是否正常工作\""
echo ""
echo "或者使用标准 git commit（自动 hook）："
echo "  git commit -m \"test: 测试 commit 日志系统\""
