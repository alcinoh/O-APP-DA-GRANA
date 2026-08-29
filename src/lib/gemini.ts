import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Modelo padrão estável do Gemini
 */
export const GEMINI_MODEL = 'gemini-1.5-flash';

/**
 * Retorna a instância configurada do GoogleGenerativeAI utilizando a variável de ambiente Vite.
 */
export const getGemini = (customKey?: string): GoogleGenerativeAI => {
  const apiKey = customKey || import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey || apiKey === 'COLE_SUA_CHAVE_AQUI' || apiKey.trim() === '') {
    throw new Error('API Key ausente. Configure a variável VITE_GEMINI_API_KEY no seu arquivo .env');
  }

  return new GoogleGenerativeAI(apiKey.trim());
};
