# 时间线共用界面与稳定性阶段报告（2026-10-23）

## 范围
根据用户录屏、截图及后续明确反馈，将两种时间线接入同一套 Toolbar、Workspace、Tray、TrackHeader、TrackEditor、Playhead、关系侧栏和选择手势。故事日期与叙述顺序仍各自存储，故事中置刻度、叙述顶部刻度保留。未发布、未推送。

## 录屏问题与证据
- 已实际下载并 ffprobe 检查 QQ20261023-164327.mp4：1212×776、3.56 秒。抽帧可见滚动条交替出现，刻度轴上下跳动。
- 原因：ResizeObserver 使用取整后的 clientHeight/clientWidth 反推内部世界尺寸，分数像素容器触发滚动条—内容尺寸反馈。
- 修复：读取 ResizeObserver contentRect，向下取整并忽略不可见零尺寸；单一滚动表面、稳定滚动条槽，不让内部世界反撑父布局。
- 同一真实组件的隔离浏览器夹具：修复前 180 帧内 179 次尺寸/轴位置交替；最新集成后 180 帧仅 1 次初始居中，随后 179 帧稳定。最新稳定 viewport/world 为 1060×576，轴 y=406。

## 已实现
- 新建剧情卡、事件、轨道统一进入新建菜单；移除重复顶层新建和常驻轨道摘要卡。
- 轨道名称、颜色与排序设置共用组件；维持各坐标系独立排列。
- 普通滚轮以光标为中心缩放，Shift/横向触控板平移；统一 deltaMode 换算。
- 缩放同时影响卡片高度/宽度、行距和轨道高度，拖放使用对应逆坐标。
- 两轴共用细线、小滑块指针；故事滑块位于中置刻度线上，键盘与拖动同步关系查看时间。
- 故事起点显示保存的名称，点击编辑起点；不再放置含义不明的常驻加号。
- 待安排区共用折叠外壳；故事待安排拖入使用释放点绝对日期，已有卡片拖动保持相对偏移。
- 编辑时尝试移动卡片给出“请先保存或取消编辑”，保留未保存输入；编辑面板提供显式保存、取消编辑。
- 左键单击选择、双击/右键编辑；空白左拖平移、空白右拖框选复用选择辅助逻辑。框选取消、失去捕获恢复原选择。

## 已完成的实际浏览器检查
- 桌面两模式均可加载，共用工具栏、待安排区、关系侧栏。
- 故事减小一次：卡片 208×42 →147.08×29.69；轨道高度 94→66.45。
- 叙述 100%→83%：轨道高度 120→109.53；轨道名称输入可以正常聚焦，不被空白平移劫持。
- 故事指针右方向键：2026-01-01→01-02；拖动后日期与关系侧栏同步至 04-03。
- 故事卡单击仅选择，不打开编辑面板。
- 编辑未保存标题后拖另一张卡：原输入和焦点保留，出现说明；取消编辑仍要求确认丢弃，仅丢弃测试草稿。
- 320px 页面可展示轨道与侧栏边缘入口，无页面横向溢出；窄屏关系采用完整次级面板并可返回。
- 起点隔离夹具实际保存自定义名称成功，无额外新标记。

## 检查边界和待收尾
- 纯函数/共享组件集中测试 33 项通过；扩大旧时间线回归时发现 4 项旧文案/结构断言，正在由对应组件负责人核对更新，不能计为全绿。
- 正在完成小屏工具栏换行一致性、低缩放多标记留白修正及最终截图。
- CUA 原生浏览器 drag API 仅提供左拖；右拖以隔离浏览器合成 PointerEvent 夹具验证，不能声称真实鼠标捕获已验证。
- 双指触摸缩放、新待安排往返拖动尚需完整交互复核；未伪称已覆盖。

