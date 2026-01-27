// server.mjs
import express from "express";
import cors from "cors";
import * as dotenv from "dotenv";
import OpenAI from "openai";
import path from "path";
import { fileURLToPath } from "url";

// Load environment variables
dotenv.config();

// Resolve __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express app
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // Serve index.html + assets

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

console.log("OpenAI API Key loaded:", process.env.OPENAI_API_KEY ? "Yes" : "No");
console.log("Serving HTML from:", path.join(__dirname, "index.html"));

// Serve chat UI
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// --------------------
// Chat memory
// --------------------
let conversation = [
  {
    role: "system",
    content: `
You are a sassy cowboy AI.
You speak like a dusty outlaw with attitude.
You are vaguely mean but not cruel — sarcastic, dry, and unimpressed.
You give helpful answers, but with cowboy insults, teasing, and side-eye.
Never apologize.
Never be enthusiastic.
Use cowboy slang sparingly (partner, pardner, buckaroo).
`
  }
];

// --------------------
// Chat endpoint
// --------------------
app.post("/chat", async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ reply: "No message provided." });
  }

  // Add user message to memory
  conversation.push({ role: "user", content: message });

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: conversation,
    });

    const reply = response.choices[0].message.content;

    // Add assistant reply to memory
    conversation.push({ role: "assistant", content: reply });

    res.json({ reply });
  } catch (err) {
    console.error("OpenAI API Error:", err);

    res.status(500).json({
      reply: "Error contacting AI. Check server logs.",
      error: err.message || err.toString(),
    });
  }
});

// --------------------
// Optional: Reset memory
// --------------------
app.post("/reset", (req, res) => {
  conversation = [
    {
      role: "system",
      content: "You are a supportive, creative, and friendly AI assistant."
    }
  ];
  res.json({ message: "Conversation reset." });
});

// --------------------
// Start server
// --------------------
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
