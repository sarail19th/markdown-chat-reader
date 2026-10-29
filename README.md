# Markdown Chat Reader

Read an exported AI chat as a phone-style chat. Your messages sit on the right and the AI's on the left. It is a single-file web app that runs in your browser, also offline, and installs on your phone like an app.

**Live site:** https://sarail19th.github.io/markdown-chat-reader/

## Your chat stays with you

- The file is read inside your browser. It is never uploaded, and the page has no server that could receive it.
- Chats are never saved or tracked. Reload or close the tab and the chat is gone.
- The only things remembered on your device are your display choices (style, mode, text size, spacing, font and where you moved the buttons). A font file you add stays on your device and is never uploaded.
- After your first visit the app's own files (the page, icons, fonts and two small libraries) stay on your device so it opens without internet. Your chats are never part of that.

## How to use it

1. **Export from your AI app.** Most apps have a data export in Settings. The app usually emails you a download link. The in-app Help panel lists the steps for ChatGPT, Claude, Grok and Copilot.
2. **Convert to Markdown.** Upload the export to an AI assistant you trust and paste the prompt from the in-app Help panel. You get one `.md` file per chat. This step is separate: it sends your export to that assistant. The reader itself never sends anything.
3. **Read here.** Tap the **Open** button in the floating menu, pick a `.md` file, and read it as a chat. You can also drop a file on the page or use **Paste**.

## Features

- Detects speakers in many export formats, including custom names. If it finds no speakers, it shows the whole file as one message with a notice.
- Phone-fit layout with a Classic look plus ten colour themes, Auto, Light and Dark modes, and four text sizes.
- A floating menu at the bottom right, folded to one round button until you tap it (drag that button to move the menu anywhere on screen), with Open, Paste (or press Ctrl+V), Search, a jump arrow (down to the end, or back up to the start), Edit, Style and Help. A copy button on every code block.
- Tap-to-edit: turn on **Edit**, tap a message, then edit its text (with **B**, **I** and **Clear style** buttons to fix wrong bold or italic), swap its speaker or delete it. Undo, then download or copy a new `.md` file. Your original file is never changed.
- Installable and works offline (PWA). On Android, open the page in Chrome and choose **Install app**. On iPhone, open it in Safari, tap **Share**, then **Add to Home Screen**. The installed app opens full screen, in portrait or landscape; swipe in from an edge to show the system bars.

## Edited chats are labeled

Edits are meant for tidying your own chats, for example removing private details. To keep edited chats from passing as originals:

- Edited messages show an "edited" tag, and the page shows an "Edited copy" banner.
- A saved copy starts with a notice and a short summary of what changed.
- The page always shows that it is an unofficial viewer, not an export or screen from any AI company.

Please only edit your own chats, and do not present an edited chat as a real, original conversation.

## What it understands

Speaker lines such as `**You:**`, `**AI:**`, `### User`, `### Assistant`, `You said:` or `Prompt:` / `Response:`, with an optional time or model name after them. A rare extra label inside a long two-speaker chat, such as an in-story line, is treated as part of the message before it.

## Run it locally

No build step. Serve the folder with any static server, for example:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`. Service workers need `localhost` or HTTPS.

## Files

| Path | What it is |
|---|---|
| `index.html` | The app: HTML, CSS and vanilla JavaScript. The parser sits between the `//#parser-start` and `//#parser-end` markers. |
| `sample.md` | The sample chat shown on first load. It explains how to use the reader, in the reader's own chat format. Edit it to change the start screen. |
| `sw.js` | Service worker for offline use. It caches only app files, never chats. |
| `manifest.webmanifest`, `icon-192.png`, `icon-512.png` | Install-as-app support |
| `vendor/` | [marked](https://github.com/markedjs/marked) and [DOMPurify](https://github.com/cure53/DOMPurify), bundled so the app works offline |
| `fonts/` | Figtree and JetBrains Mono (woff2) with their SIL Open Font Licence files |
| `.github/workflows/pages.yml` | Deploys to GitHub Pages on every push to `main` |

## Third-party licences

Bundled libraries and fonts keep their own licences. The font licences are in `fonts/`. See the marked and DOMPurify projects for theirs.