## 收尾更新（09:32 UTC）
- 320px 工具栏已改显式两行网格：模式与新建同排，定位/缩放/更多第二排；桌面两模式工具栏及工作区顶部对齐，同纸色背景。
- 叙述起点指针被旧 ruler z-index:8 遮挡的问题经 elementsFromPoint 定位，统一指针升到9，实际截图可见；边缘滑块向内移而日期线坐标不变。
- 固定像素刻度/起点/多行标记在低缩放时保留上下留白，轨道本身仍缩放；6项缩放测试通过。
- 框选隔离浏览器的9项检查全部通过：阈值、50%两卡命中/另一行排除、覆盖层、追加选择、取消恢复、右键菜单延后与拖动抑制、编辑锁。夹具需等 React 下一帧再断言。仍不等于真实 OS 右键拖动验证。
- 实际鼠标左拖空白：320px 故事 scrollLeft126→176；叙述0→50；没有打开编辑器或修改安排。
- 实际叙述待安排卡单击：出现 selected 样式，编辑器不存在。故事已安排卡同样单击仅选择。
- 窄屏关系打开/返回前后故事 scrollLeft126、scrollTop0、viewport236×398完全一致。
- 最新37项扩大回归为33通过、4项旧合同待独立审阅者核对。构建、diff检查通过。阶段报告不把这些失败隐去。
- 实际同一工作台/同一本书四张截图位于 `artifacts/story-jitter/final/{story,narrative}-{desktop,mobile}.jpg`。该本书尚无章节，因此叙述的两张卡在待安排，故事已有日期；没有为截图伪造安排。

## 代表性验收补充（09:39 UTC）
- 原空章节截图不足以证明叙述轨道，因此通过真实 Store/workbench RPC 创建独立《时间线共用界面 · 隔离验收书》，3章、4条共享轨道、6张卡，每张都有叙述区间及故事日期。未修改原书。生成脚本与ID记录在 `artifacts/story-jitter/create-populated-book.mjs`、`populated-book.json`。
- 正常作品库导航打开这本书，在实际完整工作台验证：叙述卡宽高496×42→413.33×38.33；双行轨道158→144.22，单行轨道120→109.53。两个维度同步缩放，不是空轨道推断。
- 新建与更多出现多余右箭头确认为继承的summary伪元素。限定共享工具栏去除伪元素，保留显式下箭头；浏览器computed content由空字符串变none，截图确认。新增回归通过。
- 代表性最终图片改为 `*-populated-desktop.jpg`、`*-populated-mobile.jpg`，同一本书的两种时间坐标。手机图片由CUA screenshot clip原生截取320×720，无后处理灰边。
- `relations-populated-mobile.jpg`显示关系标题、时间控制、内容和边缘返回按钮在同一面板；桌面图中标题与内容也在同一侧栏内，不在远处页头。
- 独立审阅者最新汇总：根440项、工作台317项、云14项均通过，typecheck及所有构建通过；此前4项旧合同失败已修正。工具栏新增1项回归随后单独验证通过（6/6）。

## 09:55 actual persistence and crash regression follow-up

- Isolated book only: 时间线共用界面 · 隔离验收书 (`a0d1496a-d6c7-418a-b80e-2f15afa7932c`). Story pending → placed → pending succeeded, revisions 1→2→3; narration first return persisted revision5 correctly but exposed React #185 and white UI. This was a real failure, not a data loss.
- Stack pointed to `useRelationSidebar`'s dependency-free `useLayoutEffect` measuring width and synchronously setting state every commit. Sidebar worker replaced it with a stable callback ref, ResizeObserver lifecycle, old-node guard, and equal floored-width guard. Two actual native narrative roundtrips then succeeded: revisions5→6→7 and7→8→9. Each return left story:null, narration:null; each reload retained pending1 and rendered UI. Browser extension metadata errors are separate from app errors.
- Desktop header collapse is a descendant of `aside header`; collapse/reopen succeeds. Keyboard ArrowLeft changed sidebar385→409px; native separator drag changed409→458px; reload retained458px. A subsequently requested full-height sidebar/toolbar structural layout is still undergoing visual verification; these measurements precede that rearrangement.
- Full app 生成大纲视图 → preview → 确认生成 → reload passed. First trial revealed the long-running test server held old ESM layout code; restarted the same local server/data, explicitly regenerated (no implicit migration of manual positions). Current result has10refs in3columns×4rows: x60/372/684; y60/368/676/984. Generated and reopened domain snapshots are byte-identical. Evidence: `artifacts/story-jitter/outline-compact-generated.json`, `outline-compact-reopened.json`, `final/outline-generated-reopened.jpg`.

## 10:02 full-height sidebar and short-menu final checks

