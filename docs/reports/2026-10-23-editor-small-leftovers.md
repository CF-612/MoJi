# 正文编辑器遗留问题收尾记录

## 本阶段目标

只处理本次确认的小修，不扩展未定义的“默认编辑器视图”，也不改变正文、历史记录或云端数据模型。

## 已完成的修改

| 需求 | 实际行为 | 主要文件 |
| --- | --- | --- |
| 普通作品搜索不显示多余版本号 | 搜索结果保留标题、位置、匹配字段，不再附加“版本 N”。打开条目时仍传递完整命中对象；历史版本、恢复和正文证据机制不删减。 | `shared/WorkSearch.jsx` |
| 字数位置可选 | 正文“更多 → 编辑偏好”新增底部/顶部选择。旧用户默认仍在底部。顶部在工具栏下方显示紧凑字数行，不挤入操作按钮；与底部互斥，底部信息栏关闭也不影响顶部显示。两种位置使用同一计数与切换按钮。 | `shared/editor-preferences.mjs`、`features/chapters/ChapterAppearance.jsx`、`features/chapters/index.jsx`、`features/chapters/chapter-tools-style.mjs` |
| 去掉重复字号/行距设置 | 全局设置保留当前值展示和清晰的设置路径说明，实际调整统一在正文“更多 → 字体字号 / 页面布局”。原有字号与行距存储继续使用，不重置。 | `shared/preferences.tsx` |

以上路径均相对于当前工作台实际使用的 `integrations/chatgpt-workbench/vendor/cuigengji/src/client/`。

## 自动验证

- 新增 `integrations/chatgpt-workbench/tests/editor-small-leftovers.test.mjs`：4/4 通过。覆盖旧偏好默认值、无效值回落、保存后恢复、实际计数 JSX 的含/不含标点行为及按钮切换、顶部/底部互斥连接、搜索引用保留和设置入口去重。
- 现有 `editor-text.test.mjs`：6/6 通过，包括复制、格式化、计数、偏好校验与样式解析。
- 现有 `work-search.test.mjs`：4/5 通过。一项在测试夹具准备时因 `NOT_ALLOWED` 失败；与改动前记录中的同一失败一致。本轮未修改权限或搜索后端。
- `npm run typecheck`：通过。
- `npm --prefix integrations/chatgpt-workbench run build`：通过，当前工作台可打包。
- `git diff --check`：通过。

## 边界与交付状态

上述验证不等同于手机真机宿主验收。实际桌面/窄屏预览、合并审查与最终提交推送由本轮总报告补充；本阶段没有操作生产小说数据，没有部署。搜索测试的既有失败仍需另行排查，不能把本轮记录称为“全测试通过”。
