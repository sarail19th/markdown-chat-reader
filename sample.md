# How to use Markdown Chat Reader

**You:**
How do I use this markdown reader?

---

**AI:**
It turns an exported AI chat into a phone-style chat. Your messages sit on the **right** and the AI's on the **left**, like this one. There are three steps:

1. **Export** your chats from your AI app.
2. **Convert** the export to Markdown (`.md`) with an AI assistant.
3. **Read** the `.md` file here.

Ask me about any step below.

---

**You:**
How do I export my chats from ChatGPT, Claude, Grok, Copilot or Gemini?

---

**AI:**
Most apps have a data export in Settings. The app emails you a download link or gives you a file, usually a `.zip`, `.json` or `.csv`. Links often expire after about a day, and menu names change from time to time.

- **ChatGPT:** profile icon or name, then Settings, Data controls, Export data.
- **Claude:** on the web app or Claude Desktop (not the phone apps), click your initials at the bottom left, then Settings, Privacy, **Export data**. The download link is emailed to you and expires after 24 hours.
- **Grok:** profile icon or name, then Data & Information, Data controls, Export account data. That takes you to your x.ai account page, where you choose **Download account data**. The file is sent by email. This covers chats made in the Grok app, not Grok inside X. For one chat, or Grok in X, use the one-chat prompt further down.
- **Copilot:** sign in to your Microsoft account privacy dashboard, open Copilot, Your Copilot activity history, then **Export all activity history**. You get a `.csv` file.
- **Gemini:** its chat menu only saves a chat as a PDF or Google Doc. This reader does not open those. Use the one-chat prompt further down instead.

---

**You:**
I have the export file. What do I do with it?

---

**AI:**
Upload it to an AI assistant you trust, such as Claude, and paste the prompt below. You get Markdown files back, one per chat or per project, to download.

```text
Convert this AI chat export into Markdown files, one .md file per chat. Group chats by project if the export shows projects. Start each file with the chat title as a # heading, then label every message on its own line as **You:** or **AI:**, with a blank line between messages. Keep code blocks and lists as they are. Give me all files in one zip. If the export is large, start with the 20 most recent chats.
```

Use the **Copy** button on the code block to copy the prompt. This step sends your export to that assistant. This reader never sends anything.

---

**You:**
My app has no export, or only exports everything. Can I export just one chat?

---

**AI:**
Yes, with any AI. Open the chat, paste the prompt below, and save what the AI gives you. Long chats come back in several parts: select them all at once with **Open** and they merge into one chat, or use **Paste** one part at a time.

```text
Export this entire conversation into sequential .md files for an AI chat reader.

Start the first file with the chat title as a # heading. Then format every message exactly like this, with a blank line between messages:

**You:**
(my message)

**AI:**
(your reply)

Rules:
- Copy every message word for word. Do not summarize, shorten or skip anything. If you cannot, tell me instead of cutting it.
- Put **You:** and **AI:** on their own line, with nothing after the colon.
- Keep code blocks, lists and tables as they are.
- If the conversation is long, split it into several files of roughly 80 to 120 lines each (about 3 to 5 A4 pages).
- Cut only at the end of a complete **You:** and **AI:** pair, never in the middle of a message.
- Name the files in order: chat_export_01.md, chat_export_02.md, and so on.
- Give each file as a download if you can. If you cannot make files, give each part as its own code block that I can copy (use four backticks if the text contains code blocks).
- If one reply is not enough for all the parts, give part 1 and wait until I say next.

Do this for the full conversation history of this chat.
```

The AI rewrites the chat from memory, so it is not a true export. Long chats can still come back shortened. Skim the result against the original.

---

**You:**
Okay, I have the .md files on my phone. How do I open one?

---

**AI:**
Tap **Open** in the top bar and pick a file. You can also:

- tap **Paste** and paste the chat text,
- or drop a `.md` file anywhere on the page on a computer.

