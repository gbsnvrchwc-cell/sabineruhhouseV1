# Sabine Ruh House — Literary Platform

A sophisticated author website with an integrated bookstore and four AI-powered professional tools for serious writers.

## Features

- **Bookstore** — All six books listed with direct Amazon purchase links
- **ARC Outreach Generator** — Personalized pitch emails for bloggers, librarians & educators
- **Amazon Listing Optimizer** — High-converting descriptions, keywords & title variants
- **30-Day Launch Planner** — Week-by-week content calendar and milestone map
- **Reading Group Discussion Guide** — Themes, questions, activities & curriculum links

---

## Deploying to Railway

### Step 1 — Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/sabine-ruh-house.git
git push -u origin main
```

### Step 2 — Deploy on Railway

1. Go to [railway.app](https://railway.app) and sign in
2. Click **New Project** → **Deploy from GitHub repo**
3. Select your `sabine-ruh-house` repository
4. Railway will auto-detect the `package.json` and deploy
5. Click **Generate Domain** under Settings → Networking to get your public URL

### Step 3 — Done!

Your site will be live at `https://your-project.up.railway.app`

---

## Using the Author Tools

The tools require an **Anthropic API key** to function. When a visitor opens the tools section, they are prompted to enter their key. The key is stored only in their browser session (never on any server).

To get an API key: [console.anthropic.com](https://console.anthropic.com)

---

## File Structure

```
sabine-ruh-house/
├── index.html      # Main HTML — all sections and page structure
├── style.css       # All styles — typography, layout, dark theme
├── app.js          # All JavaScript — tabs, tools, API calls
├── package.json    # Node dependencies (serve)
├── railway.json    # Railway deployment config
└── README.md       # This file
```

---

## Customisation

- **Add a book** — Copy a `.book-card` block in `index.html` and update the title, description, and Amazon link
- **Update bio** — Edit the `<div class="bio">` section in `index.html`
- **Change colours** — Edit the CSS variables at the top of `style.css` (`:root { ... }`)
- **Add your own API key server-side** — Replace the client-side key input with a proxy endpoint for a fully managed SaaS experience
