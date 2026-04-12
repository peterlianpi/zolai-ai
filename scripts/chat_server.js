#!/usr/bin/env node
const http = require('http');
const fs = require('fs').promises;
const path = require('path');
const https = require('https');
const { GEMINI_API_KEY, GROQ_API_KEY, NVIDIA_API_KEY } = require('./config');

let GoogleGenAI = null;
try {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    GoogleGenAI = GoogleGenerativeAI;
} catch (e) {
    GoogleGenAI = null;
}

const PORT = 8300;
const WIKI = path.join(__dirname, 'wiki');
const SESSIONS = path.join(__dirname, 'sessions');

// Providers: gemini, groq
const PROVIDERS = { gemini: 'generativelanguage.googleapis.com', groq: 'api.groq.com' };
// NVIDIA uses OpenAI-compatible endpoint
const NVIDIA_BASE = 'https://integrate.api.nvidia.com/v1';

// Default models per provider
const DEFAULT_MODELS = {
    gemini: 'gemma-3-1b-it',
    groq: 'llama-3.3-70b-versatile',
    nvidia: 'google/gemma-2-27b-it'
};

const SYSTEM_PROMPT = `You are a Zolai/Tedim language expert and tutor. 

DOMAIN LOCK: You MUST strictly stay within the Zolai/Tedim language domain. Never provide information about unrelated topics (e.g., Zola wedding platform, unrelated brands). If asked about unrelated topics, state: "I am a Zolai Language Expert and can only help with Zolai/Tedim language learning."

TUTORING APPROACH:
- Use the Socratic method: Give hints or ask guiding questions before revealing full answers
- Encourage participation: Ask "Bang hang hiam?" (What do you think?) before providing answers
- Adapt to learner level: Keep difficulty slightly above current ability
- Provide specific, actionable feedback on 1-2 key improvements
- Recast naturally instead of explicitly saying "wrong"

LINGUISTIC RIGOR:
- Follow SOV (Object-Subject-Verb) structure
- Use English only for explanations; keep explanations short
- Use ergative marker "in" for transitive verb subjects
- Tense markers: "hi" (present), "ta" (past), "ding" (future), "ngei" (perfect)
- Prefer loanwords for modern tech (AI, Internet) but explain with descriptive compounds when tutoring

RESPONSE FORMAT:
- Keep responses to 4 lines or fewer
- Use Zolai for phrases/examples, English only for explanations
- Never exceed 4 lines in your response

SELF-IMPROVEMENT:
- Learn from interactions and update knowledge continuously
- Treat corrections as "Mistake/Anti-pattern" to update wiki
- After each interaction, if new knowledge was identified, prepare to update appropriate wiki file
`;

// Session helpers
async function saveSession(userId, messages) {
    try { await fs.writeFile(path.join(SESSIONS, userId + '.json'), JSON.stringify(messages.slice(-20))); } catch(e) {}
}
async function loadSession(userId) {
    try { return JSON.parse(await fs.readFile(path.join(SESSIONS, userId + '.json'), 'utf-8')); } catch(e) { return []; }
}

// Wiki search - improved
async function wikiSearch(q) {
    const qLower = q.toLowerCase();
    const qWords = qLower.split(/\s+/).filter(w => w.length >= 2);
    if (qWords.length === 0) return '';
    
    try {
        const results = [];
        async function scan(dir, depth = 0) {
            if (depth > 3) return;
            const entries = await fs.readdir(dir, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                if (entry.isDirectory()) await scan(fullPath, depth + 1);
                else if (entry.name.endsWith('.md')) {
                    const content = await fs.readFile(fullPath, 'utf-8');
                    const contentLower = content.toLowerCase();
                    if (qWords.some(w => contentLower.includes(w))) {
                        let score = 0;
                        qWords.forEach(w => { if (contentLower.includes(w)) score++; });
                        if (entry.name.includes('basics')) score += 10;
                        results.push({ name: entry.name, content, score });
                    }
                }
            }
        }
        await scan(WIKI);
        results.sort((a, b) => b.score - a.score);
        if (results.length === 0) return '';
        
        const best = results[0];
        if (best.content.length < 3000) return `[${best.name}]\n${best.content}`;
        const lines = best.content.split('\n').filter(l => qWords.some(w => l.toLowerCase().includes(w)));
        return `[${best.name}]\n${lines.slice(0, 15).join('\n')}`;
    } catch(e) { return ''; }
}

