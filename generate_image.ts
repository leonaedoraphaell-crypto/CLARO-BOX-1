import { GoogleGenAI } from "@google/genai";

async function generate() {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY not found");
    process.exit(1);
  }

  const ai = new GoogleGenAI({ apiKey });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: "A sleek, modern electronic set-top box called 'Claro Box'. On the front panel, there is a glowing green LED on the right side and a circular power button on the left side. In the center of the front panel, there is a high-quality engraving of the text 'Claro Box' alongside the official Claro logo (a red circle with white 'claro' text). The entire device is presented as a high-fidelity, 3D-rendered app icon with rounded corners, similar to an iOS/iPhone icon style, with soft shadows and a premium metallic or matte finish.",
          },
        ],
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        console.log(part.inlineData.data);
        return;
      }
    }
    console.error("No image generated");
  } catch (error) {
    console.error("Error generating image:", error);
    process.exit(1);
  }
}

generate();
