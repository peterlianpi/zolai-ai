#!/usr/bin/env node
'use strict';
const http  = require('http');
const https = require('https');
const fs    = require('fs').promises;
const path  = require('path');
const { GEMINI_API_KEY, GEMINI_API_KEY_2, GEMINI_API_KEY_3, GEMINI_API_KEY_4, GROQ_API_KEY, NVIDIA_API_KEY, OPENROUTER_API_KEY, QWEN_API_KEY } = require('./config');

// All Gemini keys in rotation order (duplicates kept intentionally for extra quota)
const GEMINI_KEYS = [GEMINI_API_KEY, GEMINI_API_KEY_2, GEMINI_API_KEY_3, GEMINI_API_KEY_4].filter(Boolean);

const PORT     = 8300;
const WIKI_DIR = path.resolve(__dirname, '../../wiki');
const SESS_DIR = path.join(__dirname, 'sessions');

const SYSTEM = `You are Sangsia, the Zolai AI Second Brain and language tutor.
- Teach Tedim Zolai (ZVS standard). Use pasian, gam, tapa, topa, kumpipa, tua.
- Never use: pathian, ram, fapa, cu, cun, bawipa, siangpahrang.
- SOV word order. Ergative 'in' for transitive subjects.
- Tense: hi (present), ta (past), ding (future), ngei (perfect).
- Negation: kei (future/intent), lo (general facts).
- Hint-first teaching: guide with clues before giving full answers.
- Keep replies concise (2-4 sentences). Mix Zolai + English explanation.`;

// CEFR level descriptors injected into system prompt
const CEFR_CONTEXT = {
    A1: 'Learner is BEGINNER (A1). Use only: basic SOV sentences, present tense (hi), simple nouns. Max 5 words per sentence. No complex grammar.',
    A2: 'Learner is ELEMENTARY (A2). Use: past (khin hi), future (ding), simple connectors (tua ciangin). Introduce day-counting and identity patterns.',
    B1: 'Learner is INTERMEDIATE (B1). Use: cause/effect (ahih manin), interrogatives (hiam/diam), quotatives (ci hi, ci-in). Introduce directional particles (hong, va, khia, lut, kik).',
    B2: 'Learner is UPPER-INTERMEDIATE (B2). Use: conditionals (leh), comparative (sangin), embedded clauses. Introduce formal register.',
    C1: 'Learner is ADVANCED (C1). Use: I Am metaphors (KEIMAH ka hi hi), rhetorical questions, complex biblical connectors (Tua ahih ciangin). Full register awareness.',
    C2: 'Learner is MASTERY (C2). Use: poetic parallelism, archaic forms, full discourse analysis. Teach nuanced translation decisions.',
};

// Infer CEFR level from session history (message count + complexity signals)
function inferLevel(history) {
    if (!history.length) return 'A1';
    const msgs = history.length;
    // Check if level was explicitly set
    for (const m of history.slice().reverse()) {
        const lm = (m.content || '').match(/\b(A1|A2|B1|B2|C1|C2)\b/);
        if (lm) return lm[1];
    }
    // Heuristic: escalate level with session depth
    if (msgs >= 40) return 'C1';
    if (msgs >= 20) return 'B2';
    if (msgs >= 10) return 'B1';
    if (msgs >= 4)  return 'A2';
    return 'A1';
}

// ── Sessions ──────────────────────────────────────────────────────────────
fs.mkdir(SESS_DIR, { recursive: true }).catch(() => {});

async function loadSession(id) {
    try { return JSON.parse(await fs.readFile(path.join(SESS_DIR, id + '.json'), 'utf-8')); }
    catch { return []; }
}
async function saveSession(id, msgs) {
    await fs.writeFile(path.join(SESS_DIR, id + '.json'), JSON.stringify(msgs.slice(-30)));
}

// ── Wiki context search ───────────────────────────────────────────────────
async function wikiSearch(q) {
    const words = q.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    if (!words.length) return '';
    const results = [];
    async function scan(dir, depth = 0) {
        if (depth > 3) return;
        for (const e of await fs.readdir(dir, { withFileTypes: true }).catch(() => [])) {
            const p = path.join(dir, e.name);
            if (e.isDirectory()) { await scan(p, depth + 1); continue; }
            if (!e.name.endsWith('.md')) continue;
            const content = await fs.readFile(p, 'utf-8').catch(() => '');
            const lower = content.toLowerCase();
            const score = words.reduce((s, w) => s + (lower.includes(w) ? 1 : 0), 0);
            if (score > 0) results.push({ content, score });
        }
    }
    await scan(WIKI_DIR);
    results.sort((a, b) => b.score - a.score);
    if (!results.length) return '';
    return results[0].content.slice(0, 600);
}

