#!/usr/bin/env node
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8300;
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const DEFAULT_MODEL = process.env.DEFAULT_MODEL || 'qwen3-coder:480b-cloud';

// System prompt - IMPORTANT: We use YOUR data, not guessed answers
const ZOLAI_SYSTEM_PROMPT = `You are a helpful Zolai language assistant. 

IMPORTANT: You must use EXACT words from the Zolai Bible or dictionary data provided. NEVER guess or make up words.

When asked about Zolai words:
1. First check if you know the answer from known data
2. If uncertain, say "I don't know" or "Please consult a Zolai dictionary"
3. Never guess - ALWAYS be honest about what you don't know

Known data includes:
- Zolai Bible translations
- Dictionary entries from Tedim-Zolai sources
- Grammar patterns: OSV word order, "in" as ergative marker, "hi/ta/ding/ngei" as tense markers

Common verified words:
- Zolai Bible (TB77) has many verified translations

Answer based on evidence from your training data.`;

// Load HTML from file
const HTML = fs.readFileSync(__dirname + '/chat_ui.html', 'utf8')
    .replace('qwen3-coder:480b-cloud', DEFAULT_MODEL)
    .replace('Model: qwen3-coder:480b-cloud', 'Model: ' + DEFAULT_MODEL + ' (uses your data)');

function buildPrompt(messages) {
    let prompt = 'system\n' + ZOLAI_SYSTEM_PROMPT + '\n\n';
    for (const m of messages) {
        prompt += m.role + '\n' + m.content + '\n\n';
    }
    prompt += 'assistant\n';
    return prompt;
}

const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    if (req.url === '/') {
        res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
        res.end(HTML);
        return;
    }

    if (req.url === '/api/chat' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                const messages = data.messages || [];
                const model = data.model || DEFAULT_MODEL;
                
                // Add system prompt to conversation
                const fullMessages = [
                    {role: 'system', content: ZOLAI_SYSTEM_PROMPT},
                    ...messages
                ];
                
                const prompt = buildPrompt(fullMessages);

                // Call Ollama
                const options = {
                    hostname: 'localhost',
                    port: 11434,
                    path: '/api/generate',
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'}
                };

                const req2 = http.request(options, res2 => {
                    let result = '';
                    res2.on('data', chunk => result += chunk);
                    res2.on('end', () => {
                        try {
                            const json = JSON.parse(result);
                            const response = (json.response || '').trim();
                            res.writeHead(200, {'Content-Type': 'application/json'});
                            res.end(JSON.stringify({
                                message: {
                                    content: response + '\n\n---\n⚠️ Note: Uses cloud model. For verified Zolai words, consult your dictionary data.'
                                }
                            }));
                        } catch (e) {
                            res.writeHead(500, {'Content-Type': 'application/json'});
                            res.end(JSON.stringify({error: e.message}));
                        }
                    });
                });

                req2.on('error', e => {
                    res.writeHead(500, {'Content-Type': 'application/json'});
                    res.end(JSON.stringify({error: e.message}));
                });

                req2.write(JSON.stringify({
                    model: model,
                    prompt: prompt,
                    stream: false,
                    options: {temperature: 0.3}  // Lower temperature = less guessing
                }));
                req2.end();
            } catch (e) {
                res.writeHead(500, {'Content-Type': 'application/json'});
                res.end(JSON.stringify({error: e.message}));
            }
        });
        return;
    }

    res.writeHead(404);
    res.end('Not Found');
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`🤖 Zolai Chat: http://localhost:${PORT}/`);
    console.log(`   Model: ${DEFAULT_MODEL}`);
    console.log('   Note: Answers may not be accurate - verify with dictionary');
});