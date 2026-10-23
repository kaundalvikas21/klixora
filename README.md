# Klixora

Growth-driven digital strategy site for Klixora — a Next.js 16 rebuild of the
original Emergent preview SPA, on an owned, deployable foundation.

## Stack

| | |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack, Cache Components) |
| UI | React 19, Tailwind CSS v4 (CSS-first `@theme`), shadcn/ui token conventions |
| Motion | Motion 14 (`motion/react`) + Lenis smooth scroll |
| Icons | Lucide |
| Tests | Playwright + axe-core |

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
```

```bash
npm run build      # production build
npm run start      # serve the build
npm run lint       # eslint
npx playwright test
```

## Routes

| Route | Contents |
|---|---|
| `/` | Hero · brands · services · results · why-us · process · testimonials · contact |
| `/agri-marketing` | Agri vertical landing page |
| `/event-management` | Events vertical landing page |

Both vertical pages render from one template (`components/sections/sub/page-template.tsx`)
driven by typed content in `content/pages.ts`.

## Where things live

```
app/           routes, root layout, server actions, sitemap/robots
components/
  layout/      header, footer, WhatsApp FAB, Lenis provider
  motion/      Reveal, StatCounter, TiltCard — the shared motion primitives
  sections/    one file per home section; sub/ holds the vertical template
content/       all copy, typed. Edit here, not in components.
lib/           cn(), motion constants, zod schema, Supabase client
e2e/           Playwright specs
```

Pages and section shells are **server components**. Only the pieces that need
browser APIs are `'use client'`: the Lenis provider, header scroll state, the
tilt cards, stat counters, carousel, reveals and the contact form.

## Design system

Tokens live in `app/globals.css` under `:root` and `@theme inline`.

| Token | Value |
|---|---|
| ink / surface | `#07090e` / `#0e131f` |
| cyan / violet | `#22d3ee` / `#8b5cf6` |
| radius | `0.75rem` |
| display / body / mono | Syne / Plus Jakarta Sans / JetBrains Mono |

Utilities ported from the original build: `.glass`, `.glass-strong`, `.eyebrow`,
`.text-gradient`, `.input-glass`, `.bg-grid`, `.shadow-glow-*`, `.no-scrollbar`,
`.marquee-paused`.

Motion constants are centralised in `lib/motion.ts` — shared easing
`[0.22, 1, 0.36, 1]`, a 0.7s reveal with a `(i % 3)` column stagger, and the
tilt spring. Every primitive honours `prefers-reduced-motion`.

## Lead capture (not wired up yet)

The 4-step enquiry form is complete: client-side step gating plus server-side
re-validation in `app/actions/submit-enquiry.ts` (the real trust boundary).

Storage is **intentionally not connected**. With no credentials set, the action
validates the enquiry, logs a warning and tells the visitor to email instead —
it never reports a success it did not achieve.

To switch it on, copy `.env.example` to `.env.local` and fill in:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

It writes to the `leads` table (`name`, `email`, `phone`, `service_interest`,
`message`, `source: "website"`), which already has an anon-INSERT /
admin-only-SELECT policy, so the publishable key cannot read submissions.

## Accessibility

Playwright runs axe on every route and fails on serious/critical violations.
Also covered: a skip link, visible focus rings, a reduced-motion path that
renders content statically, and a 375px no-horizontal-scroll check.
