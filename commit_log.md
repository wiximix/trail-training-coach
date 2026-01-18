# Git Commit 日志

**项目：** trail-training-coach（越野训练教练APP）
**开始记录时间：** 2026-01-11

---

## 使用说明

### 方式 1：使用 git-commit-wrapper.sh（推荐）

```bash
# 交互式提交
./git-commit-wrapper.sh

# 使用 -m 参数指定 commit message
./git-commit-wrapper.sh -m "feat: 添加新功能" "用户需求：实现xxx功能"
```

### 方式 2：使用 git-commit.sh（带提示词输入）

```bash
./git-commit.sh
```

### 方式 3：使用标准 git commit（自动记录）

```bash
git add .
git commit -m "your message"
# post-commit hook 会自动记录到 commit_log.md
```

---

## Commit 日志

| 日期 | Commit Hash | 分支 | 提交信息 | 提示词 | 影响文件 |
|------|-------------|------|----------|--------|----------|
| 2026-01-18 | `90e74e8b628ffb357dd05fbe5d2df31b873e7e7e` | main | chore: 发布版本 1.0.1 - 更改配速格式验证从 MM:SS 到 MMSS | 无 |  |
| 2026-01-18 | `edffd9e478f665a0dc2e32431dc539c25e3f8328` | main | refactor: 更改配速格式验证从 MM:SS 到 MMSS | 无 | src/components/forms/MemberForm.tsx,src/lib/trailAlgorithm.ts,src/lib/validation.ts,tsconfig.tsbuildinfo |
| 2026-01-17 | `62f3186b48926b0b4b6491b4118a562f2745b394` | main | feat: 完成组件复用增强与表单抽离优化 | 无 | docs/component-refactor-completed.md,docs/refine_status.md,src/app/members/new/page.tsx,src/app/predict/page.tsx,src/app/trails/new/page.tsx,src/components/features/checkpoint/CheckpointTable.tsx,src/components/features/checkpoint/index.ts,src/components/features/supply/SupplyCalculator.tsx,src/components/features/supply/index.ts,src/components/forms/MemberForm.tsx,src/components/forms/README.md,src/components/forms/TrailForm.tsx,src/components/forms/index.ts |
| 2026-01-17 | `1bb67290b9dfbe2cf2f3a97f6d8fb974957c90b7` | main | feat: 完成高优先级优化 - 统一错误处理和输入验证 | 无 | src/app/api/auth/login/route.ts,src/app/api/auth/register/route.ts,src/app/api/members/[id]/route.ts,src/app/api/members/route.ts,src/app/api/predict/route.ts,src/app/api/teams/route.ts,src/app/api/trails/[id]/route.ts,src/app/api/trails/route.ts,src/lib/errorHandler.ts,src/lib/logger.ts,src/lib/validation.ts,tsconfig.tsbuildinfo |
| 2026-01-17 | `cb4d1c57de8c6dbf1826e56eaeccbce21b6856d6` | main | docs: 创建优化建议实施状态评估文档 | 无 |  |
| 2026-01-17 | `c4fc1a310d36174bfbaa6b4ecc4eb6670dee1065` | main | refactor: 整理文档和脚本目录结构，添加 commit log 自动归档功能 | 无 |  |
| 2026-01-17 | `0c8a6d2fd6b33615ba58949076ed2400ba49d572` | main | docs: 更新项目目录结构说明文档 | 无 |  |
| 2026-01-17 | `fc10d6eb02d9a69ad416431504855aa0889fdebb` | main | docs: 更新 commit log | 无 |  |
| 2026-01-17 | `52c71bcc0bd5966c1d04f115e49b7474033e6e13` | main | refactor: 优化 pre-push hook，忽略 commit_log.md 的自动更新 | 无 |  |
| 2026-01-17 | `67d0857c69bca1354312b3338da568b6c590e81b` | main | docs: 自动更新 commit log | 无 |  |
| 2026-01-17 | `60fa78752205e52def4a11d4b6d63d84020a944a` | main | docs: 更新 commit log | 无 |  |
| 2026-01-17 | `10b513937cfffda6f77c42784bc4d1a265ac189f` | main | docs: 自动更新 commit log | 无 |  |
| 2026-01-17 | `9d9097edb2e4d821b61fe7fbc5286f05bb8d47f9` | main | docs: 更新 commit log - push 完成 | 无 |  |
| 2026-01-17 | `a7806fed0afb1d3e102cf0619929345116e12ff2` | main | docs: 自动更新 commit log | 无 |  |
| 2026-01-17 | `22ef4efd38342223013d44f1571cba922c24b026` | main | refactor: 优化 pre-push hook，自动提交 commit_log.md 的更新 | 无 |  |
| 2026-01-17 | `b53b80d07c246f97ea80df5adbddeeed6e7ac7b3` | main | refactor: 优化 pre-push hook 逻辑，只检测未暂存的 commit_log 更改 | 无 |  |
| 2026-01-17 | `19cab2d8c33e7d350813d074bd33a9f693ef379e` | main | docs: 更新 commit log - 添加归档记录 | 无 |  |
| 2026-01-17 | `6864bb6b8348784d5afe2cdc1a0e7c454852dd88` | main | docs: 归档 commit log - 2026-01-17_003201 | 无 |  |
| 2026-01-17 | `769632b787191d75f66e2653c00423ae0a786fac` | main | refactor: 整理文档和脚本目录结构，添加 commit log 自动归档功能 | 无 | docs/API_ROUTES.md,docs/CODE_OPTIMIZATION_SUMMARY.md,docs/COMMIT_LOG_GUIDE.md,docs/DEPLOYMENT.md,docs/README.md,docs/REFACTORING_GUIDE.md,docs/REFACTORING_SUMMARY.md,docs/refine.md,scripts/README.md,scripts/archive-commit-log.sh,scripts/git-commit-wrapper.sh,scripts/git-commit.sh,scripts/install-hooks.sh,scripts/restore_history.sh,scripts/test_commit.sh,scripts/upload_to_github.sh |
| 2026-01-17 | `0c9a4c79af9e263efa642869d920e23a9c809648` | main | docs: 添加完整的 README、API 文档和部署指南 | 无 |  |
| 2026-01-17 | `5fd945def0e37c5c95ff9c98727bbbb8251e29b8` | main | resolve: 解决 commit_log.md 合并冲突 | 无 |  |
| 2026-01-17 | `dcae8f0afbc1348b050dddc4c3211294dbd65031` | main | docs: 添加完整的 README、API 文档和部署指南 | 无 | DEPLOYMENT.md,README.md |
| 2026-01-16 | `2bb3f67cee05293c1c9ca1473977707157d9ef5e` | main | auto saved your changes before deploy | 无 |  |
| 2026-01-15 | `ec73a3a9831676a08c9c55c93bca29c6c62eb63f` | main | refactor: 完成代码组织优化和组件复用增强 | 无 | src/app/api/auth/forgot-password/route.ts,src/app/api/auth/login/route.ts,src/app/api/auth/register/route.ts,src/app/api/auth/reset-password/route.ts,src/app/api/members/[id]/route.ts,src/app/api/members/route.ts,src/app/api/predict/route.ts,src/app/api/reviews/[id]/route.ts,src/app/api/reviews/route.ts,src/app/api/teams/[id]/approve/route.ts,src/app/api/teams/[id]/leave/route.ts,src/app/api/teams/[id]/members/[userId]/route.ts,src/app/api/teams/[id]/members/route.ts,src/app/api/teams/[id]/reject/route.ts,src/app/api/teams/[id]/route.ts,src/app/api/teams/my/route.ts,src/app/api/teams/route.ts,src/app/api/trails/[id]/route.ts,src/app/api/trails/route.ts,src/components/features/HeartRateZones.tsx,src/components/ui/Button.tsx,src/components/ui/Input.tsx,src/components/ui/Modal.tsx,src/components/ui/Select.tsx,src/components/ui/Table.tsx,src/lib/heartRate.ts,src/lib/utils.ts,src/storage/database/index.ts,src/storage/database/memberManager.ts,src/storage/database/reviewManager.ts,src/storage/database/teamManager.ts,src/storage/database/trailManager.ts,src/storage/database/userManager.ts,src/types/models.ts,tsconfig.tsbuildinfo |
| 2026-01-15 | `3548c323ed3e56c648b3bff8d2c6f874b8483859` | main | refactor: 完成项目目录结构重组与代码优化 | 无 | src/app/members/page.tsx,src/app/predict/page.tsx,src/app/profile/page.tsx,src/app/reviews/[id]/page.tsx,src/app/reviews/new/page.tsx,src/app/reviews/page.tsx,src/app/settings/page.tsx,src/app/teams/[id]/page.tsx,src/app/teams/new/page.tsx,src/app/teams/page.tsx,src/app/trails/page.tsx,src/components/features/auth/AuthGuard.tsx,src/components/features/layout/DashboardLayout.tsx,src/components/features/theme/ThemeToggle.tsx,src/components/ui/README.md,src/config/constants.ts,src/config/index.ts,src/config/navigation.ts,src/config/theme.ts,src/hooks/index.ts,src/hooks/useAuth.ts,src/hooks/useLocalStorage.ts,src/hooks/useMembers.ts,src/hooks/usePrediction.ts,src/hooks/useTeams.ts,src/hooks/useTrails.ts,src/services/apiClient.ts,src/services/authService.ts,src/services/index.ts,src/services/memberService.ts,src/services/predictionService.ts,src/services/reviewService.ts,src/services/teamService.ts,src/services/terrainTypeService.ts,src/services/trailService.ts,src/types/api.ts,src/types/auth.ts,src/types/index.ts,src/types/models.ts,tsconfig.tsbuildinfo |
| 2026-01-15 | `53149aa047e7cd923e38060689f9c5aae0a51058` | main | docs: 完成项目结构分析与优化建议文档 | 无 |  |
| 2026-01-14 | `0d5c6d526d34d523c756500c71280ad773891fe9` | main | fix: 修复编辑赛道后保存失败导致赛道消失的问题 | 无 |  |
| 2026-01-14 | `353e85ef04c503cef37cb7f8262d15437beb62f6` | main | fix: 修复编辑赛道后保存失败导致赛道消失的问题 | 无 | src/app/api/trails/route.ts,src/app/trails/[id]/edit/page.tsx,src/app/trails/new/page.tsx,tsconfig.tsbuildinfo |
| 2026-01-13 | `e874507344273a18fd394690636bab04262e3cde` | main | fix: 修复路书识别下坡数据问题并增加缩略图查看功能 | 无 |  |
| 2026-01-13 | `0d67c1e66828d7b978da4b374f41ceaf08e7cf2a` | main | fix: 修复路书识别下坡数据问题并增加缩略图查看功能 | 无 | src/app/api/recognize-route/route.ts,src/app/trails/[id]/edit/page.tsx,src/app/trails/new/page.tsx,tsconfig.tsbuildinfo |
| 2026-01-12 | `b29016d60d6b146480ae651c5ad61ead22df5bce` | main | auto saved your changes before deploy | 无 |  |
| 2026-01-12 | `944fe0074519b196f95cbc87fc328f8c86e8c53a` | main | deploy: 部署最新版本修复预测参数问题 | 无 |  |
| 2026-01-12 | `de0994ecd25c173f6f691103e2858514a83e9a2c` | main | fix: 修复预测参数传递和更新问题 | 无 | src/app/predict/page.tsx,tsconfig.tsbuildinfo |
| 2026-01-12 | `9518da9ebb95cb45aecf7274c279df5803215dc2` | main | feat: 将地形复杂系数改为全局设置，新增系统设置页面 | 无 | src/app/api/predict/route.ts,src/app/api/terrain-types/[id]/route.ts,src/app/api/terrain-types/route.ts,src/app/members/[id]/edit/page.tsx,src/app/members/new/page.tsx,src/app/settings/page.tsx,src/components/DashboardLayout.tsx,src/lib/trailAlgorithm.ts,src/storage/database/index.ts,src/storage/database/shared/schema.ts,tsconfig.tsbuildinfo |
| 2026-01-12 | `adfed6e1aeb42e8d42e1915fc720a9e572a761f0` | main | fix: 修复预测参数保留和默认值设置问题 | 无 | tsconfig.tsbuildinfo |
| 2026-01-12 | `5db43d8348d66c4e0acdd7c89ae390bc9f70cd98` | main | feat: 优化预测参数侧边栏和CP点列表交互功能 | 无 | tsconfig.tsbuildinfo |
| 2026-01-12 | `407d4c38697506bf208db41f05784b1f20794ceb` | main | feat: 成绩预测页面新增P0平路基准配速输入与编辑功能 | 无 | tsconfig.tsbuildinfo |
| 2026-01-12 | `98ba59deaaa62882d96e0bd63cdc76d5c188c200` | main | feat: 更新成绩预测算法，采用新公式 Ti = (Di × P0 + Ei × k) × α | 无 | src/app/members/[id]/edit/page.tsx,src/app/members/new/page.tsx,src/app/predict/page.tsx,src/app/trails/[id]/edit/page.tsx,src/app/trails/new/page.tsx,src/lib/trailAlgorithm.ts,src/storage/database/shared/schema.ts,tsconfig.tsbuildinfo |
| 2026-01-12 | `4cfd11b1a3f623c4c0286a3ed40838a83e36c0cb` | main | fix: 修复路书识别功能的bug，增强AI识别能力并完善数据完整性 | 无 | tsconfig.tsbuildinfo |
| 2026-01-12 | `96ece12f517da0888494abeecd9ee767fad8006a` | main | fix: 修复路书图片上传和数据库迁移问题 | 无 | drizzle/meta/0000_snapshot.json,drizzle/meta/_journal.json,src/app/api/upload/route.ts,tsconfig.tsbuildinfo |
| 2026-01-12 | `951dddf3eb306fe893ffb90f207942e5e1d8f2fe` | main | feat: 添加路书图片上传和自动识别功能 | 无 |  |
| 2026-01-12 | `fccbba2d9b9ea7f0777b17fa92671951ae217185` | main | fix: 修复路书图片上传失败的客户端打包问题 | 无 |  |
| 2026-01-12 | `6804ddd1449151d476a09b1ce5b9030230cad47e` | main | fix: 修复路书图片上传失败的客户端打包问题 | 无 | src/app/api/upload/route.ts,tsconfig.tsbuildinfo |
| 2026-01-12 | `dd6bc3c9680fda85e8c81f22edb6283f227bde60` | main | feat: 添加路书图片上传和自动识别功能 | 无 | src/app/api/recognize-route/route.ts,src/app/api/upload/route.ts,src/app/trails/[id]/edit/page.tsx,src/app/trails/new/page.tsx,src/storage/database/shared/schema.ts,tsconfig.tsbuildinfo,workspace/git history.md |
| 2026-01-12 | `5c72877838c6d27f939e89953993a0f30afa5990` | main | auto saved your changes before deploy | 无 |  |
| 2026-01-12 | `3b389efd6fac817144f20c9690773bf55b36d48d` | main | fix: 修复登录后跳转问题，添加详细的调试日志 | 无 | src/app/auth/login/LoginClient.tsx,src/components/AuthGuard.tsx,src/lib/auth.ts,tsconfig.tsbuildinfo |
| 2026-01-12 | `3fd719e728546823b50ecaf71ffe251fd750f47d` | main | auto saved your changes before deploy | 无 |  |
| 2026-01-12 | `cee3e9110f3973e778af77422bd879702f439bbb` | main | config: 配置正式域名 byptb6339h.coze.site | 无 | next.config.ts,src/app/layout.tsx |
| 2026-01-12 | `aee50807f809f398b6623ce0e535311453d2e519` | main | auto saved your changes before deploy | 无 |  |
| 2026-01-12 | `904563606f53ad492fce6048de1c47f8dc74bb19` | main | fix: 修复 useSearchParams Suspense 边界问题，解决 Next.js 16 构建错误 | 无 | .next/dev/build/chunks/[root-of-the-server]__51225daf._.js,.next/dev/build/chunks/[root-of-the-server]__51225daf._.js.map,.next/dev/build/chunks/[root-of-the-server]__974941ed._.js,.next/dev/build/chunks/[root-of-the-server]__974941ed._.js.map,.next/dev/build/chunks/[turbopack-node]_transforms_postcss_ts_72275c55._.js,.next/dev/build/chunks/[turbopack-node]_transforms_postcss_ts_72275c55._.js.map,.next/dev/build/chunks/[turbopack]_runtime.js,.next/dev/build/chunks/[turbopack]_runtime.js.map,.next/dev/build/chunks/node_modules__pnpm_56ec7204._.js,.next/dev/build/chunks/node_modules__pnpm_56ec7204._.js.map,.next/dev/build/package.json,.next/dev/build/postcss.js,.next/dev/build/postcss.js.map,.next/dev/cache/.rscinfo,.next/dev/cache/next-devtools-config.json,.next/dev/fallback-build-manifest.json,.next/dev/lock,.next/dev/logs/next-development.log,.next/dev/package.json,.next/dev/prerender-manifest.json,.next/dev/routes-manifest.json,.next/dev/server/app-paths-manifest.json,.next/dev/server/app/page.js,.next/dev/server/app/page.js.map,.next/dev/server/app/page/app-paths-manifest.json,.next/dev/server/app/page/build-manifest.json,.next/dev/server/app/page/next-font-manifest.json,.next/dev/server/app/page/react-loadable-manifest.json,.next/dev/server/app/page/server-reference-manifest.json,.next/dev/server/app/page_client-reference-manifest.js,.next/dev/server/chunks/ssr/69652_@swc_helpers_cjs__interop_require_wildcard_cjs_f6d64c6c._.js,.next/dev/server/chunks/ssr/69652_@swc_helpers_cjs__interop_require_wildcard_cjs_f6d64c6c._.js.map,.next/dev/server/chunks/ssr/[root-of-the-server]__018293d2._.js,.next/dev/server/chunks/ssr/[root-of-the-server]__018293d2._.js.map,.next/dev/server/chunks/ssr/[root-of-the-server]__343259c8._.js,.next/dev/server/chunks/ssr/[root-of-the-server]__343259c8._.js.map,.next/dev/server/chunks/ssr/[root-of-the-server]__c80f7c8f._.js,.next/dev/server/chunks/ssr/[root-of-the-server]__c80f7c8f._.js.map,.next/dev/server/chunks/ssr/[root-of-the-server]__e8a2741f._.js,.next/dev/server/chunks/ssr/[root-of-the-server]__e8a2741f._.js.map,.next/dev/server/chunks/ssr/[turbopack]_runtime.js,.next/dev/server/chunks/ssr/[turbopack]_runtime.js.map,.next/dev/server/chunks/ssr/_next-internal_server_app_page_actions_39d4fc33.js,.next/dev/server/chunks/ssr/_next-internal_server_app_page_actions_39d4fc33.js.map,.next/dev/server/chunks/ssr/af9ea_next_dist_40203f0f._.js,.next/dev/server/chunks/ssr/af9ea_next_dist_40203f0f._.js.map,.next/dev/server/chunks/ssr/af9ea_next_dist_6b72e98b._.js,.next/dev/server/chunks/ssr/af9ea_next_dist_6b72e98b._.js.map,.next/dev/server/chunks/ssr/af9ea_next_dist_client_components_builtin_forbidden_f3bcaaa9.js,.next/dev/server/chunks/ssr/af9ea_next_dist_client_components_builtin_forbidden_f3bcaaa9.js.map,.next/dev/server/chunks/ssr/af9ea_next_dist_client_components_builtin_global-error_a59a19e8.js,.next/dev/server/chunks/ssr/af9ea_next_dist_client_components_builtin_global-error_a59a19e8.js.map,.next/dev/server/chunks/ssr/af9ea_next_dist_client_components_builtin_unauthorized_0f7ce14d.js,.next/dev/server/chunks/ssr/af9ea_next_dist_client_components_builtin_unauthorized_0f7ce14d.js.map,.next/dev/server/chunks/ssr/af9ea_next_dist_client_components_db84ebba._.js,.next/dev/server/chunks/ssr/af9ea_next_dist_client_components_db84ebba._.js.map,.next/dev/server/chunks/ssr/af9ea_next_dist_compiled_65a3d2fb._.js,.next/dev/server/chunks/ssr/af9ea_next_dist_compiled_65a3d2fb._.js.map,.next/dev/server/chunks/ssr/af9ea_next_dist_esm_4e8121f9._.js,.next/dev/server/chunks/ssr/af9ea_next_dist_esm_4e8121f9._.js.map,.next/dev/server/chunks/ssr/src_app_5b2047f8._.js,.next/dev/server/chunks/ssr/src_app_5b2047f8._.js.map,.next/dev/server/interception-route-rewrite-manifest.js,.next/dev/server/middleware-build-manifest.js,.next/dev/server/middleware-manifest.json,.next/dev/server/next-font-manifest.js,.next/dev/server/next-font-manifest.json,.next/dev/server/pages-manifest.json,.next/dev/server/server-reference-manifest.js,.next/dev/server/server-reference-manifest.json,.next/dev/static/chunks/69652_@swc_helpers_cjs_679851cc._.js,.next/dev/static/chunks/69652_@swc_helpers_cjs_679851cc._.js.map,.next/dev/static/chunks/[next]_internal_font_google_geist_a71539c9_module_css_bad6b30c._.single.css,.next/dev/static/chunks/[next]_internal_font_google_geist_a71539c9_module_css_bad6b30c._.single.css.map,.next/dev/static/chunks/[next]_internal_font_google_geist_mono_8d43a2aa_module_css_bad6b30c._.single.css,.next/dev/static/chunks/[next]_internal_font_google_geist_mono_8d43a2aa_module_css_bad6b30c._.single.css.map,.next/dev/static/chunks/[root-of-the-server]__0f0ba101._.css,.next/dev/static/chunks/[root-of-the-server]__0f0ba101._.css.map,.next/dev/static/chunks/[turbopack]_browser_dev_hmr-client_hmr-client_ts_2bcdcb7f._.js,.next/dev/static/chunks/[turbopack]_browser_dev_hmr-client_hmr-client_ts_2bcdcb7f._.js.map,.next/dev/static/chunks/[turbopack]_browser_dev_hmr-client_hmr-client_ts_c8c997ce._.js,.next/dev/static/chunks/[turbopack]_browser_dev_hmr-client_hmr-client_ts_c8c997ce._.js.map,.next/dev/static/chunks/[turbopack]_browser_dev_hmr-client_hmr-client_ts_e5c6f61a._.js,.next/dev/static/chunks/_3d990400._.js.map,.next/dev/static/chunks/_a0ff3932._.js,.next/dev/static/chunks/af9ea_next_dist_228e97cc._.js,.next/dev/static/chunks/af9ea_next_dist_228e97cc._.js.map,.next/dev/static/chunks/af9ea_next_dist_build_polyfills_polyfill-nomodule.js,.next/dev/static/chunks/af9ea_next_dist_cd5fede2._.js,.next/dev/static/chunks/af9ea_next_dist_cd5fede2._.js.map,.next/dev/static/chunks/af9ea_next_dist_client_3d23be48._.js,.next/dev/static/chunks/af9ea_next_dist_client_3d23be48._.js.map,.next/dev/static/chunks/af9ea_next_dist_client_components_builtin_global-error_d2de1600.js,.next/dev/static/chunks/af9ea_next_dist_compiled_c3d66c67._.js,.next/dev/static/chunks/af9ea_next_dist_compiled_c3d66c67._.js.map,.next/dev/static/chunks/af9ea_next_dist_compiled_next-devtools_index_fe54e8ed.js,.next/dev/static/chunks/af9ea_next_dist_compiled_next-devtools_index_fe54e8ed.js.map,.next/dev/static/chunks/af9ea_next_dist_compiled_react-dom_40b459a3._.js,.next/dev/static/chunks/af9ea_next_dist_compiled_react-dom_40b459a3._.js.map,.next/dev/static/chunks/af9ea_next_dist_compiled_react-server-dom-turbopack_f0daa290._.js,.next/dev/static/chunks/af9ea_next_dist_compiled_react-server-dom-turbopack_f0daa290._.js.map,.next/dev/static/chunks/src_app_favicon_ico_mjs_91667f65._.js,.next/dev/static/chunks/src_app_globals_css_bad6b30c._.single.css,.next/dev/static/chunks/src_app_globals_css_bad6b30c._.single.css.map,.next/dev/static/chunks/src_app_layout_tsx_d2de1600._.js,.next/dev/static/chunks/src_app_page_tsx_20f3862f._.js,.next/dev/static/chunks/turbopack-_3d990400._.js,.next/dev/static/development/_buildManifest.js,.next/dev/static/development/_clientMiddlewareManifest.json,.next/dev/static/development/_ssgManifest.js,.next/dev/static/media/4fa387ec64143e14-s.c1fdd6c2.woff2,.next/dev/static/media/7178b3e590c64307-s.b97b3418.woff2,.next/dev/static/media/797e433ab948586e-s.p.dbea232f.woff2,.next/dev/static/media/8a480f0b521d4e75-s.8e0177b5.woff2,.next/dev/static/media/bbc41e54d2fcbd21-s.799d8ef8.woff2,.next/dev/static/media/caa3a2e1cccd8315-s.p.853070df.woff2,.next/dev/static/media/favicon.0b3bf435.ico,.next/dev/trace,.next/dev/types/cache-life.d.ts,.next/dev/types/routes.d.ts,.next/dev/types/validator.ts |
| 2026-01-12 | `9c721fba53d4fbd2775ee360036d9c8cfe15d792` | main | fix: 修复 useSearchParams Suspense 边界问题，解决 Next.js 16 构建错误 | 无 | .next/dev/static/chunks/[root-of-the-server]__0f0ba101._.css,.next/dev/static/chunks/[root-of-the-server]__0f0ba101._.css.map,.next/dev/static/chunks/src_app_globals_css_bad6b30c._.single.css,.next/dev/static/chunks/src_app_globals_css_bad6b30c._.single.css.map,next-env.d.ts,src/app/auth/login/LoginClient.tsx,src/app/auth/login/page.tsx,src/app/auth/reset-password/ResetPasswordClient.tsx,src/app/auth/reset-password/page.tsx,tsconfig.tsbuildinfo |
| 2026-01-12 | `29f28e033840700aa61d5be52892d275b4ac1843` | main | auto saved your changes before deploy | 无 |  |
| 2026-01-12 | `a054b76691de8a624eb6fe2ca85856502cbf9ea0` | main | fix: 修复 Next.js 16 动态路由参数类型问题及 TypeScript 错误 | 无 | src/app/api/teams/[id]/approve/route.ts,src/app/api/teams/[id]/leave/route.ts,src/app/api/teams/[id]/members/[userId]/route.ts,src/app/api/teams/[id]/members/route.ts,src/app/api/teams/[id]/reject/route.ts,src/app/api/teams/[id]/route.ts,src/app/reviews/page.tsx,tsconfig.tsbuildinfo |
| 2026-01-12 | `ff65d4da047bb7147ef8ded062499bec8701a113` | main | auto saved your changes before deploy | 无 |  |
| 2026-01-12 | `7d9021a9c0f578bc3ff19d2e83c26ebced9f45fd` | main | fix: 修复主题上下文提供者问题，确保 ThemeToggle 始终可访问 ThemeContext | 无 | .next/dev/trace,src/app/layout.tsx,src/lib/theme.tsx |
| 2026-01-12 | `d7fc8319d76f8f32e130ee6ecd7d7b6426e68878` | main | feat: 添加深色模式支持、优化成绩预测页面布局和按钮样式 | 无 | .next/dev/cache/next-devtools-config.json,.next/dev/logs/next-development.log,.next/dev/prerender-manifest.json,.next/dev/server/app-paths-manifest.json,.next/dev/server/app/page.js,.next/dev/server/app/page_client-reference-manifest.js,.next/dev/server/chunks/ssr/[externals]_next_dist_compiled_next-server_app-page-turbo_runtime_dev_062c5159.js,.next/dev/server/chunks/ssr/[externals]_next_dist_compiled_next-server_app-page-turbo_runtime_dev_062c5159.js.map,.next/dev/server/chunks/ssr/[root-of-the-server]__305743d6._.js,.next/dev/server/chunks/ssr/[root-of-the-server]__305743d6._.js.map,.next/dev/server/chunks/ssr/af9ea_next_dist_dde23a19._.js,.next/dev/server/chunks/ssr/af9ea_next_dist_dde23a19._.js.map,.next/dev/server/chunks/ssr/node_modules__pnpm_7b2a8724._.js,.next/dev/server/chunks/ssr/node_modules__pnpm_7b2a8724._.js.map,.next/dev/server/middleware-manifest.json,.next/dev/server/next-font-manifest.js,.next/dev/server/next-font-manifest.json,.next/dev/server/server-reference-manifest.js,.next/dev/server/server-reference-manifest.json,.next/dev/static/chunks/[root-of-the-server]__0f0ba101._.css,.next/dev/static/chunks/[root-of-the-server]__0f0ba101._.css.map,.next/dev/static/chunks/af9ea_next_dist_fc9beb60._.js,.next/dev/static/chunks/af9ea_next_dist_fc9beb60._.js.map,.next/dev/static/chunks/src_app_globals_css_bad6b30c._.single.css,.next/dev/static/chunks/src_app_globals_css_bad6b30c._.single.css.map,.next/dev/static/chunks/src_app_layout_tsx_d2de1600._.js,.next/dev/trace,src/app/layout.tsx,src/app/predict/page.tsx,src/components/DashboardLayout.tsx,src/components/ThemeToggle.tsx,src/lib/theme.tsx,tsconfig.tsbuildinfo |
| 2026-01-12 | `dc3fec7a3c1aa3ce318cf05ef5b72265f5c24a7b` | main | fix: 修复成绩预测API 500错误，补充缺失的函数导入 | 无 |  |
| 2026-01-12 | `1b6f279b5770eed6b1087210278481d589b27585` | main | fix: 修复成绩预测API 500错误，补充缺失的函数导入 | 无 | .next/dev/server/app-paths-manifest.json,.next/dev/server/next-font-manifest.js,.next/dev/server/next-font-manifest.json,.next/dev/trace,src/app/api/predict/route.ts,src/app/predict/page.tsx,tmp/test-predict-api.js,tsconfig.tsbuildinfo,"workspace/345276205345274200345217221.md" |
| 2026-01-12 | `443884ce4a87a3f34baa55dc4b4dd8f2d01502fe` | main | feat: 添加跑团功能，支持创建跑团、申请加入、成员管理 | 无 | .next/dev/prerender-manifest.json,.next/dev/server/app-paths-manifest.json,.next/dev/server/middleware-manifest.json,.next/dev/server/next-font-manifest.js,.next/dev/server/next-font-manifest.json,.next/dev/static/chunks/[root-of-the-server]__0f0ba101._.css,.next/dev/static/chunks/[root-of-the-server]__0f0ba101._.css.map,.next/dev/static/chunks/src_app_globals_css_bad6b30c._.single.css,.next/dev/static/chunks/src_app_globals_css_bad6b30c._.single.css.map,.next/dev/trace,.next/dev/types/routes.d.ts,.next/dev/types/validator.ts,src/app/api/teams/[id]/approve/route.ts,src/app/api/teams/[id]/leave/route.ts,src/app/api/teams/[id]/members/[userId]/route.ts,src/app/api/teams/[id]/members/route.ts,src/app/api/teams/[id]/reject/route.ts,src/app/api/teams/[id]/route.ts,src/app/api/teams/my/route.ts,src/app/api/teams/route.ts,src/app/teams/[id]/page.tsx,src/app/teams/new/page.tsx,src/app/teams/page.tsx,src/components/DashboardLayout.tsx,src/storage/database/index.ts,src/storage/database/shared/schema.ts,src/storage/database/teamManager.ts,tsconfig.tsbuildinfo,"workspace/345276205345274200345217221.md" |
| 2026-01-12 | `c7dfcb2ef3f2405c063ccce2f538e45a24023f55` | main | fix: 修复导航栏显示和复盘页面404问题 | 无 | .next/dev/prerender-manifest.json,.next/dev/server/app-paths-manifest.json,.next/dev/server/middleware-manifest.json,.next/dev/server/next-font-manifest.js,.next/dev/server/next-font-manifest.json,.next/dev/static/chunks/[root-of-the-server]__0f0ba101._.css,.next/dev/static/chunks/[root-of-the-server]__0f0ba101._.css.map,.next/dev/static/chunks/src_app_globals_css_bad6b30c._.single.css,.next/dev/static/chunks/src_app_globals_css_bad6b30c._.single.css.map,.next/dev/trace,.next/dev/types/routes.d.ts,.next/dev/types/validator.ts,src/app/predict/page.tsx,src/app/reviews/[id]/page.tsx,src/app/reviews/new/page.tsx,src/app/reviews/page.tsx,src/app/trails/page.tsx,tsconfig.tsbuildinfo |
| 2026-01-12 | `2356b2e715211dbf94406d8188aceeae15d4283c` | main | fix: 修复 child_process 构建错误和 useRouter 运行时错误 | 无 | .next/dev/cache/next-devtools-config.json,.next/dev/fallback-build-manifest.json,.next/dev/logs/next-development.log,.next/dev/prerender-manifest.json,.next/dev/server/app-paths-manifest.json,.next/dev/server/app/page_client-reference-manifest.js,.next/dev/server/middleware-build-manifest.js,.next/dev/server/middleware-manifest.json,.next/dev/server/next-font-manifest.js,.next/dev/server/next-font-manifest.json,.next/dev/server/pages-manifest.json,.next/dev/static/chunks/[root-of-the-server]__0f0ba101._.css,.next/dev/static/chunks/[root-of-the-server]__0f0ba101._.css.map,.next/dev/static/chunks/src_app_globals_css_bad6b30c._.single.css,.next/dev/static/chunks/src_app_globals_css_bad6b30c._.single.css.map,.next/dev/static/chunks/src_app_page_tsx_20f3862f._.js,.next/dev/static/development/_buildManifest.js,.next/dev/trace,src/app/api/auth/forgot-password/route.ts,src/app/api/auth/login/route.ts,src/app/api/auth/register/route.ts,src/app/api/auth/reset-password/route.ts,src/app/api/members/[id]/route.ts,src/app/api/members/route.ts,src/app/api/predict/route.ts,src/app/api/reviews/[id]/route.ts,src/app/api/reviews/route.ts,src/app/api/trails/[id]/route.ts,src/app/api/trails/route.ts,src/app/members/page.tsx,src/lib/auth.ts,src/storage/database/index.ts,src/storage/database/memberManager.ts,src/storage/database/reviewManager.ts,src/storage/database/trailManager.ts,src/storage/database/userManager.ts,tsconfig.tsbuildinfo |
| 2026-01-11 | `26e474b608bd91509c99d74ff83c6b688fbb04c1` | main | feat: 添加身份验证、路由保护、忘记密码和个人中心功能 | 无 | .next/dev/fallback-build-manifest.json,.next/dev/logs/next-development.log,.next/dev/server/app/page.js,.next/dev/server/app/page_client-reference-manifest.js,.next/dev/server/middleware-build-manifest.js,.next/dev/server/middleware-manifest.json,.next/dev/server/next-font-manifest.js,.next/dev/server/next-font-manifest.json,.next/dev/server/pages-manifest.json,.next/dev/static/chunks/src_app_page_tsx_20f3862f._.js,.next/dev/static/development/_buildManifest.js,.next/dev/static/development/_clientMiddlewareManifest.json,.next/dev/types/routes.d.ts,.next/dev/types/validator.ts |
| 2026-01-11 | `b55d04b376beb9d4ed2d3162cb3259a1ba766e27` | main | feat: 添加用户注册和登录功能 | 无 | .next/dev/server/app-paths-manifest.json,.next/dev/static/chunks/[root-of-the-server]__0f0ba101._.css,.next/dev/static/chunks/[root-of-the-server]__0f0ba101._.css.map,.next/dev/static/chunks/src_app_globals_css_bad6b30c._.single.css,.next/dev/static/chunks/src_app_globals_css_bad6b30c._.single.css.map,.next/dev/types/routes.d.ts,.next/dev/types/validator.ts,"workspace/345276205345274200345217221.md" |
| 2026-01-11 | `6313eee0a31a9a7d68a60622d70bcded003bbb2e` | main | feat: 添加用户注册和登录功能 | 无 | drizzle/migrations/0001_create_users_table.sql,package.json,pnpm-lock.yaml,src/app/api/auth/login/route.ts,src/app/api/auth/register/route.ts,src/app/auth/login/page.tsx,src/app/auth/register/page.tsx,src/storage/database/shared/schema.ts,src/storage/database/userManager.ts |
| 2026-01-11 | `999d03b2c7faaada680fd457053f82e46e121f1e` | dev | chore: 更新 commit 日志 | 无 |  |
| 2026-01-11 | `d49a298cafa8db835577dc210048f324a50cb225` | dev | fix: 解决 commit 日志合并冲突 | 无 |  |
| 2026-01-11 | `bcafa7b1f4536910460372ad2d1dc97be4d4d433` | main | chore: 更新 commit 日志 | 无 |  |
| 2026-01-11 | `44f57f0225007f0a6546ca22d7495c39a3e58e5f` | main | chore: 更新 commit 日志 | 无 |  |
| 2026-01-11 | `d28ce95a5701cf1cee7cd642ea4a6460b29507c8` | main | chore: 更新 commit 日志 | 无 |  |
| 2026-01-11 | `784e3435318349930b252ea2323ea397bd4cd681` | main | chore: 更新 commit 日志 | 无 |  |
| 2026-01-11 | `8a5721f453cbe1391766ab96502537f7117ce98b` | main | chore: 更新 commit 日志 | 无 |  |
| 2026-01-11 | `240000c8950b669f4cd8e07f74e7003843a3d0c5` | main | chore: 同步 dev 分支与 main 分支内容 | 无 | .next/dev/logs/next-development.log,.next/dev/prerender-manifest.json,.next/dev/server/app-paths-manifest.json,.next/dev/server/next-font-manifest.js,.next/dev/server/next-font-manifest.js,.next/dev/server/server-reference-manifest.js,.next/dev/server/server-reference-manifest.json,.next/dev/trace,tmp/git_status_report.md |
| 2026-01-11 | `c4ff985506c4330b2c2a0b65582ef666cc8689db` | main | chore: 更新 commit 日志 | 无 |  |
| 2026-01-11 | `9efce48bdfc8ff83360ac88f9d30cdac1bda5453` | main | chore: 更新 package.json，添加越野训练教练APP所需依赖 | 无 | pnpm-lock.yaml |
| 2026-01-11 | `07c8c73f413a4632a55304e04c271bea714cb3ba` | main | Update - 2026-01-11 20:54:55 | 无 |  |
| 2026-01-11 | `2bffddab93e48cc39d8c3fd130506c810d7e82c9` | main | chore: 更新 commit 日志 | 无 |  |
| 2026-01-11 | `884c7041b1aa20db9b9af907d984d922202111e7` | main | docs: 创建 Git Commit 日志系统，支持自动记录每次提交和提示词 | 无 |  |
| 2026-01-11 | `ac605c5ee892c1c2cb5de6cddf91a305f996c7a1` | main | chore: 清理测试文件 | 无 |  |
| 2026-01-11 | `3e0d0fce736e563fb27f76353caf9b8a4e8d2d47` | main | test: 测试 post-commit hook | 无 |  |
| 2026-01-11 | dc40059 | main | Add GitHub upload script | 创建 GitHub 上传脚本，用于自动化部署项目代码到 GitHub 仓库 | upload_to_github.sh |
| 2026-01-11 | 9c79d75 | main | Initial commit | 初始化项目，创建 Next.js 越野训练教练APP的基础结构 | 所有项目文件 |

