import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "25mb" }));
  app.use(express.urlencoded({ extended: true, limit: "25mb" }));

  // API Route for Parsing Receipts / Invoices / PDFs with Gemini
  app.post("/api/parse-receipt", async (req, res) => {
    try {
      const { base64Data, mimeType } = req.body;
      const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

      if (!apiKey) {
        return res.status(500).json({
          error: "API key is missing. Configure VITE_GEMINI_API_KEY in .env or GEMINI_API_KEY in server secrets."
        });
      }

      const ai = new GoogleGenAI({ apiKey });
      const todayStr = new Date().toISOString().split("T")[0];

      const prompt = `Você é um assistente financeiro especialista em leitura de documentos fiscais, notas, cupons de supermercado/restaurante, faturas e comprovantes de pagamento/PIX.
Analise a imagem ou PDF deste documento e extraia os seguintes dados estruturados com extrema precisão:
- description: Nome do estabelecimento comercial, loja, fornecedor ou beneficiário/pagador (ex: "Supermercado Extra", "Posto Ipiranga", "Uber", "Farmácia Drogasil")
- amount: Valor total monetário (apenas o número float, ex: 145.90)
- date: Data indicada no documento no formato "YYYY-MM-DD". Se não estiver explícita, use "${todayStr}".
- category: Categoria sugerida mais apropriada (ex: "Alimentação", "Transporte", "Saúde", "Moradia", "Lazer", "Educação", "Serviços", "Salário", "Outros")
- type: "expense" (para pagamentos, compras, boletos, despesas) ou "income" (para recebimentos, comprovante de transferência recebida, salário)

Retorne EXCLUSIVAMENTE o objeto JSON válido, sem texto explicativo adicional.`;

      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: [
          {
            role: "user",
            parts: [
              {
                inlineData: {
                  data: base64Data,
                  mimeType: mimeType || "application/pdf"
                }
              },
              {
                text: prompt
              }
            ]
          }
        ],
        config: {
          responseMimeType: "application/json"
        }
      });

      const text = response.text || "{}";
      const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleaned);

      res.json({
        description: parsed.description || "Lançamento via Comprovante",
        amount: typeof parsed.amount === "number" ? parsed.amount : Math.abs(parseFloat(parsed.amount || "0")) || 0,
        date: parsed.date || todayStr,
        category: parsed.category || "Alimentação",
        type: parsed.type === "income" ? "income" : "expense"
      });
    } catch (error: any) {
      console.error("Gemini Receipt Parse Error:", error);
      res.status(500).json({ error: error.message || "Falha ao processar o comprovante na IA" });
    }
  });

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
