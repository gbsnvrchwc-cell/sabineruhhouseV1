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

// ── Parse JSON request bodies ───────────────────────────────────────────────
app.use(express.json({ limit: '10mb' })); // 10mb to allow PDF uploads

// ── Rate limiter ────────────────────────────────────────────────────────────
// Max 10 requests per IP per hour — protects your API credits
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,                   // max 10 generations per IP per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'You have reached the limit of 10 generations per hour. Please try again later.'
  }
});

// Apply rate limiting only to the API proxy route
app.use('/api/generate', limiter);

// ── Serve static files (your HTML, CSS, JS) ─────────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));

// ── API Proxy Route ──────────────────────────────────────────────────────────
// The browser calls /api/generate → this server adds the secret key → forwards to Anthropic
app.post('/api/generate', async (req, res) => {
  try {
    const { messages, max_tokens } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid request: messages array required.' });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,   // Key lives only here
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: max_tokens || 2500,
        messages: messages
      })
    });

    const data = await response.json();

    // If Anthropic returned an error, pass it back clearly
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

// ── Catch-all: serve index.html for any other route ─────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log('Sabine Ruh House platform running on port ' + PORT);
});
