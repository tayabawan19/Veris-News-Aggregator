import { NextResponse } from 'next/server';
import axios from 'axios';
import { GoogleGenAI } from '@google/genai';

async function generateGeminiContent(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your-gemini-api-key') {
    throw new Error('GEMINI_API_KEY is not configured in environment variables.');
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (sdkError) {
    console.warn('Gemini SDK failed, trying direct REST fallback:', sdkError.message);
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const restResponse = await axios.post(url, {
      contents: [{ parts: [{ text: prompt }] }]
    });
    return restResponse.data.candidates[0].content.parts[0].text;
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { title, description } = body;

    if (!title && !description) {
      return NextResponse.json({ error: "Article 'title' or 'description' is required." }, { status: 400 });
    }

    const prompt = `You are a professional news editor. Provide a concise 2-3 sentence summary of the following news article:

Title: ${title || 'Untitled'}
Description: ${description || ''}`;

    const summaryText = await generateGeminiContent(prompt);
    return NextResponse.json({ summary: summaryText.trim() });
  } catch (err) {
    console.error('Summarize error:', err.message);
    return NextResponse.json({
      error: "Failed to generate summary.",
      details: err.message
    }, { status: 500 });
  }
}
