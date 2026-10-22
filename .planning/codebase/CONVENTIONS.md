# Code Conventions & Style

## Naming & Organization
- TypeScript interfaces in PascalCase (`ChatMessage`).
- Functional React components in PascalCase (`App`).
- Functions and variables in camelCase (`sendMessage`, `handleSend`, `conversationHistory`).
- CSS variables prefixed with `--` in `:root` (`--bg-primary`, `--accent-red`).
- CSS classes in kebab-case (`.message-wrapper`, `.status-badge`).

## Code Style
- Single quotes for TypeScript/JavaScript strings.
- Semicolons omitted where possible.
- Strict typing with TypeScript (`strict: true` in `tsconfig.json`).
- Minimal third-party abstraction: raw CSS instead of Tailwind or styled-components; native fetch instead of Axios.
