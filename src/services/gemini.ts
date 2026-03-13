import { GoogleGenAI, Type } from "@google/genai";

const getAI = () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not defined");
  }
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
};

export const analyzeSymptoms = async (symptoms: string, language: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze the following symptoms for a patient in a rural setting. Provide potential conditions, urgency level (Low, Medium, High), and recommended next steps. Respond in ${language}. Symptoms: ${symptoms}`,
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

  return JSON.parse(response.text);
};

export const detectSkinDisease = async (base64Image: string, language: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: base64Image.split(",")[1] || base64Image,
          },
        },
        {
          text: `Analyze this skin condition image. Identify possible diseases, provide a brief description, and recommend if a specialist visit is necessary. Respond in ${language}.`,
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

  return JSON.parse(response.text);
};

export const transcribeSymptoms = async (audioBase64: string) => {
  // Note: Using Gemini for audio transcription if native audio model is available
  // For now, we'll assume the worker uses the browser's Web Speech API for real-time STT,
  // but this service can be used for post-processing or translation.
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
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
