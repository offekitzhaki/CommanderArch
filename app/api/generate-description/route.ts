import { NextResponse } from 'next/server';

const API_KEY = process.env.API_KEY;
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

if (!API_KEY) {
    throw new Error("API_KEY environment variable not set.");
}

export async function POST(request: Request) {
    try {
        const { command } = await request.json();

        if (!command) {
            return NextResponse.json({ error: 'Command is required' }, { status: 400 });
        }

        const payload = {
            contents: [{
                parts: [{
                    text: `Provide a short, one-sentence description for the following command-line tool or command: \`${command}\`. Start the sentence with a verb.`
                }]
            }]
        };

        const apiResponse = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!apiResponse.ok) {
            const errorBody = await apiResponse.json();
            console.error("Gemini API Error:", errorBody);
            return NextResponse.json({ error: `API error: ${errorBody.error.message}` }, { status: apiResponse.status });
        }

        const responseData = await apiResponse.json();
        
        // Accessing the text directly via the documented path
        const description = responseData.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!description) {
            console.error("API did not return expected text. Full response:", responseData);
            return NextResponse.json({ error: "Failed to generate description: API returned no text." }, { status: 500 });
        }
        
        return NextResponse.json({ description: description.trim() });

    } catch (error) {
        console.error("Error in /api/generate-description:", error);
        return NextResponse.json({ error: 'Failed to generate description.' }, { status: 500 });
    }
}