#!/bin/bash

# ============================================================
# Git 历史记录恢复脚本
# ============================================================

set -e

echo "========================================"
echo "Git 历史记录恢复"
echo "========================================"

cd /workspace/projects

# 检查当前分支
CURRENT_BRANCH=$(git branch --show-current)
echo "当前分支: $CURRENT_BRANCH"
echo ""

# 检查所有分支
echo "可用的历史记录分支："
echo ""
echo "1. origin/master (GitHub 上的历史分支)"
echo "   - 提交: b34b4ea (Upload projects folder)"
echo "   - 提交: 8352981 (Remove .git from projects folder and re-add files)"
echo ""
echo "2. 本地 main 分支 (当前工作分支)"
echo "   - 提交: 9c79d75 (Initial commit)"
echo "   - 提交: dc40059 (Add GitHub upload script)"
echo ""

# 检查是否已经创建了本地 master 分支
if git show-ref --verify --quiet refs/heads/master 2>/dev/null; then
    echo "本地 master 分支已存在"
    echo ""
    echo "master 分支历史："
    git log --oneline master
    echo ""
else
    echo "本地 master 分支不存在，正在创建..."
    git checkout -b master origin/master
    echo "本地 master 分支已创建并追踪 origin/master"
    echo ""
fi

# 检查两个分支的结构差异
echo "========================================"
echo "分支结构对比"
echo "========================================"
echo ""

echo "main 分支结构 (当前工作):"
git checkout main > /dev/null 2>&1
echo "根目录下包含项目源代码"
ls -1 | grep -v "\.git\|node_modules\|\.next" | head -10
echo ""

echo "master 分支结构 (历史记录):"
git checkout master > /dev/null 2>&1
echo "根目录下包含 projects/ 子目录"
ls -1 | head -10
echo ""

echo "projects/ 子目录内容："
ls -1 projects/ | grep -v "node_modules\|\.next" | head -10
echo ""

# 返回 main 分支
git checkout main > /dev/null 2>&1

echo "========================================"
echo "恢复选项"
echo "========================================"
echo ""
echo "选项 1: 保持现状，保留 master 分支作为历史参考"
echo "  - 优点: 不影响当前工作"
echo "  - 缺点: 历史记录与当前工作分离"
echo ""
echo "选项 2: 将 master 分支的历史合并到 main 分支"
echo "  - 优点: 所有历史记录统一"
echo "  - 缺点: 会产生复杂的提交历史图"
echo ""
echo "选项 3: 从 master 分支恢复 projects/ 目录内容"
echo "  - 优点: 可以找回历史版本的代码"
echo "  - 缺点: 可能覆盖当前工作"
echo ""

echo "建议："
echo "1. 先查看 master 分支的历史代码："
echo "   git checkout master"
echo "   cd projects"
echo ""
echo "2. 如需恢复文件，手动复制需要的文件到 main 分支"
echo ""
echo "3. 如需合并历史，执行："
echo "   git checkout main"
echo "   git merge master"
echo ""

echo "========================================"
echo "当前状态"
echo "========================================"
git branch -a
echo ""

echo "Git 提交历史图："
git log --oneline --graph --all --decorate -10
