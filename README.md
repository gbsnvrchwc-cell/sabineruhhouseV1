# Sabine Ruh House — Literary Platform (v2 — Secure Backend)

The API key lives **only on the server** — never visible to any visitor.

## File Structure

```
sabine-ruh-house/
├── server.js       ← Express backend (API proxy + rate limiting)
├── package.json    ← Node dependencies
├── railway.json    ← Railway config
├── README.md
└── public/
    ├── index.html
    ├── style.css
    └── app.js      ← Calls /api/generate (never Anthropic directly)
```

## Deploy to Railway

### 1. Push to GitHub
```bash
git add .
git commit -m "Secure backend v2"
git push
```

### 2. Add your API key in Railway
1. Open your project on railway.app
2. Click your service → **Variables** tab
3. Click **New Variable**
4. Name: `ANTHROPIC_API_KEY` / Value: your `sk-ant-...` key
5. Click **Add** — Railway redeploys automatically

### 3. Done!
Tools work without asking visitors for any key.

## Rate Limiting
10 generations per IP per hour. Change `max: 10` in `server.js` to adjust.

## Spend Cap (Recommended)
Go to console.anthropic.com → Settings → Billing → set a Monthly Spend Limit.
