# 给 AI 与开发者：如何扩展 MoJi、反馈与贡献

想要某个功能，可以先在 [Issues](https://github.com/CF-612/MoJi/issues) 搜索已有讨论，再[提出功能建议或问题](https://github.com/CF-612/MoJi/issues/new)；也欢迎自己实现后[提交 PR](https://github.com/CF-612/MoJi/pulls)。不必会写代码才能提建议，也不要求每个小修复都先开 Issue。

## 先说需求，再决定改哪一层

- **功能想法**：说明写作场景、现在遇到的困难、希望怎样操作；可以附简单草图，不必预先指定技术方案。
- **问题反馈**：附 MoJi 版本／提交、宿主与系统、复现步骤、预期和实际结果，以及是否只在某种屏幕宽度出现。使用合成作品，不上传私人正文、备份或含密钥的日志。
- **较大改动**：先讨论设计、兼容与验收范围，再开 Draft PR，尤其是新业务模型、迁移、权限或跨端功能，避免投入后才发现边界不一致。
- **个人定制**：可以在本地或自己的 fork 上修改，不必贡献回上游；想让更多人用到再提交 PR。维护者会根据项目方向和验证情况评审，不保证采纳或排期。

当前开发入口为 [`codex/main`](https://github.com/CF-612/MoJi/tree/codex/main)，正式发行入口为 [`moji-release`](https://github.com/CF-612/MoJi/tree/moji-release)。从最新开发分支建立功能分支，PR 通常以开发分支为目标；如维护者另有要求，以当前讨论为准。**本地改动、PR 合并、发行包和个人云部署是不同步骤**：提交代码不会自动更新作者的设备或云端；不要未经授权推送、发版、部署或操作真实作品库。

## 1. 这里的“模块化”是什么

MoJi 已有领域规则、应用命令、存储适配、宿主通信、界面功能模块的边界，但仍有较大的 Store 和 JSX 文件，也保留历史兼容入口。它不是可以任意安装扩展包的插件平台。

内置模块的注册表、显示开关与延后渲染已实现；**第三方模块 SDK、独立模块安装／卸载、创意工坊尚未实现**。设置中的开关是设备上的显示偏好，不是服务器权限，关闭不会删除作品资料，也不会撤销已授权 AI 的读写能力。当前单 HTML 构建仍包含模块代码，`React.lazy` 不等于可以独立下载扩展。

先选最小边界：只换展示／筛选，优先复用现有查询；只有新增业务事实才扩展模型。不要为一个新视图复制一套卡片、正文或历史。

## 2. 沿实际入口找代码

以下路径相对仓库根目录。不要把仍可见的旧路径误当作当前宿主实际加载的实现。

| 边界 | 当前入口与职责 |
| --- | --- |
| DSH 服务 | [`src/index.js`](../src/index.js) 注册工具、RPC、升级与会话策略；[`src/adapters/dsh/`](../src/adapters/dsh/) 处理本地／个人云连接、传输和宿主协议。 |
| 应用命令 | [`src/application/store.js`](../src/application/store.js) 的 `dispatch` 管理锁、按需加载、请求去重与保存；`execute` 分派业务命令。旧 [`src/core/store.js`](../src/core/store.js) 是兼容转发。 |
| 业务模型／校验 | [`src/domain/story-workspace.mjs`](../src/domain/story-workspace.mjs) 的 `emptyWorkspace`、`applyStory`、`validateRestore` 定义统一剧情及操作；[`story-v31.js`](../src/domain/story-v31.js) 的 `storyAction` 处理修订、历史、正文依据和引用保护。结构资料见 [`writing.js`](../src/domain/writing.js)，共享类型见 [`src/contracts/`](../src/contracts/)。不要混淆同名 `story-workspace.js` 的旧时间线投影与 `.mjs` 的统一剧情模型。 |
| 命令与 AI 契约 | [`src/contracts/actions.js`](../src/contracts/actions.js) 维护 `TOOL_ACTIONS`、`HUMAN_ACTIONS`、`isReadAction`；[`src/adapters/dsh/planning-schema.js`](../src/adapters/dsh/planning-schema.js) 描述 `story.get`／`story.apply` 参数；[`src/index.js`](../src/index.js)、[`server/mcp.mjs`](../integrations/chatgpt-workbench/server/mcp.mjs) 和 [`cloud/worker.mjs`](../integrations/chatgpt-workbench/cloud/worker.mjs) 各有工具说明／元数据。 |
| 本地持久化 | [`project-store.ts`](../src/infrastructure/persistence/project-store.ts) 的 `loadForAction` 决定读取边界；[`project-layout.ts`](../src/infrastructure/persistence/project-layout.ts)、[`story-fragments.ts`](../src/infrastructure/persistence/story-fragments.ts) 编解码；[`file-transaction.ts`](../src/infrastructure/persistence/file-transaction.ts) 提交和恢复。迁移／启动闸门见 [`upgrade.ts`](../src/application/maintenance/upgrade.ts)。 |
| 本机网页服务 | [`server/index.mjs`](../integrations/chatgpt-workbench/server/index.mjs)、[`server/service.mjs`](../integrations/chatgpt-workbench/server/service.mjs)、[`server/workbench-service.mjs`](../integrations/chatgpt-workbench/server/workbench-service.mjs) 把 UI／模型请求交给同一个业务 Store。 |
| 云端适配 | [`cloud/service.mjs`](../integrations/chatgpt-workbench/cloud/service.mjs) 调用生成的业务引擎，处理 owner 隔离、请求身份与 D1 CAS；[`cloud/runtime.mjs`](../integrations/chatgpt-workbench/cloud/runtime.mjs) 排队执行。分片信封见 [`workspace-storage.mjs`](../integrations/chatgpt-workbench/cloud/workspace-storage.mjs)，原始／gzip 编码见 [`state-codec.mjs`](../integrations/chatgpt-workbench/cloud/state-codec.mjs)。 |
| 当前共享 UI | [`integrations/chatgpt-workbench/vendor/cuigengji/src/client/index.tsx`](../integrations/chatgpt-workbench/vendor/cuigengji/src/client/index.tsx) 是当前 Workbench。其 `features/` 放界面，`shared/` 放资源、草稿、偏好、导航，`modules/` 放模块能力。`vendor/cuigengji` 是历史来源路径，不是另一个产品或生成目录。 |
| 宿主 UI 接线 | 网页／MCP Apps 从 [`client/workbench.tsx`](../integrations/chatgpt-workbench/client/workbench.tsx) 导入共享 UI；DSH 从 [`src/client/dsh-entry.tsx`](../src/client/dsh-entry.tsx) 经 `#moji-shared-ui` → [`native-shared-ui.mjs`](../integrations/chatgpt-workbench/client/native-shared-ui.mjs) 复用它。根目录 `src/client/` 仍有原生连接及旧界面，不能仅修改旧同名组件就声称两端生效。 |

部分纯领域函数与 action 契约在工作台目录内的 `vendor/cuigengji/src/domain/`、`vendor/cuigengji/src/contracts/` 还存在前端副本。修改前查调用者／导入路径，必要时同步被消费的副本并补一致性测试；**当前构建不会自动把根目录源码全部复制过去**，也不要无差别覆盖整个 vendor 目录。仅有类型定义不等于已经有服务端校验；当前类型检查也不覆盖全部 JS/JSX。

### 构建产物不是修改入口

- 根目录 [`scripts/build.mjs`](../scripts/build.mjs)：编译服务端为 `runtime/`，由 DSH 入口打包 `lib/client.js`；不要只手改打包文件。
- 工作台 [`scripts/build-workbench.mjs`](../integrations/chatgpt-workbench/scripts/build-workbench.mjs)：生成 `dist/workbench-dev.html`。
- 工作台 [`scripts/build-cloud.mjs`](../integrations/chatgpt-workbench/scripts/build-cloud.mjs)：从根目录 Store 提取业务引擎，生成 `cloud/generated/engine.mjs`、传输包及 `cloud/public/`；它依赖前一步生成的 HTML。改 Store 的构造／分派边界时必须重建验证，不手改生成引擎绕过失败。

## 3. 最小例子：新增一个可关闭的“构思清单”视图

这是**开发练习，不是已经交付的功能**。只列出 `status === 'idea'` 的现有剧情卡，不新增持久数据、action 或权限。下面路径前缀统一为 `integrations/chatgpt-workbench/vendor/cuigengji/src/client/`。

1. 在 `modules/registry.mjs` 的 `modules` 数组增加 `{id:'ideas', name:'构思清单', description:'查看尚未采用的剧情卡', page:'ideas', defaultEnabled:false, dependencies:[]}`。使用稳定 ID；这个例子默认关闭，避免改变已有作者的界面。既有七个模块的缺省开启行为与显式关闭偏好保持原样。检查极简／标准／完整预设与依赖逻辑，不用“恢复默认”覆盖保存的选择。
2. 新建 `features/ideas/index.jsx`，沿用现有 `useResource`、`ResourceState` 与父级 `call`，不从 React 直接读磁盘或 D1：

   ```jsx
   import React from 'react';
   import {useResource} from '../../shared/state.js';
   import {ResourceState} from '../../shared/ui.jsx';

   export function Ideas({call, novelId, tick}) {
     const resource = useResource(
       () => call('story.get', {novelId}),
       [call, novelId, tick],
       `${novelId}:ideas`
     );
     const cards = Object.values(resource.value?.state.cards ?? {})
       .filter(card => card.status === 'idea');
     return <section className="ideas-page">
       <h2>构思清单</h2>
       <ResourceState resource={resource}>
         {cards.length ? <ul>{cards.map(card =>
           <li key={card.id}>{card.title}</li>
         )}</ul> : <p>还没有待采用的构思。</p>}
       </ResourceState>
     </section>;
   }
   ```

3. 在 `modules/index.tsx` 的 `renderers` 中按现有模式增加 `ideas: lazy(() => import('../features/ideas/index.jsx').then(m => ({default:m.Ideas})))`。这只登记渲染器，**不会自动新增页面路由**。
4. 在共享 `index.tsx` 已绑定作品的主内容分支中增加 `{tab === 'ideas' && <ModulePage id="ideas" {...{call, novelId, tick}}/>}`，与 `overview` 分支同级。`WorkbenchHeader.tsx` 已消费 `navigationModules`；新 `page` 默认参与导航。保留 `pageAvailable` 的隐藏页回退，并检查返回、切换作品和关闭当前模块的行为。
5. 当前实际设置对话框是 `shared/preferences.tsx`：在“功能模块”相应分组加入 `<ModuleToggle id="ideas"/>`。只改 `modules/index.tsx` 的 `ModuleSettings` 并不足以接入实际设置页。`moduleExtensions` 只是现有页面／关联／动作元数据，不是可调用的第三方注册 API；有实际消费者需要时再补，不伪造 SDK。
6. 给 `integrations/chatgpt-workbench/tests/modules.test.mjs` 增加新模块的默认关闭、开启、重载与导航测试；该文件原有“七个模块全部开启”的断言需改为分别验证旧模块与新模块，而不是把旧模块也关闭。增加真实组件的空态、错误／重试、刷新与跨作品隔离测试，运行两套 UI 构建并检查窄屏。组件样式限制在 `.cuigengji .ideas-page` 内。

这样完成的是一个已有数据的新投影；作者关闭后，剧情卡、历史、正文及导出都应保持原样。若接入页面导览，只调整介绍和导航，不替作者开启模块或写入演示作品。

### 若再增加“修改卡片摘要”

仍可复用现有操作，不必发明新 endpoint。在作者明确保存时，用**编辑开始时读取并保存在草稿中的**工作区和卡片版本：

```js
const args = {
  novelId,
  requestId: crypto.randomUUID(),
  expectedRevision: base.state.revision,
  operation: {
    type: 'card.update',
    id: card.id,
    expectedRevision: card.revision,
    value: {summary: draftSummary},
  },
};
const saved = await call('story.apply', args);
```

这里的 `base`、`card` 来自同一次已读取的 `story.get`，`draftSummary` 是作者草稿。外层版本是工作区版本，内层是卡片版本。使用既有 `run`／保存状态处理错误，成功后接受返回值；发生冲突保留草稿，让作者重新核对，不重新读取新版本号后盲写。结果不明的重试保持同一 `args` 和 `requestId`，不能重新生成 ID。工作台的 [`client/reliable-rpc.mjs`](../integrations/chatgpt-workbench/client/reliable-rpc.mjs) 已有传输重试规则，避免另造不一致的保存队列。

## 4. 真的新增字段或命令时，走完链路

1. **模型与兼容**：在实际领域模型／契约定义字段、缺省值与限制；旧作品缺字段时仍可读。参考 `applyStory` 中已有操作，而不是修改 UI 本地对象后整本覆盖。
2. **业务处理与校验**：接入 `storyAction`／对应领域 handler 及 Store；校验输入、引用存在性、作者确认、版本冲突和历史恢复。新增剧情操作还需覆盖 `validateRestore`、`validateStory`、`validateStoryView` 的相应边界。正文依据只能指向有效已保存版本，计划不自动变成事实。
3. **读取与持久化**：检查 `ProjectStore.loadForAction` 是否读取所需数据，不能将未加载字段／延迟历史当成空值保存。字段保存、索引、历史、删除／恢复、复制 ID 重映射及备份往返都要有测试；不为展示性偏好迁移作者作品。
4. **授权与工具**：确需新 action 才改 `TOOL_ACTIONS` 或 `HUMAN_ACTIONS`，明确只读／修改／作者专用边界。`isReadAction` 影响分类，不是授权。检查 DSH 会话策略、MCP 查询／修改白名单、云端白名单、参数 schema、工具描述和 `readOnlyHint` 等元数据；工具文案可能留有历史描述，实际可用性以当前能力目录／白名单与业务校验为准。必要时更新 `skills/` 的协作说明。不能为了让测试通过，把作者专用操作暴露给 AI。
5. **两端与构建**：本地适配调用 Store，云端复用生成业务引擎但不是磁盘 ProjectStore。分别验证；新 UI 通过既有 RPC 接入，处理加载、空态、拒绝、冲突、重试和未保存草稿，不只验证 happy path。

## 5. 存储与升级不能破坏的约定

详细格式以 [MoJi 分片存储说明](moji-granular-storage.md) 为准：

- 当前磁盘身份是 **`moji-library` v5**，读取迁移旧单文件及 `cuigengji-library` v2/v3/v4。上游 **`cuigengji-library` v5 不是同一格式**，不可手改版本号或原地混写；用原应用导出可移植包，再在独立库预览导入。
- 未知字段、稳定业务 ID、数组顺序、空页／空组、小数及精确时间值、当前记录、历史／redo、旧规划、导入原文、绑定与请求身份都要保全。物理文件名／片段哈希不是业务 ID；存储拆分不是借机做内容“清洗”。
- 备份／导出版本与物理存储版本独立。迁移要在完整备份和业务校验后，通过已有可恢复事务发布；失败应保留现场并停止，不能变成空库或绕过校验。回退先保留升级后的新写作，再在独立目录恢复兼容备份，不直接降低新库版本号。
- 本地剧情快速路径读取当前片段及必要元数据，不等于每次只读一张卡；完整导出／恢复等仍完整验证。不要用哈希校验代替业务校验，也不要丢掉未加载历史。
- 云端大库使用 **`moji-workspace-fragments` v1**，保留原始 JSON、gzip 及旧 `cuigengji-workspace-fragments` v1 读取；小库仍走原始／压缩路径。D1 仍完整水合工作库，分片减少重写，不是已实现接口级懒加载。保留 owner 隔离、CAS、哈希与旧快照可读性；不在真实 owner 数据上测试。

## 6. 本地验证：从合成数据开始

需要 **Node.js 24+**。下面命令均从仓库根目录执行，脚本来自两份 `package.json`；它们是安装依赖、本地构建和测试，不是发布命令：

```sh
npm ci
npm --prefix integrations/chatgpt-workbench ci
npm run typecheck
npm run build
npm --prefix integrations/chatgpt-workbench run build
npm --prefix integrations/chatgpt-workbench run build:cloud
npm test
npm --prefix integrations/chatgpt-workbench test
npm --prefix integrations/chatgpt-workbench run test:cloud
```

`typecheck` 目前主要覆盖根目录 `src/**/*.ts(x)`，不是全仓静态保证；工作台构建、行为测试和 UI 检查不能省略。纯文档修改先校验链接、路径、命令和 diff，不必为验证文档访问真实账号或部署。代码改动先做针对性测试，提交前执行适用的完整检查并记录未通过项。

按改动追加专项命令（同样在根目录）：

```sh
# 模块偏好、实际设置页与宿主样式隔离
node --test integrations/chatgpt-workbench/tests/modules.test.mjs integrations/chatgpt-workbench/tests/settings-layout.test.mjs tests/dsh-theme-isolation.test.js
# 统一剧情与 AI 工具／宿主协议
node --test integrations/chatgpt-workbench/tests/story-workspace.test.mjs integrations/chatgpt-workbench/tests/mcp.test.mjs tests/host-tools.test.js
# 本地存储迁移与备份
node --test tests/moji-granular-storage.test.js tests/project-storage.test.js tests/upgrade.test.js
# 云端编解码与 D1 持久化（先完成 build:cloud）
node --test integrations/chatgpt-workbench/cloud/tests/state-codec.test.mjs integrations/chatgpt-workbench/cloud/tests/workspace-storage.test.mjs integrations/chatgpt-workbench/cloud/tests/workspace-storage-d1.test.mjs
# 已构建 DSH UI 的隔离宿主浏览器验收，需要可用的 Playwright Chromium
node tests/dsh-theme-isolation-ui.mjs
```

UI 改动还应为新行为补浏览器场景：桌面侧栏、窄侧栏／手机宽度、明暗主题、键盘与触摸、关闭／返回／重复打开、模块关闭再开启。复用合成样例与隔离目录；实际宿主、Android／iOS 真机未测就明确标记，不把静态渲染或模拟尺寸写成全端通过。已有部分旧 UI 脚本使用旧规划接口，选测试前核对是否覆盖当前入口，不能用旧脚本成功代替新行为验收。

更多预览、专用脚本与发布验收说明见 [development.md](development.md)。涉及真实 DSH profile、认证 URL、迁移 `--apply` 或部署的脚本不属于普通本地验证，须单独确认授权；不要将“构建成功”写成“已发布／已部署”。

## 7. 提交 PR 前的清单

- [ ] 说明需求／关联 Issue、改动范围、未实现部分；大改动使用 Draft PR，并说明兼容和回退方案。
- [ ] 功能复用正确入口；业务逻辑不塞进宿主适配或视图，生成文件按构建规则处理，没有只改旧 UI／产物。
- [ ] 记录测试／类型检查／构建命令及结果，包括失败和未运行原因；新行为有相应测试，冲突与重复请求不静默覆盖。
- [ ] 数据改动覆盖旧库、未知字段、精度、稳定 ID、历史／redo、导入导出往返；关闭模块、重载偏好不删除资料、不重置作者选择。
- [ ] UI 附合成内容的桌面侧栏与窄屏／移动布局截图，标明宿主／视口；检查弹层、返回、键盘焦点、触摸、滚动及草稿保护。
- [ ] CSS 只作用于 `.cuigengji`／`.moji-preferences` 等 MoJi 自有根；不修改宿主 `html/body`、主题变量、壁纸、全局 dialog 背景或模糊效果。网页壳有宿主适配职责，不把它的全局处理搬进共享组件。
- [ ] 检查 `git diff --check`、`git diff --stat`、`git diff --cached --name-only` 和实际待提交内容；无作者小说／设定、导出备份、聊天或运行日志、凭据、令牌、`.env`／`.dev.vars`、个人 `.moji-cloud/` 或 `wrangler.local.jsonc` 配置。截图与测试报告也要脱敏，忽略规则不能移除已跟踪内容或历史。
- [ ] 未擅自改版本、发布、推送发行分支、部署个人云或上传真实作品；保留上游版权、[MIT 许可证](../LICENSE)及来源说明。

让 AI 协助时，可以直接给它需求、目标宿主和本文链接，要求它先说明将改动的层、兼容风险与验证方法，再在授权范围内实现。你可以只提 Issue，也可以自己动手；贡献的价值不取决于功能大小。
