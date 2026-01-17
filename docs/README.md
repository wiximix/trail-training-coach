# 项目文档目录

本目录包含项目的所有文档和资源。

## 目录结构

```
docs/
├── README.md                         # 本文档
├── API_ROUTES.md                     # API 路由文档
├── DEPLOYMENT.md                     # 部署指南
├── CODE_OPTIMIZATION_SUMMARY.md      # 代码优化总结
├── COMMIT_LOG_GUIDE.md               # Commit Log 使用指南
├── REFACTORING_GUIDE.md              # 重构指南
├── REFACTORING_SUMMARY.md            # 重构总结
├── refine.md                         # 项目优化建议
├── refine_status.md                  # 项目优化状态评估
├── component-refactor-completed.md   # 组件复用增强完成记录
└── archives/                         # 归档目录
    └── commit_log_YYYY-MM-DD.md      # 归档的 commit log
```

## 文档说明

### 核心文档

- **API_ROUTES.md**: 完整的 API 接口文档，包含所有 API 的请求/响应示例
- **DEPLOYMENT.md**: 详细的部署指南，支持本地部署、Docker 部署和云平台部署
- **README.md** (项目根目录): 项目主文档，包含功能介绍、快速开始等

### 开发文档

- **CODE_OPTIMIZATION_SUMMARY.md**: 代码优化的详细总结和成果
- **REFACTORING_GUIDE.md**: 重构指南，包含重构的最佳实践
- **REFACTORING_SUMMARY.md**: 项目重构的总结报告
- **refine.md**: 项目优化建议和待办事项
- **refine_status.md**: 项目优化状态评估，记录各项优化的完成情况
- **component-refactor-completed.md**: 组件复用增强与表单抽离完成记录

### Commit 相关

- **commit_log.md** (项目根目录): 当前的 Git Commit 日志记录
- **COMMIT_LOG_GUIDE.md**: Commit Log 的使用指南
- **archives/**: 历史归档的 commit log 文件

## 归档机制

项目使用自动化归档机制，在每次 `git push` 前自动归档 `commit_log.md`：

- 归档文件保存在 `docs/archives/` 目录
- 归档文件命名格式: `commit_log_YYYY-MM-DD.md`
- 每次推送前会自动归档当前日志

## 使用指南

### 查看 API 文档

```bash
# 查看完整的 API 文档
cat docs/API_ROUTES.md
```

### 查看部署指南

```bash
# 查看部署指南
cat docs/DEPLOYMENT.md
```

### 查看归档的 commit log

```bash
# 列出所有归档文件
ls docs/archives/

# 查看最新的归档
cat docs/archives/commit_log_$(date +%Y-%m-%d).md
```

### 归档 commit log

```bash
# 手动归档 commit log
./scripts/archive-commit-log.sh

# 或使用 git push 时自动归档
git push
```

## 文档维护

### 更新文档

1. 修改对应的文档文件
2. 提交更改
3. 推送到远程仓库

### 添加新文档

1. 在 `docs/` 目录下创建新的 `.md` 文件
2. 更新本文档的目录结构
3. 提交并推送

## 相关资源

- 项目主文档: [README.md](../README.md)
- Git 提交脚本: [scripts/](../scripts/)
- 项目代码: [src/](../src/)

## 贡献指南

欢迎为文档做出贡献：

1. 发现文档错误或不清晰的地方，请提出 Issue
2. 有新的文档需求，可以创建 Issue 讨论
3. 改进文档后提交 Pull Request

## 联系方式

如有文档相关问题，请通过以下方式联系：

- GitHub Issues: [提交问题](https://github.com/wiximix/trail-training-coach/issues)
- 邮箱: support@example.com
