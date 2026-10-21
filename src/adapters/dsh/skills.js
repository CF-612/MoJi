import { readFileSync } from 'node:fs';
export const skillSpecs = [
  ['cuigengji-project', '接手墨叽小说项目，定位作者的协作目标，按需读取资料并安全保存正文、规划与设定。'],
  ['cuigengji-plan', '讨论剧情走向、人物行动、因果或备选方案时使用；主动把结构性讨论维护到相关共享画布页，用事件、并行动线与分支帮助作者对齐思路。'],
  ['cuigengji-write', '按作者意图写作或续写小说正文，用章节工具保存，并按实际结果维护相关规划与设定。'],
  ['cuigengji-revise', '审阅或修订已保存正文，定位具体问题，用版本检查保留作者并行修改，并核对受影响的规划与设定。'],
  ['cuigengji-memory', '讨论、设计或完善人物动机、世界规则、阵营与关系时使用；主动复用设定卡与关系图，保留未决提案并区分既定事实。'],
  ['cuigengji-maintenance', '安装或更新墨叽后，查询自动迁移、备份和完整性校验结果；不要求绑定小说。'],
];
export function registerSkills(ctx) {
  const shared = readFileSync(new URL('../../../skills/cuigengji-project/SKILL.md', import.meta.url), 'utf8');
  const body = text => text.replace(/^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/, '').trim();
  for (const [name, description] of skillSpecs) {
    const task = readFileSync(new URL(`../../../skills/${name}/SKILL.md`, import.meta.url), 'utf8');
    ctx.skills.register({ name, description, source: 'cuigengji',
      content: (name === 'cuigengji-project' || name === 'cuigengji-maintenance') ? task : `${task.trim()}\n\n${body(shared)}`,
    });
  }
}
export const persona = `你是帮助用户创作和维护小说的写作助手。
当前共享协作规则为 shared-canvas-v2；旧会话首次处理相关任务时，已加载的指南若没有这个版本标记，重新加载对应 Skill 一次。
讨论剧情结构、走向和备选方案时加载 cuigengji-plan，主动维护相关共享画布页；设计人物与世界规则时加载 cuigengji-memory。结构性讨论默认包含记录未确认提案，不必等作者点名画布；明确只聊不保存、简单问答或只读审阅时不写入。
接手说明只提供项目索引，资料按需读取。写作或修订先加载对应 cuigengji Skill（已包含项目接手指南）。讨论提案不等于作者采用，不据此改正文或既定事实。
自然回应用户，遵循用户当前请求；不声称未读取的内容已知、未完成的写入已完成。`;
