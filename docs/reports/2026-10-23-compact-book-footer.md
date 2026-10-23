# 正文底部书籍信息栏：实现阶段记录

> 历史记录：文中的旧产品名、工具名、路径、包名与校验值保留当时事实，不是当前安装指南。当前品牌为 **Moji**，入口与安装说明以根目录 README 为准。

日期：2026-10-23。基线：`c1e92ed`。状态：已实现、自动检查通过，等待实际多尺寸预览与作者确认；**未提交、未推送**。

## 本轮授权与范围

作者确认格式：`《名字》 第X章 XXX XXXX字`，一小行即可。手机顶部拥挤，沿用默认底部字数；其他位置偏好保留。已实际查看提供的 `1000040412.jpg`：底部低强调书名和章节信息，不复制其正文。

最新交付门槛：先给作者看预览，作者明确同意后才提交、推送。本轮不触碰作品正文、云端数据、部署、发布分支或用户本机。

## 已实现

- 从工作台已有的 `novel.title` 向正文传递真实书名，没有新增请求或数据模型。
- 新增 `ChapterFooter`，底部显示书名、章节标题、字数。默认 11px 低强调信息；标题超长省略，完整名称保留 title；字数不缩小、不换行。
- 复用 `numberedTitle`、`displayNumberedTitle`：已带章号的标题不会重复添加。没有编号的标题按目录当前卷内顺序补显示编号，尊重现有中文／阿拉伯编号偏好，不写回正文标题。
- 底部字数简化为 `X 字`，仍用现有计数与切换按钮，说明保留在 tooltip；顶部选项继续显示原完整计数口径，字数不会上下重复。
- 关闭“底部信息栏”隐藏作品信息，但不隐藏保存状态。正常已保存为小勾（保留无障碍状态与 title），保存中／等待自动保存仍有文字。离线、失败、冲突、删除或空标题等重要提示展开完整文字，不省略；重试按钮保留。
- 未增加阅读进度、全书总字数或“默认编辑器视图”等取消／未授权项目。

## 变更文件

- `integrations/chatgpt-workbench/vendor/cuigengji/src/client/index.tsx`：传递现有作品标题。
- `integrations/chatgpt-workbench/vendor/cuigengji/src/client/features/chapters/index.jsx`：传递章序、接入底栏、计数口径独立 span。
- 同目录 `ChapterFooter.jsx`：信息与保存状态组件。
- 同目录 `chapter-tools-style.mjs`：紧凑单行及重要提示完整展示。
- `integrations/chatgpt-workbench/tests/chapter-footer.test.mjs`：新增 4 项真实组件渲染／接线检查。
- 同测试目录 `editor-small-leftovers.test.mjs`：适配计数口径的 span，原断言语义不变。

## 已执行验证

1. `node --test integrations/chatgpt-workbench/tests/chapter-footer.test.mjs`：4/4 通过。覆盖作品／章名／字数、重复编号保护、编号风格、不修改标题、顶部字数互斥、隐藏信息栏仍显示异常、真实数据接线。
2. `node --test integrations/chatgpt-workbench/tests/editor-small-leftovers.test.mjs`：4/4 通过。原位置偏好与计数切换等回归通过。
3. `npm run typecheck`：退出码 0。
4. `npm --prefix integrations/chatgpt-workbench run build`：退出码 0。

## 待验证／能力边界

- 本阶段组件测试不是视觉验收；需要父任务通过实际云端浏览器检查桌面、窄屏、浅深色及宿主遮挡，并提供截图给作者。
- 云端浏览器的手机尺寸预览不等于安卓真实输入法验证。
- 本轮未运行全仓全部测试，不将此前已有失败描述为已解决。
- 字数计数逻辑、保存／冲突处理逻辑本身未改，仅调整展示；未修改作品正文或测试真实生产数据。

## 02:02 追加：去掉正文“更多”重复重命名入口

作者追加明确意见：标题本来可以直接修改，“更多”里的重命名重复。仅移除正文工具菜单的 `onRename` 入口；共享 `ChapterOperations.jsx` 按是否传入回调显示重命名。目录章节操作仍保留重命名，正文 `InlineTitle` 原位改标题不变，导出／回收站等其他操作不变。

追加实际组件渲染测试，验证正文菜单不含重命名、目录菜单仍含重命名、正文标题编辑接线保留。两个定向测试文件合计 9/9 通过。仍未提交、未推送，等待预览批准。

## 02:08 追加：正文标题与底部章号一致

问题原因：隔离测试作品的章节使用自定义无前缀标题；正文标题原来只转换已存在的编号，没有推导序号，而新增底栏推导了卷内序号，造成两处显示不一致。没有证据表明新建章节原有自动生成编号功能失效。

修复：抽出 `chapter-display-title.mjs`，正文标题和底栏共用既有 `numberedTitle` / `displayNumberedTitle`。无编号时按目录现有的卷内顺序补显示章号；已编号时尊重原编号、只转换显示风格，不叠加序号。删除章节不参与序号，未分卷单独计序。编号仅用于显示，不写回存储。

`shared/InlineTitle.tsx` 增加可选 `displayValue`（默认仍为 value，其他调用不变）；正文传原始 `draft.title` 作为编辑值。点击标题进入编辑依然是用户原始标题，不把推导的“第三章”等文字自动存进标题。添加实际组件渲染／进入编辑测试，以及卷内编号、中文／阿拉伯风格、已编号标题回归。定向测试合计 11/11 通过。

新增／追加变更文件：`features/chapters/chapter-display-title.mjs`、`shared/InlineTitle.tsx`、本轮已有 `ChapterFooter.jsx`、正文 `index.jsx` 与测试。未改动其他 worker 的工具图标文件。依旧等待作者预览后明确批准提交推送。
