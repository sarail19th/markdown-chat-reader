// Fast checks of how .md text is split into messages. No browser needed.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { loadParser, ROOT } = require('./helpers');

const { parseChat } = loadParser();

test('the guide chat has 30 messages that alternate You and AI', () => {
  const chat = parseChat(fs.readFileSync(path.join(ROOT, 'sample.md'), 'utf8'));
  assert.equal(chat.msgs.length, 30);
  chat.msgs.forEach((m, i) => assert.equal(m.role, i % 2 ? 'assistant' : 'user'));
});

test('common speaker labels are recognised', () => {
  const chat = parseChat('### User\nHello\n\n### Assistant\nHi there');
  assert.deepEqual(chat.msgs.map((m) => m.role), ['user', 'assistant']);
  assert.equal(chat.msgs[1].text, 'Hi there');
});

test('in a converted file, story dialogue such as **Mira:** stays inside its message', () => {
  const text = [
    '# A story', '', '> Converted with Markdown Chat Reader from a ChatGPT export.', '',
    '**You:**', 'Write a scene.', '', '---', '',
    '**AI:**', '**Mira:**', 'We should go.', '', '**User:**', 'Not yet.', '',
  ].join('\n');
  const chat = parseChat(text);
  assert.equal(chat.msgs.length, 2);
  assert.match(chat.msgs[1].text, /\*\*Mira:\*\*[\s\S]*\*\*User:\*\*/);
});

test('a file with no speaker labels gives no messages', () => {
  assert.equal(parseChat('Just some notes.\nNo speakers here.').msgs.length, 0);
});
