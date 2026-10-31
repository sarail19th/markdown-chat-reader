// The whole app in an invisible Chrome, using the made-up files in tests/fixtures.
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const os = require('os');
const path = require('path');
const { chromium } = require('playwright');
const { startServer, FIXTURES } = require('./helpers');

let server, browser;
before(async () => { server = await startServer(); browser = await chromium.launch(); });
after(async () => { await browser.close(); server.close(); });

// A fresh page each time, so one test's saved settings never affect another.
async function openApp() {
  const context = await browser.newContext({ acceptDownloads: true, serviceWorkers: 'block' });
  const page = await context.newPage();
  await page.goto(server.url);
  await page.waitForFunction(() => window.doc && doc.msgs.length > 0);
  return page;
}
// Opens files with the Open button's file picker and waits for the list of chats or a notice.
async function openFiles(page, ...names) {
  await page.evaluate(() => { document.getElementById('notice').hidden = true; document.getElementById('libInfo').textContent = ''; });
  await page.setInputFiles('#file', names.map((n) => path.isAbsolute(n) ? n : path.join(FIXTURES, n)));
  await page.waitForFunction(() => !document.getElementById('notice').hidden || document.getElementById('libInfo').textContent);
}
const info = (page) => page.textContent('#libInfo');
const notice = (page) => page.textContent('#noticeText');
const groups = (page) => page.$$eval('.libgroup h3', (hs) => hs.map((h) => h.textContent));
const rows = (page) => page.locator('#libList .librow').count();
const allText = (page) => page.evaluate(() => lib.items.map((it) => it.msgs.map((m) => m.text).join('\n')).join('\n'));

test('a ChatGPT export opens as a list of chats, sorted by [Name] titles', async () => {
  const page = await openApp();
  await openFiles(page, 'chatgpt-export.zip');
  assert.match(await info(page), /^3 chats from ChatGPT/);
  assert.deepEqual(await groups(page), ['Travel (2)', 'No project (1)']);
  assert.equal(await page.evaluate(() => lib.items.reduce((n, it) => n + it.msgs.length, 0)), 8);
  const text = await allText(page);
  assert.doesNotMatch(text, /OLD REPLY/, 'a reply that was regenerated away is left out');
  assert.doesNotMatch(text, /hidden thinking/, "the model's thinking is left out");
  assert.doesNotMatch(text, /[-]/, 'web-search citation marks are removed');
});

test('the backup .zip opens again with every message identical', async () => {
  const page = await openApp();
  await openFiles(page, 'chatgpt-export.zip');
  const before = await page.evaluate(() => lib.items.map((it) => it.msgs.map((m) => m.role + ':' + m.text)));
  const [download] = await Promise.all([page.waitForEvent('download'), page.click('#libZip')]);
  const saved = path.join(os.tmpdir(), 'backup-' + Date.now() + '.zip');
  await download.saveAs(saved);
  await openFiles(page, saved);
  assert.match(await info(page), /^3 chats from a \.zip of Markdown files/);
  const after = await page.evaluate(() => lib.items.map((it) => it.msgs.map((m) => m.role + ':' + m.text)));
  assert.deepEqual(after, before);
});

test('Claude: chats with no text are hidden until shown, and gaps are marked', async () => {
  const page = await openApp();
  await openFiles(page, 'claude-export.zip');
  assert.match(await info(page), /2 chats have no text at all/);
  assert.equal(await rows(page), 2);
  assert.equal(await page.textContent('#libGhostTxt'), 'Show 2 chats with no text');
  await page.check('#libGhost');
  assert.equal(await rows(page), 4);
  const text = await allText(page);
  assert.doesNotMatch(text, /SECRET THOUGHTS/, "Claude's thinking is left out");
  assert.match(text, /No text for this message in the export/);
});

test("Claude's download list says which file holds the chats", async () => {
  const page = await openApp();
  await openFiles(page, 'claude-manifest.json');
  assert.match(await notice(page), /Download conversations-000\.zip/);
});

