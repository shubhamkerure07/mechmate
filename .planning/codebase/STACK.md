# Technology Stack & Environment

## Core Runtime & Frameworks
- **Runtime / Bundler**: Vite 5.4.2 (ESModules, Rollup-based bundling)
- **UI Library**: React 18.3.1 (`react`, `react-dom`)
- **Language**: TypeScript 5.5.3 (`tsc` strict type-checking enabled in `tsconfig.json`)
- **Styling**: Pure CSS3 (`src/index.css`) with custom CSS custom properties (variables) for dark automotive theme
- **Package Manager**: npm with lockfile `package-lock.json` (v3 format)

## Build & Scripts (`package.json`)
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  }
}
```

## Dependencies & Footprint
- Production dependencies: 2 packages (`react`, `react-dom`). Extremely light bundle (<160 kB JS uncompressed, ~51 kB gzip).
- Dev dependencies: 5 packages (`@types/react`, `@types/react-dom`, `@vitejs/plugin-react`, `typescript`, `vite`).
- No UI component libraries, icon libraries, or utility frameworks currently installed.

## Environment Variables
- `VITE_GEMINI_API_KEY`: Client-side environment variable defined in `.env.example`.
