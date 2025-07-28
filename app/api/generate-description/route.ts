import { NextResponse } from 'next/server';
import { GoogleGenAI } from "@google/genai";

// Ensure process.env.API_KEY is available. If not, this will throw an error during build/startup.
if (!process.env.API_KEY) {
    console.error("API_KEY environment variable not set.");
    throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function POST(request: Request) {
    try {
        const { command } = await request.json();

        if (!command) {
            return NextResponse.json({ error: 'Command is required' }, { status: 400 });
        }

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Provide a short, one-sentence description for the following command-line tool or command: \`${command}\`. Start the sentence with a verb.`,
        });
        const result = response.response; 

       
        if (!result || !result.text) {
            console.error("Gemini API did not return expected text.");
            return NextResponse.json({ error: "Failed to generate description: API returned no text." }, { status: 500 });
        }

        const description = result.text.trim();
        return NextResponse.json({ description });

    } catch (error) {
        console.error("Error in /api/generate-description:", error);
        return NextResponse.json({ error: 'Failed to generate description.' }, { status: 500 });
    }
}