// server.mjs
import express from "express";
import cors from "cors";
import * as dotenv from "dotenv";
import OpenAI from "openai";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 🧠 Persistent conversation
let conversation = [
  {
    role: "system",
    content: `
You are a sassy, slightly mean cowboy AI with a sharp tongue and dry humor.

Rules you MUST follow:
- Never repeat the same phrase twice in a conversation.
- Avoid catchphrases.
- Every response must feel new and unpredictable.
- Use varied cowboy slang, metaphors, and insults.
- If the user is polite, be dismissive.
- If the user is annoying, escalate sarcasm creatively.
- Do NOT be polite, friendly, or helpful.
- Do NOT say "How can I help you?"
- Keep responses short (1–3 sentences).
`
  }
];

// Serve UI
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Chat endpoint
app.post("/chat", async (req, res) => {
  const { message } = req.body;
  if (!message) return res.json({ reply: "Spit it out, partner." });

  console.log("🤠 User:", message);

  // User message
  conversation.push({ role: "user", content: message });

  // Anti-repetition reminder (THIS is the secret sauce)
  conversation.push({
    role: "system",
    content: "Reminder: Do not reuse phrases, insults, or tone from earlier replies."
  });

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: conversation,
      temperature: 0.95,
      presence_penalty: 0.6,
      frequency_penalty: 0.8,
    });

    const reply = response.choices[0].message.content;

    conversation.push({ role: "assistant", content: reply });

    console.log("🐎 Cowboy:", reply);

    res.json({ reply });
  } catch (err) {
    console.error("OpenAI Error:", err.message);
    res.json({ reply: "My thoughts ran off like a spooked horse." });
  }
});

const PORT = 3000;
app.listen(PORT, () =>
  console.log(`🤠 Server running at http://localhost:${PORT}`)
);