Opening your own file replaces this sample. If your export came in several parts, select all the files at once in the picker (or drop them together). A window lists them in file name order: drag the dots (or use the arrows) to put them in reading order, name the merged chat, and tap **Merge files**. Download then gives you one merged `.md` file.

---

**You:**
What can I do once a chat is open?

---

**AI:**
| Floating button | What it does |
|---|---|
| <svg class="gi" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg> **Open** | Opens a .md file from your device. |
| <svg class="gi" viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="5" width="12" height="16" rx="2"/><path d="M9 5V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1M9 11h6M9 15h4"/></svg> **Paste** | Opens a box for pasted text. On a computer, pressing Ctrl+V anywhere on the page does the same. |
| <svg class="gi" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6"/><path d="M20 20l-4.5-4.5"/></svg> **Search** | Finds text in the chat. Use the arrows to jump between matches. |
| **Scroll handle** | On a touch screen, a handle appears on the right edge while you scroll. Drag it to move through a long chat quickly; a counter shows which message you are at. |
| <svg class="gi" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 7l4-4 4 4"/><path d="M6 10h12a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-6l-3 2.5V19H6a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2z"/></svg> <svg class="gi" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 2.5h12a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-6l-3 2.5V11.5H6a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2z"/><path d="M8 17l4 4 4-4"/></svg> **Previous / next message** | The pair of speech-bubble buttons moves up or down exactly one message per tap. |
| <svg class="gi" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 15l6-6 6 6"/><path d="M6 5h12"/></svg> <svg class="gi" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/><path d="M6 19h12"/></svg> **Up or down arrow** | Jumps to the end of a long chat, or back to the start once you are past the middle. |
| <svg class="gi" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20l4-1 11-11a2.1 2.1 0 0 0-3-3L5 16z"/><path d="M14 7l3 3"/></svg> **Edit** | Tap a message to change its text and style (bold, italic, strikethrough, heading), delete it, swap its side, split it between both speakers or split a long chat into two files. |
| <svg class="gi" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a9 9 0 1 0 0 18c1.2 0 2-.8 2-1.8 0-1-.7-1.4-.7-2.2 0-.8.7-1.5 1.6-1.5H17a4 4 0 0 0 4-4C21 6.9 17 3 12 3z"/><circle cx="7.5" cy="11" r="1" fill="currentColor" stroke="none"/><circle cx="10" cy="7" r="1" fill="currentColor" stroke="none"/><circle cx="15" cy="7.5" r="1" fill="currentColor" stroke="none"/></svg> **Style** | Chat colours, light or dark mode, text size, spacing, font and whether long messages are collapsed. |
| <svg class="gi" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.6 2.3c-.8.4-1.1 1-1.1 1.7"/><circle cx="12" cy="17" r=".7" fill="currentColor" stroke="none"/></svg> **Help** | The full steps and what happens to your file. |

