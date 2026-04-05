# Environment Changes (PleaseVote v7 Rebuild)

## Infrastructure Update
- Migrated from **Next.js 9/Node 14** to **React Router v7/Bun**.
- Initialized project using `bun init` and added modern React 19 dependencies.
- Replaced legacy Webpack 4 with **Vite 8** for lightning-fast development.
- Configured **Tailwind CSS v4** as a Vite plugin.

## Dependency Additions
- `react-router`: Modern framework for routing and server-side rendering.
- `bun`: Modern runtime and package manager.
- `lucide-react`: Modern icon library (replacement for older icon sets).
- `isbot`: Used for entry.server logic to identify bot traffic.
- `@playwright/test`: For scenario-based testing.
- `@tailwindcss/vite`: Tailwind v4's first-class Vite integration.

## Architectural Changes
- **Server Components:** Data fetching for voter info is handled directly in the `loader` of `voterinfo.tsx`.
- **TypeScript:** Enforced strict typing for all API responses and components.
- **Project Structure:** Flat component and route structure as requested.

## Dev Tools
- Added `typecheck`, `build`, `dev`, and `start` scripts to `package.json`.
- Configured `playwright.config.ts` for automated UI verification.
- Implemented `tsconfig.json` for ESM support and React 19 types.
