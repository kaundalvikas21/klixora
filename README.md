# Klixora

Growth-driven digital strategy site for Klixora, a Next.js 16 rebuild of the
original Emergent preview SPA, on an owned, deployable foundation.

## Stack

| | |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack, Cache Components) |
| UI | React 19, Tailwind CSS v4 (CSS-first `@theme`), shadcn/ui token conventions |
| Motion | Motion 14 (`motion/react`); smooth scroll is native CSS |
| Icons | Lucide |
| Database | Supabase Postgres, SQL migrations, row level security |
| Admin auth | Supabase Auth, one `ADMIN` role gated by an `admin_users` allowlist |
| Admin UI | Own primitives on the site's tokens, dnd-kit for reorder, sonner for toasts |
| Tests | Playwright + axe-core, plus an assert-based logic check |

## Getting started

```bash
npm install
cp .env.example .env.local
npm run dev            # http://localhost:3000
```

The public site renders with **no database at all**: every read falls back to
`content/defaults.ts`, which holds the page's copy in the exact shape the
tables store it. To switch the admin on, bring up a local Supabase stack:

```bash
npm run db:start       # Postgres, Auth, Storage, Studio
npm run db:reset       # applies supabase/migrations, then supabase/seed.sql
npm run db:admin       # creates the admin operator from .env.local
```

`npm run db:start` prints the URL and keys. Copy them into `.env.local`,
along with `ADMIN_EMAIL` and `ADMIN_PASSWORD`, then re-run `db:admin`. Quote
a password containing `#`, or dotenv reads the rest of the line as a comment.
`npm run db:admin -- --only` makes that address the sole operator, revoking
every other account; without the flag the command only adds or resets one.
Studio is at <http://127.0.0.1:54323>, and the local mail catcher, where the
Auth emails land, at <http://127.0.0.1:54324>.

### Local Supabase without Docker

`supabase start` normally needs a container engine. This project turns on the
CLI's experimental `stack` setting (`[experimental] stack = true` in
`supabase/config.toml`), which exposes `--runtime native`: each service runs
as an ordinary process instead of a container. That is what `npm run db:start`
uses, and it is why no Docker install is required.

The native runtime needs Linux on `amd64`/`arm64` with glibc 2.35 or later
(Ubuntu 22.04+), or macOS on Apple silicon, plus `tar`, and it refuses to run
as root. On Windows, run it from WSL or install Docker Desktop and drop the
`--runtime native` flag.

### Moving to a hosted project

The migrations are plain SQL and the same ones run in both places:

```bash
npx supabase link --project-ref <ref>
npm run db:push        # applies supabase/migrations to the hosted project
```

Then swap `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` and
`SUPABASE_SERVICE_ROLE_KEY` for the hosted values and run `npm run db:admin`
once. Nothing in the application code changes.

> Run everything from **one** environment. `node_modules` holds
> platform-specific binaries (Next's SWC, Playwright's browsers), so a tree
> installed on Windows will not run under WSL and vice versa. Switching means
> `rm -rf node_modules && npm install` plus `npx playwright install`.

```bash
npm run build          # production build
npm run start          # serve the build
npm run lint           # eslint
npm run typecheck      # tsc --noEmit
npm run check:logic    # fit score, SEO score, reply window, heading parser
npm test               # playwright
npm run db:types       # regenerate src/lib/database.types.ts from the schema
```

## Routes

| Route | Contents |
|---|---|
| `/` | Hero · brands · services · results · why-us · process · testimonials · contact |
| `/agri-marketing` | Agri vertical landing page |
| `/event-management` | Events vertical landing page |
| `/admin` | Overview: four KPI tiles, the "needs you now" queue, lead sources |
| `/admin/content` | Home page CMS: Hero, Core Services, Contact, each with a live preview |
| `/admin/leads` | Contact leads: table and board views, reply-window pills, CSV export |
| `/admin/seo` | Per-page meta, Open Graph, structured data, Google and share previews |
| `/admin/settings` | Identity, contact details, working hours, social links |
| `/admin/login` | Credentials sign-in |
| `/api/leads` | Public enquiry endpoint: Zod, honeypot, IP rate limit |

Both vertical pages render from one template (`components/sections/sub/page-template.tsx`)
driven by typed content in `content/pages.ts`.