The buttons start folded into one round button (<svg class="gi" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14M5 12h14M5 17h14"/></svg>) at the bottom right. Tap it to show the rest, and tap it again (it now shows <svg class="gi" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>) to fold them. Drag the round button to move the buttons wherever suits you, and the reader remembers the spot. **Reset all settings** in Style puts it back.

Every code block has a **Copy** button.

---

**You:**
Tell me more about Edit. Does it change my original file?

---

**AI:**
No. Your original file is never changed. Turn on **Edit**, tap a message, then:

1. Edit its text. Wrong style from the conversion? Select the words and tap **B** (bold), **I** (italic) or **S** (strikethrough) to switch it on or off, and **H** to turn the selected lines into a heading or back into plain text. **Clear style** removes all bold, italic and strikethrough from the selected paragraphs, or from the whole message if nothing is selected.
2. Delete it.
3. Use **Swap side** to move it to the other speaker, for when a speaker was mixed up.
4. Use **Split speaker** when one message holds both speakers' words. Tap in the text where the other speaker starts, or select the part that is theirs, then tap **Split speaker**. The message becomes separate messages on the correct sides. **Undo** brings it back.
5. Use **Split after this** to cut a very long chat in two. The cut is right after the message you tapped: that message is the last one in part 1, and the next message starts part 2. To start part 2 with a certain message, tap the message just above it. The window shows how each part ends and starts, and saves two new `.md` files named "(part 1)" and "(part 2)" unless you rename them. Your open chat is not changed, and selecting both files in **Open** merges them back into one chat.

While editing, a pencil appears beside the chat title so you can rename the chat.

The icons at the bottom are <svg class="gi" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 14 4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/></svg> **Undo**, <svg class="gi" viewBox="0 0 24 24" aria-hidden="true"><path d="M15 14l5-5-5-5"/><path d="M20 9H10a6 6 0 0 0 0 12h3"/></svg> **Redo**, <svg class="gi" viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"/></svg> **Copy** (the whole chat as Markdown) and <svg class="gi" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12M7 10l5 5 5-5"/><path d="M4 15v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4"/></svg> **Download** (saves a new `.md` copy to your device, and asks you what to call it). <svg class="gi" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3"/><path d="M16 8l4 4-4 4M20 12H9"/></svg> **Exit editing** at the right leaves edit mode and saves a message you still have open. Edited messages show an "edited" tag, and saved copies say they were edited. You can try all of this on this guide chat: nothing is saved, and Download gives you a copy. Please only edit your own chats, for example to remove private details, and do not present an edited chat as a real, original conversation.

---

**You:**
How do I change how it looks?

---

**AI:**
Open **Style**:

| Setting | Choices |
|---|---|
| Chat style | Classic plus ten colours, from Blue to Purple |
| Mode | Auto, Light, Dark or Green Read |
| Text size | A slider from 14 to 28 px |
| Line and paragraph spacing | Sliders |
| Long messages | Show full (the default), or Collapse: messages longer than about 14 lines are shortened to 12 lines, and **Show more** opens one in full. Search opens any message that has a match. |
| Font | Figtree, your device font, or a font file you add |

Green Read uses recycled-paper tones that are easy on the eyes. Your choices are remembered on this device only.

---

**You:**
My chat shows as one big message. Why didn't the speakers split?

---

**AI:**
The reader looks for speaker lines such as `**You:**`, `**AI:**`, `### User`, `### Assistant`, `You said:` or `Prompt:` / `Response:`, with an optional time or model name after them.

If it finds none, it shows the whole file as one message with a notice. Check that each speaker label is on its own line, or run the conversion step again with the prompt above.

---

**You:**
Is my chat uploaded or saved anywhere?

---

**AI:**
No. The file is read inside your browser and this page has no server that could receive it. Your chats are never saved or tracked, so reloading or closing the tab clears the chat.

Only your display choices are remembered, on this device. After your first visit the app's own files stay on your device, so it opens without internet. Your chats are never part of that.

---

**You:**
Can I install it on my phone?

---

**AI:**
Yes. It then opens from its own icon with no address bar, and it works without internet after your first visit.

- **Android:** open this page in Chrome, choose the menu (⋮) and tap **Install app**. The installed app opens full screen with no bars, in portrait or landscape. Swipe in from the top or bottom edge to see the system bars for a moment. Once it is installed, a `.md` file can be opened from your Files app: tap the file, choose **Share**, then **Chat Reader**. If the app is not in the Share list, remove it and install it again once. Android does not let a web app be the default for `.md` files, so this takes one extra tap.
- **iPhone:** open this page in Safari, tap the **Share** button (the square with an arrow pointing up), scroll down and tap **Add to Home Screen**, then tap **Add**. If you see an **Open as Web App** switch, leave it on.

Your chats are still never saved. Installing only keeps the app's own files on your phone.

---

**You:**
Thanks. I'm ready to try it with my own chat.

---

**AI:**
Tap **Open** or **Paste** at the top to replace this sample. Happy reading!
