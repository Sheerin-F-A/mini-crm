import { GoogleGenAI } from '@google/genai';

// Initialize the Google Gen AI client. 
// Note: Ensure GEMINI_API_KEY is set in your .env file
export const ai = process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null;

// Helper function for structured JSON responses
export async function generateJSON<T>(prompt: string, systemInstruction?: string): Promise<T | null> {
  if (!ai) {
    console.warn("GEMINI_API_KEY is not set. Skipping AI generation.");
    return null;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        temperature: 0.2, // Low temperature for more deterministic JSON outputs
      }
    });

    const text = response.text;
    if (!text) return null;
    
    return JSON.parse(text) as T;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return null;
  }
}
