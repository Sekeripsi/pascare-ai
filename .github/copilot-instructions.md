# Copilot instructions for `postvisit`

## Build, lint, and test commands

- Install deps: `npm install`
- Dev server (port 3001): `npm run dev`
- Production build: `npm run build`
- Start production server (port 3001): `npm run start`
- Lint: `npm run lint`

There is currently no test script or test runner configuration in this repository, so there is no supported "single test" command yet.

## High-level architecture

This is a Next.js App Router frontend that acts as a BFF for a separate backend service (`BACKEND_URL`, default `http://localhost:3003`).

1. **Public and staff-facing pages**
   - `app/page.tsx`: public landing page for post-visit assistant access.
   - `app/login/page.tsx`: staff login UI.
   - `app/dashboard/page.tsx`: staff dashboard for post-visit token management and test-data token generation.
   - `app/chat/[token]/page.tsx`: token-scoped patient chat; token is verified server-side before rendering chat UI.

2. **BFF API layer (Next Route Handlers)**
   - `app/api/auth/*`: login/logout/current-user validation against backend auth endpoints.
   - `app/api/tokens/*`: token list, token generation/create-test dispatch, toggle active, delete, available records.
   - `app/api/chat/route.ts`: forwards chat requests to backend and preserves streaming; when backend responds non-stream JSON, it converts content into AI SDK UI message stream format for assistant-ui compatibility.

3. **Assistant UI composition**
   - `app/assistant.tsx` wires `@assistant-ui/react` runtime with `AssistantChatTransport` to `/api/chat`, optionally including a chat token in request body.
   - `components/thread.tsx` is the main custom chat shell built from `@assistant-ui/react` primitives (composer, grouped parts, tool/reasoning rendering, action bars, branch picker).

## Key repository-specific conventions

- **Next.js version rule is strict here**: this repo explicitly warns that Next.js behavior and APIs may differ from older assumptions. Before changing Next-specific APIs/patterns, consult `node_modules/next/dist/docs/` and heed deprecations (`AGENTS.md`, `CLAUDE.md`).
- **Backend integration pattern**: route handlers consistently define `const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:3003"` and proxy requests to backend endpoints rather than implementing domain logic in the frontend.
- **Auth token flow**:
  - Login stores token/user in `localStorage` keys `simpus_auth_token` and `simpus_user`.
  - Login route also sets `simpus_auth_token` cookie.
  - `/api/auth/me` accepts bearer token from `Authorization` header, with cookie fallback.
- **Fresh-data fetching**: token and auth-related reads generally use `cache: "no-store"` to avoid stale dashboard/chat state.
- **Token generation API contract**: `/api/tokens` `POST` uses `action` switch:
  - `action: "generate"` -> backend `/post-visit/generate` (existing medical record).
  - otherwise -> backend `/post-visit/create-test` (preset/custom synthetic record).
- **TypeScript + imports**:
  - Path alias `@/*` is used across app/components (`tsconfig.json`).
  - Route params in App Router handlers/pages are typed as `Promise<{ ... }>` and awaited (follow this local pattern for consistency).
- **Styling stack**: Tailwind CSS v4 + shadcn (`base-nova` style) with centralized design tokens and theme variables in `app/globals.css`; reuse `cn()` from `lib/utils.ts` for class merging.
