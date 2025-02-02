import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const { messages } = await request.json();

        // Extract the last user message
        const lastMessage = messages[messages.length - 1].content;

        // Send the prompt to Ollama
        const ollamaResponse = await fetch("http://localhost:11434/api/generate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "llama2", // Replace with your model name
                prompt: lastMessage,
                stream: false, // Set to true if you want a streamed response
            }),
        });

        if (!ollamaResponse.ok) {
            throw new Error(`Ollama API Error: ${ollamaResponse.statusText}`);
        }

        const data = await ollamaResponse.json();
        return NextResponse.json({ result: data.response });
    } catch (error) {
        console.error("Error in API route:", error);
        return NextResponse.json(
            { error: "Failed to process the question" },
            { status: 500 }
        );
    }
}
