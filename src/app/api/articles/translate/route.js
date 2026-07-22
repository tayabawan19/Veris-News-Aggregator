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
    const { title, description, target_language = 'English' } = body;

    if (!title && !description) {
      return NextResponse.json({ error: "Article 'title' or 'description' is required." }, { status: 400 });
    }

    const prompt = `Translate the following news article title and description into ${target_language}. Preserve the original meaning, context, and tone.
Return ONLY a raw JSON object with keys "translated_title" and "translated_description". Do NOT wrap in markdown formatting or code blocks.

Title: ${title || ''}
Description: ${description || ''}`;

    const rawResult = await generateGeminiContent(prompt);
    
    let cleaned = rawResult.trim();
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
    }

    try {
      const parsed = JSON.parse(cleaned);
      return NextResponse.json({
        translated_title: parsed.translated_title || title || '',
        translated_description: parsed.translated_description || description || ''
      });
    } catch (parseError) {
      return NextResponse.json({
        translated_title: title || '',
        translated_description: cleaned
      });
    }
  } catch (err) {
    console.error('Translate error:', err.message);
    return NextResponse.json({
      error: "Failed to translate article.",
      details: err.message
    }, { status: 500 });
  }
}
