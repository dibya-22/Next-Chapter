import { auth } from "@clerk/nextjs/server";
import { NextResponse, NextRequest } from 'next/server';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({})

// ! Content filter for harmful/explicit words
const harmfulWords = [
    'fuck', 'shit', 'bitch', 'ass', 'damn', 'hell', 'piss', 'cock', 'dick', 'pussy',
    'cunt', 'whore', 'slut', 'bastard', 'motherfucker', 'fucker', 'fucking', 'shitty',
    'asshole', 'dumbass', 'jackass', 'dickhead', 'prick', 'twat', 'wanker', 'cocksucker'
];

function containsHarmfulContent(message: string): boolean {
    const lowerMessage = message.toLowerCase();
    return harmfulWords.some(word => lowerMessage.includes(word));
}

export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();
        
        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { message, conversationHistory = [] } = body;

        if (!message) {
            return NextResponse.json(
                { error: 'Message is required' },
                { status: 400 }
            );
        }

        // Check for harmful content
        if (containsHarmfulContent(message)) {
            return NextResponse.json(
                { error: 'Please keep the conversation respectful and professional.' },
                { status: 400 }
            );
        }

        // Build conversation context
        const systemPrompt = `You are a professional and knowledgeable chat assistant for "Next Chapter", an online bookstore. 
            Your role is to:
            - Help customers find books they'll love
            - Provide thoughtful book recommendations based on their interests
            - Answer questions about books, authors, genres, and reading
            - Assist with book-related queries professionally
            - Maintain a helpful, friendly, and knowledgeable tone

            Always be professional, courteous, and focused on providing excellent book-related assistance.
        `;

        // Prepare conversation history for the AI
        const conversationContext = conversationHistory.length > 0 
            ? conversationHistory.map((msg: { role: string; content: string }) => ({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.content }]
            }))
            : [];

        // Add current user message
        conversationContext.push({
            role: 'user',
            parts: [{ text: message }]
        });

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [
                { role: 'user', parts: [{ text: systemPrompt }] },
                ...conversationContext
            ]
        });

        const responseText = response.candidates?.[0]?.content?.parts?.[0]?.text || 'I apologize, but I encountered an error. Please try again.';

        return NextResponse.json({ 
            message: responseText,
            conversationHistory: [
                ...conversationHistory,
                { role: 'user', content: message },
                { role: 'assistant', content: responseText }
            ]
        });

    } catch (error) {
        console.error('Error in chat API:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}