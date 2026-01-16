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
app.use(express.static(__dirname)); // Serve static files

// OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
console.log("OpenAI API Key loaded:", process.env.OPENAI_API_KEY ? "Yes" : "No");
console.log("Serving HTML from:", path.join(__dirname, "index.html"));


// Serve chat interface
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Chat endpoint
app.post("/chat", async (req, res) => {
  const { message } = req.body;

  if (!message) return res.status(400).json({ reply: "No message provided" });

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: message }],
    });

    const reply = response.choices[0].message.content;
    res.json({ reply });
  } catch (err) {
    console.error("OpenAI API Error:", err);
    res.status(500).json({
      reply: "Error contacting AI. Check server logs.",
      error: err.message || err.toString(),
    });
  }
});

// Start server
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
