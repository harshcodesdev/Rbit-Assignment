import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const generateSummary = async (data: any[]): Promise<string> => {
    try {
        const prompt = `
      You are an expert Sales Analyst. Your job is to concisely summarize the following sales data into a professional narrative for executive leadership.
      Highlight key metrics, top performing products, regional insights, and any noticeable trends or anomalies.
      Please format your response in clear HTML with headers, lists, and bold text for readability in an email, also give proper html only nothing else not no quotes unquotes '' or any kind of \`\` stuff.

      Data Sample (first 100 rows):
      ${JSON.stringify(data.slice(0, 100))}
    `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        return response.text || "No summary generated.";
    } catch (error) {
        console.error("LLM Error:", error);
        throw new Error("Failed to generate summary via Gemini API");
    }
};
