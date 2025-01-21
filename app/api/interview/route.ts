import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';  // Correct import

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const INTERVIEW_POSITION = "python developer";
const SYSTEM_PROMPT = `You are interviewing for a ${INTERVIEW_POSITION} position.
You will receive an audio transcription of the question. It may not be complete. You need to understand the question and write an answer to it.
Before answering, take a deep breath and think one step at a time. Believe the answer in no more than 150 words.`;

export async function POST(req: Request) {
    try {
        const { question } = await req.json();

        if (!question) {
            return NextResponse.json(
                { error: 'Question is required' },
                { status: 400 }
            );
        }

        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            temperature: 0.7,
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "user", content: question }
            ],
        });

        const answer = response.choices[0].message.content;

        return NextResponse.json({ response: answer });

    } catch (error) {
        console.error('Error processing interview question:', error);
        return NextResponse.json(
            { error: 'Failed to process interview question' },
            { status: 500 }
        );
    }
}
