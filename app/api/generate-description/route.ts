import { NextResponse } from 'next/server';
import { GoogleGenAI } from "@google/genai";

// Ensure process.env.API_KEY is available.
if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function POST(request: Request) {
    try {
        const { command } = await request.json();

        if (!command) {
            return NextResponse.json({ error: 'Command is required' }, { status: 400 });
        }

        const geminiResponse = await ai.models.generateContent({
            // Corrected the model name
            model: 'gemini-1.5-flash',
            contents: `Provide a short, one-sentence description for the following command-line tool or command: \`${command}\`. Start the sentence with a verb.`,
        });

        const result = geminiResponse.response;

        // --- MAJOR FIX HERE ---
        // Call the text() function to get the string content
        const description = result.text();

        // Now, you can safely work with the 'description' string
        if (!description) {
            console.error("Gemini API did not return expected text.");
            return NextResponse.json({ error: "Failed to generate description: API returned no text." }, { status: 500 });
        }

        return NextResponse.json({ description: description.trim() });

    } catch (error) {
        console.error("Error in /api/generate-description:", error);
        return NextResponse.json({ error: 'Failed to generate description.' }, { status: 500 });
    }
}