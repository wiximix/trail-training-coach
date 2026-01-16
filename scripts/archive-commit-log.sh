#!/bin/bash

# 归档 commit_log.md 的脚本
# 每次执行会将当前的 commit_log.md 归档到 docs/archives/ 目录

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

# 归档目录
ARCHIVES_DIR="${PROJECT_ROOT}/docs/archives"
COMMIT_LOG_FILE="${PROJECT_ROOT}/commit_log.md"

# 获取当前日期和时间
TIMESTAMP=$(date +"%Y-%m-%d_%H%M%S")
DATE=$(date +"%Y-%m-%d")

# 归档文件名
ARCHIVE_FILE="${ARCHIVES_DIR}/commit_log_${TIMESTAMP}.md"

# 主函数
main() {
    log_info "=== Commit Log 归档脚本 ==="
    echo

    # 检查 commit_log.md 是否存在
    if [ ! -f "${COMMIT_LOG_FILE}" ]; then
        log_error "未找到 commit_log.md 文件"
        exit 1
    fi

    # 检查 commit_log.md 是否为空
    if [ ! -s "${COMMIT_LOG_FILE}" ]; then
        log_warn "commit_log.md 文件为空，无需归档"
        exit 0
    fi

    # 检查是否存在今天日期的归档文件
    TODAY_ARCHIVE="${ARCHIVES_DIR}/commit_log_${DATE}_*.md"
    if ls ${TODAY_ARCHIVE} 1> /dev/null 2>&1; then
        log_warn "今天已有归档文件：$(ls ${TODAY_ARCHIVE} | head -n 1)"
        read -p "是否继续归档？(y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_info "取消归档"
            exit 0
        fi
    fi

    # 创建归档目录
    log_step "创建归档目录..."
    mkdir -p "${ARCHIVES_DIR}"
    log_info "归档目录: ${ARCHIVES_DIR}"

    # 归档 commit_log.md
    log_step "归档 commit_log.md..."
    cp "${COMMIT_LOG_FILE}" "${ARCHIVE_FILE}"
    log_info "归档文件: ${ARCHIVE_FILE}"

    # 获取文件大小
    FILE_SIZE=$(wc -c < "${ARCHIVE_FILE}")
    FILE_SIZE_KB=$((FILE_SIZE / 1024))
    log_info "文件大小: ${FILE_SIZE_KB} KB"

    # 获取归档文件中的 commit 数量
    COMMIT_COUNT=$(grep -c "^| [0-9]" "${ARCHIVE_FILE}" 2>/dev/null || echo "0")
    log_info "Commit 数量: ${COMMIT_COUNT}"

    # 获取归档文件的时间范围
    FIRST_DATE=$(grep "^| [0-9]" "${ARCHIVE_FILE}" | tail -n 1 | awk '{print $1}' || echo "N/A")
    LAST_DATE=$(grep "^| [0-9]" "${ARCHIVE_FILE}" | head -n 1 | awk '{print $1}' || echo "N/A")
    log_info "时间范围: ${FIRST_DATE} ~ ${LAST_DATE}"

    echo
    log_info "归档成功！"

    # 询问是否清空 commit_log.md
    echo
    read -p "是否清空当前的 commit_log.md？(y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log_step "清空 commit_log.md..."
        # 保留表头
        {
            head -n 20 "${COMMIT_LOG_FILE}"
        } > "${COMMIT_LOG_FILE}.tmp"
        mv "${COMMIT_LOG_FILE}.tmp" "${COMMIT_LOG_FILE}"
        log_info "commit_log.md 已清空"
    else
        log_info "保留 commit_log.md 的内容"
    fi

    echo
    log_step "添加到 Git..."
    cd "${PROJECT_ROOT}"
    git add "${ARCHIVE_FILE}"
    git add "${COMMIT_LOG_FILE}" 2>/dev/null || true
    log_info "文件已添加到 Git 暂存区"

    echo
    log_info "=== 归档完成 ==="
    echo
    log_info "归档文件: ${ARCHIVE_FILE}"
    log_info "下一步: 提交并推送归档文件"
    echo
    echo "提交命令示例:"
    echo "  git commit -m 'docs: 归档 commit log - ${TIMESTAMP}'"
    echo "  git push"
}

# 执行主函数
main "$@"
