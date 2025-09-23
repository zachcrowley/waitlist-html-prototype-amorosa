# Amorosa Top Bar (Shopify Section)

A Shopify-ready top bar that shows a live waitlist count and a CTA. It calls your existing API endpoints and never exposes admin tokens.

## Files

- sections/top-bar-waitlist.liquid
- assets/top-bar-waitlist.css
- assets/top-bar-waitlist.js

## Install

1. Copy `sections/top-bar-waitlist.liquid` to your Shopify theme `sections/`.
2. Copy `assets/top-bar-waitlist.css` and `assets/top-bar-waitlist.js` into your theme `assets/`.
3. Ensure CSS/JS are loaded globally (theme may auto-include). If not, add to `layout/theme.liquid`:

```liquid
{{ 'top-bar-waitlist.css' | asset_url | stylesheet_tag }}
<script src="{{ 'top-bar-waitlist.js' | asset_url }}" defer></script>
```

4. In Theme Editor, add the section “Amorosa Top Bar (Waitlist)” and configure:
- Desktop message
- Mobile message
- CTA label
- Show CTA on mobile (optional)
- Stick to top
- Confetti on join
- Polling interval (default 60s)
- API Base URL (leave blank to use same origin)

## API and CORS

This section expects:
- GET `/api/waitlist` → returns `{ displayCount, serverTs }`
- POST `/api/join-success` → returns `{ ok: true }`

CORS: Your API must allow origin `https://amorosaaus.com.au` for GET/POST and preflight (OPTIONS). This repo’s endpoints are configured accordingly.

## Tokens

- Admin token is never used client-side. Keep it server-side on your API.