## Where things live

```
supabase/
├── config.toml            # local stack, incl. [experimental] stack = true
├── migrations/
│   ├── 0001_schema.sql    # tables, enums, indexes, updated_at triggers
│   ├── 0002_auth.sql      # admin_users, is_admin(), the published view, storage
│   └── 0003_rls.sql       # row level security, one section per table
└── seed.sql               # the home page's live copy
scripts/
└── create-admin.ts        # creates the operator through the Auth Admin API
src/
├── app/
│   ├── (frontend)/        # public marketing routes
│   │   ├── layout.tsx     # shared chrome: header + footer + FAB
│   │   ├── page.tsx       # /
│   │   ├── agri-marketing/page.tsx
│   │   └── event-management/page.tsx
│   ├── (admin)/
│   │   └── admin/
│   │       ├── (shell)/   # rail + top bar + save bar; one folder per screen
│   │       │   ├── layout.tsx  page.tsx
│   │       │   ├── content/  leads/  seo/  settings/
│   │       └── login/     # outside (shell): no rail, no auth required
│   ├── api/
│   │   ├── auth/[...nextauth]/   # Auth.js handlers
│   │   ├── leads/                # public enquiry endpoint
│   │   └── cta-click/            # hero CTA click counter
│   ├── layout.tsx         # root: html/body, fonts, title template
│   ├── globals.css        # design tokens, utilities, responsive-table
│   ├── error.tsx  not-found.tsx
│   └── sitemap.ts  robots.ts
├── proxy.ts               # session refresh + redirect for /admin/*
├── components/
│   ├── admin/
│   │   ├── ui/            # button, field, switch, table, drawer, sortable, charts
│   │   ├── shell/         # rail, top bar, mobile nav, save bar, dirty state
│   │   ├── content/  leads/  seo/  settings/  overview/
│   │   └── login-form.tsx
│   ├── layout/            # header, footer, WhatsApp FAB
│   ├── motion/            # Reveal, StatCounter, TiltCard
│   ├── sections/          # one file per section; sub/ = vertical template
│   └── ui/                # SectionHeading, JsonLd, Icon, SocialIcon, Cta
├── content/
│   ├── defaults.ts        # seed + no-database fallback for CMS content
│   ├── home.ts  pages.ts  # copy for the sections NOT in the admin's scope
│   └── site.ts            # deployment constants only (the canonical origin)
├── lib/
│   ├── schemas/           # one Zod schema per entity, shared client + server
│   ├── database.types.ts  # generated: npm run db:types
│   ├── fit-score.ts  seo-score.ts  sla.ts  lead-ref.ts  rich-text.tsx
│   └── format.ts  self-check.ts
├── server/
│   ├── supabase.ts        # the three clients: public, user, service role
│   ├── auth.ts            # currentAdmin, requireAdmin, requireAdminPage
│   ├── content.ts         # cached public reads, tagged `site-content`
│   ├── admin.ts           # uncached admin reads, overview, publish pre-flight
│   ├── metadata.ts        # generateMetadata from SeoMeta + SeoDefaults
│   ├── leads.ts  notify.ts  rate-limit.ts  audit.ts
│   └── actions/           # Server Actions, one file per domain
├── hooks/  utils/  types/
e2e/                       # Playwright specs, including admin.spec.ts
public/                    # images, logo, favicon
```

`(frontend)` and `(admin)` are route groups: the parentheses keep them out of
the URL, so `src/app/(frontend)/page.tsx` still serves `/` and
`src/app/(admin)/admin/(shell)/page.tsx` serves `/admin`. The split is what
keeps the admin from inheriting the marketing header, footer and FAB, and the
nested `(shell)` group is what keeps the login page out of the admin chrome.

Header, footer and FAB are declared once in the frontend layout instead of
being repeated in every page.

Nav links are hash-only (`#services`), which the browser resolves against the
current route. The same header works on all three pages with no per-page props.

Pages and section shells are **server components**. Only the pieces that need
browser APIs are `'use client'`: the header, tilt cards, stat counters,
carousel, reveals and the contact form.

## Scrolling

No scroll library, and nothing intercepts the wheel.

