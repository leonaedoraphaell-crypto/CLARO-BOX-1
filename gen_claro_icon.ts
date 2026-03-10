import { GoogleGenAI } from "@google/genai";

async function generate() {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey) {
    console.error("No API key found in environment");
    return;
  }

  const ai = new GoogleGenAI({ apiKey });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: "A high-quality 3D app icon of a 'Claro Box' device. The device is a sleek black set-top box. On the front panel: a glowing green LED on the right side, a circular power button on the left side, and a central engraving with the text 'Claro Box' and the red circular Claro logo. The image is framed as a rounded square icon with soft shadows and a premium finish, similar to an iPhone app icon style.",
          },
        ],
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        console.log("IMAGE_DATA_START");
        console.log(part.inlineData.data);
        console.log("IMAGE_DATA_END");
        return;
      }
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

generate();
