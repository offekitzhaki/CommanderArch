import { NextResponse } from 'next/server';
import { GoogleGenAI } from "@google/genai";

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

        // The object returned here is the final response object.
        const result = await ai.models.generateContent({
            // Using the correct and valid model name
            model: 'gemini-1.5-flash',
            contents: `Provide a short, one-sentence description for the following command-line tool or command: \`${command}\`. Start the sentence with a verb.`,
        });

        // The 'result' object itself contains the text() function.
        // There is no need to access a nested 'response' property.
        const description = result.response.text();

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