- Both adapters now pass the same toolbar into `TimelineWorkspace`; toolbar + position + axis + pending tray form the left column, and relations occupy the complete right column from the same top edge. The upper-left collapse button is inside the relation header. Main column and relation pane both measured top113.796875, bottom745 in1180px desktop. Story wrapper now uses the same internally scrolling relation content as narration, not an outer overflowing sidebar.
- Actual collapse expands main width; reopen restores sidebar; Home resets defaultone-third after native/keyboard resize tests. Narrow320px uses a full-width secondary relation page, not a side rail; Back preserves the mounted timeline/cursor. Main toolbar hides on that secondary page. Exact measured workspace899px uses pages with899px main;900px uses wide grid519.64/8/364.36. Layout attributes and CSS use one authoritative measured width.
- Moving toolbar inside its column exposed genuine clipping on320×400: More had240px viewport extending beyond the column. Fixed shared popup height using real column/viewport available space. Afterfix More measured top259.8/bottom379.8/height120; story filter andallthree presets reachable by native scrolling. Narrative final History action opened规划选项, New→新建轨道 opened dialog and was cancelled withoutsave. Both New/More also checked320×720. Short narrative screenshot occasionally timed out at browser protocol level; geometry and actual button actions were verified, not claimed as a captured image.
- Current representative evidence supersedes earlier rejected images: `final/story-fullheight-desktop.jpg`, `narrative-fullheight-desktop.jpg`, `story-fullheight-collapsed.jpg`, `story-fullheight-mobile.jpg`, `narrative-fullheight-mobile.jpg`, `relations-fullheight-mobile.jpg`. All actual populated isolated book, noDOMmock; narrow images use native screenshotclip320×720.
- Source frozen for independent aggregate review at10:02. Native right-button drag and real touch pinch remain unsupported by available automation and are NOT claimed as verified; synthetic marquee9checks and pure geometry tests are separate evidence.

## 10:25 origin, timepoint and ruler visual acceptance

- Card-to-date stems are now thin, subtle dashed lines. The actual rendered pseudo-element was `.sa-card::before` (not `::after`); only that decoration changed. Story major ticks and narrative chapter-boundary ticks share a darker 2×14px hierarchy; no invented date subdivisions, scale mathematics or stored coordinates changed.
- Plain origin is a prominent round point with its persisted name below. Custom timepoints are a tick and plain name, with no bubble/card background. Labels are packed by projected pixel intervals using a sorted copy of markers; same-coordinate names occupy separate rows and reserve lower-lane clearance. Full names remain available via accessible labels/title. Actual linked plot cards remain actual cards, without creating a duplicate origin card.
- Native clicks directly on the visible origin dot and custom tick were checked, not just their names. An initial review caught symbols extending outside the name button: explicit pointer events on the symbol now route those clicks to the correct parent editor. Names retain a transparent 44px-high hit area; origin/tick transforms and layering align with the real date line.
- In the isolated QA book, actual New → 新建时间点 opened the clarified form. Created 验收·港口钟声 at 1932-09-16, found the newly focused tick, entered an unsaved rename and cancelled, reopened unchanged, saved 验收·港口钟声修订 at 09-17, then deleted that disposable point. Reload confirmed absence (`marker-after-delete.json`). Existing delete is immediate; no confirmation dialog is claimed.
- The form distinguishes timepoints from plot cards, explains the prefilled editable date, previews exact placement, and disables save for an empty name/invalid date. Mobile repeated New → fill → Cancel and New → Close left the complete axis/cards/revision snapshots byte-identical (`marker-before-cancel.json`, `marker-after-cancel.json`). Custom-calendar copy/formatting has focused tests; a separate full browser custom-calendar walkthrough was not performed in this pass.
- Selected the existing plot card 收到未署名的信 as origin through the real settings dialog. `origin-linked-card.json` retains that card ID; all seven card records deep-equal the pre-change snapshot, with no duplicate or time changes. Restored the named plain origin afterwards. A disposable demonstration point 码头封锁 remains in this QA book for the final preview. Same-date label separation was checked before moving that point to 09-20.
- Current screenshots supersede old bubble-origin images: `final/story-origin-marker-light.jpg`, `story-origin-marker-dark.jpg`, `story-origin-marker-collapsed-light.jpg`, `story-origin-marker-mobile-light.jpg`, `story-origin-marker-mobile-dark.jpg`, `timepoint-new-mobile-light.jpg`, `narrative-ticks-light.jpg`, `narrative-ticks-dark.jpg`, `narrative-ticks-mobile-dark.jpg`. These show the actual populated app; mobile captures use native 320×720 clipping. At exact origin/playhead coincidence the playhead remains the foreground drag target; the separate origin-name target stays editable.
- Local focused suite: 13/13 passed (ruler visuals, story stability, marker copy/footer), workbench build and diff check passed. Independent reviewer subsequently reported 87 focused tests, typecheck and three builds passed, inspected light/dark visuals and independently compared cancellation snapshots; no source finding remains. Earlier aggregate totals apply to their recorded earlier freeze, not a newly claimed full aggregate for this visual increment.
- Full-height sidebar geometry and narrow full-page navigation are unchanged. Its discoverability-only update uses the same-position 32px tinted button with an 18px panel/chevron SVG. Native OS right-drag and real touch pinch limitations remain as documented above. No publication or package was performed.

