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

        const result = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: `Provide a short, one-sentence description for the following command-line tool or command: \`${command}\`. Start the sentence with a verb.`,
        });

        // The error log proved 'result.response' doesn't exist.
        // The correct, safe path is through the 'candidates' array on the result object itself.
        const response = result.response;
        const text = response.candidates?.[0]?.content?.parts?.[0]?.text;

        // This check is now robust and safe.
        if (!text) {
            console.error("Gemini API did not return expected text. Full response:", JSON.stringify(result.response, null, 2));
            if (result.response.promptFeedback?.blockReason) {
                return NextResponse.json({ error: `Request was blocked: ${result.response.promptFeedback.blockReason}` }, { status: 400 });
            }
            return NextResponse.json({ error: "Failed to generate description: API returned no text." }, { status: 500 });
        }

        return NextResponse.json({ description: text.trim() });

    } catch (error) {
        console.error("Error in /api/generate-description:", error);
        return NextResponse.json({ error: 'Failed to generate description.' }, { status: 500 });
    }
}