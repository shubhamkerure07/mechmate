# Architecture & Data Flow

## Current Architecture Overview
The current MechMate system is a single-page React client application with direct browser-to-API communication:

```
[User Browser]
      │
      ▼
[App.tsx] ──── (User Input / Chat State)
      │
      ▼
[gemini.ts: sendMessage]
      ├──> [Google Gemini 1.5 Flash API] (Client-side HTTP via VITE_GEMINI_API_KEY)
      └──> (Fallback) [getExpertAutomotiveDiagnosis] (Deterministic Keyword Matcher)
```

## Key Architectural Observations
1. **Single Flat Component**: `src/App.tsx` contains all UI states: Header, Welcome screen, Suggestion buttons, Message list, Typing indicator, and Textarea input.
2. **In-Memory State**: Messages and conversation history are kept in React state (`useState<ChatMessage[]>`) and module-level variables (`let conversationHistory`). No LocalStorage, SessionStorage, or IndexedDB persistence.
3. **No Domain Layer Separation**: Diagnostic logic, safety checks, severity classification, and cost estimation are bundled together inside an unstructured text prompt or hardcoded response strings.
4. **No Schema Validation**: LLM returns unconstrained markdown. Client uses naive regex splitting `parts = text.split(/(\*\*.*?\*\*)/g)` which can break on nested formatting or complex markdown.
