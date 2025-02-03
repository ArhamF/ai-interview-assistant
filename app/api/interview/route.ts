import { NextResponse } from "next/server"

export async function POST(request: Request) {
    try {
        const { messages } = await request.json()

        // Prepare the prompt by including context from previous messages
        const prompt =
            messages.map((msg: any) => `${msg.role}: ${msg.content}`).join("\n") +
            "\nAssistant: Let me think about this step by step:\n"

        // Create a new TransformStream for streaming
        const stream = new TransformStream()
        const writer = stream.writable.getWriter()

        // Start the Ollama request
        fetch("http://localhost:11434/api/generate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "deepseek-coder:1.5b",
                prompt: prompt,
                stream: true,
            }),
        })
            .then(async (response) => {
                if (!response.ok) {
                    throw new Error(`Ollama API Error: ${response.statusText}`)
                }

                const reader = response.body?.getReader()
                if (!reader) {
                    throw new Error("Response body is not readable")
                }

                while (true) {
                    const { done, value } = await reader.read()
                    if (done) {
                        await writer.close()
                        break
                    }
                    const chunk = new TextDecoder().decode(value)
                    const lines = chunk.split("\n")
                    for (const line of lines) {
                        if (line.trim() !== "") {
                            const parsed = JSON.parse(line)
                            await writer.write(parsed.response.replace(/\n/g, "\r\n"))
                        }
                    }
                }
            })
            .catch(async (error) => {
                console.error("Error in API route:", error)
                await writer.abort(error)
            })

        return new NextResponse(stream.readable, {
            headers: {
                "Content-Type": "text/plain",
            },
        })
    } catch (error) {
        console.error("Error in API route:", error)
        return NextResponse.json({ error: "Failed to process the question" }, { status: 500 })
    }
}
