import { GoogleGenAI } from '@google/genai';

/**
 * Modelo padrão estável do Gemini com suporte nativo a multimodalidade (PDF, imagens e documentos)
 */
export const GEMINI_MODEL = 'gemini-1.5-flash';

/**
 * Retorna a instância configurada do GoogleGenAI utilizando a variável de ambiente Vite.
 */
export const getGemini = (): GoogleGenAI => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey || apiKey === 'COLE_SUA_CHAVE_AQUI' || apiKey.trim() === '') {
    throw new Error('API key is missing. Defina a variável VITE_GEMINI_API_KEY no seu arquivo .env');
  }

  return new GoogleGenAI({ apiKey: apiKey.trim() });
};

export interface ExtractedReceipt {
  description: string;
  amount: number;
  date: string; // YYYY-MM-DD
  category: string;
  type: 'expense' | 'income';
}

/**
 * Lê uma imagem de comprovante ou nota fiscal e extrai os dados estruturados via Gemini Vision
 */
export async function parseReceiptWithGemini(base64Data: string, mimeType: string): Promise<ExtractedReceipt> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const todayStr = new Date().toISOString().split('T')[0];

  // 1. Se a chave estiver disponível no cliente (Vite), executa diretamente no client
  if (apiKey && apiKey !== 'COLE_SUA_CHAVE_AQUI' && apiKey.trim() !== '') {
    const ai = new GoogleGenAI({ apiKey: apiKey.trim() });

    const prompt = `Você é um assistente financeiro especialista em leitura de documentos fiscais, notas, cupons de supermercado/restaurante, faturas e comprovantes de pagamento/PIX.
Analise a imagem ou PDF deste documento e extraia os seguintes dados estruturados com extrema precisão:
- description: Nome do estabelecimento comercial, loja, fornecedor ou beneficiário/pagador (ex: "Supermercado Extra", "Posto Ipiranga", "Uber", "Farmácia Drogasil")
- amount: Valor total monetário (apenas o número float, ex: 145.90)
- date: Data indicada no documento no formato "YYYY-MM-DD". Se não estiver explícita, use "${todayStr}".
- category: Categoria sugerida mais apropriada (ex: "Alimentação", "Transporte", "Saúde", "Moradia", "Lazer", "Educação", "Serviços", "Salário", "Outros")
- type: "expense" (para pagamentos, compras, boletos, despesas) ou "income" (para recebimentos, comprovante de transferência recebida, salário)

Retorne EXCLUSIVAMENTE o objeto JSON válido, sem texto explicativo adicional.`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType: mimeType || 'application/pdf'
              }
            },
            {
              text: prompt
            }
          ]
        }
      ],
      config: {
        responseMimeType: 'application/json',
      }
    });

    const text = response.text || '';
    const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    return {
      description: parsed.description || 'Lançamento via Comprovante',
      amount: typeof parsed.amount === 'number' ? parsed.amount : Math.abs(parseFloat(parsed.amount || '0')) || 0,
      date: parsed.date || todayStr,
      category: parsed.category || 'Alimentação',
      type: parsed.type === 'income' ? 'income' : 'expense'
    };
  }

  // 2. Se a chave não estiver no cliente, chama o endpoint seguro do backend
  try {
    const res = await fetch('/api/parse-receipt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ base64Data, mimeType })
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `Erro do servidor HTTP ${res.status}`);
    }

    const data = await res.json();
    return data as ExtractedReceipt;
  } catch (error: any) {
    if (error.message && error.message.includes('API key is missing')) {
      throw new Error('API key is missing. Defina a variável VITE_GEMINI_API_KEY no arquivo .env para ler comprovantes com IA.');
    }
    throw error;
  }
}
