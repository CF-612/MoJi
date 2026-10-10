/** Use the author's visible entry points, shared by the UI regression scripts. */
export async function openAuthorPage(page, name) {
  if (name === '写作预设') {
    await page.getByRole('button', {name: '设置', exact: true}).click();
    await page.getByRole('button', {name: '写作预设', exact: true}).click();
    return;
  }
  await page.getByRole('button', {name: '作品首页', exact: true}).click();
  if (name === '作品首页') return;
  await page.getByRole('button', {name: name === '作品与备份' ? '作品管理' : name, exact: true}).click();
}
