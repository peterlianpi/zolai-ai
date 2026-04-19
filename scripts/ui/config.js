// Load .env from project root if present
const path = require('path');
const fs   = require('fs');
const envPath = path.resolve(__dirname, '../../.env');
if (fs.existsSync(envPath)) {
    fs.readFileSync(envPath, 'utf-8').split('\n').forEach(line => {
        const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
        if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
    });
}

module.exports = {
    GEMINI_API_KEY:     process.env.GEMINI_API_KEY     || '',
    GEMINI_API_KEY_2:   process.env.GEMINI_API_KEY_2   || '',
    GEMINI_API_KEY_3:   process.env.GEMINI_API_KEY_3   || '',
    GEMINI_API_KEY_4:   process.env.GEMINI_API_KEY_4   || '',
    GROQ_API_KEY:       process.env.GROQ_API_KEY       || '',
    NVIDIA_API_KEY:     process.env.NVIDIA_API_KEY     || '',
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY || '',
    QWEN_API_KEY:       process.env.QWEN_API_KEY       || '',
};
