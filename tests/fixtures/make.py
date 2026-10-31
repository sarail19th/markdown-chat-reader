"""Builds the made-up exports the tests open. Run it again after changing it:  python3 tests/fixtures/make.py
None of this is real chat data."""
import json, os, zipfile

HERE = os.path.dirname(os.path.abspath(__file__))


def write_zip(name, files):
    with zipfile.ZipFile(os.path.join(HERE, name), "w", zipfile.ZIP_DEFLATED) as z:
        for path, data in files.items():
            info = zipfile.ZipInfo(path, (2025, 1, 1, 0, 0, 0))  # fixed date, so the file only changes when its content does
            info.compress_type = zipfile.ZIP_DEFLATED
            z.writestr(info, data if isinstance(data, str) else json.dumps(data, indent=1))


# ChatGPT: each chat is a tree of messages; current_node is the version the person last saw.
def gpt_chat(cid, title, when, turns, extra=None):
    mapping, prev = {"root": {"id": "root", "message": None, "parent": None}}, "root"
    for i, (role, part, ctype) in enumerate(turns):
        nid = f"{cid}-n{i}"
        mapping[nid] = {"id": nid, "parent": prev, "message": {
            "author": {"role": role}, "content": {"content_type": ctype, "parts": [part]}, "metadata": {}}}
        prev = nid
    mapping.update(extra or {})
    return {"conversation_id": cid, "title": title, "create_time": when, "current_node": prev, "mapping": mapping}


write_zip("chatgpt-export.zip", {
    "conversations.json": [
        gpt_chat("gpt-0001", "[Travel] Packing list", 1736900000, [
            ("user", "What should I pack for three days?", "text"),
            ("assistant", "Layers, an umbrella and comfy shoes.", "text"),
            ("user", "And for the train?", "text"),
            ("assistant", "Snacks and a book. citeturn0search0", "text"),
        ], extra={  # a regenerated reply that is not on the current path, so it must not appear
            "gpt-0001-alt": {"id": "gpt-0001-alt", "parent": "gpt-0001-n0", "message": {
                "author": {"role": "assistant"}, "content": {"content_type": "text", "parts": ["OLD REPLY"]}, "metadata": {}}}}),
        gpt_chat("gpt-0002", "[Travel] Rainy day plans", 1737000000, [
            ("user", "Ideas for a rainy afternoon?", "text"),
            ("assistant", "hidden thinking", "thoughts"),
            ("assistant", "A museum, then a cafe.", "text"),
        ]),
        gpt_chat("gpt-0003", "Birthday message", 1735000000, [
            ("user", "Help me write a birthday card.", "text"),
            ("assistant", "Happy birthday! Wishing you a bright year.", "text"),
        ]),
    ],
    "conversation_asset_file_names.json": {},
})


# Claude: chat_messages with sender human or assistant. Some real exports leave the text of messages empty.
def claude_msg(sender, text, thinking=False):
    content = ([{"type": "thinking", "thinking": "SECRET THOUGHTS"}] if thinking else []) + ([{"type": "text", "text": text}] if text else [])
    return {"uuid": "m", "sender": sender, "text": text, "content": content, "attachments": [], "files": []}


write_zip("claude-export.zip", {
    "conversations.json": [
        {"uuid": "cl-0001", "name": "[Garden] Tomato care", "created_at": "2025-05-02T10:00:00Z",
         "chat_messages": [claude_msg("human", "Why are the leaves yellow?"), claude_msg("assistant", "Usually too much water.", thinking=True)]},
        {"uuid": "cl-0002", "name": "Weekend plans", "created_at": "2025-05-01T10:00:00Z",
         "chat_messages": [claude_msg("human", "Any ideas?"), claude_msg("assistant", "")]},
        {"uuid": "cl-0003", "name": "", "created_at": "2025-04-01T10:00:00Z",
         "chat_messages": [claude_msg("human", ""), claude_msg("assistant", "")]},
        {"uuid": "cl-0004", "name": "", "created_at": "2025-04-02T10:00:00Z",
         "chat_messages": [claude_msg("human", ""), claude_msg("assistant", "")]},
    ],
})

# Claude's newer export starts as a list of download links; the chats are in conversations-000.zip.
with open(os.path.join(HERE, "claude-manifest.json"), "w") as f:
    json.dump({"total_files": 2, "data_files": [
        {"category": "frames", "filename": "frames-000.zip", "export_url": "https://example.invalid/1"},
        {"category": "conversations", "filename": "conversations-000.zip", "export_url": "https://example.invalid/2"}]}, f, indent=1)

# frames-000.zip holds artifacts, not chats.
write_zip("frames-000.zip", {
    "artifacts/aaaa1111-2222-3333-4444-555566667777/artifact.json": {"id": "a1", "kind": "page", "versions": ["v1"]},
    "artifacts/aaaa1111-2222-3333-4444-555566667777/versions/1-a1/index.html": "<h1>An artifact</h1>",
})
print("fixtures written")
