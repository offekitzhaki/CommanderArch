import { NextResponse } from 'next/server';

const API_KEY = process.env.API_KEY;
// This is the standard direct endpoint for the Gemini API
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

        // The exact payload structure required by the REST API
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

        const responseData = await apiResponse.json();

        if (!apiResponse.ok) {
            console.error("Gemini API Error:", responseData);
            const errorMessage = responseData?.error?.message || "An unknown API error occurred";
            // The API returns detailed errors, so we show them to the user.
            return NextResponse.json({ error: `API error: ${errorMessage}` }, { status: apiResponse.status });
        }
        
        // This is the verified, correct path to the text in a direct API response
        const description = responseData.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!description) {
            console.error("API did not return expected text. Full response:", responseData);
            return NextResponse.json({ error: "Failed to generate description: API returned no text." }, { status: 500 });
        }
        
        return NextResponse.json({ description: description.trim() });

    } catch (error) {
        // This will catch network errors or other issues with the fetch call itself
        console.error("Fetch request failed:", error);
        return NextResponse.json({ error: 'Failed to make a request to the Gemini API.' }, { status: 500 });
    }
}