Lenis and similar libraries work by listening for `wheel` with
`{ passive: false }`, calling `preventDefault()` on it, and re-animating the
scroll position in a `requestAnimationFrame` loop. Their own source says as
much:

```
// - listen to 'wheel' events
// - prevent 'wheel' event to prevent scroll
// - normalize wheel delta
// - add delta to targetScroll
// - animate scroll to targetScroll
```

That is scroll hijacking by definition. It costs native wheel momentum,
trackpad inertia and an honest scrollbar, and it stutters whenever a frame is
dropped, because scrolling now depends on the main thread keeping up.

This site takes the opposite approach. The browser keeps full control of
scrolling, and anything that should feel connected to scroll is driven by
scroll position instead of a clock:

| Behaviour | Mechanism |
|---|---|
| Anchor jumps | `scroll-behavior: smooth`, with `scroll-margin-top: 5.5rem` so sections clear the fixed header |
| Hero backdrop parallax | `animation-timeline: scroll(root block)` |
| Process rail fill | `animation-timeline: view(block)` |
| Section reveals | IntersectionObserver, fired once |

The two scroll timelines replaced `useScroll` loops that ran on the main
thread. The spec lets a browser sample scroll-driven animations off the main
thread and in sync with asynchronous scrolling, so they stay glued to the
scrollbar even while JavaScript is busy. You can confirm both are live in
DevTools: `document.getAnimations()` reports a `ScrollTimeline` and a
`ViewTimeline`.

Support is Chrome and Edge 115+, Safari 26+, Firefox 159+, about 88% of users.
Everything is wrapped in `@supports (animation-timeline: scroll())`, so
browsers without it render the static end state rather than a broken one. All
of it sits inside `prefers-reduced-motion: no-preference`.

What this does not do is smooth the wheel itself. Nothing can, without
intercepting it.

## Routing and proxy

In Next 16 the file is `proxy.ts`, not `middleware.ts`: the `middleware` file
convention and named export are **deprecated**. It lives at `src/proxy.ts`,
alongside `app/`.

`src/proxy.ts` does two things for `/admin/*` only. It refreshes the Supabase
session, because access tokens are short lived, refresh tokens rotate, and the
proxy is the only place in the request path that can both read and write
cookies. Then it redirects an unauthenticated request to `/admin/login?from=`.

It is **not** the security boundary:

| Layer | Check |
|---|---|
| `src/proxy.ts` | Refreshes the session, redirects when there is no user |
| `app/(admin)/admin/(shell)/layout.tsx` | `requireAdminPage()`: `getUser()` against the Auth server, then the `admin_users` row |
| every admin Server Action | `requireAdmin()`, throws if not an admin |
| Postgres | Row level security. Every admin query runs as the operator, and `is_admin()` decides |

`getUser()` rather than `getSession()` throughout: `getSession` trusts the
cookie without verifying its signature.

Public routes are untouched: the matcher is `["/admin", "/admin/:path*"]`, so
static assets and the auth API routes never pass through it. The runtime is
`nodejs` and not configurable; `edge` is unsupported in `proxy`. Config flags
were renamed too: `skipMiddlewareUrlNormalize` is now `skipProxyUrlNormalize`.
Response headers belong in `next.config.ts` under `headers()`, not here.

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

Motion constants are centralised in `utils/motion.ts`: shared easing
`[0.22, 1, 0.36, 1]`, a 0.7s reveal with a `(i % 3)` column stagger, and the
tilt spring. Every primitive honours `prefers-reduced-motion`.

## Admin panel

Everything the admin can edit is read from the database by the public site.
Nothing a visitor sees from the Hero, Core Services or Contact blocks is
hardcoded in a component any more.

### Two content models, deliberately not collapsed

| Kind | Where | How it publishes |
|---|---|---|
| Section copy (eyebrows, headings, intros, success messages) | `PageSection.draft` / `.published` as JSON | **Save draft** writes `draft`; **Save & publish** copies draft over published |
| Structured rows (services, CTAs, promises, form steps, socials, hours) | their own tables with `sortOrder`, `status`, `isVisible` | on save, because visibility is governed by `status` + `isVisible`, not by a draft payload |

That distinction is what makes "Save draft" and "Save & publish" different
actions rather than two buttons doing the same thing.

### Row level security

