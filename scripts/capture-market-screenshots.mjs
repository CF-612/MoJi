// Capture the production workbench with original demo data, never a DSH profile.
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdir, readFile, writeFile} from 'node:fs/promises';
import {join, resolve} from 'node:path';
import {chromium, expect} from '@playwright/test';

const root = resolve(import.meta.dirname, '..');
const {version} = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'));
const images = join(root, 'docs/screenshots');
await mkdir(images, {recursive: true});
const preview = spawn(process.execPath, ['scripts/preview-workbench.mjs', '--empty'], {
  cwd: root, stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true,
});
let browser;
try {
  const {url} = await new Promise((resolve, reject) => {
    let output = '', errors = '';
    const timer = setTimeout(() => reject(new Error('Preview timeout: ' + errors)), 30000);
    preview.stderr.on('data', value => errors += value);
    preview.once('exit', code => {clearTimeout(timer); reject(new Error('Preview exited ' + code + ': ' + errors));});
    preview.stdout.on('data', value => {
      output += value;
      const line = output.split('\n').find(value => value.startsWith('{'));
      if (line) {clearTimeout(timer); resolve(JSON.parse(line));}
    });
  });
  const call = async (action, args = {}) => {
    const response = await fetch(new URL('/dispatch', url), {
      method: 'POST', headers: {'content-type': 'application/json'}, body: JSON.stringify({action, args}),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error);
    return result;
  };
  const novelId = (await call('novel.create', {title: '雨城来信 · 演示作品', description: '为展示催更姬制作的虚构作品。'})).id;
  const run = (action, args = {}) => call(action, {novelId, ...args});
  const volume = await run('volume.create', {title: '第一卷 · 雨城旧事'});
  const chapters = [];
  for (const [title, content] of [
    ['第一章 雨夜来信', [
      '第三封信抵达旧书铺的时候，雨已经停了。林照把信放在父亲的笔记旁，两个字的收笔几乎一样。',
      '她没有立刻拆开。前两封信只写了一个地址，这次信封上却多了一道浅蓝色的印记，像旧钟楼的钟面。',
      '“邮差说，是从南岸寄来的。”陆行舟站在门口，伞尖的水一滴一滴落在石阶上。',
      '林照翻过信封。邮戳清楚得有些刻意，日期是昨天；可南岸渡口已经封了十年。',
      '“你认识这个印记？”她问。',
      '陆行舟看了一眼，把伞收得更紧：“以前修钟的时候见过。”',
      '她等着下文。他却伸手去扶门边松动的招牌，木板碰到墙，发出一声闷响。',
      '林照终于拆开了信。纸上没有地址，只有一句话：钟声停下以前，别相信第一个告诉你真相的人。',
      '门口的钟恰好走到六点。她抬头，旧钟楼的方向传来了一声迟到的钟鸣。',
      '陆行舟也听见了。这一次，他没再假装忙着修理招牌。',
    ].map(paragraph => '　　' + paragraph).join('\n\n')],
    ['第二章 钟楼里的齿轮', '　　林照沿着旋梯向上，发现一枚不属于钟机的齿轮。陆行舟认出了它，却没有解释。'],
    ['第三章 南岸的守夜人', '　　灰帽女人守在渡口。她愿意交出航海日志，但要求林照先查清钟声的来源。'],
  ]) chapters.push(await run('chapter.create', {volumeId: volume.id, title, content}));

  const tx = await run('planning.apply', {requestId: crypto.randomUUID(), reason: '虚构宣传演示，不代表模型实际输出', operations: [
    {op: 'group.create', ref: 'clues', value: {name: '线索推进'}},
    {op: 'group.create', ref: 'motives', value: {name: '人物动机'}},
    {op: 'page.create', ref: 'dock', value: {name: '南岸码头 · 局部推演', summary: '展开码头段的多方行动，主线保留事件结果。'}},
    {op: 'decoration.create', value: {kind: 'frame', title: '调查线 · 从信件到钟楼', position: {x: 40, y: 48}, width: 610, height: 218, color: 'sky', moveContents: true}},
    {op: 'decoration.create', value: {kind: 'frame', title: '人物线 · 沉默的约定', position: {x: 40, y: 316}, width: 610, height: 218, color: 'sage', moveContents: true}},
    ...[
      ['letter', '收到第三封信', '相同的字迹，把林照引向旧钟楼。', '检查邮戳与蓝色印记；陆行舟第一次回避提问。', 68, 100, 'clues', 'written'],
      ['gear', '找到异常齿轮', '钟机里留下了旧货船的标记。', '将钟楼线索和南岸航线联系起来，不在这里揭开父亲去向。', 374, 100, 'clues', 'selected'],
      ['silence', '陆行舟守口如瓶', '他知道齿轮来历，却在保护一个约定。', '沉默来自具体选择；与作者讨论约定的对象。', 68, 368, 'motives', 'idea'],
      ['trust', '给他一次坦白机会', '林照决定带他同行，保留疑问。', '先推进信任，再决定揭露时机；此处尚未落地。', 374, 368, 'motives', 'idea'],
      ['dock-event', '在码头交换线索', '两条动线汇合，守夜人提出条件。', '调查证据与人物选择在码头交汇。详细行动在“南岸码头 · 局部推演”页展开。', 730, 238, 'clues', 'idea'],
    ].map(([ref, title, summary, content, x, y, groupId, status]) => ({op: 'node.create', ref, value: {
      title, summary, content, position: {x, y}, groupId, status,
      ...(status === 'written' ? {chapterRefs: [{chapterId: chapters[0].id, revision: 1}]} : {}),
    }})),
    ...[['letter', 'gear'], ['silence', 'trust'], ['gear', 'dock-event'], ['trust', 'dock-event']].map(([from, to]) => ({op: 'edge.create', value: {from, to}})),
    {op: 'decoration.create', value: {kind: 'note', title: '一起讨论', content: '先得到线索，还是先赢得信任？\n两者的代价会怎样改变下一步？', position: {x: 730, y: 452}, width: 248, height: 110, color: 'sand', fontSize: 14}},
    {op: 'node.create', value: {pageId: 'dock', title: '守夜人的交换条件', summary: '她需要知道钟声是否来自旧船。', content: '局部推演示例，可继续扩展多方行动。', position: {x: 90, y: 120}}},
  ]});
  assert.ok(tx);
  const people = await run('graph.group.create', {name: '主要人物'});
  const world = await run('graph.group.create', {name: '雨城与南岸'});
  const settings = [];
  for (const [name, type, summary, content, x, y] of [
    ['林照', 'character_card', '旧书铺店主，寻找失踪的父亲。', '习惯先核对细节，再相信自己的直觉。她愿意追问真相，却不愿让无辜的人承担代价。\n\n与陆行舟互相信任，也都保留着尚未说出的疑问。', 62, 98],
    ['陆行舟', 'character_card', '钟楼修理员，守着不能说的约定。', '认识旧货船的齿轮。沉默不是冷漠，而是他仍在衡量坦白会给谁带来危险。', 398, 98],
    ['旧钟楼', 'world_entry', '封闭十年，每晚仍传来钟声。', '钟机里有一枚不属于它的齿轮，带着南岸货船的标记。', 734, 98],
    ['灰帽女人', 'character_card', '南岸渡口的守夜人，知道旧航线。', '愿意交换线索，但不会无条件交出日志。她有自己的目标与信息盲区。', 398, 364],
    ['南岸码头', 'world_entry', '旧货船的停泊地，也是线索的交汇处。', '渡口封闭后依然有人值夜。航海日志与钟楼齿轮记录了同一段往事。', 734, 364],
  ]) settings.push(await run('graph.create', {name, type, summary, content, position: {x, y}, groupId: type === 'character_card' ? people.id : world.id}));
  for (const [a, b, name] of [[0, 1, '同行与隐瞒'], [1, 2, '维护钟机'], [0, 3, '交换线索'], [3, 4, '守夜'], [2, 4, '旧船的印记']]) {
    await run('edge.create', {from: settings[a].id, to: settings[b].id, name});
  }
  await call('binding.set', {novelId});

  browser = await chromium.launch({headless: true, executablePath: process.env.CHROMIUM_EXECUTABLE || undefined});
  const page = await browser.newPage({viewport: {width: 1600, height: 1060}, deviceScaleFactor: 1, reducedMotion: 'reduce'});
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(({novelId, chapterId}) => {
    localStorage.setItem(`cuigengji:ui:production-preview:${novelId}:chapter`, JSON.stringify(chapterId));
  }, {novelId, chapterId: chapters[0].id});
  await page.goto(url);
  await expect(page.getByRole('textbox', {name: '正文', exact: true})).toHaveValue(/第三封信/);
  await page.evaluate(() => document.fonts.ready);
  const shots = [];
  const capture = async (name, title, subtitle, accent) => {
    await page.evaluate(({title, subtitle, accent, version}) => {
      let style = document.getElementById('market-shot-style');
      if (!style) {
        style = document.createElement('style'); style.id = 'market-shot-style';
        style.textContent = `body{background:#eef3fa}#root{position:absolute;inset:166px 36px 46px;height:auto;border:1px solid #dce4ef;border-radius:18px;overflow:hidden;box-shadow:0 18px 54px #273c6312}.market-shot-heading{position:absolute;inset:28px 48px auto;font-family:system-ui,"Microsoft YaHei",sans-serif;color:#192843}.market-shot-eyebrow{display:flex;justify-content:space-between;font-size:15px;letter-spacing:1px;color:#53709a}.market-shot-heading h1{margin:12px 0 8px;font-size:37px;font-weight:650;letter-spacing:-1px}.market-shot-heading p{margin:0;font-size:17px;color:#5e7089}.market-shot-footer{position:absolute;left:48px;bottom:14px;margin:0;font:13px system-ui;color:#718098}`;
        document.head.append(style);
      }
      document.querySelectorAll('.market-shot-heading,.market-shot-footer').forEach(element => element.remove());
      const heading = document.createElement('header'); heading.className = 'market-shot-heading';
      const eyebrow = document.createElement('div'); eyebrow.className = 'market-shot-eyebrow';
      const brand = document.createElement('span'); brand.textContent = '催更姬 · DSH 小说写作工作台';
      const versionLabel = document.createElement('span'); versionLabel.textContent = version; eyebrow.append(brand, versionLabel);
      const h1 = document.createElement('h1'); h1.textContent = title; h1.style.color = accent;
      const p = document.createElement('p'); p.textContent = subtitle; heading.append(eyebrow, h1, p);
      const footer = document.createElement('p'); footer.className = 'market-shot-footer'; footer.textContent = '正式工作台 · 虚构演示作品 · 不含真实小说或聊天记录';
      document.body.append(heading, footer);
    }, {title, subtitle, accent, version});
    await page.screenshot({path: join(images, name)});
    shots.push('docs/screenshots/' + name);
  };
  await capture('01-manuscript.png', '把故事写下来，也把每次修改留下来', '章节目录 · 自动保存 · 一键排版 · 正文历史', '#214e97');
  await page.getByRole('button', {name: '规划', exact: true}).click();
  await expect(page.locator('.scene-card')).toHaveCount(5);
  await page.getByRole('button', {name: '适应视图', exact: true}).click();
  await capture('02-planning.png', '和 AI 一起，把下一步情节讨论清楚', '事件与人物动线在画布交汇；复杂情节可以另开一页推演。', '#214e97');
  await page.getByRole('button', {name: '设定', exact: true}).click();
  await page.getByRole('button', {name: '画布', exact: true}).click();
  await expect(page.locator('.planning-card')).toHaveCount(5);
  await page.getByRole('button', {name: '适应视图', exact: true}).click();
  await capture('03-settings.png', '人物、世界与关系，放在同一份案头资料里', '角色卡与世界书 · 分组筛选 · 关系图 · 作者和 AI 都能查阅与维护', '#214e97');
  assert.deepEqual(errors, []);
  await writeFile(join(root, 'screenshots.json'), JSON.stringify(shots, null, 2) + '\n');
  console.log(JSON.stringify({ok: true, screenshots: shots, dataSource: 'original fictional demo in disposable storage', ui: 'production Workbench', errors}));
} finally {
  await browser?.close();
  preview.kill();
}
