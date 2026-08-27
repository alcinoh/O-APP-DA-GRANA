import { GoogleGenAI } from '@google/genai';

// COLE_SUA_CHAVE_AQUI
export const GEMINI_API_KEY = "COLE_SUA_CHAVE_AQUI";

let aiInstance: GoogleGenAI | null = null;

export const getGemini = () => {
  if (!aiInstance) {
    if (!GEMINI_API_KEY || GEMINI_API_KEY === "COLE_SUA_CHAVE_AQUI") {
      console.warn("⚠️ Chave da API do Gemini não configurada!");
      // We still return an instance, but calls will fail until the key is valid.
    }
    aiInstance = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  }
  return aiInstance;
};