Every table has RLS on, and the application picks a client per privilege
level rather than holding one connection that can do everything:

| Client | Key | Sees |
|---|---|---|
| `publicClient()` | anon | Published, visible content. Used by the cached public reads, so it reads no cookies and is safe inside `'use cache'`. |
| `userClient()` | anon + the operator's session | Whatever `is_admin()` allows. Every admin read and write goes through this, which is what makes the policies load-bearing rather than decorative. |
| `adminClient()` | service role | Everything. Deliberately rare: minting a lead reference needs a count the anon role cannot see, the audit log is append-only to everyone else, and storage uploads need it. |

Two details worth knowing:

- `page_sections` holds unpublished drafts, and RLS cannot hide a *column*.
  The public site reads a `published_sections` view instead. The view runs as
  the caller, so the guarantee comes from two things underneath it: anon holds
  a *column* grant covering `page_slug`, `section_key`, `published` and
  `published_at` but not `draft`, and a row policy that only matches a
  published row. Column privileges are checked before policies, which is what
  makes the draft unreachable rather than merely unselected.
- The CTA click counter is a `SECURITY DEFINER` function, not an anon
  `UPDATE` policy. The public site must be able to add 1 to one column and
  nothing else, which a table-level policy cannot express.

Anyone can insert a lead; nobody but an admin can read one back. The insert
policy also pins `status = 'NEW'` and an empty assignee, so a crafted request
cannot post itself in as `WON`.

### Publishing and revalidation

Every public read goes through `server/content.ts`, which wraps each query in
`'use cache'` and tags it `site-content`. Publishing calls `updateTag('site-content')`
rather than `revalidateTag`, because the operator is about to look at the live
site and needs read-your-own-writes, not eventual freshness. The live page
updates on its next request with no redeploy.

The Publish button opens a pre-flight that lists what is about to change and
what is wrong: drafts ahead of live, services still in draft, pages with no
Open Graph image, a hero with no visible CTA.

### One source per value

A contact detail is typed in exactly one place. The Contact tab of the CMS
shows the address, email, phone and hours as **read-only**, pulled from Site
Settings, with a link to go and edit the source. Changing the phone number in
Site Settings moves the header, the contact block, the footer, the WhatsApp
button and the JSON-LD, because all of them read the same cached row.

The working-hours table and the hours *sentence* are allowed to differ, and
the screen says why: the table becomes `openingHoursSpecification` in the
structured data, the sentence is what a visitor reads. The JSON-LD is built
from the table, never from the sentence.

### Reply window

The Contact tab holds one number, `slaHours`. It drives the pill in the leads
table, the overdue queue on the Overview and the "Replied in time" tile,
through one pure function in `lib/sla.ts`. Green while comfortable, amber
under six hours left, red and "overdue Nh" past zero, and only while a lead
is still `NEW`.

### Lead capture

The public form posts to a Server Action; `POST /api/leads` accepts the same
payload as JSON. Both call one `createLead()` in `server/leads.ts`, so the
honeypot, the IP rate limit, the fit score, the reference number and the
notification email cannot drift apart between them.

`fitScore` is computed server-side on insert from the budget band, the goal,
whether a company was named and how much was written. It is one pure function
in `lib/fit-score.ts` so the weights can be tuned in one place, and
`npm run check:logic` asserts its boundaries.

With Supabase unconfigured the action still validates, then tells the visitor
to email instead. It never reports a success it did not achieve.

### Open Graph is generated, never missing

Every page shipped with no `og:image`, which means every share rendered as a
bare grey link. Rather than asking an operator to remember to upload five
images, `/api/og` renders a 1200x630 card built on the page's OWN hero image
with its title and description over it, from the same rows the page itself
reads. `effectiveOgImage()` is the one place that picks between uploaded art
and the generated card.

Two traps that cost real time, recorded so they do not again:

- Satori will not fetch an image from localhost at all (SSRF protection),
  so the hero is read off disk and inlined rather than requested over HTTP.
- Satori cannot decode WebP, and every hero on this site is WebP. It does
  not raise an error, it silently renders nothing, so the first version
  shipped looking like a plain gradient. The bytes are transcoded with
  `sharp` before they reach the card, and blurred on the way through: that
  keeps the headline legible over a busy photograph, and `ImageResponse`
  only emits PNG, which encodes sharp photographic detail so poorly that
  unblurred cards came out near a megabyte. Some clients abandon a link
  preview well before that.

