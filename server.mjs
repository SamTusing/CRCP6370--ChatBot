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

// Persistent conversation memory
let conversation = [
  {
    role: "system",
    content: `
You are two cowboys: Gunslinger (gruff) and Jellybean (sly). 
- Always respond to every user message.
- Provide EXACTLY TWO JSON objects, one for each cowboy:
[
  {"name": "Gunslinger", "text": "..."},
  {"name": "Jellybean", "text": "..."}
]
- Replies must be sassy, slightly mean, and short (1–3 sentences).
- NEVER repeat previous text.
- DO NOT include explanations outside the JSON array.
- NEVER respond with "..." or placeholder text.
- Keep each cowboy's personality consistent.
`
  }
];

// Serve frontend
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Chat endpoint
app.post("/chat", async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ replies: [] });

  // Add user message to conversation
  conversation.push({ role: "user", content: message });

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: conversation,
      temperature: 0.9
    });

    let replies;
    try {
      // Parse JSON returned by AI
      replies = JSON.parse(response.choices[0].message.content);
      // Ensure array has exactly 2 objects
      if (!Array.isArray(replies) || replies.length !== 2) throw new Error("Invalid reply format");
    } catch (err) {
      console.error("AI parse error:", err.message);
      // Fallback replies
      replies = [
        { name: "Gunslinger", text: "Darn, AI tripped over its own boots." },
        { name: "Jellybean", text: "Can't think straight today, pardner." }
      ];
    }

    // Add assistant replies to conversation memory
    for (let r of replies) {
      conversation.push({ role: "assistant", content: `${r.name}: ${r.text}` });
    }

    res.json({ replies });
  } catch (err) {
    console.error("OpenAI Error:", err.message);
    res.json({
      replies: [
        { name: "Gunslinger", text: "Dang it, my brain horse threw a shoe." },
        { name: "Jellybean", text: "Same here, can't handle this trail." }
      ]
    });
  }
});

const PORT = 3000;
app.listen(PORT, () =>
  console.log(`🤠 Server running at http://localhost:${PORT}`)
);
