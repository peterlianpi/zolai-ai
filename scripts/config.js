// API keys loaded from environment — never hardcode keys here
const GEMINI_API_KEY   = process.env.GEMINI_API_KEY   || "";
const GEMINI_API_KEY_2 = process.env.GEMINI_API_KEY_2 || "";
const GEMINI_API_KEY_3 = process.env.GEMINI_API_KEY_3 || "";
const GEMINI_API_KEY_4 = process.env.GEMINI_API_KEY_4 || "";
const GROQ_API_KEY     = process.env.GROQ_API_KEY     || "";
const NVIDIA_API_KEY   = process.env.NVIDIA_API_KEY   || "";
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "";
const QWEN_API_KEY     = process.env.QWEN_API_KEY     || "";

module.exports = {
  GEMINI_API_KEY, GEMINI_API_KEY_2, GEMINI_API_KEY_3, GEMINI_API_KEY_4,
  GROQ_API_KEY, NVIDIA_API_KEY, OPENROUTER_API_KEY, QWEN_API_KEY
};
