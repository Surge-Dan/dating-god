# 开发质量检查

产品仍可用Node18启动；以下开发工具链使用Node24。首次运行`npm ci --ignore-scripts`和`npx playwright install chromium`。

- `npm run check`：语法和静态资源契约。
- `npm run test:coverage`：全部Node回归；仅统计scripts、engine与report，门槛行85%、分支75%，测试文件和内容数据不参与分母。
- `npm run test:features`：执行Gherkin，不接受未定义或跳过的步骤。
- `npm run test:e2e`：六档宽度、axe严重问题、离线返回、模拟模型开练至复盘保存导出；另收集真实浏览器脚本覆盖率，必须包含app和radar-ui。浏览器覆盖率与服务端单独报告。
- `npm run test:mutation`：仅变异报告证据校验函数，得分低于80%失败。此项不是全项目变异得分。

普通CI执行快检查、覆盖率、Gherkin与浏览器测试；手动触发额外运行变异测试。当前自动浏览器验收使用Chromium；Firefox、WebKit、真人模型及真实手机仍需单独验收。

新增行为先有失败用例。问题修复后复查取消、过期、重复提交、归因、预算/时间、拒绝、草稿与隐私边界。不得用自动重试或放宽断言掩盖失败。视觉基准变更需要人工检查截图。

本地生成结果保留在被忽略的`.private/qa/`；不要上传私人对话或真实密钥。Phosphor仅按需内嵌图标，随产品附带原始MIT授权。
