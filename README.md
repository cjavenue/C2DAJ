# MJ Prompt Builder Pro

A mobile-first **Progressive Web App (PWA)** for building, optimizing, and copying
[Midjourney](https://www.midjourney.com) prompts on the go. It's a single static
page — no build step, no backend — and it leans entirely on **free / open services**:

- **[Pollinations.ai](https://pollinations.ai)** — free, no-key text AI used to expand & optimize prompts.
- **[Google Gemini](https://aistudio.google.com/app/apikey) free tier** — optional, you supply your own free key, used to analyze a reference image and turn it into prompt keywords.

## Features

- 📱 **Installable PWA** — "Add to Home Screen" and it runs full-screen like a native app.
- 🔌 **Works offline** — the prompt builder is cached by a service worker (AI optimize needs a connection).
- ✨ **AI Optimize** — expand a rough idea, or describe an uploaded reference image, into a rich prompt.
- 🎛️ **Full parameter set** — aspect ratio, model version (v7/v6.1/v6/v5.2/Niji), chaos, stylize, weird, quality, negative prompt (`--no`), style reference (`--sref`), seed, and seamless tiling.
- 💾 **Remembers your inputs** between visits (stored locally on your device).
- 📋 **One-tap copy** with a clipboard fallback for older mobile browsers.

## Run it locally

It's just static files, so any static server works:

```bash
# Python 3
python3 -m http.server 8080
# then open http://localhost:8080
```

> Service workers and "Install" require **HTTPS** (or `localhost`). Opening
> `index.html` directly via `file://` will run the app, but PWA install/offline
> features won't activate.

## Deploy to GitHub Pages (test it on your phone)

This repo includes a workflow at `.github/workflows/deploy-pages.yml` that
publishes the site automatically.

1. In GitHub: **Settings → Pages → Build and deployment → Source → "GitHub Actions"**.
2. Push to the configured branch — the **Deploy to GitHub Pages** workflow runs and publishes the site.
3. Open the published URL (shown in the Actions run summary, typically
   `https://<your-username>.github.io/<repo>/`) on your phone, then use your
   browser's **Add to Home Screen** to install it.

## Project structure

```
index.html              The whole app (UI + logic)
manifest.webmanifest    PWA metadata (name, icons, theme)
sw.js                   Service worker (offline app-shell cache)
icons/                  App icons (192/512 + maskable + apple-touch)
scripts/gen_icons.py    Regenerates the icons (stdlib only, no deps)
.github/workflows/      GitHub Pages deploy workflow
```

### Regenerating icons

The icons are generated programmatically (no image editor or third-party
libraries needed):

```bash
python3 scripts/gen_icons.py
```
