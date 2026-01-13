
import { GoogleGenAI, Type } from "@google/genai";
import { CardFormData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const extractCardData = async (base64Image: string): Promise<CardFormData> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: base64Image.split(',')[1] || base64Image,
          },
        },
        {
          text: "Extract contact information from this business card. Be precise. If a field is missing, return an empty string. Focus on Name, Company, Job Title, Phone, Email, Website, and Address."
        }
      ],
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          companyName: { type: Type.STRING },
          jobTitle: { type: Type.STRING },
          phone: { type: Type.STRING },
          email: { type: Type.STRING },
          website: { type: Type.STRING },
          address: { type: Type.STRING },
        },
        required: ["name", "companyName", "jobTitle", "phone", "email", "website", "address"]
      }
    }
  });

  try {
    const jsonStr = response.text.trim();
    return JSON.parse(jsonStr) as CardFormData;
  } catch (error) {
    console.error("Failed to parse Gemini response:", error);
    throw new Error("Could not extract data from the card.");
  }
};
