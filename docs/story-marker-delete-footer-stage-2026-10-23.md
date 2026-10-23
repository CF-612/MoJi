# 时间标记删除按钮 — 2026-10-23 阶段记录

## 确认目标
已实际查看用户截图 `libfile_5ebe730f1cdc81918bc1081d1adb7ab8`：标题为「编辑时间标记」，「删除这个标记」原本是分隔线上方的红色文字，取消和保存位于底部。

## 修改
- 共享 `StoryAxisPanels.jsx` 的 Footer 增加可选危险操作槽；该标记编辑器把原有删除按钮移入底栏左侧。
- 删除为红底白字按钮；取消／保存单独成组靠右。底栏允许换行，窄屏不挤压重叠；保留 44px 最小触控高度和键盘焦点轮廓。
- 原有 `type="button"`、`submission.disabled`、`submission.submit(onDelete)` 完全保留。未改动 StoryTimeAxis 的实际删除 handler，也未新增或移除确认流程。
- 新建标记不显示删除。其他故事面板未新增危险操作。
- 本组件由共享工作台使用，不增加宿主专用分叉。

## 验证
已通过：
- `npm run typecheck`。
- `node --test tests/story-marker-footer.test.js`：2 项结构／样式回归。
- `node --test tests/story-axis-view.test.js tests/story-axis.test.js tests/story-shared-tracks.test.js tests/story-track-controls.test.js`：45 项通过。
- `git diff --check`。
- `tests/ui-story-marker-footer.mjs` 的真实组件＋正式样式独立 fixture 构建成功：`artifacts/story-marker-footer/fixture.html`。

待验证：
- 浏览器脚本包括 320/390/600/1100px × 明暗主题、左右布局和重叠、取消和焦点恢复、删除 false/error/success、等待锁和重复点击、Escape、busy、保存、新建标记。尚未运行到断言：容器 Chromium 启动被 socket 权限阻止；提权重试受环境 bwrap 只读路径错误阻止。未尝试绕过。
- 已与占用云浏览器的时间轴抖动修复任务协调，等待现有 CUA 的实际视觉验证。

## 范围
没有操作任何真实用户数据；fixture 回调仅写入浏览器内存。未 commit、push、发布或改动四个保留私有文件。现有大批未提交 UI／模板变更保持原样。

## 08:55 CUA 验证补充（取代上述等待状态）
- 使用独立本地 fixture 服务器 43144，无账户连接；实际查看 600px 与 320px iframe 的浅色／深色编辑器。
- 删除按钮在底栏左侧为实心红色，取消／保存分组位于右侧；320px 宽度没有按钮重叠，内容滚动后底部三个按钮完整可见。
- fixture 补齐实际 `unified-story` 祖先及正式样式后，确认保存仍为主色按钮，红色删除与保存区分明确（600px 深色、320px 浅色终态）。
- 点击合成删除（回调返回 false）后对话框仍打开；取消正常关闭。
- 这不是完整 Playwright 脚本通过；pending/error/success 等剩余自动化断言仍未运行。

## 10:14 自建时间点易用性补充
- 新建／编辑标题统一为「新建时间点」「编辑时间点」，名称字段为「时间点名称」，日期区为「时间点放在哪一天？」。
- 新建说明明确是命名时间点、不是剧情卡，日期已带入当前选择位置并可修改。使用本作品历法，名字与日期的职责分开说明。
- 增加实时落点预览：「保存后将把『名称』放在 [完整年月日]」。即使时间轴隐藏月／日，此确认预览仍显示完整日期；自定义历法纪年由已有格式化函数处理。
- 新建按钮为「创建时间点」，编辑仍为「保存」。名称全空白或日期无效时禁用提交并保留校验；提交 payload 不变。
- 原有相邻插入按钮明确改为「在前一天新建／在后一天新建」，与现有 ±1 天 handler 一致；删除 handler 与左下红色布局未变。
- 类型检查通过；copy/footer 共 5 项测试通过，fixture 构建通过。真实 CUA 新建、编辑、取消、删除测试交由时间轴 worker 在独立 QA 数据上完成，本文不预先宣称通过。
