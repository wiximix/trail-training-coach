#!/bin/bash

# 安装 Git Hooks 的脚本
# 将 .githooks 目录中的 hooks 安装到 .git/hooks 目录

set -e

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
GITHOOKS_DIR="${PROJECT_ROOT}/.githooks"
GIT_HOOKS_DIR="${PROJECT_ROOT}/.git/hooks"

# 主函数
main() {
    log_info "=== 安装 Git Hooks ==="
    echo

    # 检查 .githooks 目录是否存在
    if [ ! -d "${GITHOOKS_DIR}" ]; then
        log_error ".githooks 目录不存在"
        exit 1
    fi

    # 检查是否有 hooks 文件
    HOOK_FILES=$(find "${GITHOOKS_DIR}" -type f -executable 2>/dev/null || true)
    if [ -z "${HOOK_FILES}" ]; then
        log_warn ".githooks 目录中没有可执行的 hook 文件"
        exit 0
    fi

    # 创建 .git/hooks 目录（如果不存在）
    mkdir -p "${GIT_HOOKS_DIR}"

    # 复制每个 hook 文件
    for hook_file in ${HOOK_FILES}; do
        hook_name=$(basename "${hook_file}")
        target_hook="${GIT_HOOKS_DIR}/${hook_name}"

        log_info "安装 hook: ${hook_name}"

        # 备份现有的 hook（如果存在）
        if [ -f "${target_hook}" ]; then
            log_warn "已存在 ${hook_name}，备份为 ${hook_name}.backup"
            cp "${target_hook}" "${target_hook}.backup"
        fi

        # 复制 hook 文件
        cp "${hook_file}" "${target_hook}"

        # 设置执行权限
        chmod +x "${target_hook}"

        log_info "✓ ${hook_name} 安装完成"
    done

    echo
    log_info "=== Git Hooks 安装完成 ==="
    echo
    log_info "已安装的 hooks:"
    ls -la "${GIT_HOOKS_DIR}" | grep -v "^d" | awk '{print "  - " $NF}'
    echo
    log_info "提示: 使用 'git commit --no-verify' 可以跳过 hooks"
}

# 执行主函数
main "$@"
