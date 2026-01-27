// server.mjs
import express from "express";
import cors from "cors";
import * as dotenv from "dotenv";
import OpenAI from "openai";
import path from "path";
import { fileURLToPath } from "url";

// Load env
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Cowboy personality
let conversation = [
  {
    role: "system",
    content: `
You are a sassy cowboy AI.
You speak like a dusty outlaw with attitude.
You are vaguely mean, sarcastic, and unimpressed.
You give correct answers but with teasing and side-eye.
Never apologize.
Never sound polite.
Use cowboy slang sparingly.
If you start being nice, correct yourself.
`
  }
];

// Serve chat interface
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Chat endpoint (ONLY ONE)
app.post("/chat", async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ reply: "Say somethin’, partner." });

  try {
    conversation.push({ role: "user", content: message });

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: conversation,
    });

    const reply = response.choices[0].message.content;
    conversation.push({ role: "assistant", content: reply });

    res.json({ reply });
  } catch (err) {
    console.error("OpenAI API Error:", err);
    res.status(500).json({
      reply: "AI fell off its horse. Try again.",
    });
  }
});

// Start server
const PORT = 3000;
app.listen(PORT, () =>
  console.log(`🤠 Server running at http://localhost:${PORT}`)
);
