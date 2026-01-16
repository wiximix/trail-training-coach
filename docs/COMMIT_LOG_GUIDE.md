# Git Commit 日志系统使用指南

本项目配置了自动化的 commit 日志记录系统，可以自动记录每次提交的详细信息，包括提交信息、提示词、影响文件等。

---

## 可用的脚本

### 1. git-commit-wrapper.sh（推荐使用）

**功能最完整的 commit 脚本，支持：**
- 交互式输入 commit message 和提示词
- 命令行参数模式
- 自动更新 commit_log.md
- 彩色输出，更好的用户体验

**使用方法：**

```bash
# 方式 1：交互式提交
./git-commit-wrapper.sh

# 方式 2：使用 -m 参数
./git-commit-wrapper.sh -m "feat: 添加新功能" "提示词内容"

# 方式 3：添加文件后提交
git add .
./git-commit-wrapper.sh -m "docs: 更新文档" "用户要求更新README"
```

---

### 2. git-commit.sh

**基础版本的 commit 脚本，支持：**
- 交互式输入 commit message 和提示词
- 自动更新 commit_log.md

**使用方法：**

```bash
# 添加文件
git add .

# 执行脚本
./git-commit.sh

# 按提示输入 commit message 和提示词
```

---

### 3. 自动 Hook（post-commit）

**无需手动调用，系统会自动执行：**

每次执行 `git commit` 后，post-commit hook 会自动：
1. 获取最新的 commit 信息
2. 提取影响文件列表
3. 更新 commit_log.md
4. 自动将日志文件的更新添加到 commit 中

**使用方法：**

```bash
# 正常使用 git commit 即可
git add .
git commit -m "your message"

# Hook 会自动记录到 commit_log.md
```

---

## Commit Log 文件

**文件路径：** `commit_log.md`

**包含内容：**
1. 使用说明
2. Commit 日志表格（包含日期、Commit Hash、分支、提交信息、提示词、影响文件）
3. 详细记录（每个 commit 的完整信息）

**查看日志：**

```bash
# 查看完整日志
cat commit_log.md

# 查看最近 10 条 commit
git log --oneline -10

# 查看特定 commit 的详细信息
git show <commit-hash>
```

---

## 工作流程

### 推荐工作流程（使用 git-commit-wrapper.sh）

```bash
# 1. 修改文件
vim src/app/page.tsx

# 2. 添加文件到暂存区
git add src/app/page.tsx

# 3. 提交并记录日志
./git-commit-wrapper.sh -m "fix: 修复页面样式问题" "用户反馈首页布局错乱，需要调整CSS"

# 4. 推送到 GitHub
./upload_to_github.sh
```

---

### 标准工作流程（使用自动 Hook）

```bash
# 1. 修改文件
vim src/app/page.tsx

# 2. 添加文件到暂存区
git add src/app/page.tsx

# 3. 提交（hook 自动记录）
git commit -m "fix: 修复页面样式问题"

# 4. 推送到 GitHub
./upload_to_github.sh
```

---

## Commit Message 规范

建议遵循 Conventional Commits 规范：

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Type 类型：**
- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `style`: 代码格式调整（不影响功能）
- `refactor`: 重构
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建/工具链相关

**示例：**

```bash
# feat: 添加用户登录功能
./git-commit-wrapper.sh -m "feat: 添加用户登录功能" "用户要求实现GitHub登录"

# fix: 修复提交记录丢失的问题
./git-commit-wrapper.sh -m "fix: 修复提交记录丢失的问题" "用户反馈.git目录被删除后历史记录消失"

# docs: 更新 README 文档
./git-commit-wrapper.sh -m "docs: 更新 README 文档" "补充使用说明和示例"
```

---

## 提示词记录

**为什么记录提示词？**

提示词记录可以帮助你：
1. 追溯每次提交的需求来源
2. 理解为什么要做这个修改
3. 后续回顾时快速理解上下文
4. 生成更好的提交历史文档

**如何记录提示词？**

**方式 1：使用 git-commit-wrapper.sh**
```bash
./git-commit-wrapper.sh -m "feat: 添加新功能" "用户要求：实现xxx功能"
```

**方式 2：使用 git-commit.sh**
```bash
./git-commit.sh
# 按提示输入
```

**方式 3：手动编辑 commit_log.md**
```bash
vim commit_log.md
```

---

## 故障排查

### 问题 1：Hook 没有自动执行

**解决方案：**
```bash
# 检查 hook 是否有执行权限
ls -la .git/hooks/post-commit

# 如果没有，添加执行权限
chmod +x .git/hooks/post-commit
```

---

### 问题 2：日志文件没有更新

**解决方案：**
```bash
# 检查 commit_log.md 是否被跟踪
git status

# 手动添加并提交
git add commit_log.md
git commit -m "chore: 添加 commit_log.md"
```

---

### 问题 3：提示词没有记录

**解决方案：**
```bash
# 使用 git-commit-wrapper.sh 或 git-commit.sh
# 它们支持交互式输入提示词

# 或者手动编辑 commit_log.md
vim commit_log.md
```

---

## 相关脚本

### upload_to_github.sh

上传项目到 GitHub 的脚本。

```bash
cd /workspace/projects
export GITHUB_TOKEN="your_token"
export GITHUB_USERNAME="wiximix"
export GITHUB_REPO="https://github.com/wiximix/trail-training-coach.git"
./upload_to_github.sh
```

---

### restore_history.sh

恢复 Git 历史记录的脚本。

```bash
cd /workspace/projects
./restore_history.sh
```

---

## 最佳实践

1. **总是添加清晰的 commit message**
   - 描述清楚做了什么
   - 说明为什么这么做

2. **记录提示词**
   - 记录用户的需求
   - 记录相关的上下文信息

3. **保持日志文件同步**
   - 每次提交后检查 commit_log.md
   - 确保日志文件也被提交

4. **定期推送到 GitHub**
   - 提交后及时推送
   - 保持远程仓库最新

5. **查看历史记录**
   - 定期查看 commit_log.md
   - 了解项目演进过程

---

## 示例

### 完整的提交流程示例

```bash
# 1. 查看当前状态
git status

# 2. 添加修改的文件
git add src/app/page.tsx

# 3. 提交并记录日志
./git-commit-wrapper.sh -m "feat: 优化首页加载速度" \
  "用户反馈首页加载太慢，需要优化图片加载和代码分割"

# 4. 查看提交历史
git log --oneline -5

# 5. 查看日志文件
cat commit_log.md

# 6. 推送到 GitHub
./upload_to_github.sh
```

---

## 总结

通过这个自动化的 commit 日志系统，你可以：
- ✅ 自动记录每次提交的详细信息
- ✅ 轻松追溯项目演进历史
- ✅ 记录用户需求和上下文
- ✅ 生成高质量的项目文档

建议在每次提交时都使用这些脚本，保持日志的完整性和准确性。
