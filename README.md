## Amorosa Waitlist Prototype

Static front‑end prototype with an animated faux search input and responsive email signup.

### Local preview

Node is only used for local preview. You can also open `index.html` directly.

```bash
npm run start
```

Then visit `http://localhost:3000`.

### Deploy to Vercel

This repo includes `vercel.json` for a static deployment.

1. Install the Vercel CLI if you haven’t: `npm i -g vercel`
2. From the project directory, run: `vercel` and follow prompts
3. For production: `vercel --prod`

### Top bar and API endpoints

This repo includes a sky-blue top bar that displays a live waitlist count and a button to join. The following endpoints power it:

- `GET /api/waitlist` → proxies the public live count
- `POST /api/join-success` → securely increments the live count upstream

#### Local

For local POST to work, set `ADMIN_TOKEN` before starting the server:

```bash
export ADMIN_TOKEN=your-token
npm run start
```

#### Vercel

Set the environment variable in Vercel → Settings → Environment Variables:

- `ADMIN_TOKEN = <your-admin-token>`

Security notes:

- Never commit your `ADMIN_TOKEN` to the repo or expose it in client code.
- If a token was shared publicly, rotate it immediately in Vercel.

### Scripts

```json
{
  "start": "node server.js"
}
```


