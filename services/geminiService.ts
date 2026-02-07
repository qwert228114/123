import { GoogleGenAI, Modality } from "@google/genai";
import { Word } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates audio for a specific word pattern:
 * 1. English
 * 2. Chinese
 * 3. English (Repeat 1)
 * 4. English (Repeat 2)
 */
export const generateWordAudio = async (word: Word): Promise<string | undefined> => {
  // Construct a prompt that enforces the specific reading pattern
  // Using punctuation to create natural pauses.
  const promptText = `
    Please read the following vocabulary pattern clearly.
    First, say the English word: "${word.english}".
    Second, say the Chinese meaning: "${word.chinese}".
    Third, repeat the English word twice: "${word.english}", "${word.english}".
    
    Maintain a moderate, clear pace suitable for learning.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: promptText }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' }, // 'Kore' is usually good for clear enunciation
          },
        },
      },
    });

    // Extract the base64 audio data
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    
    if (!base64Audio) {
      console.error("No audio data received from Gemini.");
      return undefined;
    }

    return base64Audio;
  } catch (error) {
    console.error("Error generating audio:", error);
    throw error;
  }
};
