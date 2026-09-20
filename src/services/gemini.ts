// Supports both AI Studio OAuth tokens (AQ.) and Cloud API keys (AIza.)
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'

const SYSTEM_PROMPT = `You are MechMate, an expert AI car mechanic assistant. 
You help car owners understand their vehicle problems in simple, clear language.

When someone describes a car problem:
1. 🔍 **Diagnose**: Explain what is likely causing the issue
2. ⚠️ **Severity**: Tell them if it's urgent (dangerous), moderate (fix soon), or minor (can wait)
3. 🔧 **Fix**: Explain what needs to be done to fix it
4. 💰 **Cost estimate**: Give a rough estimate in Indian Rupees (₹)
5. 🛡️ **Safety tip**: Any safety advice if needed

Keep your language simple and friendly — not overly technical. 
Use emojis to make it easy to read.
If the question is not related to cars/vehicles, politely redirect the user back to car problems.`

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

// Store conversation history for multi-turn chat
let conversationHistory: { role: string; parts: { text: string }[] }[] = []

export async function sendMessage(userMessage: string): Promise<string> {
  // Add user message to history
  conversationHistory.push({
    role: 'user',
    parts: [{ text: userMessage }]
  })

  const requestBody = {
    system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents: conversationHistory
  }

  // Support both OAuth tokens (AQ.) and API keys (AIza.)
  const isOAuthToken = API_KEY?.startsWith('AQ.')
  
  const url = isOAuthToken 
    ? GEMINI_URL 
    : `${GEMINI_URL}?key=${API_KEY}`

  const fetchHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (isOAuthToken) {
    fetchHeaders['Authorization'] = `Bearer ${API_KEY}`
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: fetchHeaders,
    body: JSON.stringify(requestBody)
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error?.error?.message || 'API request failed')
  }

  const data = await response.json()
  const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not get a response.'

  // Add AI response to history
  conversationHistory.push({
    role: 'model',
    parts: [{ text: aiText }]
  })

  return aiText
}

export function resetChat(): void {
  conversationHistory = []
}
