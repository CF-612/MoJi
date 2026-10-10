import {spawn} from 'node:child_process';
import {mkdir} from 'node:fs/promises';
import {resolve, join} from 'node:path';
import {chromium, expect} from '@playwright/test';

const root = resolve(import.meta.dirname, '..'), shots = join(root, 'test-results', 'manuscript');
await mkdir(shots, {recursive: true});
const preview = spawn(process.execPath, ['scripts/preview-workbench.mjs'], {cwd: root, stdio: ['ignore', 'pipe', 'pipe']});
let browser, page;
try {
  const {url} = await new Promise((resolve, reject) => {
    let output = '', errors = ''; const timer = setTimeout(() => reject(new Error(errors || 'Preview timeout')), 20000);
    preview.stderr.on('data', chunk => {errors += chunk;});
    preview.once('exit', code => {clearTimeout(timer); reject(new Error('Preview exit ' + code + errors));});
    preview.stdout.on('data', chunk => {output += chunk; const line = output.split('\n').find(line => line.startsWith('{')); if (line) {clearTimeout(timer); resolve(JSON.parse(line));}});
  });
  const call = async (action, args = {}) => {
    const response = await fetch(new URL('/dispatch', url), {method: 'POST', headers: {'content-type': 'application/json'}, body: JSON.stringify({action, args})});
    const result = await response.json(); if (!response.ok) throw new Error(result.error); return result;
  };
  const novelId = (await call('novel.list'))[0].id, chapter = (await call('chapter.list', {novelId}))[0];
  const prose = Array.from({length: 80}, (_, i) => `第${i + 1}段。${'她读完来信，将窗边的灯熄灭了。'.repeat(4)}`).join('\n\n');
  await call('chapter.update', {novelId, chapterId: chapter.id, expectedRevision: chapter.revision, content: prose});
  browser = await chromium.launch({headless: true});
  page = await browser.newPage({viewport: {width: 1100, height: 900}, reducedMotion: 'reduce'});
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  // Hold a real Store response after JSON parsing so it can arrive during a native
  // input event, before the browser's queued selectionchange event is delivered.
  await page.addInitScript(() => {
    const fetch = window.fetch.bind(window);
    window.fetch = async (...args) => {
      const response = await fetch(...args);
      let action; try {action = JSON.parse(args[1]?.body || '{}').action;} catch {}
      if (action === 'chapter.update') {
        const json = response.json.bind(response);
        response.json = async () => {
          const result = await json();
          if (window.__holdNextChapterSave) {
            window.__holdNextChapterSave = false;
            await new Promise(resolve => {window.__releaseChapterSave = resolve; window.__chapterSaveHeld = true;});
            window.__chapterSaveHeld = false;
          }
          return result;
        };
      }
      return response;
    };
  });
  await page.goto(url); await page.locator('.chapter-item').first().click();
  const manuscript = page.getByLabel('正文', {exact: true}), scroll = page.locator('.editor-scroll');
  await expect(manuscript).toHaveValue(prose);
  await manuscript.evaluate(element => {element.focus({preventScroll: true}); element.setSelectionRange(1000, 1000);});
  await page.evaluate(() => {window.__holdNextChapterSave = true;});
  await page.keyboard.insertText('初次输入');
  await expect.poll(() => page.evaluate(() => window.__chapterSaveHeld)).toBe(true);
  await manuscript.evaluate(element => {element.addEventListener('input', () => window.__releaseChapterSave(), {once: true});});
  await page.keyboard.insertText('继续');
  await expect.poll(() => page.evaluate(() => window.__chapterSaveHeld)).toBe(false);
  const caret = await manuscript.evaluate(element => ({start: element.selectionStart, end: element.selectionEnd}));
  expect(caret, 'save acknowledgement must keep the newest insertion point').toEqual({start: 1006, end: 1006});
  await expect(manuscript).toHaveValue(prose.slice(0, 1000) + '初次输入继续' + prose.slice(1000));
  await expect.poll(async () => (await call('chapter.get', {novelId, chapterId: chapter.id, maxChars: 200000})).content).toBe(await manuscript.inputValue());
  await expect(page.locator('.auto-savebar')).toContainText('已保存');

  // A save that began before IME composition must not touch its in-progress text
  // or submit it halfway. Use real DOM input events, including the composition flag.
  await page.evaluate(() => {window.__holdNextChapterSave = true;});
  await manuscript.evaluate(element => {element.focus({preventScroll: true}); element.setSelectionRange(1006, 1006);});
  await page.keyboard.insertText('。');
  await expect.poll(() => page.evaluate(() => window.__chapterSaveHeld)).toBe(true);
  const beforeComposition = await manuscript.inputValue();
  await manuscript.evaluate(element => {
    element.dispatchEvent(new CompositionEvent('compositionstart', {bubbles: true}));
    element.addEventListener('input', () => window.__releaseChapterSave(), {once: true});
    const setValue = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set;
    setValue.call(element, element.value.slice(0, 1007) + 'zhong' + element.value.slice(1007));
    element.setSelectionRange(1012, 1012);
    element.dispatchEvent(new InputEvent('input', {bubbles: true, inputType: 'insertCompositionText', data: 'zhong', isComposing: true}));
  });
  await expect.poll(() => page.evaluate(() => window.__chapterSaveHeld)).toBe(false);
  expect(await manuscript.evaluate(element => element.selectionStart)).toBe(1012);
  await expect(manuscript).toHaveValue(beforeComposition.slice(0, 1007) + 'zhong' + beforeComposition.slice(1007));
  expect((await call('chapter.get', {novelId, chapterId: chapter.id, maxChars: 200000})).content).toBe(beforeComposition);
  await manuscript.evaluate(element => {
    const setValue = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set;
    setValue.call(element, element.value.replace('zhong', '中'));
    element.setSelectionRange(1008, 1008);
    element.dispatchEvent(new InputEvent('input', {bubbles: true, inputType: 'insertCompositionText', data: '中', isComposing: true}));
    element.dispatchEvent(new CompositionEvent('compositionend', {bubbles: true, data: '中'}));
  });
  const composed = beforeComposition.slice(0, 1007) + '中' + beforeComposition.slice(1007);
  await expect.poll(async () => (await call('chapter.get', {novelId, chapterId: chapter.id, maxChars: 200000})).content).toBe(composed);
  expect(await manuscript.evaluate(element => element.selectionStart)).toBe(1008);
  await expect(page.locator('.auto-savebar')).toContainText('已保存');

  // Own-save receipts must leave native Undo/Redo intact as well as the caret.
  await manuscript.evaluate(element => {element.focus({preventScroll: true}); element.setSelectionRange(1500, 1500);});
  await page.keyboard.insertText('撤销测试');
  const undoText = composed.slice(0, 1500) + '撤销测试' + composed.slice(1500);
  await expect.poll(async () => (await call('chapter.get', {novelId, chapterId: chapter.id, maxChars: 200000})).content).toBe(undoText);
  await expect(page.locator('.auto-savebar')).toContainText('已保存');
  await page.keyboard.press('Control+z'); await expect(manuscript).toHaveValue(composed);
  await page.keyboard.press('Control+Shift+z'); await expect(manuscript).toHaveValue(undoText);
  await expect(page.locator('.auto-savebar')).toContainText('已保存');

  // A remote insertion above the caret keeps the same selected sentence and its
  // direction. Updating metadata alone must keep selection and scroll untouched.
  const selectionStart = undoText.indexOf('第30段'), selectionEnd = selectionStart + 12;
  await scroll.evaluate(element => {element.scrollTop = 1000;});
  await manuscript.evaluate((element, selection) => {element.focus({preventScroll: true}); element.setSelectionRange(selection.start, selection.end, 'backward');}, {start: selectionStart, end: selectionEnd});
  const scrollBefore = await scroll.evaluate(element => element.scrollTop);
  const saved = await call('chapter.get', {novelId, chapterId: chapter.id, maxChars: 200000});
  const prefix = 'AI 补充的开场。\n\n';
  await call('chapter.update', {novelId, chapterId: chapter.id, expectedRevision: saved.revision, content: prefix + undoText});
  await expect(manuscript).toHaveValue(prefix + undoText, {timeout: 10000});
  expect(await manuscript.evaluate(element => ({start: element.selectionStart, end: element.selectionEnd, direction: element.selectionDirection}))).toEqual({start: selectionStart + prefix.length, end: selectionEnd + prefix.length, direction: 'backward'});
  expect(await scroll.evaluate(element => element.scrollTop)).toBe(scrollBefore);
  const metadata = await call('chapter.get', {novelId, chapterId: chapter.id, maxChars: 200000});
  await call('chapter.update', {novelId, chapterId: chapter.id, expectedRevision: metadata.revision, title: '第一章 · Windows 换行', content: (prefix + undoText).replace(/\n/g, '\r\n')});
  await expect(page.getByRole('heading', {name: '第一章 · Windows 换行', exact: true})).toBeVisible({timeout: 10000});
  await expect(manuscript).toHaveValue(prefix + undoText);
  expect(await manuscript.evaluate(element => ({start: element.selectionStart, end: element.selectionEnd, direction: element.selectionDirection}))).toEqual({start: selectionStart + prefix.length, end: selectionEnd + prefix.length, direction: 'backward'});
  expect(await scroll.evaluate(element => element.scrollTop)).toBe(scrollBefore);
  const afterRemote = await call('chapter.get', {novelId, chapterId: chapter.id, maxChars: 200000});
  await call('chapter.update', {novelId, chapterId: chapter.id, expectedRevision: afterRemote.revision, title: '第一章 · 改名'});
  await expect(page.getByRole('heading', {name: '第一章 · 改名', exact: true})).toBeVisible({timeout: 10000});
  expect(await manuscript.evaluate(element => ({start: element.selectionStart, end: element.selectionEnd, direction: element.selectionDirection}))).toEqual({start: selectionStart + prefix.length, end: selectionEnd + prefix.length, direction: 'backward'});
  expect(await scroll.evaluate(element => element.scrollTop)).toBe(scrollBefore);
  await page.screenshot({path: join(shots, 'saved-selection.png'), animations: 'disabled'});
  expect(errors).toEqual([]);
  console.log(JSON.stringify({ok: true, checks: ['typing during an in-flight autosave preserves the newest caret and all text', 'in-flight save does not interrupt IME or save its partial input', 'native Undo/Redo after saving', 'remote prefix edit preserves the selected prose and direction', 'metadata sync preserves selection and scroll', 'Windows CRLF sync preserves the DOM selection']}));
} catch (error) {if (page) await page.screenshot({path: join(shots, 'failure.png')}).catch(() => {}); throw error;}
finally {await browser?.close(); preview.kill();}
