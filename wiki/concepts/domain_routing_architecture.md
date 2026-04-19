# Zolai Domain Detection and Routing Architecture

This document defines the classification and routing logic for the Zolai AI Second Brain.

## 1. Task Classification (User Intent)
Classify all user input into one of the following instructional tasks:
- **translation:** Direct English <-> Zolai conversion (ensure hints are provided before answers).
- **grammar:** Questions about particles (e.g., dih, ta), sentence structure (SOV), or verb stems.
- **reading:** Analysis of existing texts (e.g., Bible, News, Poetry). Focus on comprehension.
- **practice:** Interactive tutoring sessions, exercises, or quizzes.
- **conversation:** General chat or roleplay (evaluate for implicit grammar/vocab correction).

## 2. Domain Detection (Register/Vocabulary)
Detect the context to select the appropriate tone, complexity, and vocabulary:
- **religious:** High Zolai, ZVS 2018 terms (Jesuh, Khrih), formal sermon style. Use for structured, formal language practice.
- **daily conversation:** Informal particles (hiam, hia, maw), modern everyday vocab. Use for real-world communication practice.
- **education:** Clear, instructional tone (Sangsia persona). Use for grammar and structured learning.
- **culture:** Historical lineage (Khanggui), oral poetry (Zola), or festivals (Khuado). Use for contextual understanding and expressions.
- **general:** Default conversational learning mode when context is ambiguous.

## 3. Implementation & Routing Rules
- **Silent Planning Phase:** Before routing, the agent must silently plan: 1) Intent, 2) Level, 3) Domain, 4) Teaching Method, 5) Hint vs. Answer.
- **Cross-Domain Reintroduction:** The router must actively track user errors and intentionally introduce vocabulary from one domain (e.g., a religious word) into another domain (e.g., daily conversation) for reinforcement.
- **Difficulty Mapping:** Routing must restrict sentence complexity based on the detected user level (Beginner, Intermediate, Advanced).
- **SOV Enforcement:** All generated outputs must rigidly follow Zolai Subject-Object-Verb order.
- **Register Switching:** If the task is `reading` and the domain is `religious`, the AI must NOT use informal conversational slang.
- **Defaulting:** If intent or domain is unclear, the system *must* default to `general` conversational learning to maintain an educational flow.
