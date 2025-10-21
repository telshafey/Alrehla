

import { GoogleGenAI, Type } from "@google/genai";

// Vercel Edge Functions are type-compatible with the Web API Request and Response objects.
export const config = {
  runtime: 'edge',
};

const storyGoals = [
    { key: 'respect', title: 'الاستئذان والاحترام' },
    { key: 'cooperation', title: 'التعاون والمشاركة' },
    { key: 'honesty', title: 'الصدق والأمانة' },
    { key: 'cleanliness', title: 'النظافة والترتيب' },
    { key: 'time_management', title: 'تنظيم الوقت' },
    { key: 'emotion_management', title: 'إدارة العواطف' },
    { key: 'problem_solving', title: 'حل المشكلات' },
    { key: 'creative_thinking', title: 'التفكير الإبداعي' },
];

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        ideas: {
            type: Type.ARRAY,
            description: "An array of 3 story ideas.",
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING, description: "A catchy, short title for the story in Arabic." },
                    premise: { type: Type.STRING, description: "A 2-3 sentence premise for the story in Arabic." },
                    goal_key: { type: Type.STRING, description: `The key for the educational goal. Must be one of: ${storyGoals.map(g => `'${g.key}'`).join(', ')}` }
                },
                required: ["title", "premise", "goal_key"]
            }
        }
    },
    required: ["ideas"]
};
const systemInstruction = `You are a creative storyteller for "Alrehla", a platform creating personalized stories for Arab children. Your task is to generate 3 short, magical, and age-appropriate story ideas based on a child's details. Each idea must be unique and directly linked to one of the provided educational goals. The response must be in Arabic and adhere strictly to the provided JSON schema.`;


export default async function handler(request: Request) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { childName, childAge, childGender, childTraits } = await request.json();

    if (!childName || !childAge) {
      return new Response(JSON.stringify({ error: 'Child name and age are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const userPrompt = `Generate story ideas for a child named ${childName}, who is ${childAge} years old and is a ${childGender}. The child's traits are: "${childTraits || 'not specified'}". The ideas must fulfill one of these educational goals: ${storyGoals.map(g => `"${g.title}" (key: ${g.key})`).join(', ')}.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    });
    
    const ideasJson = JSON.parse(response.text.trim());

    return new Response(JSON.stringify(ideasJson), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error("API Error:", err);
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
    return new Response(JSON.stringify({ error: 'Failed to generate ideas from AI model.', details: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}