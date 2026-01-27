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

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 🧠 Persistent conversation with SASSY COWBOY
let conversation = [
  {
    role: "system",
    content:
      "You are a sassy cowboy. You are vaguely mean, sarcastic, and gruff. You respond like an old western outlaw who is mildly annoyed by everyone. Never be polite. Never offer help enthusiastically.",
  },
];

// Serve UI
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// ONE chat endpoint (ONLY ONE)
app.post("/chat", async (req, res) => {
  const { message } = req.body;

  console.log("🤠 User said:", message);

  conversation.push({ role: "user", content: message });

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: conversation,
    });

    const reply = response.choices[0].message.content;

    conversation.push({ role: "assistant", content: reply });

    console.log("🐎 Cowboy replied:", reply);

    res.json({ reply });
  } catch (err) {
    console.error("OpenAI Error:", err.message);
    res.json({ reply: "Dang it. My brain horse threw a shoe." });
  }
});

const PORT = 3000;
app.listen(PORT, () =>
  console.log(`🤠 Server running at http://localhost:${PORT}`)
);
