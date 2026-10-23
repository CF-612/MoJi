# 关系侧栏与图预览交互修正

依据用户 05:30 截图，已实际查看 `image(20261023-053051).png` 与 `image(20261023-053052).png`。

## 原因
- 宽屏 CSS 强制 340px 关系列，无折叠状态或分隔拖柄；不是构建遗漏已有功能。
- SVG 仅支持按钮缩放，平移不阻止默认文本选择；坐标换算只使用宽度，放大窗口产生留白后也会失准。
- 现有展开窗口最多 900px，图高最多 54vh，空间利用不足。

## 修改
- 故事/叙述页共用 RelationSidebar，按实际工作区 ResizeObserver 尺寸默认分配三分之一，拖动分隔线调整；方向键微调，Home 恢复默认。主区至少约 420px，关系区至少 280px。
- 每本作品、每种时间视图分别本地保存收起状态及比例；收起释放真实网格列，不卸载关系组件，因此查询、图相机、人物聚焦仍保留。编辑剧情卡继续替换关系侧栏；窄工作区继续原切页行为。
- SVG 区域原生非 passive wheel，以指针为锚缩放 35%–500%；正确处理 SVG 等比缩放留白。加减号和 Home 键也可操作。
- 只在 SVG 手势区禁用文本选取，不影响搜索/编辑输入。指针取消和失去捕获结束平移。
- 复用既有展开 Modal，扩大为最高 1320px / 96vw、92dvh，图占剩余空间；未增加第二套窗口入口。
- 保留 relationColor/relationName 自定义关系颜色与名称解析。

## 验证
- `npm run typecheck` 通过。
- `node --test tests/relation-viewport.test.js integrations/chatgpt-workbench/tests/relation-sidebar-layout.test.mjs` 9/9。
- `node --check tests/ui-relation-viewport.mjs` 通过；新增真实浏览器测试覆盖折叠恢复、宽度拖动/键盘/持久化、滚轮、平移无选字、输入可选、大图窗口、多容器宽度。
- 浏览器脚本未执行：当前独立 Chromium 启动受环境限制，未重试或申请绕过。云 CUA 主任务在集成构建后实际复核。
- 无 commit / push / build / deploy。
