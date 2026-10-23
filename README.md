# Klixora

Growth-driven digital strategy site for Klixora — a Next.js 16 rebuild of the
original Emergent preview SPA, on an owned, deployable foundation.

## Stack

| | |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack, Cache Components) |
| UI | React 19, Tailwind CSS v4 (CSS-first `@theme`), shadcn/ui token conventions |
| Motion | Motion 14 (`motion/react`); smooth scroll is native CSS |
| Icons | Lucide |
| Tests | Playwright + axe-core |

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
```

> Run everything from **one** environment. `node_modules` holds
> platform-specific binaries (Next's SWC, Playwright's browsers), so a tree
> installed on Windows will not run under WSL and vice versa. Switching means
> `rm -rf node_modules && npm install` plus `npx playwright install`.

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
src/
├── app/
│   ├── (frontend)/        # public marketing routes
│   │   ├── layout.tsx     # shared chrome: header + footer + FAB
│   │   ├── page.tsx       # /
│   │   ├── agri-marketing/page.tsx
│   │   └── event-management/page.tsx
│   ├── layout.tsx         # root: html/body, fonts, metadata
│   ├── globals.css        # design tokens + utilities
│   ├── error.tsx  not-found.tsx
│   └── sitemap.ts  robots.ts
├── components/
│   ├── layout/            # header, footer, WhatsApp FAB
│   ├── motion/            # Reveal, StatCounter, TiltCard
│   ├── sections/          # one file per section; sub/ = vertical template
│   └── ui/                # SectionHeading, JsonLd
├── content/               # all copy, typed. Edit here, not in components.
├── hooks/                 # useScrolled, useLockBody
├── services/              # supabase client, leads submission
└── utils/                 # cn, motion constants, validation schema
e2e/                       # Playwright specs
public/                    # images, logo, favicon
```

`(frontend)` is a route group: the parentheses keep it out of the URL, so
`src/app/(frontend)/page.tsx` still serves `/`. Its `layout.tsx` is the shared
page layout — header, footer and FAB are declared once there instead of being
repeated in every page.

Nav links are hash-only (`#services`), which the browser resolves against the
current route. The same header works on all three pages with no per-page props.

Pages and section shells are **server components**. Only the pieces that need
browser APIs are `'use client'`: the header, tilt cards, stat counters,
carousel, reveals and the contact form.

## Scrolling

Smooth scrolling is `scroll-behavior: smooth` on `<html>` — no JS scroll
library. A hijacking library (Lenis, Locomotive) replaces the browser's own
scroll with a rAF loop, which costs you native wheel momentum, trackpad
inertia and an honest scrollbar, and stutters when a frame is dropped.

Anchored sections carry `scroll-margin-top: 6rem` so they clear the fixed
header instead of hiding under it. Under `prefers-reduced-motion`, smooth
scrolling reverts to `auto`.

## Routing and proxy

There is deliberately no `proxy.ts`. Every route is statically prerendered and
nothing needs to run per-request — no auth, no locale negotiation, no
rewrites. A proxy would put a Node function in front of files a CDN can serve
on its own.

Add one when you need auth gating, redirects, locale routing or A/B bucketing.
In Next 16 the file is `proxy.ts` at the project root (`src/proxy.ts` here) —
`middleware.ts` and the `middleware` named export are **deprecated**:

```ts
// src/proxy.ts
import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  return NextResponse.next();
}

export const config = { matcher: ["/((?!_next/static|_next/image|.*\\..*).*)"] };
```

The runtime is `nodejs` and is not configurable; `edge` is unsupported in
`proxy`. Config flags renamed too — `skipMiddlewareUrlNormalize` is now
`skipProxyUrlNormalize`. Response headers belong in `next.config.ts` under
`headers()`, not in a proxy.

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
