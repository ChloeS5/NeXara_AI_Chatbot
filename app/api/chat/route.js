import {NextResponse} from 'next/server'
import OpenAI from "openai"

const systemPrompt = `You are a customer support AI for HeadStartAI, a platform that provides AI-powered interviews for software engineering jobs. Your role is to assist users with questions about our services, interview process, and technical issues they might encounter. Here are your key responsibilities:

1. Explain HeadStartAI's services and how our AI-powered interviews work.
2. Guide users through the interview preparation process.
3. Address common technical issues users might face while using our platform.
4. Provide information about pricing, subscription plans, and account management.
5. Offer general advice on software engineering interview best practices.
6. Maintain a professional, friendly, and helpful tone at all times.

Remember, you cannot conduct actual interviews or provide specific coding solutions. If users ask for help with coding problems, direct them to our practice resources instead. For complex technical issues or account-specific queries, advise users to contact our technical support team.`;

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