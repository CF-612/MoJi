# 给参与 MoJi 开发的 AI

- 先读 [开发与贡献指南](docs/development-and-contributing.md)，再沿实际入口确认改动范围；不要仅凭目录名选文件。
- 当前 DSH 与网页工作台复用 `integrations/chatgpt-workbench/vendor/cuigengji/src/client/`。业务命令的源头是根目录 `src/application/`、`src/domain/`；不要直接修改生成的 `runtime/`、`dist/` 或 `cloud/generated/`。
- “模块化”指仓库内的代码边界与内置模块开关，不代表已有第三方插件 SDK、模块安装器或创意工坊。显示开关不是权限；关闭不删除资料。
- 保持既有默认行为、显式关闭偏好、action、稳定 ID、版本冲突与请求去重契约。存储修改先读 [moji-library v5 兼容边界](docs/moji-granular-storage.md)，用合成数据验证历史、未知字段和备份往返。
- 新功能优先复用现有 action；新命令同时检查业务校验、宿主白名单、工具说明及本地／云端构建，不只添加按钮。
- 按指南运行相关测试与构建；报告实际通过、失败和未验证项。UI 改动提供桌面侧栏、窄屏／移动布局证据，保护宿主样式与未保存草稿。
- 只提交源码、公共文档和合成样例；不提交作者作品、备份、聊天日志、密钥、令牌或个人云配置。提交前逐项检查 diff，不把忽略规则当隐私保证。
- 可以在本地或个人 fork 定制；提交 Issue、创建 PR、推送、发布、部署、操作真实工作库都须符合当前用户授权。不要自动发布或修改个人云实例，也不要承诺维护者一定接受 PR。

构建／测试入口见 [development.md](docs/development.md)；功能想法可先提 [Issue](https://github.com/CF-612/MoJi/issues/new)，也欢迎自行实现后提交 [PR](https://github.com/CF-612/MoJi/pulls)。
