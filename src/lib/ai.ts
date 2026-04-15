import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

const model = genAI.getGenerativeModel({ 
  model: 'gemini-2.0-flash', // Upgraded to 2.0 Flash for superior multimodal & structural output
  generationConfig: {
    responseMimeType: 'application/json',
  }
});

export async function callGemini(prompt: string, systemInstruction?: string, imageBase64?: string) {
  if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY_MISSING: Orchestrator requires AI credentials.');
  }

  const parts: any[] = [{ text: prompt }];
  
  if (imageBase64) {
    parts.push({
      inlineData: {
        data: imageBase64.split(',')[1] || imageBase64,
        mimeType: 'image/jpeg'
      }
    });
  }

  console.log('[Clinical-Orchestrator]: Engaging Gemini...', { 
    promptLength: prompt.length,
    hasImage: !!imageBase64 
  });

  const result = await model.generateContent({
    contents: [{ role: 'user', parts }],
    systemInstruction: systemInstruction ? { role: 'system', parts: [{ text: systemInstruction }] } : undefined,
  });

  const responseText = result.response.text();
  console.log('[Clinical-Orchestrator]: Process complete.');
  return responseText;
}
