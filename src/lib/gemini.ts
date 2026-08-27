import { GoogleGenAI } from '@google/genai';

/**
 * Modelo padrão estável do Gemini
 */
export const GEMINI_MODEL = 'gemini-2.0-flash';

/**
 * Retorna a instância configurada do GoogleGenAI utilizando a variável de ambiente Vite.
 */
export const getGemini = (): GoogleGenAI => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey || apiKey === "COLE_SUA_CHAVE_AQUI" || apiKey.trim() === "") {
    console.error(
      "❌ Chave da API do Gemini não configurada! Certifique-se de que a variável de ambiente 'VITE_GEMINI_API_KEY' está definida no seu arquivo .env ou no painel de Secrets do AI Studio."
    );
  }

  return new GoogleGenAI({ apiKey: apiKey || "" });
};


