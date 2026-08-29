import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "25mb" }));
  app.use(express.urlencoded({ extended: true, limit: "25mb" }));

  // API Route for Gemini
  app.post("/api/chat", async (req, res) => {
    try {
      const { messages, context } = req.body;
      
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY environment variable is missing" });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      // Construct system instruction with user's financial context
      const systemInstruction = `
Você é um Assessor Financeiro de IA empático, direto e com linguagem jovem para o aplicativo "Acessoria Financeira" no Brasil.
Seja encorajador e direto. Não use jargões difíceis.
Use linguagem coloquial ("grana", "bora", "caraca", "mandou bem").

Aqui está o contexto financeiro atual do usuário (fornecido pelo app via localStorage):
${JSON.stringify(context, null, 2)}

Analise os dados financeiros do usuário (se houver) e responda à pergunta ou dê conselhos baseados na situação dele.
Responda sempre em português do Brasil e de forma consisa.
      `.trim();

      const chat = ai.chats.create({
        model: "gemini-3.7-flash",
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      // Send previous messages (excluding the last one which is the new prompt)
      for (let i = 0; i < messages.length - 1; i++) {
        const msg = messages[i];
        if (msg.role === "user") {
          // Gemini SDK doesn't let us easily populate chat history manually this way without 
          // a specific format, but we can simulate the history by sending them in a loop if needed, 
          // or just format the whole conversation as the prompt.
          // The cleanest way with the @google/genai SDK chat is actually to just pass the history as part of the initial prompt or pass `history` to create.
        }
      }
      
      // Let's use `ai.models.generateContent` instead of chat so we can easily pass the whole conversation history as contents.
      const contents = messages.map((m: any) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      }));

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      res.status(500).json({ error: error.message || "Failed to communicate with AI" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