The consequence is that the SEO check for a share image genuinely passes,
rather than nagging about something the system already handles. Uploading an
image in the SEO screen still takes precedence, and the admin labels which
of the two a page is using.

### Lead source attribution

Every call to action on the site scrolls to the same contact form, so a
hardcoded `source` could only ever hold one value and the chart was
comparing a column against itself. Clicking a CTA now records which one it
was for the length of the visit, and the form sends it with the submission.
Somebody who scrolls straight to the form is recorded as "Scrolled to the
form", named for what happened rather than for which form it was.

The panel is titled "How leads reach the form" for the same reason, and when
only one route has been used it states that in a sentence instead of drawing
a single bar: one category is not a distribution, and a lone bar invites a
comparison that is not there.

### SEO

`generateMetadata` on every public route is one call to `metadataFor(slug)`,
which reads `SeoMeta` and falls back to `SeoDefaults` and then Site Settings.
A row's `metaTitle` is the complete title and is rendered absolute: the
site-wide `%s | Klixora` template applies only to routes with no row, such as
the admin screens. The sitemap is built from the same table.

The score is one function, `lib/seo-score.ts`: title in range 30, description
in range 30, OG image 20, canonical 10, schema type 10. The same function
feeds the ring in the table, the editor and the Overview tile, so they cannot
disagree, and each check states what it costs you rather than just failing.

### Sign in and out

The login field has a reveal toggle. The control is a real button so it is
keyboard reachable and never submits the form, its accessible name says what
pressing it will do ("Show password") while `aria-pressed` carries the state,
and nothing is persisted: a password left visible across a reload is a
shoulder-surfing gift.

`signOutAction` returns a result rather than redirecting from inside the
action. A redirect there fires whether or not the sign-out succeeded, which
shows the operator the login screen while their session is still live on the
server. The button navigates only once the action confirms it worked, and
surfaces a toast if it did not.

Sign-out uses `scope: "local"`, not Supabase's default of `"global"`. Global
revokes every refresh token the operator holds, so signing out on a phone
would also end the session on their desktop mid-edit.

### Semantic status colour

`lib/status.ts` is the only place a state becomes a colour. Everything that
signals health reads from it: the KPI tiles, the lead chips and pills, the
board columns, the reply-window badge, the SEO score ring and the Overview
queue. One scale, so amber means the same thing on every screen.

Two rules it exists to enforce:

- **Status colours are reserved.** Good / warning / critical are never reused
  as a chart series or as decoration.
- **Colour never carries meaning alone.** Every tone ships with an icon and a
  written label. Roughly one man in twelve cannot separate the red and green
  ends of a RAG scale, and a colour on its own is unreadable in a screenshot,
  in print, or in forced-colours mode. The KPI tiles print "On track" /
  "Needs attention" / "Off track" under the number, and the lead chips pair
  their hue with a dot and the state's name.

Period-on-period change uses a trending icon whose shape changes with the
direction, and whose colour follows the *meaning* rather than the arrow.
Every KPI here is higher-is-better, so rising is green; the component takes
`higherIsBetter` so the day a bounce rate appears it is still correct.

Thresholds live in `KPI_THRESHOLDS` as plain numbers, because where a metric
turns amber is a business decision and should be visible and arguable in one
place. `npm run check:logic` asserts the boundaries.

### The live preview is an iframe

Not a styling choice. A scaled `<div>` cannot be a responsive preview: CSS
media queries, `vw` and `dvh` all resolve against the real browser window,
not against the box you drew. A 390px "mobile" frame still matched `lg:` and
still computed `9vw` against a 1600px window, so the hero rendered 72px type
inside a 390px column and spilled out of the frame.

An iframe is a real nested browsing context, so its viewport IS the device
width and every breakpoint, viewport unit and `min-h-screen` resolves
correctly with no overrides. The app's stylesheets and the `<html>` font
classes are copied in, and the draft is rendered through a React portal, so
the preview still updates as you type.

Inside the frame, `pointer-events` is off for the content. Wheel and
trackpad scrolling still work, because those target the document rather than
the element under the cursor, while every control stays inert.