---

## 详细记录

### 2026-01-11

#### Commit: dc40059

**Commit Hash:** `dc40059`
**分支:** main
**时间:** 2026-01-11 14:51:30
**提交信息:** Add GitHub upload script
**提示词:** 创建 GitHub 上传脚本，用于自动化部署项目代码到 GitHub 仓库
**影响文件:** upload_to_github.sh

---

#### Commit: 9c79d75

**Commit Hash:** `9c79d75`
**分支:** main
**时间:** 2026-01-11
**提交信息:** Initial commit
**提示词:** 初始化项目，创建 Next.js 越野训练教练APP的基础结构
**影响文件:** 所有项目文件

---

### 历史记录（master 分支）

#### Commit: 8352981

**Commit Hash:** `8352981`
**分支:** master
**时间:** 2026-01-11 14:42:04
**提交信息:** Remove .git from projects folder and re-add files
**提示词:** 修复上传问题，删除 projects/.git 目录后重新添加实际文件内容
**影响文件:** projects/ 目录下所有文件

---

#### Commit: b34b4ea

**Commit Hash:** `b34b4ea`
**分支:** master
**时间:** 2026-01-11 14:41:57
**提交信息:** Upload projects folder
**提示词:** 首次上传 projects 文件夹到 GitHub 仓库
**影响文件:** projects/

---
