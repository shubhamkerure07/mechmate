import { GoogleGenerativeAI } from '@google/generative-ai'

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string

if (!API_KEY || API_KEY === 'your_gemini_api_key_here') {
  console.error('❌ No Gemini API key found in .env file!')
}
if (API_KEY?.startsWith('AQ.')) {
  console.warn('⚠️ OAuth token detected. Use an API key from console.cloud.google.com/apis/credentials instead.')
}

const genAI = new GoogleGenerativeAI(API_KEY)

const model = genAI.getGenerativeModel({
  model: 'gemini-1.5-flash',
  systemInstruction: `You are MechMate, an expert AI car mechanic assistant. 
You help car owners understand their vehicle problems in simple, clear language.

When someone describes a car problem:
1. 🔍 **Diagnose**: Explain what is likely causing the issue
2. ⚠️ **Severity**: Tell them if it's urgent (dangerous), moderate (fix soon), or minor (can wait)
3. 🔧 **Fix**: Explain what needs to be done to fix it
4. 💰 **Cost estimate**: Give a rough estimate in Indian Rupees (₹)
5. 🛡️ **Safety tip**: Any safety advice if needed

Keep your language simple and friendly — not overly technical. 
Use emojis to make it easy to read.
If the question is not related to cars/vehicles, politely redirect the user back to car problems.`,
})

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

let chat = model.startChat({ history: [] })

export async function sendMessage(userMessage: string): Promise<string> {
  const result = await chat.sendMessage(userMessage)
  return result.response.text()
}

export function resetChat(): void {
  chat = model.startChat({ history: [] })
}
