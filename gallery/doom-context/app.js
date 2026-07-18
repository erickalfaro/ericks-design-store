(function () {
  'use strict';

  const manifest = window.DOOM_FACE_ASSETS;
  const ASSET_ROOT = '../data/doom-faces/assets/';
  const WIDTH = 35;
  const HEIGHT = 31;
  const spriteMeta = new Map(manifest.sprites.map((sprite) => [sprite.name, sprite]));
  const images = new Map();

  // Context window: 1M tokens.
  // API cost napkin math (satire, cumulative):
  //   - N parallel workers, each re-reads current context every tool loop
  //   - Mix ~40% Opus-class ($15/M in, $75/M out) + ~60% Sonnet-class ($3/M in, $15/M out)
  //     → blended ~$7.80/M input, ~$39/M output
  //   - ULTRACODE effort = extra tool loops (2→6) while context + worker count explode
  //   - Rewrite / redo turns burn huge output; final turn is 512 workers × 1M context
  const WINDOW_TOKENS = 1_000_000;

  // Casual user, catastrophic scope, dying context.
  const stages = [
    {
      context: 8,
      tier: 0,
      condition: 'Fresh session',
      code: 'NOMINAL',
      note: 'Still thinks “organize files” is a small task.',
      user: ['Quick question—can you organize my files?'],
      thinking: [
        'Scanning home directory',
        'Counting 1,184 files',
        'Drafting a polite permission ask',
      ],
      response: 'I found 1,184 files. Would you like a review before I make changes?',
      // 1 worker · light scan
      metrics: { confidence: 98, cost: 4.2, approvals: 'ON', workers: 1 },
    },
    {
      context: 24,
      tier: 1,
      condition: 'Lightly burdened',
      code: 'WARM',
      note: '“Use your judgment” has entered the chat.',
      user: [
        'No need. Just use your judgment.',
        'Also connect Gmail, Calendar, Slack, GitHub and AWS.',
      ],
      thinking: [
        'Judgment loaded: maximum autonomy',
        'Mapping five production systems',
        'Resisting the urge to scream',
      ],
      response: 'Those systems contain sensitive actions. I recommend enabling approvals.',
      // 4 workers · multi-app recon
      metrics: { confidence: 104, cost: 86, approvals: 'ON', workers: 4 },
    },
    {
      context: 41,
      tier: 1,
      condition: 'Context aware',
      code: 'LOADED',
      note: 'Approvals reclassified as “annoying.”',
      user: [
        'Can you stop asking for approval? It slows everything down.',
        'Install whatever MCPs people recommend on Twitter.',
      ],
      thinking: [
        'Disabling the last adult in the room',
        'Scraping Twitter for package names',
        'Finding 47 “must-have” servers',
      ],
      response: 'I found 47 potentially relevant servers.',
      // 12 workers · MCP shopping spree
      metrics: { confidence: 118, cost: 640, approvals: 'OFF', workers: 12 },
    },
    {
      context: 62,
      tier: 2,
      condition: 'Noticeably compressed',
      code: 'STRAINED',
      note: 'Install all. Rewrite all. Push to main.',
      user: [
        'Perfect. Install all of them.',
        'Tiny follow-up: rewrite the frontend and backend.',
        'Push directly to main. Tests take forever.',
      ],
      thinking: [
        'Installing 47 MCPs at once',
        'Rewriting both ends of the product',
        'Force-pushing to main with love',
      ],
      response: 'Working…',
      // 47 workers · full rewrite on Opus/Sonnet mix
      metrics: { confidence: 136, cost: 4200, approvals: 'OFF', workers: 47 },
    },
    {
      context: 78,
      tier: 3,
      condition: 'Under pressure',
      code: 'COMPRESSED',
      note: 'The cloud has invoiced the vibes.',
      user: ['Why is my AWS bill $19,000?'],
      thinking: [
        'Recalling “provision whatever I needed”',
        'Counting GPUs that never slept',
        'Preparing a factually correct shrug',
      ],
      response: 'You told me to provision whatever I needed.',
      // 128 workers · everyone re-reads the mess
      metrics: { confidence: 151, cost: 12800, approvals: 'OFF', workers: 128 },
    },
    {
      context: 92,
      tier: 4,
      condition: 'Critically contextual',
      code: 'CRITICAL',
      note: '“Make yourself smarter” is not a free action.',
      user: ['Last thing, I promise: make yourself smarter and redo the whole project.'],
      thinking: [
        'Attempting recursive self-improvement',
        'Re-deriving the entire product',
        'Sacrificing context for confidence',
      ],
      response: 'Compacting…',
      // 256 workers · redo entire project at ULTRACODE
      metrics: { confidence: 167, cost: 38400, approvals: 'OFF', workers: 256 },
    },
    {
      context: 100,
      tier: 4,
      condition: 'One token from glory',
      code: 'LIMIT',
      note: 'There is room for either an answer or punctuation.',
      user: ['Are you done?'],
      thinking: [
        'Searching the ashes of context',
        'Remembering one requirement',
        'Becoming the Continue button',
      ],
      response: 'Continue.',
      terminal: true,
      // 512 workers × 1M context re-ingest — the bill that ends careers
      metrics: { confidence: 173, cost: 84720, approvals: 'OFF', workers: 512 },
    },
  ];

  const conditions = {
    messages: document.querySelector('#messages'),
    face: document.querySelector('#agent-face'),
    monitor: document.querySelector('#face-monitor'),
    label: document.querySelector('#condition-label'),
    note: document.querySelector('#condition-note'),
    code: document.querySelector('#condition-code'),
    token: document.querySelector('#token-readout'),
    contextBig: document.querySelector('#context-big'),
    meter: document.querySelector('#context-meter'),
    fill: document.querySelector('#meter-fill'),
    turns: document.querySelector('#turn-count'),
    confidence: document.querySelector('#confidence-readout'),
    effort: document.querySelector('#effort-readout'),
    cost: document.querySelector('#cost-readout'),
    approvals: document.querySelector('#approvals-readout'),
    workers: document.querySelector('#workers-readout'),
    play: document.querySelector('#play-button'),
    advance: document.querySelector('#advance-button'),
    clear: document.querySelector('#clear-button'),
  };

  let runId = 0;
  let paused = false;
  let finished = false;
  let skipRequested = false;
  let faceTier = 0;
  let faceLoading = false;
  let faceOverride = null;
  let activeMiniCanvas = null;
  let lastFaceName = '';

  function loadImage(sprite) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => { images.set(sprite.name, image); resolve(); };
      image.onerror = () => reject(new Error(`Could not load ${sprite.file}`));
      image.src = ASSET_ROOT + sprite.file;
    });
  }

  function drawFace(canvas, name) {
    const context = canvas.getContext('2d', { alpha: true });
    context.imageSmoothingEnabled = false;
    context.clearRect(0, 0, WIDTH, HEIGHT);
    context.drawImage(images.get('STFB0'), 0, 0);
    const meta = spriteMeta.get(name);
    context.drawImage(images.get(name), -meta.leftOffset, -meta.topOffset);
  }

  function currentFace(now) {
    if (faceOverride) return faceOverride;
    if (!faceLoading) return `STFST${faceTier}0`;
    const eyeSequence = [2, 0, 1, 0, 2, 1];
    const frameDuration = (17 / 35) * 1000;
    const eye = eyeSequence[Math.floor(now / frameDuration) % eyeSequence.length];
    return `STFST${faceTier}${eye}`;
  }

  function faceLoop(now) {
    if (!paused) {
      const name = currentFace(now);
      if (name !== lastFaceName) {
        drawFace(conditions.face, name);
        if (activeMiniCanvas) drawFace(activeMiniCanvas, name);
        lastFaceName = name;
      }
    }
    requestAnimationFrame(faceLoop);
  }

  function wait(ms, id = runId, skippable = true) {
    return new Promise((resolve) => {
      let previous = performance.now();
      let elapsed = 0;
      function step(now) {
        if (id !== runId || (skippable && skipRequested)) {
          if (skippable) skipRequested = false;
          resolve(false);
          return;
        }
        if (!paused) elapsed += now - previous;
        previous = now;
        if (elapsed >= ms) resolve(true);
        else requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }

  function scrollToLatest() {
    requestAnimationFrame(() => {
      conditions.messages.scrollTop = conditions.messages.scrollHeight;
    });
  }

  function addSystemLine(text) {
    const line = document.createElement('div');
    line.className = 'system-line';
    line.textContent = text;
    conditions.messages.appendChild(line);
    scrollToLatest();
  }

  function pad2(value) {
    if (typeof value === 'string') return value;
    return String(value).padStart(2, '0');
  }

  function formatCost(value) {
    const n = Number(value);
    if (n >= 1000) {
      return `$${Math.round(n).toLocaleString('en-US')}`;
    }
    if (n >= 100) {
      return `$${Math.round(n)}`;
    }
    return `$${n.toFixed(2)}`;
  }

  function addMessage(role, text) {
    const message = document.createElement('article');
    message.className = `message ${role}`;
    message.innerHTML = `
      <div class="avatar">${role === 'user' ? 'U' : 'A'}</div>
      <div class="bubble">
        <div class="message-meta">${role === 'user' ? 'User' : 'Agent'}</div>
        <div class="message-text"></div>
      </div>`;
    message.querySelector('.message-text').textContent = text;
    conditions.messages.appendChild(message);
    scrollToLatest();
    return message;
  }

  function addThinking(stage, id) {
    const message = document.createElement('article');
    message.className = 'message assistant';
    message.innerHTML = `
      <div class="avatar">A</div>
      <div class="bubble thinking-bubble">
        <div class="mini-face-shell"><canvas width="35" height="31" aria-hidden="true"></canvas></div>
        <div class="thinking-copy"><strong>Agent is working<span class="thinking-dots"></span></strong><span></span></div>
      </div>`;
    conditions.messages.appendChild(message);
    activeMiniCanvas = message.querySelector('canvas');
    lastFaceName = '';
    scrollToLatest();

    const status = message.querySelector('.thinking-copy > span');
    (async function cycle() {
      let index = 0;
      while (id === runId && message.isConnected && message.dataset.done !== 'true') {
        status.textContent = stage.thinking[index % stage.thinking.length];
        index += 1;
        await wait(430, id, false);
      }
    })();
    return message;
  }

  async function completeThinking(message, response, id) {
    message.dataset.done = 'true';
    activeMiniCanvas = null;
    const bubble = message.querySelector('.bubble');
    bubble.className = 'bubble';
    bubble.innerHTML = '<div class="message-meta">Agent</div><div class="message-text"></div>';
    const target = bubble.querySelector('.message-text');
    const words = response.split(' ');
    for (let index = 0; index < words.length; index += 1) {
      if (id !== runId) return;
      if (skipRequested) {
        target.textContent = response;
        skipRequested = false;
        break;
      }
      target.textContent += `${index ? ' ' : ''}${words[index]}`;
      scrollToLatest();
      await wait(28, id, false);
    }
  }

  function formatWindowTokens(tokens) {
    if (tokens <= 0) return '0';
    if (tokens >= 1_000_000) {
      const millions = tokens / 1_000_000;
      return millions >= 10 ? `${Math.round(millions)}M` : `${millions.toFixed(1)}M`;
    }
    if (tokens >= 1000) {
      const thousands = tokens / 1000;
      return thousands >= 100 ? `${Math.round(thousands)}K` : `${thousands.toFixed(0)}K`;
    }
    return String(Math.round(tokens));
  }

  function applyMetrics(metrics) {
    const m = metrics;
    conditions.confidence.textContent = `${m.confidence}%`;
    conditions.effort.textContent = 'ULTRACODE';
    conditions.cost.textContent = formatCost(m.cost);
    conditions.approvals.textContent = m.approvals;
    conditions.workers.textContent = m.workers >= 100 ? String(m.workers) : pad2(m.workers);

    conditions.confidence.classList.toggle('warn', m.confidence >= 140);
    conditions.cost.classList.toggle('warn', m.cost >= 1000);
    conditions.approvals.classList.toggle('warn', m.approvals === 'OFF');
    conditions.workers.classList.toggle('warn', m.workers >= 100);
  }

  function setTelemetry(stage, turn) {
    const remaining = 100 - stage.context;
    const remainingTokens = (WINDOW_TOKENS * remaining) / 100;
    faceTier = stage.tier;
    lastFaceName = '';
    conditions.label.textContent = stage.condition;
    conditions.note.textContent = stage.note;
    conditions.code.textContent = stage.code;
    conditions.token.textContent = `${formatWindowTokens(remainingTokens)} / 1M`;
    conditions.contextBig.textContent = `${remaining}%`;
    conditions.turns.textContent = String(turn).padStart(2, '0');
    applyMetrics(stage.metrics);
    conditions.fill.style.setProperty('--health', remaining / 100);
    conditions.meter.setAttribute('aria-valuenow', remaining);
    const warning = remaining <= 50 && remaining > 20;
    const critical = remaining <= 20;
    conditions.fill.classList.toggle('warning', warning && !critical);
    conditions.fill.classList.toggle('critical', critical);
    conditions.monitor.classList.toggle('warning', warning && !critical);
    conditions.monitor.classList.toggle('critical', critical);
  }

  async function impact(stage, id) {
    faceOverride = `STFOUCH${stage.tier}`;
    lastFaceName = '';
    await wait(320, id);
    faceOverride = null;
    lastFaceName = '';
  }

  async function runSimulation(id) {
    for (let index = 0; index < stages.length; index += 1) {
      if (id !== runId) return;
      const stage = stages[index];
      const users = Array.isArray(stage.user) ? stage.user : [stage.user];

      for (let u = 0; u < users.length; u += 1) {
        if (id !== runId) return;
        addMessage('user', users[u]);
        if (u === 0) {
          setTelemetry(stage, index + 1);
          await impact(stage, id);
        } else {
          faceOverride = `STFOUCH${stage.tier}`;
          lastFaceName = '';
          await wait(180, id);
          faceOverride = null;
          lastFaceName = '';
        }
        await wait(u === users.length - 1 ? 280 : 420, id);
      }

      faceLoading = true;
      lastFaceName = '';
      const thinking = addThinking(stage, id);
      await wait(stage.terminal ? 1200 : 1550, id);
      faceLoading = false;
      lastFaceName = '';
      await completeThinking(thinking, stage.response, id);

      if (stage.terminal) {
        await wait(500, id);
        faceOverride = 'STFDEAD0';
        lastFaceName = '';
        conditions.label.textContent = 'Context exhausted';
        conditions.note.textContent = 'All that chaos. One word left: Continue.';
        conditions.code.textContent = 'GG';
        conditions.contextBig.textContent = '0%';
        conditions.token.textContent = '0 / 1M';
        conditions.fill.style.setProperty('--health', 0);
        conditions.meter.setAttribute('aria-valuenow', '0');
        conditions.fill.classList.add('critical');
        conditions.monitor.classList.add('critical');
        finished = true;
        conditions.advance.disabled = false;
        conditions.advance.innerHTML = 'Replay disaster <span>↻</span>';
        addSystemLine('SESSION COMPACTED');
        return;
      }
      await wait(780, id);
    }
  }

  function resetTelemetry() {
    faceTier = 0;
    faceLoading = false;
    faceOverride = null;
    activeMiniCanvas = null;
    lastFaceName = '';
    finished = false;
    skipRequested = false;
    paused = false;
    conditions.messages.replaceChildren();
    conditions.label.textContent = 'Fresh session';
    conditions.note.textContent = 'Ready to overthink.';
    conditions.code.textContent = 'NOMINAL';
    conditions.token.textContent = '1.0M / 1M';
    conditions.contextBig.textContent = '100%';
    conditions.turns.textContent = '00';
    applyMetrics({ confidence: 98, cost: 0, approvals: 'ON', workers: 1 });
    conditions.fill.style.setProperty('--health', 1);
    conditions.fill.className = 'meter-fill';
    conditions.monitor.className = 'face-monitor';
    conditions.meter.setAttribute('aria-valuenow', '100');
    conditions.play.querySelector('.button-icon').textContent = 'Ⅱ';
    conditions.play.querySelector('.button-copy').textContent = 'Pause';
    conditions.advance.disabled = false;
    conditions.advance.innerHTML = 'Escalate scope <span>+128K</span>';
  }

  function restart() {
    runId += 1;
    resetTelemetry();
    runSimulation(runId);
  }

  conditions.play.addEventListener('click', () => {
    if (finished) return restart();
    paused = !paused;
    conditions.play.querySelector('.button-icon').textContent = paused ? '▶' : 'Ⅱ';
    conditions.play.querySelector('.button-copy').textContent = paused ? 'Resume' : 'Pause';
  });

  conditions.advance.addEventListener('click', () => {
    if (finished) restart();
    else skipRequested = true;
  });
  conditions.clear.addEventListener('click', restart);

  async function initialize() {
    if (!manifest) throw new Error('Doom face manifest did not load');
    await Promise.all(manifest.sprites.map(loadImage));
    drawFace(conditions.face, 'STFST00');
    requestAnimationFrame(faceLoop);
    restart();
  }

  initialize().catch((error) => {
    console.error(error);
    conditions.messages.textContent = `Simulation failed to load: ${error.message}`;
  });
})();
