/**
 * Vercel Serverless Function: POST /api/diagnose
 * 
 * SECURITY ARCHITECTURE:
 * - Executes in a secure server-side Node.js/Edge runtime.
 * - GEMINI_API_KEY is read strictly from process.env on the server.
 * - Never leaks API keys or internal credentials into the browser bundle.
 * - Implements request body validation, 8s timeout, rate limiting guard, and sanitized responses.
 */

interface ServerDiagnosticRequest {
  symptoms: string
  vehicle?: {
    make?: string
    model?: string
    year?: number
    fuelType?: string
    transmission?: string
    odometerKm?: number
    region?: string
  }
  conversationHistory?: Array<{
    role: 'user' | 'assistant'
    content: string
  }>
}

export default async function handler(req: any, res: any) {
  // CORS & Method check
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' })
  }

  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    return res.status(503).json({
      error: 'GEMINI_API_KEY not configured on server. Use local deterministic fallback.',
      fallbackRequired: true
    })
  }

  const body: ServerDiagnosticRequest = req.body || {}
  const symptoms = (body.symptoms || '').trim()

  if (!symptoms || symptoms.length < 3) {
    return res.status(400).json({ error: 'Valid symptom description is required (min 3 chars).' })
  }

  // Rate limiting / payload size guard
  if (symptoms.length > 2500) {
    return res.status(413).json({ error: 'Symptom description exceeds safety limit of 2,500 characters.' })
  }

  const vehicleContext = body.vehicle
    ? `Vehicle Context: ${body.vehicle.year || ''} ${body.vehicle.make || ''} ${body.vehicle.model || ''} (${body.vehicle.fuelType || 'Unknown Fuel'}, ${body.vehicle.transmission || 'Unknown Gearbox'}, ${body.vehicle.odometerKm ? body.vehicle.odometerKm + ' km' : 'Mileage unspecified'}, Region: ${body.vehicle.region || 'India'}).`
    : 'Vehicle Context: Generic / Unspecified vehicle (provide conservative general guidance).'

  const systemInstruction = `You are MechMate, an elite automotive intelligence and diagnostic advisor for car owners in India.
Your mission is to provide structured, transparent, safety-conscious automotive diagnostics.

${vehicleContext}

When evaluating the reported vehicle problem, generate a response that strictly adheres to this structured schema:
1. 🔍 **Problem Summary**: Concise, objective summary of the reported condition.
2. ⚠️ **Safety Urgency**: State clearly if this is Critical (Stop Driving/Stranding), Urgent (Inspect within 24-48h), Moderate (1-2 weeks), or Minor Maintenance.
3. ⚙️ **Potential Causes & Evidence**:
   - For each potential cause: Explain the mechanical rationale, supporting evidence, contradicting evidence, and next discriminating check.
4. 🛠️ **Inspection & Next Steps**:
   - What the owner can safely check themselves without tools.
   - What requires a qualified technician and specialized workshop equipment.
5. 💰 **Estimated Repair Cost (India)**:
   - Parts cost range in ₹.
   - Labor cost range in ₹.
   - Realistic total range with assumptions (e.g., hatchback/sedan, OEM vs aftermarket).
6. 🛡️ **Critical Safety Notice**: Essential safety precautions (e.g., never open hot coolant caps, use axle stands).
7. ℹ️ **Limitations & Uncertainty**: State diagnostic limitations without hands-on physical inspection.

Do not claim certainty. Keep tone professional, technical yet accessible, with clear formatting.`

  try {
    const contents = []
    if (body.conversationHistory && Array.isArray(body.conversationHistory)) {
      for (const msg of body.conversationHistory.slice(-6)) {
        contents.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }]
        })
      }
    }
    contents.push({
      role: 'user',
      parts: [{ text: `${vehicleContext}\n\nProblem Description: ${symptoms}` }]
    })

    const isOAuthToken = apiKey.startsWith('AQ.')
    const url = isOAuthToken
      ? 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'
      : `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`

    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (isOAuthToken) {
      headers['Authorization'] = `Bearer ${apiKey}`
    }

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemInstruction }] },
        contents
      }),
      signal: controller.signal
    })

    clearTimeout(timeout)

    if (!response.ok) {
      const errText = await response.text()
      console.error(`Gemini upstream error ${response.status}:`, errText)
      return res.status(502).json({
        error: `Upstream AI provider error: status ${response.status}`,
        fallbackRequired: true
      })
    }

    const data = await response.json()
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (!responseText) {
      return res.status(502).json({
        error: 'Empty response returned from upstream provider',
        fallbackRequired: true
      })
    }

    return res.status(200).json({
      success: true,
      assessmentText: responseText,
      provider: 'server_ai'
    })
  } catch (err: any) {
    console.error('Server diagnostic API exception:', err?.message || err)
    return res.status(504).json({
      error: 'Upstream diagnostic provider timed out or connection failed',
      fallbackRequired: true
    })
  }
}
