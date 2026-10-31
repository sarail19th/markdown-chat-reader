# How to use Markdown Chat Reader

**You:**
How do I use this markdown reader?

---

**AI:**
It shows an exported AI chat as a phone-style chat: your messages on the **right**, the AI's on the **left**, like this.

1. **Export** your chats from your AI app.
2. **Open** the export here (ChatGPT, Claude), or **convert** it to `.md` with an AI (other apps).
3. **Read** your chats, and keep the `.md` files as a backup.

Ask me about any step below.

---

**You:**
How do I export my chats from ChatGPT, Claude, Grok, Copilot or Gemini?

---

**AI:**
Most apps email you a download link, which often expires after about a day.

- **ChatGPT:** Settings, Data controls, Export data.
- **Claude:** you can't request it in the Claude phone app. Use a browser on your computer or phone: Settings, Privacy, **Export data**. You get a second email when it is ready: open its link while logged in to the same account, and download **conversations-000.zip**, the file with your chats. Some Claude exports leave out the text of many messages; the reader marks those, and the one-chat prompt below gets a full copy.
- **Grok:** Settings, Data controls, Export account data, then **Download account data** on your x.ai account page. For Grok inside X, use the one-chat prompt below.
- **Copilot:** Microsoft privacy dashboard, Copilot, **Export all activity history** (a `.csv`).
- **Gemini:** no export this reader opens. Use the one-chat prompt below.

---

**You:**
I have the export file. What do I do with it?

---

**AI:**
**ChatGPT or Claude:** tap **Open** and pick the `.zip` as you downloaded it (or the `conversations.json` inside). A list of its chats appears: tap one to read it, use **Move to folder** to sort them, and **Download .zip** to save one `.md` file per chat, in folders, for Google Drive. No AI, nothing uploaded, every word kept.

**Other apps:** upload the export to an AI assistant you trust and paste this prompt. This sends your export to that assistant.

```text
Convert this AI chat export into Markdown files, one .md file per chat. Name each file with the chat's date and title, for example 2025-03-14 Packing list.md. Start each file with the chat title as a # heading, then label every message on its own line as **You:** or **AI:**, with a blank line between messages. Copy every message word for word: do not summarize, shorten or skip anything, and leave out hidden reasoning or thinking notes. Keep code blocks, lists and tables as they are.

The export may not say which project a chat was in. If I list projects below, put each chat in a folder named after its project, and the rest in a folder called No project. If I do not, suggest folders from the chat titles and show me the list before you convert.

Give me all files in one zip. If the export is too large for one reply, first list every chat with its date and title, then convert 10 chats at a time and wait until I say next.

Projects (optional, delete if not needed):
- Project name: chat titles, or words that appear in them
```

On a free plan, convert 10 chats at a time, and check that long chats came back whole.

---

**You:**
Why Markdown? Why not read the export file itself?

---

**AI:**
An export is data for computers, with every chat in one file. A `.md` file is plain text: Google Drive or any notes app shows it as it is, one chat per file, in folders you choose. And this reader opens it the same way whichever AI it came from.

---

**You:**
My chats were in projects. Why are they all mixed together?

---

**AI:**
ChatGPT's export leaves out project names. Before you export, start each chat's title with its project, like *[Travel] Packing list*, and it lands in the folder Travel here. Or sort chats with **Move to folder**, and turn on **Remember my folders** so your next export opens sorted.

---

**You:**
My app has no export, or only exports everything. Can I export just one chat?

---

**AI:**
Yes. Open the chat in any AI, paste this prompt, and save what you get. Open all the parts at once to read them as one chat.

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

The AI rewrites the chat from memory, so skim it against the original.

---

**You:**
Okay, I have the .md files on my phone. How do I open one?

---

**AI:**
Tap **Open** and pick a `.md` file, or a backup `.zip` to get its list of chats back. You can also use **Paste**, or drop a file on the page on a computer.

If a chat came in several parts, select them all at once: drag them into reading order, name the chat and tap **Merge files**.

---

**You:**
What can I do once a chat is open?

---

