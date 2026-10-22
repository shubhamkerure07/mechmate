# Codebase Structure

## Directory Layout
```
C:\Users\Shubham\mechmate\
├── .env.example              # Example environment variable template (VITE_GEMINI_API_KEY)
├── .gitignore                # Ignores node_modules, dist, .env, *.log
├── index.html                # HTML entry point, loads Inter font and /src/main.tsx
├── package.json              # Project metadata, dependencies, build scripts
├── package-lock.json         # Dependency lockfile
├── README.md                 # Product documentation and live demo link
├── tsconfig.json             # TypeScript compiler config (ES2020 target, bundler resolution)
├── vite.config.ts            # Vite config with @vitejs/plugin-react
└── src/
    ├── App.tsx               # Main conversational UI component (211 lines)
    ├── index.css             # Dark automotive theme CSS styles (415 lines)
    ├── main.tsx              # React DOM root render
    ├── vite-env.d.ts         # Vite client types reference
    ├── components/           # Currently empty directory
    └── services/
        └── gemini.ts         # Gemini API client + local automotive fallback dictionary (263 lines)
```

## Component Breakdown
- `src/App.tsx`:
  - `SUGGESTIONS`: 4 pre-set automotive problem prompts.
  - `formatTime`: Helper for rendering timestamp.
  - `renderText`: Naive markdown bold string parser.
  - `App()`: State manager for chat messages, loading, input, scroll management, sending and clearing chat.
- `src/services/gemini.ts`:
  - `ChatMessage` interface.
  - `getExpertAutomotiveDiagnosis`: Hardcoded fallback diagnoses for 6 automotive categories (brakes, battery/start, overheating, check engine, smoke, clutch/gear) + 1 generic fallback.
  - `sendMessage`: API caller with 6.5s abort timeout and fallback recovery.
  - `resetChat`: Clears in-memory history.
