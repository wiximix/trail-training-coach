# 项目脚本目录

本目录包含项目的所有脚本工具。

## 目录结构

```
scripts/
├── README.md                    # 本文档
├── git-commit-wrapper.sh        # Git commit 包装脚本（推荐使用）
├── git-commit.sh                # Git commit 脚本（带提示词输入）
├── test_commit.sh               # 测试 commit 脚本
├── restore_history.sh           # 恢复历史脚本
├── upload_to_github.sh          # 上传到 GitHub 脚本
├── archive-commit-log.sh        # Commit log 归档脚本
└── install-hooks.sh             # Git Hooks 安装脚本
```

## 脚本说明

### Git Commit 脚本

#### git-commit-wrapper.sh (推荐)

Git commit 的包装脚本，提供交互式提交界面。

**功能**:
- 交互式选择提交类型（feat, fix, docs, refactor 等）
- 自动添加 `docs/` 和 `scripts/` 目录的更改
- 自动更新 commit_log.md
- 支持自定义 commit message 和提示词

**使用方法**:

```bash
# 交互式提交
./scripts/git-commit-wrapper.sh

# 使用 -m 参数指定 commit message
./scripts/git-commit-wrapper.sh -m "feat: 添加新功能" "用户需求：实现xxx功能"
```

**支持的提交类型**:
- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 重构
- `test`: 测试相关
- `chore`: 构建/工具相关
- `perf`: 性能优化

#### git-commit.sh

带提示词输入的 Git commit 脚本。

**功能**:
- 自动更新 commit_log.md
- 记录提示词信息
- 自动添加更改

**使用方法**:

```bash
./scripts/git-commit.sh
```

### 测试脚本

#### test_commit.sh

测试 commit 功能的脚本。

**使用方法**:

```bash
./scripts/test_commit.sh
```

### 工具脚本

#### restore_history.sh

恢复 Git 历史的脚本。

**使用方法**:

```bash
./scripts/restore_history.sh
```

#### upload_to_github.sh

上传更改到 GitHub 的脚本。

**使用方法**:

```bash
./scripts/upload_to_github.sh
```

#### archive-commit-log.sh

自动归档 commit_log.md 的脚本。

**功能**:
- 将当前的 commit_log.md 归档到 `docs/archives/` 目录
- 文件命名格式: `commit_log_YYYY-MM-DD.md`
- 归档后可以重新开始新的 commit log

**使用方法**:

```bash
# 手动归档
./scripts/archive-commit-log.sh

# 通过 git push 自动归档（推荐）
git push  # 会自动触发归档
```

**归档机制**:

脚本会在每次 `git push` 前自动执行：
1. 检查 commit_log.md 是否有更新
2. 如果有更新，将其复制到 `docs/archives/commit_log_YYYY-MM-DD.md`
3. 归档文件会被提交并推送
4. 归档完成后，可以清空当前的 commit_log.md

#### install-hooks.sh

安装 Git Hooks 的脚本。

**功能**:
- 将 `.githooks` 目录中的 hooks 安装到 `.git/hooks` 目录
- 自动设置执行权限
- 备份现有的 hooks

**使用方法**:

```bash
# 安装 hooks
./scripts/install-hooks.sh
```

**首次使用**:

克隆项目后，首次使用前需要安装 hooks：

```bash
# 1. 克隆项目
git clone https://github.com/wiximix/trail-training-coach.git
cd trail-training-coach

# 2. 安装 hooks
./scripts/install-hooks.sh

# 3. 现在可以正常使用，hooks 会自动工作
```

## Git Hooks

项目配置了自动 Git Hooks，存放在 `.githooks` 目录中：

```
.githooks/
└── pre-push    # Push 前自动归档 commit log
```

### pre-push Hook

在每次 `git push` 前自动执行归档脚本：

**功能**:
- 自动归档 commit_log.md
- 检查是否有未提交的更改
- 提醒重要信息

**安装 Hook**:

```bash
# 使用安装脚本（推荐）
./scripts/install-hooks.sh

# 或手动安装
cp .githooks/pre-push .git/hooks/pre-push
chmod +x .git/hooks/pre-push
```

**启用/禁用 Hook**:

```bash
# 启用 pre-push hook
chmod +x .git/hooks/pre-push

# 禁用 pre-push hook
chmod -x .git/hooks/pre-push
```

## 脚本开发指南

### 新增脚本

1. 在 `scripts/` 目录下创建新的脚本文件
2. 添加执行权限: `chmod +x scripts/your-script.sh`
3. 更新本文档
4. 提交并推送

### 脚本规范

- 所有脚本使用 Bash 编写
- 脚本文件名使用小写字母和连字符
- 添加详细的注释和使用说明
- 实现错误处理和日志输出
- 使用相对路径引用项目文件

**脚本模板**:

```bash
#!/bin/bash

# 脚本名称: Your Script
# 功能描述: 描述脚本的功能
# 使用方法: ./scripts/your-script.sh [参数]

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

# 主函数
main() {
    log_info "脚本开始执行..."

    # 你的逻辑

    log_info "脚本执行完成！"
}

# 执行主函数
main "$@"
```

## 常见使用场景

### 场景 1: 提交代码并自动归档 commit log

```bash
# 1. 修改代码
echo "修改内容" >> src/app/page.tsx

# 2. 使用 wrapper 脚本提交
./scripts/git-commit-wrapper.sh

# 3. 推送到远程（会自动归档 commit log）
git push
```

### 场景 2: 手动归档 commit log

```bash
# 直接执行归档脚本
./scripts/archive-commit-log.sh
```

### 场景 3: 恢复历史提交

```bash
# 使用恢复历史脚本
./scripts/restore_history.sh
```

### 场景 4: 上传到 GitHub

```bash
# 使用上传脚本
./scripts/upload_to_github.sh
```

## 环境要求

所有脚本需要以下环境：

- Bash shell (Linux/macOS) 或 Git Bash (Windows)
- Git 2.0 或更高版本
- 必要的执行权限

**设置执行权限**:

```bash
# 为所有脚本添加执行权限
chmod +x scripts/*.sh

# 或者为单个脚本添加执行权限
chmod +x scripts/git-commit-wrapper.sh
```

## 故障排查

### 问题 1: 脚本没有执行权限

**解决方案**:

```bash
chmod +x scripts/your-script.sh
```

### 问题 2: Git hooks 不工作

**解决方案**:

```bash
# 检查 hooks 目录
ls -la .git/hooks/

# 确保 pre-push hook 存在且有执行权限
chmod +x .git/hooks/pre-push
```

### 问题 3: 归档脚本失败

**解决方案**:

```bash
# 检查 docs/archives/ 目录是否存在
mkdir -p docs/archives

# 检查 commit_log.md 是否存在
ls -la commit_log.md

# 手动执行归档脚本并查看错误
./scripts/archive-commit-log.sh
```

## 贡献指南

欢迎为脚本工具做出贡献：

1. 改进现有脚本的功能
2. 添加新的实用脚本
3. 修复脚本中的 bug
4. 优化脚本性能

提交前请确保：

- 脚本可以正常执行
- 添加了详细的使用说明
- 实现了错误处理
- 更新了本文档

## 相关资源

- 项目文档: [docs/](../docs/)
- Git 提交日志: [commit_log.md](../commit_log.md)
- 项目代码: [src/](../src/)

## 联系方式

如有脚本相关问题，请通过以下方式联系：

- GitHub Issues: [提交问题](https://github.com/wiximix/trail-training-coach/issues)
- 邮箱: support@example.com
