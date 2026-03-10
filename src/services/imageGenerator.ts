import { GoogleGenAI } from "@google/genai";

let aiInstance: GoogleGenAI | null = null;

function getAI() {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined. Please set it in your environment.");
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}

export async function generateClaroIcon(customPrompt?: string, referenceImage?: string) {
  try {
    const ai = getAI();
    const basePrompt = "A high-quality 3D app icon of a 'Claro Box' device. The device is a sleek black set-top box. On the front panel: a glowing green LED on the right side, a circular power button on the left side, and a central engraving with the text 'Claro Box' and the red circular Claro logo. The image MUST BE a rounded square icon (iPhone style), NOT a circle. It should have soft shadows and a premium finish.";
    
    const finalPrompt = customPrompt ? `${basePrompt} Additional instructions: ${customPrompt}` : basePrompt;

    const parts: any[] = [{ text: finalPrompt }];
    
    if (referenceImage) {
      const [mimeType, data] = referenceImage.split(';base64,');
      parts.push({
        inlineData: {
          mimeType: mimeType.split(':')[1],
          data: data
        }
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: parts,
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
  } catch (error) {
    console.error("AI Generation Error:", error);
  }
  return null;
}
