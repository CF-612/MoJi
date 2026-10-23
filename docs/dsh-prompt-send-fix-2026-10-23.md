# DSH 提示词发送与手机查找高亮修复记录

日期：2026-10-23。基于已发布 v31.5 源码重新核对并验证；本记录不代表正式安装包已经发布或私人云端已经部署。

## 改动

- `src/client/native-reference.js`：通过当前会话 `sessions.using` 保留引用，等待 `ready` 后调用公开的 `binding.session.prompt([{type:'text',text}], 'queue')`。校验引用、binding、SessionFace 三层会话身份，严格确认 `ok === true` 和 `accepted === true` 后才关闭面板。
- 不再读取 `binding.ctx.conversation`。它属于未注入 conversation 的会话作用域，会触发 Cordis 的 `cannot get property "conversation" without inject`，并非要求用户多授予权限。
- `src/client/dsh-entry.tsx`：根据公开 sessions 通道判断发送能力，不再访问 conversation 属性做能力探测。
- 拒绝、网络异常、缺失能力或会话不匹配时保留原面板，不自动重试，也不创建新会话。发送已被接受后的导航失败不反报“发送失败”，避免用户重复提交。
- `mobile-editor-style.ts`：仅在宽度不超过 760px 的容器内，将查找高亮镜像层的上下 padding 调整为 0，与移动编辑框一致。保留共同的左右 padding、字体、行高和既有滚动实现，不修改正文。
- 重建 `lib/client.js`，使 DSH 原生包包含上述两项修复。网页和云端还需按标准构建流程生成对应包体。

## SDK 核对

安装版本：DSH 0.2.0-rc.2，`@deepseek-ai/cordis` 4.0.4。

依据安装的官方 SDK：
- `dsh-api-session-controller` 的 `client/contract/session.d.ts`：`SessionFace.prompt` 支持 queue 模式，返回 `RemoteResult<{accepted:true}>`。
- 同包 `client/sessions/service.d.ts`：`SessionBinding.session` 是功能插件可调用的 outward session face。
- 同包 `client/contract/sessions.d.ts`：`using` 将引用持有到回调完成，并负责释放。
- `dsh-client-ui-conversation` 的 `ConversationController.send` 本身也把文本转换为单个 text part，再调用上述 queue 接口。

## 本次实际验证

执行 `npm run build`、`npm run typecheck`：通过。

聚焦测试命令：

```sh
node --test tests/native-prompt-scope.test.js tests/native-prompt-bundle.test.js tests/mobile-find-alignment.test.js tests/dsh-runtime.test.js tests/dsh-connection-guidance.test.js
```

本次结果：26 项通过，0 项失败。

- 12 项发送回归：实际加载 Cordis 构造未注入作用域，复现原 guard；验证发送改走公开 SessionFace、准确路由、等待就绪和接受、失败保留 UI、释放生命周期和禁止重试。
- 3 项构建产物回归：运行真正的 `lib/client.js` ModuleLoader 入口，捕获其原生页签提供的发送回调，验证成功、拒绝、能力缺失。可设置 `MOJI_BUNDLE_ROOT` 指向解包目录复测安装包。
- 2 项 CSS 结构回归：窄屏上下 padding 修复、桌面与手机共享样式保留。
- 9 项已有 DSH 与部署引导回归更新并通过。

## 验证边界与交付门槛

Cordis guard 使用真实依赖；会话传输和宿主槽位使用受控夹具。构建产物测试不是用户 DSH 客户端联网实测。CSS 测试是结构回归，不冒充手机真机视觉验收。最终交付还需执行根目录全量、工作台及云端测试，重新构建所有发行包，核对解包内容、公开下载校验与唯一既有云端实例部署结果。相关汇总应独立记录，不沿用此前运行数字。
