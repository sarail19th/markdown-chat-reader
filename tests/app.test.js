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

test('the navigation buttons can be dragged on their own, and stay where you put them', async () => {
  const page = await openApp();
  const box = () => page.locator('#navToggle').boundingBox();
  const start = await box();
  await page.mouse.move(start.x + 26, start.y + 26);
  await page.mouse.down();
  await page.mouse.move(150, 300, { steps: 8 });
  await page.mouse.up();
  const moved = await box();
  assert.ok(Math.abs(moved.x + 26 - 150) < 4 && Math.abs(moved.y + 26 - 300) < 4, 'the button follows the finger');
  assert.ok(await page.locator('#navMenu').isVisible(), 'dragging does not fold the navigation buttons');
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

test('the top-right menu has switches that hide and show the floating tools and navigation, and remembers them', async () => {
  const page = await openApp();
  const hidden = (sel) => page.evaluate((s) => getComputedStyle(document.querySelector(s)).display === 'none', sel);
  const on = (id) => page.getAttribute(id, 'aria-checked');
  assert.equal(await hidden('#fabs'), false);
  assert.equal(await hidden('#navFabs'), false);
  await page.click('#menuBtn');
  assert.equal(await on('#hideToolsBtn'), 'true', 'both switches start on');
  assert.equal(await on('#hideArrowsBtn'), 'true');
  await page.click('#hideToolsBtn');
  assert.equal(await hidden('#fabs'), true, 'switching the tools off hides them');
  assert.equal(await hidden('#navFabs'), false, 'navigation stays');
  assert.ok(await page.locator('#topMenu').isVisible(), 'the menu stays open so the other switch can be set');
  await page.click('#hideArrowsBtn');
  assert.equal(await hidden('#navFabs'), true, 'now navigation is gone too');
  assert.equal(await on('#hideToolsBtn'), 'false');
  assert.equal(await on('#hideArrowsBtn'), 'false');
  await page.reload();
  await page.waitForFunction(() => window.doc && doc.msgs.length > 0);
  assert.equal(await hidden('#fabs'), true, 'both stay hidden after a reload');
  assert.equal(await hidden('#navFabs'), true);
  await page.click('#menuBtn');
  assert.equal(await on('#hideToolsBtn'), 'false', 'and the switches show it');
  await page.click('#hideToolsBtn');
  await page.click('#hideArrowsBtn');
  assert.equal(await hidden('#fabs'), false, 'switching them on brings them back');
  assert.equal(await hidden('#navFabs'), false);
});

test('the kebab menu button stays on screen while you read, and still opens the menu', async () => {
  const page = await openApp();
  const box = () => page.locator('#menuBtn').boundingBox();
  const top = await box();
  await page.evaluate(() => window.scrollTo(0, 1500));
  await page.waitForFunction(() => document.body.classList.contains('scrolled'));
  const later = await box();
  assert.deepEqual([Math.round(later.x), Math.round(later.y)], [Math.round(top.x), Math.round(top.y)], 'it has not moved, even far down the chat');
  await page.click('#menuBtn');
  assert.ok(await page.locator('#topMenu').isVisible(), 'and the menu opens from there');
  assert.ok(await page.locator('#hideToolsBtn').isVisible());
});

test('unsaved edits show a Save button in the tools and a dot on the folded round button, and saving clears them', async () => {
  const page = await openApp();
  const shown = (sel) => page.evaluate((s) => getComputedStyle(document.querySelector(s)).display !== 'none', sel);
  assert.equal(await shown('#saveFabBtn'), false, 'nothing to save yet, so no Save button');
  await page.click('#fabToggle');
  await page.click('#editBtn');
  await page.evaluate(() => { mutate(function () { doc.msgs[0].text = 'Changed text'; }); });
  assert.equal(await shown('#saveFabBtn'), true, 'the Save button appears with the first change');
  await page.click('#doneBtn');
  assert.equal(await shown('#saveFabBtn'), true, 'and is still there after exiting Edit mode');
  assert.match(await page.textContent('#toastMsg'), /not saved yet/);
  assert.equal(await page.textContent('#toastAct'), 'Save copy', 'the note after exiting offers to save');
  await page.click('#fabToggle');
  assert.equal(await page.evaluate(() => getComputedStyle(document.querySelector('#fabToggle .badge')).display), 'block', 'a dot shows on the folded round button');
  assert.match(await page.getAttribute('#fabToggle', 'aria-label'), /unsaved edits/);
  await page.click('#fabToggle');
  await page.click('#saveFabBtn');
  assert.ok(await page.locator('#modal input').isVisible(), 'Save asks for a file name');
  const download = page.waitForEvent('download');
  await page.click('#modalOk');
  await download;
  assert.equal(await shown('#saveFabBtn'), false, 'after saving there is nothing left to save');
  await page.click('#fabToggle');
  assert.equal(await page.evaluate(() => getComputedStyle(document.querySelector('#fabToggle .badge')).display), 'none', 'and the dot is gone');
});

test('the note after exiting Edit mode has a Save copy button that opens the save box', async () => {
  const page = await openApp();
  await page.click('#fabToggle');
  await page.click('#editBtn');
  await page.evaluate(() => { mutate(function () { doc.msgs[0].text = 'Changed text'; }); });
  await page.click('#doneBtn');
  await page.click('#toastAct');
  assert.ok(await page.locator('#modal input').isVisible(), 'Save copy opens the file name box');
  await page.click('#modalCancel');
  await page.click('#editBtn');
  await page.click('#undoBtn');
  await page.click('#doneBtn');
  assert.ok(await page.locator('#toast').isHidden(), 'no reminder when there is nothing unsaved');
});

test('the + and x buttons on a notice fit inside it, folded or open', async () => {
  const page = await openApp();
  await page.click('#fabToggle');
  await page.click('#editBtn');
  await page.evaluate(() => { mutate(function () { doc.msgs[0].text = 'Changed text'; }); });
  const fits = () => page.evaluate(() => {
    const n = document.getElementById('editedBanner').getBoundingClientRect(), b = document.querySelector('#editedBanner .nx').getBoundingClientRect();
    return b.top >= n.top && b.bottom <= n.bottom && b.right <= n.right;
  });
  assert.ok(await fits(), 'the button fits in the open notice');
  await page.click('#editedBanner .nx');
  assert.ok(await page.evaluate(() => document.getElementById('editedBanner').classList.contains('collapsed')), 'the notice folds to one line');
  assert.ok(await fits(), 'and the + still fits inside the folded notice');
});

test('Quote turns lines into a quote block and back, and Heading is spelled out', async () => {
  const page = await openApp();
  const q = (text, s, e) => page.evaluate(([t, a, b]) => { const r = toggleQuoteRange(t, a, b); return t.slice(0, r.start) + r.out + t.slice(r.end); }, [text, s, e]);
  assert.equal(await q('Hello', 2, 2), '> Hello', 'the line with the cursor becomes a quote');
  assert.equal(await q('> Hello', 3, 3), 'Hello', 'and goes back');
  assert.equal(await q('one\n\ntwo', 0, 8), '> one\n>\n> two', 'several paragraphs stay one block');
  assert.equal(await q('> one\n>\n> two', 0, 13), 'one\n\ntwo', 'and come back exactly');
  assert.equal(await q('intro\nline a\nline b\noutro', 6, 19), 'intro\n> line a\n> line b\noutro', 'only the touched lines change');
  assert.equal(await q('', 0, 0), '> ', 'an empty line starts a quote');
  await page.click('#fabToggle');
  await page.click('#editBtn');
  await page.click('.row >> nth=0 >> .bubble');
  await page.click('text=Edit text');
  assert.equal(await page.textContent('.stylebtn[data-style="heading"]'), 'Heading', 'the heading button says what it is');
  await page.fill('#editArea', 'A quoted line');
  await page.click('.stylebtn[data-style="quote"]');
  assert.equal(await page.inputValue('#editArea'), '> A quoted line');
  await page.click('[data-act="save"]');
  assert.equal(await page.locator('.row >> nth=0 >> blockquote').count(), 1, 'it shows as a quote with a bar at the side');
});

test('tapping a message shows a copy icon, and tapping the icon copies it as formatted text and as Markdown', async () => {
  const context = await browser.newContext({ serviceWorkers: 'block', permissions: ['clipboard-read', 'clipboard-write'] });
  const page = await context.newPage();
  await page.goto(server.url);
  await page.waitForFunction(() => window.doc && doc.msgs.length > 0);
  const row = page.locator('.row[data-i="2"]');
  assert.equal(await page.locator('.copytab').count(), 0, 'no icon until you tap');
  await row.locator('.bubble').click({ position: { x: 20, y: 10 } });
  assert.equal(await page.locator('.copytab').count(), 1, 'a tap shows one copy icon');
  assert.ok(await page.locator('#toast').isHidden(), 'and nothing is copied yet');
  await page.locator('.copytab button').click();
  await page.waitForFunction(() => document.getElementById('toastMsg').textContent === 'Copied'); // the copy is finished once this shows
  const clip = await page.evaluate(async () => {
    const items = await navigator.clipboard.read(), out = {};
    for (const t of items[0].types) out[t] = await (await items[0].getType(t)).text();
    return out;
  });
  const md = await page.evaluate(() => doc.msgs[2].text);
  assert.equal(clip['text/plain'], md, 'plain-text boxes get the Markdown');
  assert.match(clip['text/html'], /<strong>Export<\/strong>|<li>|<p>/, 'Word, Docs and Notes get formatted text');
  assert.equal(await page.textContent('#toastMsg'), 'Copied');
  assert.ok(await page.locator('.copytab button.done').count() === 1, 'the icon turns into a tick');
  await row.locator('.bubble').click({ position: { x: 20, y: 10 } });
  assert.equal(await page.locator('.copytab').count(), 0, 'tapping the message again hides the icon');
  await row.locator('.bubble').click({ position: { x: 20, y: 10 } });
  await page.locator('h1').click();
  assert.equal(await page.locator('.copytab').count(), 0, 'tapping elsewhere hides it too');
  await row.locator('.bubble').click({ position: { x: 20, y: 10 } });
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('.copytab').count(), 0, 'and so does Escape');
  await context.close();
});

test('selecting text does not pop up the copy icon, and Edit mode has Copy in its message menu', async () => {
  const page = await openApp();
  await page.evaluate(() => { const b = document.querySelector('.row[data-i="2"] .bubble p'); const r = document.createRange(); r.selectNodeContents(b); const s = getSelection(); s.removeAllRanges(); s.addRange(r); });
  await page.locator('.row[data-i="2"] .bubble').click({ position: { x: 20, y: 10 } });
  assert.equal(await page.locator('.copytab').count(), 0, 'a selection is left alone so you can copy it your own way');
  await page.click('#fabToggle');
  await page.click('#editBtn');
  await page.click('.row >> nth=0 >> .bubble');
  assert.equal(await page.locator('.copytab').count(), 0, 'Edit mode keeps its own menu');
  assert.equal(await page.textContent('.msgmenu button[data-act="copy"]'), 'Copy', 'with Copy at the top');
});
