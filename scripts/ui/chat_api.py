#!/usr/bin/env python3
"""Standalone Chat API Server - no zo_tdm dependencies."""

import json
import os
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse

import httpx

OLLAMA_URL = os.environ.get("OLLAMA_URL", "http://localhost:11434")
DEFAULT_MODEL = os.environ.get("DEFAULT_MODEL", "qwen3-coder:480b-cloud")
PORT = int(os.environ.get("CHAT_PORT", "8300"))

ZO_TDM_SYSTEM_PROMPT = """You are a Zo_Tdm/Tedim language assistant. Zo_Tdm (Tedim) is a Kuki-Chin language spoken in Chin State, Myanmar and parts of India.

Zo_Tdm Grammar:
- Ergative marker: "in" for transitive verb subjects (e.g., "Ken" = "Kei in")
- Word order: OSV (Object-Subject-Verb), e.g., "Laibu ka sim hi" (book I read)
- Verb stems: Stem I (affirmative) vs Stem II (negative)
- Tense markers: "hi" (present), "ta" (past), "ding" (future), "ngei" (perfect)

Common words:
- Hello: Kum
- Thank you: Ka tlung
- Yes: Aw
- No: Ai
- Good: Nung
- Bad: Koh"""


HTML = (
    """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Zo_Tdm Chat</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
            --bg-primary: #0f0f0f;
            --bg-secondary: #1a1a1a;
            --bg-tertiary: #252525;
            --text-primary: #e5e5e5;
            --accent: #10b981;
            --border: #333;
        }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: var(--bg-primary); color: var(--text-primary); height: 100vh; display: flex; flex-direction: column; }
        header { background: var(--bg-secondary); border-bottom: 1px solid var(--border); padding: 1rem; display: flex; justify-content: space-between; align-items: center; }
        h1 { font-size: 1.25rem; font-weight: 600; }
        h1 span { color: var(--accent); }
        #chat-container { flex: 1; overflow-y: auto; padding: 1rem; display: flex; flex-direction: column; gap: 1rem; }
        .message { max-width: 80%; padding: 0.75rem 1rem; border-radius: 12px; line-height: 1.5; white-space: pre-wrap; }
        .message.user { align-self: flex-end; background: var(--accent); color: #fff; border-bottom-right-radius: 4px; }
        .message.assistant { align-self: flex-start; background: var(--bg-secondary); border: 1px solid var(--border); border-bottom-left-radius: 4px; }
        #input-container { background: var(--bg-secondary); border-top: 1px solid var(--border); padding: 1rem; display: flex; gap: 0.75rem; }
        #message-input { flex: 1; background: var(--bg-tertiary); color: var(--text-primary); border: 1px solid var(--border); padding: 0.75rem 1rem; border-radius: 8px; font-size: 1rem; }
        #message-input:focus { outline: none; border-color: var(--accent); }
        #send-btn { background: var(--accent); color: #fff; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 500; cursor: pointer; }
        #send-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    </style>
</head>
<body>
    <header>
        <h1>🤖 <span>Zo_Tdm</span> Chat</h1>
    </header>
    <div id="chat-container"></div>
    <div id="input-container">
        <input id="message-input" placeholder="Type your message..." />
        <button id="send-btn">Send</button>
    </div>
    <script>
        const chatContainer = document.getElementById('chat-container');
        const messageInput = document.getElementById('message-input');
        const sendBtn = document.getElementById('send-btn');
        
        function addMessage(content, role) {
            const div = document.createElement('div');
            div.className = 'message ' + role;
            div.textContent = content;
            chatContainer.appendChild(div);
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }
        
async function sendMessage() {
            const content = messageInput.value.trim();
            if (!content) return;
            messageInput.value = '';
            addMessage(content, 'user');
            sendBtn.disabled = true;
            sendBtn.textContent = '...';
            
            try {
                console.log('Sending:', content);
                const resp = await fetch('/api/chat', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({messages: [{role: 'user', content}], model: '"""
    + DEFAULT_MODEL
    + """'}),
                });
                console.log('Response status:', resp.status);
                if (!resp.ok) {
                    throw new Error('HTTP ' + resp.status);
                }
                const data = await resp.json();
                console.log('Data:', data);
                addMessage(data.message?.content || data.error || 'No response', 'assistant');
            } catch (e) {
                console.error('Error:', e);
                addMessage('Error: ' + e.message, 'assistant');
            }
            sendBtn.disabled = false;
            sendBtn.textContent = 'Send';
            messageInput.focus();
        }
            sendBtn.disabled = false;
            messageInput.focus();
        }
        
        sendBtn.addEventListener('click', sendMessage);
        messageInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') sendMessage(); });
        addMessage('Hello! I\'m your Zo_Tdm language assistant. Ask me about Zo_Tdm/Tedim language!', 'assistant');
    </script>
</body>
</html>"""
)


def build_prompt(messages, system_prompt=ZO_TDM_SYSTEM_PROMPT):
    parts = [f"system\n{system_prompt}\n"]
    for m in messages:
        parts.append(f"{m['role']}\n{m['content']}")
    parts.append("assistant\n")
    return "\n\n".join(parts)


class Handler(BaseHTTPRequestHandler):
    def _set_headers(self, status=200, content_type="text/html"):
        self.send_response(status)
        self.send_header("Content-Type", f"{content_type}; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_OPTIONS(self):
        self._set_headers(200)

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == "/":
            self._set_headers(200, "text/html")
            self.wfile.write(HTML.encode("utf-8"))
        elif parsed.path == "/api/models":
            try:
                resp = httpx.get(f"{OLLAMA_URL}/api/tags", timeout=10)
                data = resp.json()
                models = [{"name": m["name"], "size": m.get("size", 0)} for m in data.get("models", [])]
                self._set_headers(200, "application/json")
                self.wfile.write(json.dumps({"models": models}).encode("utf-8"))
            except Exception as e:
                self._set_headers(500, "application/json")
                self.wfile.write(json.dumps({"error": str(e)}).encode("utf-8"))
        else:
            self._set_headers(404)
            self.wfile.write(b"Not Found")

    def do_POST(self):
        if self.path == "/api/chat":
            length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(length)
            data = json.loads(body.decode("utf-8"))

            messages = data.get("messages", [])
            model = data.get("model", DEFAULT_MODEL)
            prompt = build_prompt(messages)

            try:
                resp = httpx.post(
                    f"{OLLAMA_URL}/api/generate",
                    json={"model": model, "prompt": prompt, "stream": False},
                    timeout=120,
                )
                result = resp.json()
                response = result.get("response", "").strip()

                self._set_headers(200, "application/json")
                self.wfile.write(json.dumps({"message": {"content": response}}).encode("utf-8"))
            except Exception as e:
                self._set_headers(500, "application/json")
                self.wfile.write(json.dumps({"error": str(e)}).encode("utf-8"))
        else:
            self._set_headers(404)
            self.wfile.write(b"Not Found")

    def log_message(self, format, *args):
        print(f"{self.address_string()} - {format % args}")


def main():
    server = HTTPServer(("0.0.0.0", PORT), Handler)
    print(f"🤖 Zo_Tdm Chat API running at http://localhost:{PORT}")
    print(f"   Model: {DEFAULT_MODEL}")
    print(f"   Web UI: http://localhost:{PORT}/")
    print("   API: POST /api/chat")
    server.serve_forever()


if __name__ == "__main__":
    main()