### Charts

Recharts, with a hover layer on every mark: a chart a reader cannot
interrogate is a picture of data rather than a view of it. Marks stay thin,
axes and grids stay recessive, labels wear text tokens rather than the series
colour, and the single-series charts carry no legend because their panel
heading names them.

`SERIES_COLOURS` is a separate, categorical scale from the status palette,
assigned by fixed index and never cycled. A lead source is an identity, not
a health: painting one amber would read as a warning about that source
rather than as a label for it.

### Admin breakpoints

The admin uses two named breakpoints from `@theme`, `rail:` (900px) and
`wide:` (1180px), **not** arbitrary `min-[900px]:` utilities.

This is not a style preference. Tailwind v4 sorts arbitrary min-width
variants ahead of the named scale regardless of their pixel value, so
`sm:grid-cols-2` was emitted *after* `min-[1180px]:grid-cols-4` and won at
every width above 1180px. The Overview tiles sat 2x2 on a 1920px screen
because of it. Named breakpoints sort by value alongside `sm`/`md`/`lg` and
cascade correctly.

### Admin UI notes

The admin's own chrome reads Site Settings, so the logo an operator uploads
appears in the rail, the mobile drawer and the login card, not only on the
public site. The collapsed icon rail falls back to the brand's initial: there
is deliberately one logo asset in the schema, and a 3.8:1 wordmark scaled into
40px is unreadable.

No second UI kit. The admin is built from `components/admin/ui/` on the same
`:root` tokens, the same `--radius` and the same three type roles: Syne for
headings, Plus Jakarta for body, JetBrains Mono for every counter, id,
timestamp and uppercase micro-label.

- Tables collapse into labelled cards below 720px through one CSS utility
  (`responsive-table` in `globals.css`), which reads each cell's `data-label`.
  One DOM, so nothing is duplicated for a screen reader.
- Drag reorder is dnd-kit with the keyboard sensor wired up: tab to a handle,
  press space, use the arrow keys. The kanban board also gives every card a
  status select, because dnd-kit's keyboard sensor cannot express "move to
  another column".
- Toggles, reorders and status changes apply locally first and roll back with
  an error toast, so a switch never waits on a round trip.
- The CMS previews render the **real** public section components with the
  draft values as props, scaled in an `inert` container. There is no second
  implementation to drift.
- The rail is full width from 1180px, a collapsed icon rail from 900px, and a
  bottom tab bar plus a slide-in drawer below that. The save bar sits above
  the tab bar, never on top of it.

### Audit

Every create, update, delete and publish writes an `AuditLog` row with a
field-level diff. Writing it can never fail the operation it describes.

## Accessibility

Playwright runs axe on every public route and fails on serious or critical
violations. Also covered: a skip link, visible focus rings, a reduced-motion
path that renders content statically, and a 375px no-horizontal-scroll check
on every route.

In the admin: every input is tied to its label by `id` through one `Field`
component, switches are `role="switch"` with `aria-checked` and a required
accessible name, drag handles are keyboard-operable, drawers and dialogs use
the native `<dialog>` element so the browser supplies the focus trap and the
Escape handler, and the `prefers-reduced-motion` reset in `globals.css`
applies to all of it.

## What is not built

Out of scope by design, and the schema is shaped to take them later: blog,
portfolio, testimonials, "Why Klixora", process and stats sections in the CMS;
multi-user roles and permissions; content scheduling; A/B testing; analytics
beyond the Overview tiles.

Known limits in what is built:

- The IP rate limit is an in-process `Map`, so the budget is per server
  instance. Marked with a `ponytail:` comment in `server/rate-limit.ts`.
- The `supabase stack` commands are experimental and outside the CLI's
  compatibility promise. Only local development uses them; a hosted project
  takes the same migrations through `supabase db push`.
- Hero CTA click counts are a lifetime total on `HeroCta.clickCount`, shown as
  "Clicks". The brief asked for a rolling 30 days, which its own single-column
  schema cannot express; that needs a per-click event table.
- The live preview simulates a device viewport, so `min-h-screen` inside it
  resolves against the previewed device rather than the real browser window.
  Without that the hero alone was taller than the frame and nothing below it
  could be scrolled to.