test("Claude's artifacts file is named, not mistaken for chats", async () => {
  const page = await openApp();
  await openFiles(page, 'frames-000.zip');
  assert.match(await notice(page), /frames-000\.zip is your Claude artifacts, not chats/);
});

test('Remember my folders keeps only ID codes and folder names, and sorts the next export', async () => {
  const page = await openApp();
  await openFiles(page, 'chatgpt-export.zip');
  await page.check('#libRemember');
  await page.evaluate(() => { lib.sel = { [lib.items.findIndex((it) => it.title === 'Birthday message')]: true }; syncLibBar(); });
  await page.click('#libMove');
  await page.fill('#modal input', 'Cards');
  await page.click('#modalOk');
  assert.deepEqual(JSON.parse(await page.evaluate(() => localStorage.getItem('cr-folders'))), { 'gpt-0003': 'Cards' });
  await page.reload();
  await page.waitForFunction(() => window.doc && doc.msgs.length > 0);
  await openFiles(page, 'chatgpt-export.zip');
  assert.deepEqual(await groups(page), ['Cards (1)', 'Travel (2)']);
});

test('the colour menu offers Classic, seven colours and White, in colour-wheel order', async () => {
  const page = await openApp();
  const names = await page.$$eval('#accentList [role="option"] span', (spans) => spans.map((s) => s.textContent));
  assert.deepEqual(names, ['Classic', 'Lavender', 'Periwinkle', 'Ice blue', 'Mint', 'Pastel yellow', 'Peach', 'Blush', 'White']);
});

test('Help panel has a "Why Markdown?" section', async () => {
  const page = await openApp();
  const names = await page.$$eval('#info h2', (headings) => headings.map((h) => h.textContent));
  assert.ok(names.includes('Why Markdown?'));
});

test('the buttons are in groups: Open, Paste and Help in the top-left menu, Edit, Style and Search near the round button, moving around in the other corner', async () => {
  const page = await openApp();
  if (await page.evaluate(() => document.documentElement.hasAttribute('data-menu'))) await page.click('#fabToggle');
  const tools = await page.$$eval('#fabMenu > button', (bs) => bs.filter((b) => !b.hidden).map((b) => ({ name: b.getAttribute('aria-label'), top: b.getBoundingClientRect().top })));
  assert.deepEqual(tools.sort((a, b) => b.top - a.top).map((b) => b.name), ['Edit messages', 'Style', 'Search this chat'], 'nearest the round button first');
  assert.ok(await page.locator('#topMenu').isHidden(), 'the top-left menu starts closed');
  await page.click('#menuBtn');
  assert.deepEqual(await page.$$eval('#topMenu button', (bs) => bs.filter((b) => !b.hidden).map((b) => b.textContent)), ['Open a file', 'Paste text', 'Help']);
  await page.click('#pasteBtn');
  assert.ok(await page.locator('#topMenu').isHidden(), 'choosing an item closes the menu');
  assert.ok(await page.locator('#paste').isVisible(), 'and opens what was chosen');
  assert.deepEqual(await page.$$eval('#navFabs button', (bs) => bs.map((b) => b.id)), ['topBtn', 'jumpBtn', 'prevMsgBtn', 'nextMsgBtn'], 'top and bottom are both there');
  const sides = await page.evaluate(() => ({ nav: document.getElementById('navFabs').getBoundingClientRect().left, fab: document.getElementById('fabToggle').getBoundingClientRect().left }));
  assert.ok(sides.nav < sides.fab, 'the two floating groups are in opposite corners');
  await page.click('#fabToggle');
  assert.ok(await page.locator('#navFabs').isVisible(), 'hiding the tools leaves the moving-around buttons on screen');
});

test('the top and bottom buttons both work, wherever you are in the chat', async () => {
  const page = await openApp();
  await page.click('#jumpBtn');
  await page.waitForFunction(() => window.scrollY > 200);
  await page.click('#jumpBtn');
  await page.waitForTimeout(300);
  assert.ok(await page.evaluate(() => window.scrollY > 200), 'bottom stays at the bottom');
  await page.click('#topBtn');
  await page.waitForFunction(() => window.scrollY === 0);
});
