# Testing State & Strategy

## Current Testing State
- **Automated Tests**: 0 tests currently exist.
- **Test Frameworks**: None installed (`vitest` or `jest` not present in `package.json`).
- **Test Script**: No `test` script defined in `package.json`.
- **Manual Verification**: Run `npm run build` (`tsc && vite build`) passes with no TypeScript errors.

## Recommended Test Strategy
1. Install `vitest` and `@testing-library/react` (lightweight, native Vite integration, 0 overhead).
2. Create unit tests for:
   - Safety rule evaluation engine (critical emergency conditions like brake failure, fuel leaks, high overheating).
   - Structured diagnostic schema validation (handling valid, partial, and malformed responses).
   - Vehicle profile validation (mileage, fuel, year boundary checks).
   - Cost estimation bounds (parts, labor, region factors).
   - LocalStorage persistence serialization and deserialization.
   - Provider fallback and timeout degradation under network errors.