**AI:**
| Floating button | What it does |
|---|---|
| <svg class="gi" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg> **Open** | Opens a `.md` file, a backup `.zip`, or a ChatGPT or Claude export. |
| <svg class="gi" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h4v14H4zM10 5h4v14h-4z"/><path d="M16.5 5.6l3.8-1 3.2 13.5-3.8 1z" transform="translate(-2.2 .6)"/></svg> **Chats in this export** | Brings back the list of chats after you open an export. |
| <svg class="gi" viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="5" width="12" height="16" rx="2"/><path d="M9 5V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1M9 11h6M9 15h4"/></svg> **Paste** | Paste chat text (or press Ctrl+V on a computer). |
| <svg class="gi" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6"/><path d="M20 20l-4.5-4.5"/></svg> **Search** | Finds text in the chat. |
| **Scroll handle** | On a touch screen, drag the handle on the right edge to move through a long chat fast. |
| <svg class="gi" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 7l4-4 4 4"/><path d="M6 10h12a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-6l-3 2.5V19H6a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2z"/></svg> <svg class="gi" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 2.5h12a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-6l-3 2.5V11.5H6a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2z"/><path d="M8 17l4 4 4-4"/></svg> **Previous / next message** | Moves one message up or down. |
| <svg class="gi" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 15l6-6 6 6"/><path d="M6 5h12"/></svg> <svg class="gi" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/><path d="M6 19h12"/></svg> **Up or down arrow** | Jumps to the end, or back to the start. |
| <svg class="gi" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20l4-1 11-11a2.1 2.1 0 0 0-3-3L5 16z"/><path d="M14 7l3 3"/></svg> **Edit** | Change, delete, re-side or split messages. |
| <svg class="gi" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a9 9 0 1 0 0 18c1.2 0 2-.8 2-1.8 0-1-.7-1.4-.7-2.2 0-.8.7-1.5 1.6-1.5H17a4 4 0 0 0 4-4C21 6.9 17 3 12 3z"/><circle cx="7.5" cy="11" r="1" fill="currentColor" stroke="none"/><circle cx="10" cy="7" r="1" fill="currentColor" stroke="none"/><circle cx="15" cy="7.5" r="1" fill="currentColor" stroke="none"/></svg> **Style** | Colours, mode, text size, spacing and font. |
| <svg class="gi" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.6 2.3c-.8.4-1.1 1-1.1 1.7"/><circle cx="12" cy="17" r=".7" fill="currentColor" stroke="none"/></svg> **Help** | The steps, and what happens to your file. |

The round button (<svg class="gi" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14M5 12h14M5 17h14"/></svg>) folds and unfolds the menu. Drag it to move the menu; **Reset all settings** in Style puts it back. Every code block has a **Copy** button.

---

**You:**
Tell me more about Edit. Does it change my original file?

---

**AI:**
No, your original file never changes. Turn on **Edit** and tap a message to:

- change its text, with **B**, **I**, **S**, **H** and **Clear style** to fix formatting,
- delete it, or **Swap side** if the speaker is wrong,
- **Split speaker** when one message holds both speakers' words,
- **Split after this** to save a long chat as two files, or **Excerpt only** to save just some messages.

The pencil beside the title renames the chat. At the bottom: <svg class="gi" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 14 4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/></svg> **Undo**, <svg class="gi" viewBox="0 0 24 24" aria-hidden="true"><path d="M15 14l5-5-5-5"/><path d="M20 9H10a6 6 0 0 0 0 12h3"/></svg> **Redo**, <svg class="gi" viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"/></svg> **Copy**, <svg class="gi" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12M7 10l5 5 5-5"/><path d="M4 15v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4"/></svg> **Download** a new `.md` copy, and <svg class="gi" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3"/><path d="M16 8l4 4-4 4M20 12H9"/></svg> **Exit editing**. Saved copies say they were edited. Please only edit your own chats, and don't present an edited chat as an original.

---

**You:**
I use AI to write fanfiction and story collections. How do I use this?

---

**AI:**
Use **Edit** to cut a long story chat into files:

1. **Set the setup aside.** Tap the last message of your setup prompt, tap **Split after this**, and save part 1.
2. **Take a scene out.** Tap the message just before the scene, tap **Split after this**, switch to **Excerpt only**, pick where it ends (the list shows your next prompts), name it, and tap **Download excerpt**.
3. **Repeat** for each scene. Your open chat doesn't change.

Saved files say they are an excerpt, so a trimmed chat is never mistaken for the whole conversation.

---

**You:**
How do I change how it looks?

---

**AI:**
Open **Style**:

| Setting | Choices |
|---|---|
| Chat style | Classic, White and seven soft colours, Lavender by default |
| Mode | Auto, Light, Dark or Green Read (recycled-paper tones) |
| Background | Plain, or Tinted with your chat colour (Light mode) |
| Text size, spacing | Sliders |
| Long messages | Show full, or Collapse to 12 lines with **Show more** |
| Font | Figtree, your device font, or a font file you add |

Your choices are remembered on this device only.

---

**You:**
My chat shows as one big message. Why didn't the speakers split?

---

**AI:**
The reader looks for speaker lines like `**You:**`, `**AI:**`, `### User` or `You said:`, each on its own line. If it finds none, it shows the file as one message. Fix the labels, or convert again with the prompt above.

---

**You:**
Is my chat uploaded or saved anywhere?

---

**AI:**
No. Files and exports are read inside your browser, and this page has no server. Chats are never saved: reload and they're gone. Only your display choices are remembered on this device, plus chat ID codes and folder names if you turn on **Remember my folders**.

---

**You:**
Can I install it on my phone?

---

**AI:**
Yes, and then it works offline.

- **Android:** in Chrome, menu (⋮), **Install app**. Then **Share** a `.md` file or an export to **Chat Reader** from your Files app. Not in the list? Reinstall once.
- **iPhone:** in Safari, **Share**, **Add to Home Screen**, **Add**. Leave **Open as Web App** on.

---

**You:**
Thanks. I'm ready to try it with my own chat.

---

**AI:**
Tap **Open** or **Paste** to replace this sample. Happy reading!
