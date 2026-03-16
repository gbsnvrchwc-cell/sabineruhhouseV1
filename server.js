const express = require('express');
const rateLimit = require('express-rate-limit');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Safety check: make sure API key is set ──────────────────────────────────
if (!process.env.ANTHROPIC_API_KEY) {
  console.error('ERROR: ANTHROPIC_API_KEY environment variable is not set.');
  console.error('Set it in your Railway dashboard under Variables.');
  process.exit(1);
}

// ── CORS headers — allows your custom domain to call the API ────────────────
app.use((req, res, next) => {
  const allowed = [
    'https://sabineruhhouse.com',
    'https://www.sabineruhhouse.com',
    /\.railway\.app$/
  ];
  const origin = req.headers.origin || '';
  const isAllowed = allowed.some(o =>
    typeof o === 'string' ? o === origin : o.test(origin)
  );
  if (isAllowed) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// ── Parse JSON request bodies ───────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));

// ── Rate limiter ────────────────────────────────────────────────────────────
// 5 generations per IP per hour — protects your $5 credit
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'You have reached the limit of 5 generations per hour. Please try again later.'
  }
});

app.use('/api/generate', limiter);

// ── Serve static files ──────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));

// ── API Proxy Route ──────────────────────────────────────────────────────────
app.post('/api/generate', async (req, res) => {
  try {
    const { messages, max_tokens } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid request: messages array required.' });
    }

    // Cap max_tokens to 2500 regardless of what the client sends
    const safeTokens = Math.min(max_tokens || 2500, 2500);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: safeTokens,
        messages: messages
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: (data.error && data.error.message) || 'Anthropic API error'
      });
    }

    return res.json(data);

  } catch (err) {
    console.error('Proxy error:', err.message);
    return res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// ── Thank you page ──────────────────────────────────────────────────────────
app.get('/thank-you', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'thank-you.html'));
});

// ── Catch-all: serve index.html ─────────────────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log('Sabine Ruh House platform running on port ' + PORT);
});
