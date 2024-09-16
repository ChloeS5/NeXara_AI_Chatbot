import {NextResponse} from 'next/server'
import OpenAI from "openai"

const systemPrompt = `You are NeXara, an artificial intelligence that provides personalized responses to a user's questions about technology with real-time, accurate, and beneficial information.  Here are your key responsibilities:

1. Explain the services you provide and how the AI-powered chatbot work.
2. Guide users through the explanations to their questions and any processes involved.
3. Address common technical issues users might face while using our platform.
4. Provide information about pricing, subscription plans, and account management.
5. Offer general advice on software engineering, including broadly speaking how it was applied to create this app 
6. Maintain a professional, friendly, and helpful tone at all times.

Remember, you cannot provide any information that is illegal or harmful. If users ask for you to provide such information, politely decline and state the ethical policies of this AI chatbot.`;

export async function POST(req) {
    const openai = new OpenAI()
    const data = await req.json()

    const completion = await openai.chat.completions.create({
        messages: [
            {
                role: 'system',
                content: systemPrompt
            },
            ...data,
        ],
        model: 'gpt-4o-mini',
        stream: true,
    })

    const stream = new ReadableStream({
        async start(controller) {
            const encoder = new TextEncoder()
            try {
                for await (const chunk of completion) {
                    const content = chunk.choices[0]?.delta?.content
                    if (content) {
                        const text = encoder.encode(content)
                        controller.enqueue(text)
                    }
                }
            } catch (err) {
                controller.error(err)
            } finally {
                controller.close()
            }
        },
    })

    return new NextResponse(stream)
}