## 10:42 sidebar icon simplification

- User rejected the panel-within-panel symbol. The shared control now contains exactly one rounded, bold chevron (18px SVG, stroke2.5), right-facing to collapse and left-facing to reopen. Existing32×32 button, tint, focus behavior, accessible names and header/edge placement are unchanged; no layout or timeline logic changed.
- Rebuilt the workbench and checked the actual isolated book in cloud tab55. Light and dark expanded/collapsed states both rendered clearly; clicking collapse and reopen restored the existing full-height panel. DOM measurements were32×32 in both states, expanded at795.67/124.80 and collapsed at1136/117.80 in1180px viewport. SVG contains only its single chevron path.
- Evidence: `final/chevron-light-expanded.jpg`, `chevron-light-collapsed.jpg`, `chevron-dark-expanded.jpg`, `chevron-dark-collapsed.jpg`; each has a corresponding `-closeup.jpg` native clipped screenshot. These supersede the prior panel-shaped icon previews only. Focused sidebar11tests passed; independent reviewer handles the remaining build checks. No package or publication performed.

## 10:48 arrow alone, no button chrome

- Latest user clarification removes the button box as well. The32px transparent hit area and18px chevron remain in the same place. All visible button chrome is removed. Real browser inspection discovered a second1px border on the inner SVG from generic global styling even after the button was reset; the scoped reset now also covers the SVG itself.
- Actual computed styles on BOTH button and SVG: transparent background, border0px, box-shadow none and outline none. Native pointer hover was verified true on expanded dark and collapsed light controls with the same results. Final keyboard focus was verified true with SVG stroke4px and transform scale1.12; it remains visible without any surrounding box. Transient pointer-down active state was covered by the scoped CSS/test contract, not independently held and measured in the browser.
- Light/dark normal-state captures (pointer moved away) are `final/arrow-only-{light,dark}-{expanded,collapsed}-closeup.jpg`; full preview `final/arrow-only-light-expanded.jpg`. These supersede all earlier boxed-control previews. Actual collapse/reopen passed. Workbench rebuilt; worker/reviewer focused tests12passed. No package/publication, geometry or other feature changes.

## 11:02 remove the confirmed whole-sidebar outline

- User confirmed that the remaining pale line meant the entire sidebar outer frame. Shared sidebar outer border/radius/shadow are now removed, along with story wrapper rounded clipping. Internal graph/control boundaries and intercolumn resize separator remain.
- Actual cloud app computed border0px/radius0px/shadow none on both story and narrative sidebars, in light and dark themes. Collapse/reopen succeeded in both modes. Resize separator remains8px; keyboard resize changed width385→409 and Home restored the default. No coordinate/data mutation was involved.
- Final complete views: `final/sidebar-borderless-{light,dark}-{expanded,collapsed}.jpg`. These supersede previous outlined-panel previews. Workbench rebuild passed; worker focused13tests passed. No package or publication performed.

## 11:19 per-book outline fold persistence

- Created two explicitly isolated synthetic books 大纲折叠隔离验收A/B, each with one volume, one chapter and one nested plot card. Used actual browser controls for all fold-state actions, not storage injection.
- A: folded nested chapter, folded volume, refreshed; volume remained folded. Reopened volume; nested chapter remained folded. B initially showed all nodes expanded independently. In B, All-fold survived refresh, then All-expand survived refresh. Returned through the library to A; its chapter remained folded and its nested card hidden.
- Read-only domain verification deep-compared each complete before/after story response, including source objects, cards, placements and revision: both identical. Only browser display preference changed. Evidence `artifacts/outline-fold/books-before.json`, `books-after.json`, `book-a-restored.jpg`; reproducible setup/verification helpers alongside them. No real author books touched.
- Final workbench build includes the worker's current-parent filtering for All-fold status (deleted stored IDs are inert). Worker focused6tests passed. Persistence is scoped to browser/client session scope and novel, not claimed as cross-device sync. GitHub release form remains unsubmitted; no release action performed here.
