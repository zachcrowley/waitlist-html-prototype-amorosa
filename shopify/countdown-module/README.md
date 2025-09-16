## Shopify Global Countdown Module

This folder contains the assets and a wrapper section to install the countdown bar across an entire Shopify theme.

### Files

- assets/waitlist-countdown.css — Scoped styles for the bar
- assets/waitlist-countdown.js — Plain JS; injects the bar site‑wide and handles behaviour
- sections/waitlist-countdown-wrapper.liquid — Optional per‑page overrides (emits a small script only)

### Install Steps (Cursor‑Ready Prompt)

Copy/paste the following into your theme workspace terminal/actions:

1) Upload assets to theme (or paste via editor)
   - Add to `assets/`: `waitlist-countdown.css`, `waitlist-countdown.js`

2) In `config/settings_schema.json`, add a new group (merge carefully):
```json
{
  "name": "Countdown",
  "settings": [
    { "type": "checkbox", "id": "countdown_enable", "label": "Enable Countdown", "default": true },
    { "type": "text", "id": "countdown_target_utc", "label": "Target UTC", "default": "2025-10-01T10:00:00Z" },
    { "type": "url",  "id": "countdown_cta_href", "label": "CTA URL", "default": "#waitlist" },
    { "type": "text", "id": "countdown_eyebrow", "label": "Eyebrow", "default": "OCTOBER 1ST • 8:00PM (AEST)" },
    { "type": "text", "id": "countdown_title", "label": "Title", "default": "Abundance Face & Body Mask Restock Launch" },
    { "type": "textarea", "id": "countdown_copy_desktop", "label": "Desktop Copy (HTML)", "default": "Join the waitlist today<br>For early access before the General Public" },
    { "type": "textarea", "id": "countdown_copy_mobile", "label": "Mobile Copy (HTML)", "default": "Join the waitlist today for early access<br>before the General Public" },
    { "type": "checkbox", "id": "countdown_enable_close", "label": "Enable Close/Tab", "default": true },
    { "type": "text", "id": "countdown_exclude_handles", "label": "Exclude handles (comma-separated)", "default": "cart,checkout,account" },
    { "type": "text", "id": "countdown_color_navy", "label": "Navy Colour", "default": "#113A5C" },
    { "type": "text", "id": "countdown_color_bg", "label": "Background Colour", "default": "#F3FAFF" }
  ]
}
```

3) In `layout/theme.liquid`, before the closing `</head>` (or near other CSS includes), add:
```liquid
{% if settings.countdown_enable %}
  <link rel="stylesheet" href="{{ 'waitlist-countdown.css' | asset_url }}">
{% endif %}
```

4) In `layout/theme.liquid`, before the closing `</body>`, add:
```liquid
{% if settings.countdown_enable %}
  <script>
    window.__COUNTDOWN__SETTINGS = {
      enabled: true,
      targetUtc: {{ settings.countdown_target_utc | json }},
      ctaHref: {{ settings.countdown_cta_href | json }},
      eyebrow: {{ settings.countdown_eyebrow | json }},
      title: {{ settings.countdown_title | json }},
      copyDesktop: {{ settings.countdown_copy_desktop | json }},
      copyMobile: {{ settings.countdown_copy_mobile | json }},
      enableClose: {{ settings.countdown_enable_close | json }},
      excludeHandles: {{ settings.countdown_exclude_handles | json }},
      colors: { navy: {{ settings.countdown_color_navy | json }}, bg: {{ settings.countdown_color_bg | json }} }
    };
  </script>
  <script src="{{ 'waitlist-countdown.js' | asset_url }}" defer></script>
{% endif %}
```

5) Optional overrides per page
   - Add `sections/waitlist-countdown-wrapper.liquid` to your theme.
   - In the theme editor, add the section to any page to override date/copy/CTA without changing global settings.

### Notes
- Persistence: close hides for 7 days (localStorage key `amorosa_countdown_hidden`).
- A11y: ARIA live announcements throttled to once per minute; region labelled.
- Performance: single JS file, no external libraries.


