import { GoogleGenAI, Type } from "@google/genai";

const getAI = () => {
  // Vite exposes env variables via import.meta.env, NOT process.env
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("VITE_GEMINI_API_KEY is not defined in .env.local");
  }
  return new GoogleGenAI({ apiKey });
};

export const analyzeSymptoms = async (symptoms: string, language: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `You are a medical assistant helping rural health workers in India. 
Analyze the following patient symptoms and provide:
1. Possible medical conditions
2. Urgency level (Low, Medium, or High)
3. Recommended next steps for the health worker

Respond in ${language === 'hi' ? 'Hindi' : language === 'mr' ? 'Marathi' : 'English'}.
Symptoms: ${symptoms}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          analysis: { type: Type.STRING },
          urgency: { type: Type.STRING, enum: ["Low", "Medium", "High"] },
          nextSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["analysis", "urgency", "nextSteps"],
      },
    },
  });

  const text = response.text;
  if (!text) throw new Error("Empty response from Gemini");
  return JSON.parse(text);
};

export const detectSkinDisease = async (base64Image: string, language: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-1.5-flash",
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: base64Image.split(",")[1] || base64Image,
          },
        },
        {
          text: `Analyze this skin condition image. Identify possible diseases, provide a brief description, and recommend if a specialist visit is necessary. Respond in ${language === 'hi' ? 'Hindi' : language === 'mr' ? 'Marathi' : 'English'}.`,
        },
      ],
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          condition: { type: Type.STRING },
          description: { type: Type.STRING },
          specialistRequired: { type: Type.BOOLEAN },
          recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["condition", "description", "specialistRequired", "recommendations"],
      },
    },
  });

  const text = response.text;
  if (!text) throw new Error("Empty response from Gemini");
  return JSON.parse(text);
};

export const transcribeSymptoms = async (audioBase64: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-1.5-flash",
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: "audio/wav",
            data: audioBase64,
          },
        },
        {
          text: "Transcribe the medical symptoms mentioned in this audio accurately.",
        },
      ],
    },
  });

  return response.text;
};
