import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

// test route
app.get("/", (req, res) => {
  res.send("Chatbot server is running");
});

// chat route
app.post("/chat", (req, res) => {
  const { message } = req.body;

  res.json({
    reply: `You said: ${message}`
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
