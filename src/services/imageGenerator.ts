import { GoogleGenAI } from "@google/genai";

export async function generateImage(prompt: string) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    console.error("API key not found. Make sure VITE_GEMINI_API_KEY is set.");
    return;
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: { parts: [{ text: prompt }] },
    });

    console.log(response);
    return response;

  } catch (error) {
    console.error("Error generating image:", error);
  }
}