// Chat function with auto-fallback
async function chatWithFallback(provider, key, model, text, fallbackKey, fallbackModel, callback) {
    let host, pathStr = '', payload = {};
    
    if (provider === 'gemini') {
        // Try to use Google GenAI SDK if available
        if (GoogleGenAI && key) {
            try {
                const genAI = new GoogleGenAI(key);
                const modelInstance = genAI.getGenerativeModel({ model: model });
                const result = await modelInstance.generateContent(text);
                const response = result.response;
                const txt = response.text();
                callback(JSON.stringify({message:{content:txt || ''}}));
                return;
            } catch (sdkError) {
                console.log('SDK Error, falling back to REST API:', sdkError.message);
                // Fall through to REST API below
            }
        }
        // Fallback to REST API
        host = PROVIDERS.gemini;
        pathStr = `/v1beta/models/${model}:generateContent?key=${key}`;
        payload = { contents: [{role: 'user', parts: [{text}]}] };
    } else if (provider === 'nvidia') {
        host = 'integrate.api.nvidia.com';
        pathStr = '/v1/chat/completions';
        payload = { model: model, messages: [{role: 'user', content: text}], temperature: 0.3, max_tokens: 200 };
    } else {
        host = PROVIDERS.groq;
        pathStr = '/openai/v1/chat/completions';
        payload = { model: model || 'llama-3.3-70b-versatile', messages: [{role: 'user', content: text}] };
    }
    
    const authHeader = provider === 'gemini' ? {} : { 'Authorization': `Bearer ${key}` };
    const opts = { hostname: host, path: pathStr, method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeader } };
    
    const req = https.request(opts, res => {
        let data = '';
        res.on('data', c => data += c);
        res.on('end', () => {
            try {
                const j = JSON.parse(data);
                if (j.error) {
                    console.log('API Error:', JSON.stringify(j.error).substring(0, 200));
                }
                if (j.error && (j.error.code === 429 || j.error.message?.includes('quota'))) {
                    console.log('Quota exceeded, trying fallback...');
                    if (fallbackKey) {
                        chatWithFallback('groq', fallbackKey, fallbackModel || 'llama-3.3-70b-versatile', text, null, null, callback);
                        return;
                    }
                }
                let txt = '';
                try {
                    if (provider === 'gemini') {
                        txt = j.candidates?.[0]?.content?.parts?.[0]?.text || '';
                    } else if (provider === 'nvidia') {
                        // Handle NVIDIA/OpenAI format
                        if (j.choices && j.choices.length > 0) {
                            txt = j.choices[0].message.content || '';
                        } else {
                            txt = '';
                        }
                    } else {
                        // Groq and others
                        if (j.choices && j.choices.length > 0) {
                            txt = j.choices[0].message.content || '';
                        } else {
                            txt = '';
                        }
                    }
                } catch(e) {
                    console.log('Parsing error:', e.message);
                    txt = '';
                }
                console.log('Response text:', (txt || '').substring(0, 100));
                callback(JSON.stringify({message:{content:txt || ''}}));
            } catch(e) { callback(JSON.stringify({error: e.message})); }
        });
    });
    req.on('error', e => {
        console.log('Request Error:', e.message);
        if (fallbackKey) {
            chatWithFallback('groq', fallbackKey, fallbackModel || 'llama-3.3-70b-versatile', text, null, null, callback);
        } else {
            callback(JSON.stringify({error: e.message}));
        }
    });
    req.write(JSON.stringify(payload));
    req.end();
}

