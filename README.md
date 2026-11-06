# KnowledgeBridge

KnowledgeBridge is an AI-powered project knowledge handover workspace. It turns distributed project information into evidence-backed, reviewable handover reports so teams can transfer context without relying on one person's memory.

## Current MVP

- Responsive workspace dashboard with projects, activity, task completion, risks, and handover review queue.
- Functional project creation, project search, navigation views, notifications, local browser persistence, and validated source processing.
- A deterministic demo analysis endpoint at `GET /api/demo` and `POST /api/demo` that clearly reports demo mode.
- Supabase migration with project-scoped records, project roles, extracted knowledge, documents, handovers, acknowledgements, indexes, and role-aware RLS policies.
- No secrets are required to run the dashboard.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Copy `.env.example` to `.env.local` when connecting Supabase or OpenAI. Never expose a service-role key or OpenAI key in client code. `AI_LIVE_MODE=false` keeps demo mode explicit until a server-side provider is configured.

## Architecture

- `src/app/page.tsx`: responsive client dashboard and demo interactions.
- `src/app/api/demo/route.ts`: server-only demo knowledge extraction contract.
- `supabase/migrations/001_knowledgebridge.sql`: normalized project/document/knowledge/handover schema and RLS.
- `docs/KNOWLEDGEBRIDGE-DOCUMENTATION.md`: complete user, API, architecture, and troubleshooting documentation.
- `docs/KNOWLEDGEBRIDGE-DOCUMENTATION.pdf`: printable PDF version of the documentation.

The dashboard remains an unauthenticated demo. Projects and processed source metadata persist in the browser's local storage; no file contents are uploaded or retained. The source picker validates file type and size in the browser, and the demo endpoint validates metadata and returns deterministic sample knowledge; it does not upload or analyse file contents. The next integration step is to add Supabase server clients for auth and storage, then replace the demo route's deterministic provider with a validated server-side OpenAI provider. Every extracted item should retain `sourceId`, `sourceFile`, `evidence`, and `confidence`; unsupported facts must be marked for verification rather than invented.

## Security notes

The migration scopes reads and mutations through project membership, enables RLS on profiles and application tables, and includes incoming-member acknowledgements. Production deployments still need organization membership, storage bucket policies, signed downloads, server-side MIME/content validation, audit logging, server-side session enforcement, and integration tests before enabling real uploads or sharing. Apply the migration through Supabase before relying on these policies; SQL files in the repository are not executed automatically by Next.js.