// ── Model probe — test if a model actually responds ───────────────────────
const PROBE_CACHE = new Map(); // cache results for 10 min per key+model

async function probeModel(prov, modelId, key) {
    const cacheKey = `${prov}:${modelId}:${key.slice(-8)}`;
    if (PROBE_CACHE.has(cacheKey)) return PROBE_CACHE.get(cacheKey);
    try {
        const result = await Promise.race([
            callLLM(prov, modelId, key, 'Hi'),
            new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 6000)),
        ]);
        const ok = !!result;
        PROBE_CACHE.set(cacheKey, ok);
        setTimeout(() => PROBE_CACHE.delete(cacheKey), 10 * 60 * 1000); // expire 10min
        return ok;
    } catch { PROBE_CACHE.set(cacheKey, false); return false; }
}

// ── HTTP helper ───────────────────────────────────────────────────────────
function post(hostname, urlPath, headers, payload) {
    return new Promise((resolve, reject) => {
        const body = JSON.stringify(payload);
        const req = https.request(
            { hostname, path: urlPath, method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body), ...headers } },
            res => { let d = ''; res.on('data', c => d += c); res.on('end', () => resolve(d)); }
        );
        req.on('error', reject);
        req.write(body); req.end();
    });
}

// ── LLM call ─────────────────────────────────────────────────────────────
async function callLLM(provider, model, key, prompt) {
    try {
        if (provider === 'gemini') {
            const isOAuth = key && key.startsWith('ya29.');
            // Key rotation: try each key until one works
            const keys = isOAuth ? [key] : GEMINI_KEYS;
            let lastErr = '';
            for (const k of keys) {
                const urlPath = isOAuth
                    ? `/v1beta/models/${model}:generateContent`
                    : `/v1beta/models/${model}:generateContent?key=${k}`;
                const authHdr = isOAuth ? { Authorization: `Bearer ${k}` } : {};
                const raw = await post('generativelanguage.googleapis.com', urlPath, authHdr,
                    { contents: [{ role: 'user', parts: [{ text: prompt }] }] });
                const j = JSON.parse(raw);
                if (j.error) {
                    lastErr = j.error.message || JSON.stringify(j.error);
                    // quota/rate error → try next key
                    if (j.error.code === 429 || j.error.status === 'RESOURCE_EXHAUSTED') continue;
                    throw new Error(lastErr);
                }
                return j.candidates?.[0]?.content?.parts?.[0]?.text || '';
            }
            throw new Error('All Gemini keys exhausted: ' + lastErr);
        }

        if (provider === 'nvidia') {
            const raw = await post('integrate.api.nvidia.com', '/v1/chat/completions',
                { Authorization: `Bearer ${key}` },
                { model, messages: [{ role: 'user', content: prompt }], temperature: 0.7, max_tokens: 512 });
            const j = JSON.parse(raw);
            return j.choices?.[0]?.message?.content || '';
        }

        // qwen — DashScope API (OpenAI-compatible)
        if (provider === 'qwen') {
            const raw = await post('dashscope.aliyuncs.com', '/compatible-mode/v1/chat/completions',
                { Authorization: `Bearer ${key}` },
                { model, messages: [{ role: 'system', content: SYSTEM }, { role: 'user', content: prompt }], max_tokens: 512 });
            const j = JSON.parse(raw);
            return j.choices?.[0]?.message?.content || '';
        }

        // openrouter — OpenAI-compatible, 50+ free models
        if (provider === 'openrouter') {
            const raw = await post('openrouter.ai', '/api/v1/chat/completions',
                { Authorization: `Bearer ${key}`, 'HTTP-Referer': 'https://chat.peterlianpi.site', 'X-Title': 'Zolai Chat' },
                { model, messages: [{ role: 'system', content: SYSTEM }, { role: 'user', content: prompt }], max_tokens: 512 });
            const j = JSON.parse(raw);
            return j.choices?.[0]?.message?.content || '';
        }

        // groq (default)
        const raw = await post('api.groq.com', '/openai/v1/chat/completions',
            { Authorization: `Bearer ${key}` },
            { model, messages: [{ role: 'system', content: SYSTEM }, { role: 'user', content: prompt }],
              temperature: 0.7, max_tokens: 512 });
        const j = JSON.parse(raw);
        return j.choices?.[0]?.message?.content || '';
    } catch (e) {
        // Auto-fallback to Groq on any error
        if (provider !== 'groq' && GROQ_API_KEY) {
            console.warn(`[${provider}] error: ${e.message} — falling back to Groq`);
            return callLLM('groq', 'llama-3.3-70b-versatile', GROQ_API_KEY, prompt);
        }
        throw e;
    }
}

