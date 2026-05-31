# Nearby — live location-based social app

A mobile-first web app (athal.fun-style) for seeing what's happening around you
and connecting with people nearby in real time. Built incrementally; this folder
is independent of the MJ Prompt Builder app at the repo root.

## Status

| Step | Feature | State |
| --- | --- | --- |
| 1 | Live dark map + Post Status / layers / edit / locate controls | ✅ done (controls are placeholders except locate) |
| 2 | Location-permission gate → drop user pin, 5 km radius, online peers | ✅ done (peers mocked) |

## Stack (this stage)

- **MapLibre GL JS 4.x** (via CDN) — open-source map engine, **no API key / no billing**.
- **CARTO `dark-matter` vector style** — free dark basemap that matches the design.
- **Vanilla HTML/CSS/JS** — zero build step, consistent with the repo's static-PWA approach.
- **No backend / no database yet** — not required for steps 1 & 2.

### When a backend becomes necessary (flagged for later)

Real presence ("19 Online"), real nearby users, chat, and Post Status persistence
need a server. Recommended at that point:
**Supabase (PostgreSQL + PostGIS + Realtime)** — PostGIS `ST_DWithin` for the 5 km
nearby query, Realtime channels for live presence. Until then, peers are generated
locally by `mockPeers()`.

## Data security (from day one)

- Location is **opt-in only** — never requested automatically.
- Coordinates are held **in memory only** (`state.userLngLat`); nothing is persisted
  or transmitted to any server.
- Only network calls are map-tile fetches (inherent to map rendering; no user identity).
- Manual fallback ("Set location manually") for users who decline GPS.

## Run locally

```bash
python3 -m http.server 8080
# open http://localhost:8080/app/
```

> Geolocation requires HTTPS or `localhost`.

## Files

```
app/index.html   Markup: map, HUD (screen 1), location gate (screen 2)
app/styles.css   Turquoise / light-green palette over the dark map
app/app.js       Map init, geolocation gate, 5 km radius, (mock) presence
```
