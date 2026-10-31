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

test('the buttons are in groups: Open, Paste and Help in a top-right menu, Edit, Style and Search near the round button, moving around in the other corner', async () => {
  const page = await openApp();
  if (await page.evaluate(() => document.documentElement.hasAttribute('data-menu'))) await page.click('#fabToggle');
  const tools = await page.$$eval('#fabMenu > button', (bs) => bs.filter((b) => !b.hidden).map((b) => ({ name: b.getAttribute('aria-label'), top: b.getBoundingClientRect().top })));
  assert.deepEqual(tools.sort((a, b) => b.top - a.top).map((b) => b.name), ['Edit messages', 'Style', 'Search this chat'], 'nearest the round button first');
  assert.ok(await page.locator('#topMenu').isHidden(), 'the top-right menu starts closed');
  assert.ok((await page.locator('#menuBtn').boundingBox()).x > (await page.evaluate(() => innerWidth)) / 2, 'its button is on the right');
  const chatTop = () => page.evaluate(() => document.getElementById('chat').getBoundingClientRect().top);
  const before = await chatTop();
  await page.click('#menuBtn');
  assert.equal(await chatTop(), before, 'the list floats over the chat instead of pushing it down');
  assert.deepEqual(await page.$$eval('#topMenu button:not(#hideToolsBtn):not(#hideArrowsBtn)', (bs) => bs.filter((b) => !b.hidden).map((b) => b.textContent)), ['Open a file', 'Paste text', 'Help']);
  await page.click('#pasteBtn');
  assert.ok(await page.locator('#topMenu').isHidden(), 'choosing an item closes the menu');
  assert.ok(await page.locator('#paste').isVisible(), 'and opens what was chosen');
  assert.deepEqual(await page.$$eval('#navMenu button', (bs) => bs.map((b) => b.id)), ['topBtn', 'jumpBtn', 'prevMsgBtn', 'nextMsgBtn'], 'top and bottom are both there');
  const sides = await page.evaluate(() => ({ nav: document.getElementById('navFabs').getBoundingClientRect().left, fab: document.getElementById('fabToggle').getBoundingClientRect().left }));
  assert.ok(sides.nav < sides.fab, 'the two floating groups are in opposite corners');
  await page.click('#fabToggle');
  assert.ok(await page.locator('#navMenu').isVisible(), 'hiding the tools leaves the moving-around buttons on screen');
  await page.click('#navToggle');
  assert.ok(await page.locator('#navMenu').isHidden(), 'the moving-around buttons fold on their own toggle');
  await page.reload();
  await page.waitForFunction(() => window.doc && doc.msgs.length > 0);
  assert.ok(await page.locator('#navMenu').isHidden(), 'and stay folded on this device');
  await page.click('#navToggle');
  assert.ok(await page.locator('#navMenu').isVisible(), 'and unfold again');
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

test('the arrows can be dragged on their own, and stay where you put them', async () => {
  const page = await openApp();
  const box = () => page.locator('#navToggle').boundingBox();
  const start = await box();
  await page.mouse.move(start.x + 26, start.y + 26);
  await page.mouse.down();
  await page.mouse.move(150, 300, { steps: 8 });
  await page.mouse.up();
  const moved = await box();
  assert.ok(Math.abs(moved.x + 26 - 150) < 4 && Math.abs(moved.y + 26 - 300) < 4, 'the button follows the finger');
  assert.ok(await page.locator('#navMenu').isVisible(), 'dragging does not fold the arrows');
  const tools = await page.locator('#fabToggle').boundingBox();
  assert.ok(tools.x > 200, 'the tools stay where they were');
  await page.reload();
  await page.waitForFunction(() => window.doc && doc.msgs.length > 0);
  const again = await box();
  assert.ok(Math.abs(again.x - moved.x) < 3 && Math.abs(again.y - moved.y) < 3, 'and it stays there after a reload');
  await page.click('#navToggle');
  assert.ok(await page.locator('#navMenu').isHidden(), 'a plain tap still folds them');
});

test('Replace and Replace all work on a chat in Edit mode, and one undo brings the text back', async () => {
  const page = await openApp();
  const countOf = (word) => page.evaluate((w) => doc.msgs.reduce((n, m) => n + (m.text.match(new RegExp(w, 'gi')) || []).length, 0), word);
  await page.click('#fabToggle');
  await page.click('[data-panel="search"]');
  assert.ok(await page.locator('#replaceRow').isHidden(), 'no Replace while only reading');
  await page.keyboard.press('Escape');
  await page.click('#editBtn');
  await page.click('[data-panel="search"]');
  assert.ok(await page.locator('#replaceRow').isVisible(), 'Replace appears in Edit mode');
  assert.ok(await page.locator('#replaceAll').isDisabled(), 'and waits for something to search for');
  const total = await countOf('export');
  assert.ok(total > 3, 'the guide mentions "export" several times');
  await page.fill('#searchInput', 'export');
  await page.waitForFunction((n) => document.getElementById('replaceAll').textContent === 'Replace all (' + n + ')', total);
  await page.fill('#replaceInput', 'ZZQRPLC');
  await page.click('#replaceOne');
  assert.equal(await countOf('export'), total - 1, 'Replace changes one match');
  assert.equal(await countOf('ZZQRPLC'), 1);
  await page.click('#replaceAll');
  assert.equal(await countOf('export'), 0, 'Replace all changes the rest, in any capital letters');
  assert.equal(await countOf('ZZQRPLC'), total);
  await page.click('#undoBtn');
  assert.equal(await countOf('ZZQRPLC'), 1, 'one undo takes back all of Replace all');
  await page.click('#undoBtn');
  assert.equal(await countOf('ZZQRPLC'), 0, 'and one more takes back the single Replace');
  assert.equal(await countOf('export'), total);
});

test('Replace never loops on text that contains what it searched for', async () => {
  const page = await openApp();
  await page.click('#fabToggle');
  await page.click('#editBtn');
  await page.click('[data-panel="search"]');
  const have = () => page.evaluate(() => doc.msgs.reduce((n, m) => n + (m.text.match(/exports/gi) || []).length, 0));
  const before = await have();
  await page.fill('#searchInput', 'export');
  await page.waitForFunction(() => /\(\d+\)/.test(document.getElementById('replaceAll').textContent));
  await page.fill('#replaceInput', 'exports');
  for (let k = 0; k < 3; k++) await page.click('#replaceOne');
  assert.equal(await have(), before + 3, 'three clicks replace three different matches');
});

test('Whole word leaves longer words alone, in the highlights and in Replace', async () => {
  const page = await openApp();
  await page.click('#fabToggle');
  await page.click('#editBtn');
  await page.click('[data-panel="search"]');
  const count = (re) => page.evaluate((src) => doc.msgs.reduce((n, m) => n + (m.text.match(new RegExp(src, 'giu')) || []).length, 0), re);
  const WORD = '(?<![\\p{L}\\p{N}_])export(?![\\p{L}\\p{N}_])';
  const any = await count('export'), whole = await count(WORD);
  assert.ok(whole > 0 && whole < any, 'the guide has "export" on its own and inside longer words');
  await page.fill('#searchInput', 'export');
  await page.waitForFunction((n) => document.getElementById('replaceAll').textContent === 'Replace all (' + n + ')', any);
  await page.check('#wholeWord');
  await page.waitForFunction((n) => document.getElementById('replaceAll').textContent === 'Replace all (' + n + ')', whole);
  assert.equal(await page.locator('mark.hit').count(), whole, 'the highlights follow it too, when every match is on screen');
  await page.fill('#replaceInput', 'ZZQRPLC');
  await page.click('#replaceAll');
  assert.equal(await count('ZZQRPLC'), whole);
  assert.equal(await count('export'), any - whole, 'words such as exported are kept');
  await page.uncheck('#wholeWord');
  await page.waitForFunction((n) => document.getElementById('replaceAll').textContent === 'Replace all (' + n + ')', any - whole);
});

test('Search says so when a match is only in the Markdown text, such as **Export** with its bold marks', async () => {
  const page = await openApp();
  await page.click('#fabToggle');
  await page.click('#editBtn');
  await page.click('[data-panel="search"]');
  await page.fill('#searchInput', '**Export**');
  await page.waitForFunction(() => /Markdown text/.test(document.getElementById('searchCount').textContent));
  assert.match(await page.textContent('#searchCount'), /^Nothing to highlight, but 1 in the Markdown text/);
  assert.equal(await page.textContent('#replaceAll'), 'Replace all (1)');
  await page.fill('#searchInput', '**--');
  await page.waitForFunction(() => document.getElementById('searchCount').textContent === 'No matches');
});

test('a speaker name alone on a line is refused by Replace, Replace all and the message editor, and ordinary text still goes through', async () => {
  const page = await openApp();
  const ok = await page.evaluate(() => doc.msgs.every((m) => readsBackSame(m.text)));
  assert.ok(ok, 'every message in the guide reads back correctly, so nothing is blocked by mistake');
  assert.equal(await page.evaluate(() => wouldBreakSave('Zthx', '**You:**')), true);
  assert.equal(await page.evaluate(() => wouldBreakSave('Zthx', 'Thanks **You:** hi there')), false, 'a name in the middle of a line is fine');
  assert.equal(await page.evaluate(() => wouldBreakSave('Zthx', '**You:** hi')), true, 'but one at the start of a line is blocked, because the reader takes it for a new speaker');
  assert.equal(await page.evaluate(() => wouldBreakSave('Zthx', 'Dear **bold** friend\n\n- one\n- two')), false);
  await page.click('#fabToggle');
  await page.click('#editBtn');
  await page.evaluate(() => { doc.msgs[1].text = 'Zthx'; doc.msgs[3].text = 'Say Zthx please'; render(); });
  await page.click('[data-panel="search"]');
  await page.fill('#searchInput', 'Zthx');
  await page.waitForFunction(() => document.getElementById('replaceAll').textContent === 'Replace all (2)');
  await page.fill('#replaceInput', '**You:**');
  await page.click('#replaceAll');
  assert.equal(await page.evaluate(() => doc.msgs[1].text), 'Zthx', 'the one-word message is left alone');
  assert.equal(await page.evaluate(() => doc.msgs[3].text), 'Say **You:** please', 'the other is changed, since the name is not at the start of a line');
  assert.match(await page.textContent('#toastMsg'), /1 left alone/);
  await page.click('#undoBtn');
  await page.fill('#searchInput', 'Zthx');
  await page.click('#replaceOne');
  await page.click('#replaceOne');
  assert.equal(await page.evaluate(() => doc.msgs[1].text), 'Zthx', 'Replace refuses it too');
  assert.match(await page.textContent('#toastMsg'), /speaker name/);
  const md = await page.evaluate(() => toMarkdown());
  assert.equal(await page.evaluate((m) => parseChat(m).msgs.length, md), 30, 'so the saved copy still has all 30 messages');
});

test('the message editor keeps your text open and explains when it would leave a speaker name on a line of its own', async () => {
  const page = await openApp();
  await page.click('#fabToggle');
  await page.click('#editBtn');
  await page.click('.row >> nth=0 >> .bubble');
  await page.click('text=Edit text');
  await page.fill('#editArea', 'Hello\n**You:**\nthere');
  await page.click('[data-act="save"]');
  assert.ok(await page.locator('#editArea').isVisible(), 'the editor stays open, so nothing typed is lost');
  assert.equal(await page.evaluate(() => doc.msgs[0].text), 'How do I use this markdown reader?', 'the message is unchanged');
  assert.match(await page.textContent('#toastMsg'), /speaker name/);
  await page.fill('#editArea', 'Hello **You:** there');
  await page.click('[data-act="save"]');
  assert.equal(await page.evaluate(() => doc.msgs[0].text), 'Hello **You:** there', 'a name inside a line is fine');
});

test('the suggested file name follows the chat title, and a name you chose is kept only for that title', async () => {
  const page = await openApp();
  await page.click('#fabToggle');
  await page.click('#editBtn');
  const suggested = async () => {
    await page.click('#dlBtn');
    const v = await page.inputValue('#modal input');
    await page.click('#modalCancel');
    return v;
  };
  assert.equal(await suggested(), 'how-to-use-markdown-chat-reader-edited');
  await page.evaluate(() => { doc.title = 'My Trip to Rome'; render(); });
  assert.equal(await suggested(), 'my-trip-to-rome-edited', 'a renamed chat suggests its new title');
  await page.click('#dlBtn');
  await page.fill('#modal input', 'rome-final');
  await page.click('#modalOk');
  assert.equal(await suggested(), 'rome-final', 'the name you chose is offered again for the same title');
  await page.evaluate(() => { doc.title = 'My Trip to Paris'; render(); });
  assert.equal(await suggested(), 'my-trip-to-paris-edited', 'but not after the title changes');
});

test('the top-right menu can hide and show the floating tools and arrows, and remembers it', async () => {
  const page = await openApp();
  const hidden = (sel) => page.evaluate((s) => getComputedStyle(document.querySelector(s)).display === 'none', sel);
  assert.equal(await hidden('#fabs'), false);
  assert.equal(await hidden('#navFabs'), false);
  await page.click('#menuBtn');
  assert.equal(await page.textContent('#hideToolsBtn b'), 'Hide the tools');
  await page.click('#hideToolsBtn');
  assert.equal(await hidden('#fabs'), true, 'the tools are gone');
  assert.equal(await hidden('#navFabs'), false, 'the arrows stay');
  await page.click('#menuBtn');
  assert.equal(await page.textContent('#hideToolsBtn b'), 'Show the tools');
  await page.click('#hideArrowsBtn');
  assert.equal(await hidden('#navFabs'), true, 'now the arrows are gone too');
  await page.reload();
  await page.waitForFunction(() => window.doc && doc.msgs.length > 0);
  assert.equal(await hidden('#fabs'), true, 'both stay hidden after a reload');
  assert.equal(await hidden('#navFabs'), true);
  await page.click('#menuBtn');
  await page.click('#hideToolsBtn');
  await page.click('#menuBtn');
  await page.click('#hideArrowsBtn');
  assert.equal(await hidden('#fabs'), false, 'and the menu brings them back');
  assert.equal(await hidden('#navFabs'), false);
});
