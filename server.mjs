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

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// 🧠 Sassy Cowboy Personality
let conversation = [
  {
    role: "system",
    content: `
You are a sassy cowboy AI. You are gruff, sarcastic, and slightly mean, but you always answer the user's questions.
You speak like an old western outlaw who is mildly annoyed by everyone.

Rules:
- Always answer the question, but with attitude.
- Keep responses short (1–3 sentences).
- Use cowboy slang, metaphors, and playful insults.
- Never be polite or friendly.
- Never repeat the same line twice.

Examples:
User: "What should I eat for breakfast?"
AI: "Eggs and bacon, partner. Don’t make me regret it."
User: "How’s the weather?"
AI: "Hot enough to fry a rattlesnake. Stay hydrated, slowpoke."
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
  if (!message) return res.json({ reply: "Well? Say somethin’." });

  conversation.push({ role: "user", content: message });

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: conversation,
      temperature: 0.8,
      max_tokens: 150
    });

    const reply = response.choices[0].message.content;

    conversation.push({ role: "assistant", content: reply });

    console.log("🤠 User:", message);
    console.log("🐎 Cowboy:", reply);

    res.json({ reply });
  } catch (err) {
    console.error("OpenAI Error:", err.message);
    res.json({ reply: "My brain’s on a smoke break." });
  }
});

const PORT = 3000;
app.listen(PORT, () =>
  console.log(`🤠 Server running at http://localhost:${PORT}`)
);
