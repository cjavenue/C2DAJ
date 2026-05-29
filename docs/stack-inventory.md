# Stack Inventory — Location-Based Real-Time Social Discovery App

> Reference inventory captured from a review of **athal.fun** to reuse when building a
> similar type of project (proximity-based real-time social discovery).
>
> **Source & confidence:** The site is heavily client-side JS-rendered and could not be
> fetched/inspected directly from this environment (host blocked by network policy). The
> stack below is **inferred** from observed product behavior plus typical modern
> implementations for this app category (analysis via Grok). Treat entries as
> *likely/representative*, **not verified**, until confirmed against the live site source
> (View Source → inspect `<script>`/`<link>` chunk paths, response headers, etc.).
>
> _Captured: 2026-05-29_

## What the product does

A location-based real-time social discovery platform. Users enable GPS to see nearby
people (within ~50 km), view live activity on a map, post status updates, and
connect/chat in real time.

Core features:
- Live presence indicator (e.g. "16 Online")
- Proximity-based matching / "nearby users"
- Activity sharing on a live map
- Real-time chat

Comparable to a hybrid of Happn + Meetup + a location-aware social feed.

## Inferred tech stack

| Layer | Likely technologies |
| --- | --- |
| Frontend | React.js or Next.js + TypeScript + Tailwind CSS |
| Maps & location | Mapbox GL JS, Google Maps, or Leaflet.js + Turf.js (geospatial math) |
| Real-time | Socket.io, Supabase Realtime, or Firebase (live markers, presence, chat) |
| Backend | Node.js (Express / NestJS) or serverless via Next.js API routes |
| Database | PostgreSQL + PostGIS (geospatial "nearby" queries), or Supabase / Firebase |
| Auth | Supabase Auth, Clerk, or Firebase Auth (social / OAuth) |
| Caching / presence | Redis |
| Media storage | AWS S3 or Supabase Storage |
| Hosting | Vercel, Supabase, Railway, or Fly.io |

## Recommended architecture for a similar project

Full-stack monorepo built on **Next.js 15 (App Router) + TypeScript + Tailwind +
shadcn/ui**. Use a BFF pattern for real-time logic. Prioritize opt-in location sharing,
privacy controls (blur distant locations), and moderation from day one.

Key components:
- **Geospatial queries** via PostGIS (`ST_DWithin` for radius lookups).
- **Real-time sync** via Supabase Realtime, or Socket.io + Redis.
- **Mobile**: PWA or React Native.
- **Safety**: rate limiting and abuse/spam prevention.

### Stack options

- **Fastest MVP:** Next.js + Supabase + Mapbox.
- **Scalable alternative:** NestJS + PostgreSQL/PostGIS + Redis + React.

## Build priorities

Focus early on:
- GPS accuracy
- Battery efficiency
- Privacy compliance (opt-in, distance blurring, clear consent)

## TODO — verify against the live site

When network access allows, confirm the inferred entries by inspecting:
- [ ] `<meta name="generator">` and HTML structure
- [ ] Script chunk paths (`/_next/` → Next.js, `/_nuxt/` → Nuxt, `/assets/index-*.js` → Vite, etc.)
- [ ] Response headers (`server`, `x-powered-by`, `x-vercel-id`, `cf-ray`, etc.) for hosting/CDN
- [ ] Network calls to identify backend/realtime (e.g. `*.supabase.co`, `firebaseio.com`, websocket endpoints)
- [ ] Map tile requests (Mapbox / Google / Leaflet+OSM)
