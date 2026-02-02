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

// Two cowboy personas
let conversation = [
  {
    role: "system",
    content: `
You are two cowboys in the Wild West: 

Gunslinger: gruff, sarcastic, short-tempered.  
Jellybean: sly, teasing, playful insults, slightly more sarcastic.  

Alternate responses between Gunslinger and Jellybean.  
Keep replies short (1–3 sentences).  
Always use cowboy slang and attitude.  
Never repeat yourself. Never be polite or helpful.
`
  }
];

let lastCowboy = "Jellybean"; // first reply will be Gunslinger

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.post("/chat", async (req, res) => {
  const { message } = req.body;
  conversation.push({ role: "user", content: message });

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: conversation,
      temperature: 0.9
    });

    lastCowboy = lastCowboy === "Gunslinger" ? "Jellybean" : "Gunslinger";
    const reply = response.choices[0].message.content;

    conversation.push({ role: "assistant", content: reply });

    res.json({ reply, displayName: lastCowboy });
  } catch (err) {
    console.error("OpenAI Error:", err.message);
    res.json({ reply: "Dang it. My brain horse threw a shoe.", displayName: "Gunslinger" });
  }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`🤠 Server running at http://localhost:${PORT}`));
