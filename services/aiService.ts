import { GoogleGenAI, Type, Modality, Chat } from "@google/genai";
import { Category, ContentItem, AIProvider, SemanticConnection } from "../types";
import { vaultService } from "./vaultService";

/**
 * AI DATA STRUCTURES
 */
export interface QuizData {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

/**
 * GEMINI PROVIDER FACTORY
 * Provides isolated model instances. It is stateless and immutable.
 */
export const GeminiProvider = {
  /**
   * Resolves the API key and returns a fresh GoogleGenAI instance.
   * This is called on-demand by features, never at app startup.
   */
  async getClient(): Promise<GoogleGenAI> {
    const apiKey = await vaultService.getKey(AIProvider.GEMINI) || process.env.API_KEY;
    if (!apiKey) throw new Error("NEURAL_LINK_DISCONNECTED");
    return new GoogleGenAI({ apiKey });
  },

  /**
   * Helper to create a specific model instance with a fresh client.
   */
  async createModel(modelName: string = 'gemini-3-flash-preview') {
    const client = await this.getClient();
    return { client, modelName };
  }
};

// Helper: Standard string sanitization
export const stripMarkdown = (text: string): string => text.replace(/\*\*|#/g, '');

// Helper: Map AI strings to internal Category enum
const mapCategory = (catString: string): Category => {
  const catUpper = catString.toUpperCase();
  if (catUpper.includes('STACK')) return Category.FULL_STACK;
  if (catUpper.includes('UI') || catUpper.includes('UX')) return Category.UI_UX;
  if (catUpper.includes('DESIGN')) return Category.DESIGN;
  if (catUpper.includes('GAME')) return Category.GAME_DEV;
  if (catUpper.includes('AI') || catUpper.includes('ML')) return Category.AI_ML;
  if (catUpper.includes('TOOL')) return Category.TOOLS;
  if (catUpper.includes('SCREENSHOT')) return Category.SCREENSHOTS;
  if (catUpper.includes('NOTE')) return Category.NOTES;
  return Category.OTHER;
};

/** 
 * FEATURE: CONTENT ANALYSIS
 */
export const analyzeContent = async (input: string): Promise<{title: string, summary: string, category: Category}> => {
  const { client, modelName } = await GeminiProvider.createModel();
  
  const response = await client.models.generateContent({
    model: modelName,
    contents: `Analyze: "${input}". Return JSON {title, summary, category}.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          summary: { type: Type.STRING },
          category: { type: Type.STRING }
        },
        required: ["title", "summary", "category"]
      }
    }
  });

  const data = JSON.parse(response.text || '{}');
  return {
    title: stripMarkdown(data.title),
    summary: stripMarkdown(data.summary),
    category: mapCategory(data.category)
  };
};

/**
 * FEATURE: AUDIO BRIEFING (STASHCAST)
 */
export const generateAudioBriefing = async (items: ContentItem[]): Promise<string> => {
  const { client } = await GeminiProvider.createModel('gemini-2.5-flash-preview-tts');
  
  const prompt = `Say the following in a cheerful student radio voice: "Hey everyone! Here is your quick SaveStack update. First, ${items.map(i => `${i.title}, which is ${i.summary}`).join('. Next up, ')}. Keep studying!"`;
  
  const response = await client.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } },
      },
    },
  });
  
  return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || "";
};

/**
 * FEATURE: SEMANTIC MAPPING (BRAIN WEB)
 */
export const analyzeConnections = async (items: ContentItem[]): Promise<SemanticConnection[]> => {
  const { client } = await GeminiProvider.createModel('gemini-3-pro-preview');
  
  const prompt = `Analyze these ${items.length} items and find 5-8 semantic connections. Provide JSON array of connections: {fromId, toId, type, reason}. Items: ${JSON.stringify(items.map(i => ({id: i.id, title: i.title, summary: i.summary})))}`;
  
  const response = await client.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          connections: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                fromId: { type: Type.STRING },
                toId: { type: Type.STRING },
                type: { type: Type.STRING },
                reason: { type: Type.STRING }
              },
              required: ["fromId", "toId", "type", "reason"]
            }
          }
        },
        required: ["connections"]
      }
    }
  });

  const data = JSON.parse(response.text || '{"connections":[]}');
  return data.connections || [];
};

/**
 * FEATURE: EDUCATIONAL SUMMARY (GENIE)
 */
export const getEducationalSummary = async (item: ContentItem): Promise<string> => {
  const { client, modelName } = await GeminiProvider.createModel();
  const response = await client.models.generateContent({
    model: modelName,
    contents: `Expert tutor summary for: "${item.title}". Context: "${item.summary}". Under 8 lines, no markdown.`,
  });
  return stripMarkdown(response.text || "");
};

/**
 * FEATURE: QUIZ GENERATION
 */
export const generateQuiz = async (item: ContentItem): Promise<QuizData> => {
  const { client, modelName } = await GeminiProvider.createModel();
  const response = await client.models.generateContent({
    model: modelName,
    contents: `Create a 4-option multiple choice quiz about: "${item.title}". Return JSON {question, options, correctIndex, explanation}.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          options: { type: Type.ARRAY, items: { type: Type.STRING } },
          correctIndex: { type: Type.INTEGER },
          explanation: { type: Type.STRING }
        },
        required: ["question", "options", "correctIndex", "explanation"]
      }
    }
  });
  return JSON.parse(response.text || '{}');
};

/**
 * FEATURE: INTERACTIVE CHAT SESSIONS
 */
export const createProjectChat = async (item: ContentItem): Promise<Chat> => {
  const { client, modelName } = await GeminiProvider.createModel();
  return client.chats.create({
    model: modelName,
    config: { systemInstruction: `You are an expert tutor. You are helping a student understand their saved content: "${item.title}". Keep responses under 4 lines, no markdown.` },
  });
};

export const createHelpChat = async (): Promise<Chat> => {
  const { client, modelName } = await GeminiProvider.createModel();
  return client.chats.create({
    model: modelName,
    config: { systemInstruction: "You are the SaveStack Guide. Keep answers short and sassy." },
  });
};

/**
 * FEATURE: IMAGE ANALYSIS
 */
export const analyzeImage = async (base64Data: string, mimeType: string): Promise<{title: string, summary: string, category: Category}> => {
  const { client, modelName } = await GeminiProvider.createModel();
  const response = await client.models.generateContent({
    model: modelName,
    contents: {
      parts: [
        { inlineData: { data: base64Data, mimeType: mimeType } },
        { text: "Analyze this image. Return JSON {title, summary, category}." }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          summary: { type: Type.STRING },
          category: { type: Type.STRING }
        },
        required: ["title", "summary", "category"]
      }
    }
  });
  const data = JSON.parse(response.text || '{}');
  return {
    title: stripMarkdown(data.title),
    summary: stripMarkdown(data.summary),
    category: mapCategory(data.category)
  };
};
