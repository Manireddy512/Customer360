# Customer 360

Unified account intelligence prototype — combines CRM, Support, Email, Slack,
and Product Usage data into one view, then calls Claude to generate a summary,
risk/opportunity signals, and a Next Best Action.

## Project structure

```
customer360/
├── api/generate-insights.js   # Vercel serverless function (used on Vercel)
├── server.js                  # Express server (used on Render / generic Node hosts)
├── shared/accounts.js         # Dummy data + prompt logic, shared by frontend & backend
├── src/                       # React frontend (Vite)
└── dist/                      # Production build output (created by `npm run build`)
```

The **AI call is server-side only**. The browser calls `/api/generate-insights`
with just an `accountId`; the server looks up the account, builds the prompt,
and calls Anthropic using an API key stored in an environment variable. Your
API key is never sent to the browser.

---

## Requirements

- Node.js 18+ (both Vercel and Render provide this by default)
- An Anthropic API key from **https://console.anthropic.com** (this is a
  separate key from your claude.ai login — it's for the API specifically,
  and billing is usage-based)
- A GitHub (or GitLab/Bitbucket) repo — both Vercel and Render deploy from a
  connected git repo, not a raw file upload

---

## Option A — Deploy to Vercel (recommended for this project)

Vercel auto-detects Vite + the `/api` folder as serverless functions, so this
needs almost no configuration.

1. Push this folder to a GitHub repo.
2. Go to vercel.com → **Add New Project** → import that repo.
3. Vercel will detect the **Vite** framework preset automatically.
   - Build command: `npm run build` (default, no change needed)
   - Output directory: `dist` (default, no change needed)
4. Before deploying, open **Environment Variables** and add:
   - `ANTHROPIC_API_KEY` = your key
   - `ANTHROPIC_MODEL` = `claude-sonnet-4-5-20250929` (optional — check
     https://docs.claude.com for the current recommended model ID)
5. Click **Deploy**.
6. Once deployed, `/api/generate-insights` is automatically live as a
   serverless function alongside your static frontend — no extra setup.

That's it — you'll get a public `*.vercel.app` URL.

---

## Option B — Deploy to Render

Render runs this as a persistent Node web service (using `server.js`), which
serves both the built frontend and the `/api` route.

1. Push this folder to a GitHub repo.
2. Go to render.com → **New** → **Web Service** → connect the repo.
3. Configure:
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
4. Under **Environment Variables**, add:
   - `ANTHROPIC_API_KEY` = your key
   - `ANTHROPIC_MODEL` = `claude-sonnet-4-5-20250929` (optional)
5. Click **Create Web Service**.

Render will build and boot `server.js`, which serves the compiled frontend
and handles `/api/generate-insights` itself. You'll get a public
`*.onrender.com` URL.

> Render's free tier spins down after inactivity, so the first request after
> idle time can take ~30-60 seconds to wake up. That's normal.

---

## Local development

```bash
npm install
cp .env.example .env        # then fill in ANTHROPIC_API_KEY
npm run dev:server           # terminal 1 — runs the API on :3000
npm run dev                  # terminal 2 — runs Vite on :5173, proxies /api to :3000
```

Then open the URL Vite prints (usually http://localhost:5173).

## Notes

- All customer data (`shared/accounts.js`) is dummy data for three sample
  accounts. Swapping in real CRM/support/email/Slack/usage sources means
  replacing that file with live API calls — the prompt-building and UI layers
  don't need to change.
- If `ANTHROPIC_MODEL` isn't set, the backend defaults to
  `claude-sonnet-4-5-20250929`. Model IDs change over time — verify the
  current one at https://docs.claude.com before deploying.