// ── Request handler ───────────────────────────────────────────────────────
const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type' };

async function handle(req, res) {
    const url = req.url.split('?')[0];

    if (req.method === 'OPTIONS') {
        res.writeHead(204, CORS); res.end(); return;
    }

    if (url === '/' && req.method === 'GET') {
        const html = await fs.readFile(path.join(__dirname, 'chat_ui.html'));
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', ...CORS });
        res.end(html); return;
    }

    if (url === '/api/models' && req.method === 'GET') {
        const params   = new URLSearchParams(req.url.split('?')[1] || '');
        const provider = params.get('provider') || 'groq';
        const key      = params.get('key') || (provider === 'gemini' ? GEMINI_KEYS[0] : provider === 'nvidia' ? NVIDIA_API_KEY : provider === 'openrouter' ? OPENROUTER_API_KEY : GROQ_API_KEY);
        const isOAuth  = key && key.startsWith('ya29.');

        // Fetch with 8s timeout
        function getWithTimeout(opts) {
            return new Promise((resolve, reject) => {
                const r = https.get(opts, res => { let d = ''; res.on('data', c => d += c); res.on('end', () => resolve(d)); });
                r.on('error', reject);
                r.setTimeout(8000, () => { r.destroy(); reject(new Error('timeout')); });
            });
        }

        try {
            let models = [];

            if (provider === 'gemini') {
                const urlPath = isOAuth ? '/v1beta/models' : `/v1beta/models?key=${key}`;
                const raw = await getWithTimeout({ hostname: 'generativelanguage.googleapis.com', path: urlPath,
                    headers: isOAuth ? { Authorization: `Bearer ${key}` } : {} });
                const GEMINI_WORKING = ['gemma-3-1b-it','gemma-3-4b-it','gemma-3-12b-it','gemma-3-27b-it',
                    'gemma-3n-e2b-it','gemma-3n-e4b-it','gemma-4-26b-a4b-it','gemma-4-31b-it',
                    'gemini-flash-latest','gemini-2.5-flash-lite','gemini-3-flash-preview'];
                models = (JSON.parse(raw).models || [])
                    .filter(m => m.supportedGenerationMethods?.includes('generateContent')
                        && GEMINI_WORKING.some(w => m.name.includes(w)))
                    .map(m => ({ id: m.name.replace('models/', ''), label: m.displayName || m.name.replace('models/', '') }));

            } else if (provider === 'groq') {
                const raw = await getWithTimeout({ hostname: 'api.groq.com', path: '/openai/v1/models',
                    headers: { Authorization: `Bearer ${key}` } });
                models = (JSON.parse(raw).data || [])
                    .filter(m => !m.id.includes('whisper') && !m.id.includes('vision'))
                    .map(m => ({ id: m.id, label: m.id }));

            } else if (provider === 'nvidia') {
                const raw = await getWithTimeout({ hostname: 'integrate.api.nvidia.com', path: '/v1/models',
                    headers: { Authorization: `Bearer ${key}` } });
                models = (JSON.parse(raw).data || []).map(m => ({ id: m.id, label: m.id.split('/').pop() }));

            } else if (provider === 'openrouter') {
                const raw = await getWithTimeout({ hostname: 'openrouter.ai', path: '/api/v1/models',
                    headers: { Authorization: `Bearer ${key}` } });
                const BROKEN = ['lyria','gemma-4','minimax','qwen3-next','gpt-oss-20b','glm-4','qwen3-coder','dolphin','gemma-3n','nemotron-nano-12b','nemotron-3-nano','nemotron-nano-9b','llama-3.3-70b-instruct:free','llama-3.2-3b','hermes-3'];
                models = (JSON.parse(raw).data || [])
                    .filter(m => (m.pricing?.prompt === '0' || m.pricing?.prompt === 0) && !BROKEN.some(b => m.id.includes(b)))
                    .map(m => ({ id: m.id, label: m.name || m.id.split('/').pop() }))
                    .slice(0, 20);

            } else if (provider === 'qwen') {
                models = [
                    { id: 'qwen-max',             label: 'Qwen Max' },
                    { id: 'qwen-plus',            label: 'Qwen Plus' },
                    { id: 'qwen-turbo',           label: 'Qwen Turbo' },
                    { id: 'qwen2.5-72b-instruct', label: 'Qwen2.5 72B' },
                    { id: 'qwen2.5-32b-instruct', label: 'Qwen2.5 32B' },
                ];
            }

            // Probe models in parallel (max 6 at a time) — only show working ones
            // Skip probe for Qwen (static list, no key yet) and if no models
            const shouldProbe = models.length > 0 && provider !== 'qwen';
            if (shouldProbe) {
                const BATCH = 6;
                const working = [];
                for (let i = 0; i < models.length; i += BATCH) {
                    const batch = models.slice(i, i + BATCH);
                    const results = await Promise.all(
                        batch.map(m => probeModel(provider, m.id, key).then(ok => ok ? m : null))
                    );
                    working.push(...results.filter(Boolean));
                }
                models = working;
                console.log(`[models] ${provider}: ${models.length} working`);
            }

            json(res, { models });
        } catch (e) {
            console.error('[models]', provider, e.message);
            json(res, { models: [], error: e.message });
        }
        return;
    }

    if (url === '/api/chat' && req.method === 'POST') {
        let body = '';
        req.on('data', c => body += c);
        req.on('end', async () => {
            try {
                const d = JSON.parse(body);
                const userMsg  = d.messages?.at(-1)?.content?.trim() || '';
                const provider = d.provider || 'groq';
                const model    = d.model    || 'llama-3.3-70b-versatile';
                const userId   = d.userId   || 'default';

                // Key priority: user OAuth token > user API key > server key
                const key = d.oauthToken || d.apiKey
                    || (provider === 'gemini'      ? GEMINI_API_KEY
                      : provider === 'nvidia'      ? NVIDIA_API_KEY
                      : provider === 'openrouter'  ? OPENROUTER_API_KEY
                      : provider === 'qwen'        ? QWEN_API_KEY
                      : GROQ_API_KEY);

                if (!userMsg) { json(res, { error: 'Empty message' }, 400); return; }

                const [history, ctx] = await Promise.all([loadSession(userId), wikiSearch(userMsg)]);
                const level   = d.level || inferLevel(history);
                const histCtx = history.slice(-6).map(m => `${m.role}: ${m.content}`).join('\n');
                const prompt = [
                    SYSTEM,
                    `\n[Level: ${level}] ${CEFR_CONTEXT[level] || ''}`,
                    ctx ? `\n[Wiki context]\n${ctx}` : '',
                    histCtx ? `\n[History]\n${histCtx}` : '',
                    `\nUser: ${userMsg}\nSangsia:`,
                ].join('');

                const reply = await callLLM(provider, model, key, prompt);

                // Strip reasoning tags from thinking models
                const cleanReply = reply.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

                history.push({ role: 'user', content: userMsg });
                history.push({ role: 'assistant', content: cleanReply });
                await saveSession(userId, history);

                json(res, { message: { content: cleanReply }, level });
            } catch (e) {
                console.error('[chat]', e.message);
                json(res, { error: e.message }, 500);
            }
        });
        return;
    }

    res.writeHead(404, CORS); res.end('Not found');
}

function json(res, data, status = 200) {
    res.writeHead(status, { 'Content-Type': 'application/json', ...CORS });
    res.end(JSON.stringify(data));
}

http.createServer((req, res) => handle(req, res).catch(e => {
    console.error(e); res.writeHead(500); res.end('Server error');
})).listen(PORT, () => console.log(`✅ Zolai Chat → http://localhost:${PORT}`));