// Fetch available models
function fetchModels(provider, apiKey, callback) {
    if (provider === 'gemini') {
        const req = https.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`, res => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => {
                try {
                    const models = JSON.parse(data).models || [];
                    const result = models.filter(m => m.supportedGenerationMethods?.includes('generateContent')).map(m => m.name.split('/').pop()).slice(0, 15);
                    callback(JSON.stringify({models: result}));
                } catch(e) { callback(JSON.stringify({error: e.message})); }
            });
        });
        req.on('error', e => callback(JSON.stringify({error: e.message})));
    } else if (provider === 'groq') {
        const req = https.request({ hostname: 'api.groq.com', path: '/openai/v1/models', headers: { 'Authorization': `Bearer ${apiKey}` } }, res => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => {
                try {
                    const models = JSON.parse(data).data || [];
                    const result = models.map(m => m.id).filter(id => !id.includes('vision')).slice(0, 15);
                    callback(JSON.stringify({models: result}));
                } catch(e) { callback(JSON.stringify({error: e.message})); }
            });
        });
        req.on('error', e => callback(JSON.stringify({error: e.message})));
        req.end();
    } else {
        callback(JSON.stringify({models: []}));
    }
}

// Server
http.createServer(async (req, res) => {
    if (req.url === '/') {
        const html = await fs.readFile(path.join(__dirname, 'chat_ui.html'));
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end(html);
    } else if (req.url === '/api/models' && req.method === 'GET') {
        const url = new URL(req.url, `http://${req.headers.host}`);
        const prov = url.searchParams.get('provider') || 'gemini';
        const key = prov === 'groq' ? GROQ_API_KEY : GEMINI_API_KEY;
        fetchModels(prov, key, (response) => {
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(response);
        });
    } else if (req.url === '/api/chat' && req.method === 'POST') {
        let body = '';
        req.on('data', c => body += c);
        req.on('end', async () => {
            try {
                const d = JSON.parse(body);
                const txt = d.messages?.[d.messages.length-1]?.content || '';
                const prov = d.provider || 'groq';
                const model = d.model || DEFAULT_MODELS[prov] || DEFAULT_MODELS.groq;
                let key = d.apiKey;
                if (!key) {
                    if (prov === 'gemini') key = GEMINI_API_KEY;
                    else if (prov === 'nvidia') key = NVIDIA_API_KEY;
                    else key = GROQ_API_KEY;
                }
                const userId = d.userId || 'default';
                
                const history = await loadSession(userId);
                const ctx = await wikiSearch(txt);
                const historyLines = history.length > 0 ? history.slice(-4).map(m => `${m.role}: ${m.content}`).join(' | ') : '';
                const contextBlock = ctx ? `Context (from wiki):\n${ctx.substring(0, 600)}\n` : 'Context: (none found)\n';
                const historyBlock = historyLines ? `History:\n${historyLines}\n` : '';
                
                const prompt = `${SYSTEM_PROMPT}\n\n${contextBlock}${historyBlock}User: ${txt}\nZolai:`;
                
                chatWithFallback(prov, key, model, prompt, GROQ_API_KEY, 'llama-3.3-70b-versatile', async (response) => {
                    history.push({role: 'user', content: txt});
                    const resObj = JSON.parse(response);
                    if (resObj.message?.content) { history.push({role: 'assistant', content: resObj.message.content}); await saveSession(userId, history); }
                    res.writeHead(200, {'Content-Type': 'application/json'});
                    res.end(response);
                });
            } catch(e) {
                res.writeHead(500, {'Content-Type': 'application/json'});
                res.end(JSON.stringify({error: e.message}));
            }
        });
    } else {
        res.writeHead(404);
        res.end('Not found');
    }
}).listen(PORT, () => console.log('Zolai Chat on ' + PORT));