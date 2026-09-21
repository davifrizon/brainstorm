# Brainstorm

Think together. A shared, real-time brainstorming board for a small group of friends — sticky notes, voting, comments, categories, and live cursors, built with Next.js, Supabase, and Tailwind.

## Stack

- **Next.js 16** (App Router, Turbopack) + **TypeScript**
- **Tailwind CSS v4** + **shadcn/ui** (Base UI primitives)
- **Supabase** — auth, Postgres, Row Level Security, Realtime
- **Zustand** — local "demo mode" data layer
- **Framer Motion**, **Lucide icons**

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Demo mode (no setup required)

If you don't configure Supabase, the app automatically runs in **demo mode**:
no login wall, data is stored in `localStorage`, and the app is pre-seeded
with a "Weekend Brainstorm" board and a handful of fake friends so it never
looks empty. Multi-user "realtime" is simulated across browser tabs (open
the app in two tabs to see live cursors and synced notes).

### Connecting Supabase (real accounts + realtime sync)

1. Create a project at [supabase.com](https://supabase.com).
2. In the SQL editor, run `supabase/schema.sql` from this repo — it creates
   all tables, Row Level Security policies, and enables Realtime on the
   relevant tables.
3. Copy `.env.local.example` to `.env.local` and fill in your project's URL
   and anon key (Project Settings → API).
4. (Optional) Enable the Google provider under Authentication → Providers if
   you want "Continue with Google" to work; email magic links work out of
   the box.
5. Restart `npm run dev`.

## Project structure

```
src/
  app/                 routes (landing, dashboard, board, auth)
  components/
    board/             canvas, sticky notes, toolbar, panels
    dashboard/         board list, create/join dialogs
    shared/            avatar, logo, connection status
    ui/                shadcn/ui primitives
  hooks/               data hooks (branch between Supabase and demo mode)
  lib/
    data/              Supabase queries + mutations
    demo/, store/       seed data and the local Zustand store
    supabase/          browser/server/proxy clients
  types/               shared domain types
supabase/schema.sql    full Postgres schema + RLS + Realtime setup
```

## Notes on scope

- **Undo/redo** works in demo mode (local history stack). In Supabase mode,
  edits are collaborative and shared, so undo is intentionally left out to
  avoid silently reverting a friend's change.
- **Draw tool** is a placeholder in the toolbar for now — sticky notes,
  arrows, frames, voting, comments, and reactions are fully implemented.
- Realtime in Supabase mode is achieved by resubscribing to Postgres change
  events per board (simple + robust for small friend-group boards) plus a
  Presence channel for online users and live cursors.
