import {App} from '@modelcontextprotocol/ext-apps';

// 事故隔离：仅完成宿主握手，不载入工作台、调用工具或通知尺寸变化。
const app = new App({name:'cuigengji-paused',version:'0.2.0'}, {}, {autoResize:false});
app.connect().catch(() => {});
