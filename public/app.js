(function () {
  'use strict';

  // ── Mobile Nav ──────────────────────────────────────────────────────────────
  function initNav() {
    var toggle = document.getElementById('navToggle');
    var links  = document.getElementById('navLinks');
    if (!toggle || !links) return;

    toggle.addEventListener('click', function () {
      links.classList.toggle('open');
    });

    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        links.classList.remove('open');
      });
    });
  }

  // ── Tabs ────────────────────────────────────────────────────────────────────
  function initTabs() {
    document.querySelectorAll('.tab').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var t = this.dataset.tab;
        document.querySelectorAll('.tab').forEach(function (b) { b.classList.remove('active'); });
        document.querySelectorAll('.panel').forEach(function (p) { p.classList.remove('active'); });
        this.classList.add('active');
        var panel = document.getElementById('panel-' + t);
        if (panel) panel.classList.add('active');
      });
    });
  }

  // ── File Inputs ─────────────────────────────────────────────────────────────
  function initFileInputs() {
    ['arc', 'amazon', 'launch', 'guide'].forEach(function (t) {
      var fi = document.getElementById('file-' + t);
      if (!fi) return;
      fi.addEventListener('change', function () {
        var nameEl = document.getElementById('fn-' + t);
        if (this.files && this.files[0] && nameEl) {
          nameEl.textContent = '📎 ' + this.files[0].name;
        }
      });
    });
  }

  // ── File Reader ─────────────────────────────────────────────────────────────
  function readFile(file) {
    return new Promise(function (resolve, reject) {
      if (!file) { resolve(null); return; }
      var isPDF = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      var reader = new FileReader();
      if (isPDF) {
        reader.onload = function (e) {
          var bytes = new Uint8Array(e.target.result);
          var binary = '';
          for (var i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
          }
          resolve({ type: 'pdf', data: btoa(binary) });
        };
        reader.onerror = function () { reject(new Error('Could not read PDF')); };
        reader.readAsArrayBuffer(file);
      } else {
        reader.onload = function (e) { resolve({ type: 'text', data: e.target.result }); };
        reader.onerror = function () { reject(new Error('Could not read file')); };
        reader.readAsText(file);
      }
    });
  }

  // ── Prompts ─────────────────────────────────────────────────────────────────
  var PROMPTS = {
    arc: function (m, fc) {
      var excerpt = fc && fc.type === 'text' ? '\n\nMANUSCRIPT EXCERPT (first 5000 chars):\n' + fc.data.substring(0, 5000) : '';
      return 'You are a professional literary publicist. Generate 3 personalized ARC outreach pitch emails.\n\nBook: ' + m.title + '\nAudience: ' + m.audience + '\nLaunch Date: ' + m.date + '\nAuthor Bio: ' + m.bio + excerpt + '\n\nReturn ONLY a valid JSON object with no markdown fences:\n{"blogger_pitch":"Full professional email to a book blogger or literary reviewer — compelling, specific, and ready to send","librarian_pitch":"Full email to a public or school librarian explaining the book\'s value for their collection","educator_pitch":"Full email to a classroom teacher or educator highlighting curriculum connections and discussion potential"}';
    },
    amazon: function (m, fc) {
      var excerpt = fc && fc.type === 'text' ? '\n\nMANUSCRIPT EXCERPT:\n' + fc.data.substring(0, 5000) : '';
      return 'You are an Amazon book marketing expert. Create an optimised Amazon listing.\n\nBook: ' + m.title + '\nAudience: ' + m.audience + '\nLaunch Date: ' + m.date + '\nAuthor Bio: ' + m.bio + excerpt + '\n\nReturn ONLY a valid JSON object with no markdown fences:\n{"book_description":"A compelling 200-250 word Amazon book description with strong hook, keyword-rich, using short paragraphs","keywords":"7 high-value Amazon search keyword phrases, comma-separated","title_variant":"A suggested subtitle or title variant to improve discoverability","editorial_blurb":"A 2-3 sentence editorial-style review blurb suitable for the listing page"}';
    },
    launch: function (m, fc) {
      var excerpt = fc && fc.type === 'text' ? '\n\nMANUSCRIPT EXCERPT:\n' + fc.data.substring(0, 5000) : '';
      return 'You are a book launch strategist. Create a detailed 30-day launch plan.\n\nBook: ' + m.title + '\nAudience: ' + m.audience + '\nLaunch Date: ' + m.date + '\nAuthor Bio: ' + m.bio + excerpt + '\n\nReturn ONLY a valid JSON object with no markdown fences:\n{"week_1":"Days 1-7 — Pre-launch: 7 specific daily actions, post ideas, and platform recommendations","week_2":"Days 8-14 — Launch week: specific daily content and outreach actions for each day","week_3":"Days 15-21 — Building momentum: content strategy, review outreach, and community engagement","week_4":"Days 22-30 — Sustaining growth: long-tail strategy, repurposing content, next book teaser","key_milestones":"List 6-8 key events to schedule: ARC distribution, review pushes, launch day activities, media outreach windows"}';
    },
    guide: function (m, fc) {
      var excerpt = fc && fc.type === 'text' ? '\n\nMANUSCRIPT EXCERPT:\n' + fc.data.substring(0, 5000) : '';
      return 'You are an experienced educator and literary discussion facilitator. Create a comprehensive reading group and classroom guide.\n\nBook: ' + m.title + '\nAudience: ' + m.audience + '\nLaunch Date: ' + m.date + '\nAuthor Bio: ' + m.bio + excerpt + '\n\nReturn ONLY a valid JSON object with no markdown fences:\n{"synopsis":"150-word synopsis written for educators and book club leaders","key_themes":"5-7 key themes, each with a 1-2 sentence explanation","discussion_questions":"12 thoughtful discussion questions, numbered, moving from comprehension to deeper analysis and personal reflection","activities":"4 creative classroom or book club activities with step-by-step instructions","curriculum_connections":"How this book connects to educational standards: social-emotional learning, literacy, science, ethics, or other subjects"}';
    }
  };

  // ── Result Labels ────────────────────────────────────────────────────────────
  var LABELS = {
    arc:    { blogger_pitch: 'Book Blogger Pitch', librarian_pitch: 'Librarian Pitch', educator_pitch: 'Educator Pitch' },
    amazon: { book_description: 'Optimised Book Description', keywords: 'Amazon Keywords', title_variant: 'Title Variant', editorial_blurb: 'Editorial Review Blurb' },
    launch: { week_1: 'Week 1 — Pre-Launch (Days 1–7)', week_2: 'Week 2 — Launch Week (Days 8–14)', week_3: 'Week 3 — Building Momentum (Days 15–21)', week_4: 'Week 4 — Sustaining Growth (Days 22–30)', key_milestones: 'Key Milestone Events' },
    guide:  { synopsis: 'Synopsis for Educators', key_themes: 'Key Themes', discussion_questions: 'Discussion Questions', activities: 'Activities & Exercises', curriculum_connections: 'Curriculum Connections' }
  };

  // ── UI Helpers ───────────────────────────────────────────────────────────────
  function showErr(t, msg) {
    var el = document.getElementById('err-' + t);
    if (el) { el.textContent = msg; el.style.display = 'block'; }
  }
  function clearErr(t) {
    var el = document.getElementById('err-' + t);
    if (el) el.style.display = 'none';
  }

  function showSkeleton(t) {
    var ph = document.getElementById('ph-' + t);
    var rb = document.getElementById('rb-' + t);
    if (ph) ph.style.display = 'none';
    if (rb) {
      rb.innerHTML = [
        '<div class="res-blk">',
        '  <div class="skel" style="width:28%;margin-bottom:14px"></div>',
        '  <div class="skel" style="width:90%"></div>',
        '  <div class="skel" style="width:74%"></div>',
        '  <div class="skel" style="width:82%"></div>',
        '  <div class="skel" style="width:56%"></div>',
        '</div>',
        '<div class="res-blk">',
        '  <div class="skel" style="width:22%;margin-bottom:14px"></div>',
        '  <div class="skel" style="width:86%"></div>',
        '  <div class="skel" style="width:70%"></div>',
        '</div>'
      ].join('');
      rb.classList.add('on');
    }
  }

  function resetResults(t) {
    var ph = document.getElementById('ph-' + t);
    var rb = document.getElementById('rb-' + t);
    if (ph) ph.style.display = 'flex';
    if (rb) { rb.classList.remove('on'); rb.innerHTML = ''; }
  }

  function renderResults(t, parsed) {
    var rb = document.getElementById('rb-' + t);
    if (!rb) return;
    var labels = LABELS[t];
    var html = '';
    Object.keys(labels).forEach(function (k) {
      if (!parsed[k]) return;
      var safe = String(parsed[k])
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      var encoded = encodeURIComponent(parsed[k]);
      html += '<div class="res-blk">' +
        '<span class="res-lbl">' + labels[k] + '</span>' +
        '<button class="cp-btn" data-val="' + encoded + '">Copy</button>' +
        '<div class="res-txt">' + safe + '</div>' +
        '</div>';
    });
    rb.innerHTML = html;
    rb.classList.add('on');

    rb.querySelectorAll('.cp-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var text = decodeURIComponent(this.dataset.val);
        navigator.clipboard.writeText(text).then(function () {
          btn.textContent = '✓ Copied';
          btn.classList.add('ok');
          setTimeout(function () {
            btn.textContent = 'Copy';
            btn.classList.remove('ok');
          }, 2000);
        });
      });
    });
  }

  // ── API Call — talks to YOUR server, key never touches the browser ──────────
  async function callAPI(messages) {
    var res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: messages, max_tokens: 2500 })
    });

    var data = await res.json();

    if (!res.ok) {
      // Handle rate limit message nicely
      if (res.status === 429) {
        throw new Error('You have reached the limit of 10 generations per hour. Please try again later.');
      }
      throw new Error(data.error || 'Server error ' + res.status);
    }

    var raw = (data.content || []).map(function (c) { return c.text || ''; }).join('');
    var match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('Could not parse the response. Please try again.');
    return JSON.parse(match[0]);
  }

  // ── Tool Buttons ─────────────────────────────────────────────────────────────
  function initToolButtons() {
    ['arc', 'amazon', 'launch', 'guide'].forEach(function (t) {
      var btn = document.getElementById('btn-' + t);
      if (!btn) return;

      btn.addEventListener('click', async function () {
        var title = (document.getElementById('title-' + t) || {}).value || '';
        var aud   = (document.getElementById('aud-'   + t) || {}).value || '';
        var date  = (document.getElementById('date-'  + t) || {}).value || '';
        var bio   = (document.getElementById('bio-'   + t) || {}).value || '';
        var fi    = document.getElementById('file-'   + t);

        title = title.trim();
        if (!title) { showErr(t, 'Please enter a book title and genre.'); return; }

        clearErr(t);
        btn.disabled = true;
        btn.textContent = '⏳ Generating…';
        showSkeleton(t);

        var meta = {
          title:    title,
          audience: aud.trim()  || 'General readers',
          date:     date.trim() || 'TBD',
          bio:      bio.trim()  || 'An accomplished author.'
        };

        var fc = null;
        if (fi && fi.files && fi.files[0]) {
          try {
            fc = await readFile(fi.files[0]);
          } catch (e) {
            showErr(t, 'File error: ' + e.message);
            btn.disabled = false;
            btn.innerHTML = '✦ Generate';
            resetResults(t);
            return;
          }
        }

        var prompt = PROMPTS[t](meta, fc);
        var messages;

        if (fc && fc.type === 'pdf') {
          messages = [{
            role: 'user',
            content: [
              { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: fc.data } },
              { type: 'text', text: prompt }
            ]
          }];
        } else {
          messages = [{ role: 'user', content: prompt }];
        }

        try {
          var parsed = await callAPI(messages);
          renderResults(t, parsed);
        } catch (e) {
          showErr(t, '⚠ ' + e.message);
          resetResults(t);
        }

        btn.disabled = false;
        btn.innerHTML = '✦ Generate';
      });
    });
  }

  // ── Init ─────────────────────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', function () {
    // Key is server-side — hide the API notice entirely
    var notice = document.getElementById('apiNotice');
    if (notice) notice.style.display = 'none';

    initNav();
    initTabs();
    initFileInputs();
    initToolButtons();
  });

})();
