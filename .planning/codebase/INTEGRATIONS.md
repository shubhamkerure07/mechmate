# External Integrations & Services

## Active Integrations

### 1. Google Gemini Generative Language API
- **Endpoint**: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent`
- **Method**: Direct client-side `fetch` via `POST`
- **Authentication**: Query parameter `?key=${API_KEY}` or Bearer token header if `AQ.` prefixed
- **Timeout**: `AbortController` timeout at 6,500ms
- **Request Format**: Multi-turn `contents` array with role and parts, plus `system_instruction`
- **Response Format**: Raw text markdown parsed from `candidates[0].content.parts[0].text`
- **Fallback Engine**: Local mechatronic automotive rule engine `getExpertAutomotiveDiagnosis(query)` returning structured markdown if API key is missing, invalid, or request fails/times out.

## Deployment Target
- **Platform**: Vercel (`mechmate-sigma.vercel.app`)
- **Configuration**: Standard Vite static output (`dist/`). No `vercel.json` currently present in repository; no Vercel serverless Edge or Node API functions deployed.
