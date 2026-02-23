import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API_KEY is missing in environment variables.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Generates a warm, poetic thank you note for a new subscriber.
 */
export const generateThankYouNote = async (name: string, wantsPostcard: boolean): Promise<string> => {
  const ai = getClient();
  if (!ai) return "谢谢您的爱心！愿这份温暖也照亮您的生活。";

  try {
    const context = wantsPostcard 
      ? "The user has also requested a physical postcard." 
      : "The user has subscribed to email updates.";
      
    const prompt = `
      You are a warm, gentle voice for a charity group of 4 girls donating clothes to rural schools.
      Write a short, poetic, and emotional thank you message (max 60 words) in Chinese for a donor named "${name}".
      ${context}
      Express gratitude for their connection and promise to keep them updated. 
      Tone: Sincere, touching, hopeful.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "谢谢您的善意，愿温暖常伴。";
  } catch (error) {
    console.error("Error generating thank you note:", error);
    return `谢谢你，${name}。每一份善意都是黑暗中的一束光。我们会带着你的爱继续前行。`;
  }
};

/**
 * Generates a supportive comment suggestion for the guestbook.
 */
export const generateEncouragement = async (): Promise<string> => {
  const ai = getClient();
  if (!ai) return "加油！未来可期！";

  try {
    const prompt = `
      Generate a short, encouraging message (1 sentence, Chinese) that a donor might write to a student in a rural school.
      Focus on studying hard, dreaming big, or feeling loved.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "愿你哪怕在缝隙里，也要开出最美丽的花。";
  } catch (error) {
    return "孩子们，外面的世界很精彩，我在未来等你们！";
  }
};
