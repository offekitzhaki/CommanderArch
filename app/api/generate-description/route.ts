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

        // Step 1: Get the full result object from the API
        const result = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: `Provide a short, one-sentence description for the following command-line tool or command: \`${command}\`. Start the sentence with a verb.`,
        });

        // Step 2: Access the 'response' property from the result
        const response = result.response;
        
        // Step 3: Call the text() function on the response object
        const description = response.text();

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