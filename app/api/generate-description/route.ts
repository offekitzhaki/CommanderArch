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

        // The error "Property 'response' does not exist..." means we must work with the 'result' object directly.
        // We will access the text via its full path to avoid TypeScript errors.
        const response = result.response;
        const text = response.candidates?.[0]?.content?.parts?.[0]?.text;

        // This check is now robust. If the path to the text is broken for any reason
        // (e.g., no candidates returned), this will safely handle it.
        if (!text) {
            console.error("Gemini API did not return expected text. Full response:", JSON.stringify(response, null, 2));
            
            // Provide more specific feedback if the request was blocked
            if (response.promptFeedback?.blockReason) {
                return NextResponse.json({ error: `Request was blocked: ${response.promptFeedback.blockReason}` }, { status: 400 });
            }
            
            return NextResponse.json({ error: "Failed to generate description: API returned no text." }, { status: 500 });
        }

        return NextResponse.json({ description: text.trim() });

    } catch (error) {
        console.error("Error in /api/generate-description:", error);
        return NextResponse.json({ error: 'Failed to generate description.' }, { status: 500 });
    }
}