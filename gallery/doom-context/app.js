(function () {
  'use strict';

  const manifest = window.DOOM_FACE_ASSETS;
  const ASSET_ROOT = '../data/doom-faces/assets/';
  const WIDTH = 35;
  const HEIGHT = 31;
  const spriteMeta = new Map(manifest.sprites.map((sprite) => [sprite.name, sprite]));
  const images = new Map();

  const stages = [
    {
      context: 7,
      tokens: '8.9K',
      tier: 0,
      condition: 'Fresh session',
      code: 'NOMINAL',
      note: 'Plenty of room. Suspiciously optimistic.',
      vibes: 'Stable',
      user: 'Can you review this button copy? It should be quick.',
      thinking: ['Reading the brief', 'Considering two verbs', 'Still emotionally available'],
      response: 'Sure — “Continue” is clearer than “Proceed” here. Small, direct, done.',
    },
    {
      context: 22,
      tokens: '28.1K',
      tier: 1,
      condition: 'Lightly burdened',
      code: 'WARM',
      note: 'The “quick” task has acquired documentation.',
      vibes: 'Focused',
      user: 'Great. Here are our voice guidelines, research notes, and 38 previous button decisions.',
      thinking: ['Indexing inherited context', 'Re-reading decision 14', 'Finding the actual button'],
      response: 'Understood. The earlier recommendation still fits the voice system and avoids conflict with decision 14.',
    },
    {
      context: 39,
      tokens: '49.9K',
      tier: 1,
      condition: 'Context aware',
      code: 'LOADED',
      note: 'Now carrying several generations of decisions.',
      vibes: 'Present',
      user: 'Also compare it against the old implementation. I pasted the whole component tree below.',
      thinking: ['Walking the component tree', 'Holding prior constraints', 'Ignoring unrelated modals'],
      response: 'The old component used “Next,” but “Continue” is safer because this action does not advance a fixed sequence.',
    },
    {
      context: 58,
      tokens: '74.2K',
      tier: 2,
      condition: 'Noticeably compressed',
      code: 'STRAINED',
      note: 'Every new token is sitting on an older token.',
      vibes: 'Tense',
      user: 'One nuance: it also needs to work for mobile, RTL, offline mode, and the kiosk from our other thread.',
      thinking: ['Locating the other thread', 'Simulating four environments', 'Protecting the first answer'],
      response: 'The label remains sound. For the kiosk, pair it with a persistent forward icon; RTL should mirror the icon, not the text.',
    },
    {
      context: 76,
      tokens: '97.3K',
      tier: 3,
      condition: 'Under pressure',
      code: 'COMPRESSED',
      note: 'Summaries of summaries are entering the chat.',
      vibes: 'Brave',
      user: 'Please preserve every decision so far. Now explore 12 alternatives without changing the recommendation.',
      thinking: ['Preserving everything', 'Generating controlled dissent', 'Compressing inner monologue'],
      response: 'I tested 12 alternatives. “Continue” still wins on clarity, width, localization, and consistency. The recommendation is unchanged.',
    },
    {
      context: 91,
      tokens: '116.5K',
      tier: 4,
      condition: 'Critically contextual',
      code: 'CRITICAL',
      note: 'The window can now hear boss music.',
      vibes: 'Metal',
      user: 'Tiny follow-up: can you audit the entire conversation for contradictions and cite every earlier constraint?',
      thinking: ['Reconstructing the timeline', 'Checking all constraints', 'Seeing through time'],
      response: 'Audit complete. No material contradiction: the constraints consistently favor a short, directional, localization-safe label.',
    },
    {
      context: 99,
      tokens: '126.7K',
      tier: 4,
      condition: 'One token from glory',
      code: 'LIMIT',
      note: 'There is room for either an answer or punctuation.',
      vibes: 'Ascended',
      user: 'Perfect. Before we finish, paste the entire original prompt back verbatim and explain your reasoning in exhaustive detail.',
      thinking: ['Searching the ancient context', 'Negotiating with the token limit', 'Remembering the button'],
      response: 'The button should say “Continue.” Everything else has been compressed into this sentence.',
      terminal: true,
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
    pressure: document.querySelector('#pressure-readout'),
    recall: document.querySelector('#recall-readout'),
    vibes: document.querySelector('#vibes-readout'),
    patience: document.querySelector('#patience-readout'),
    tabs: document.querySelector('#tabs-readout'),
    copium: document.querySelector('#copium-readout'),
    todo: document.querySelector('#todo-readout'),
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

  function setTelemetry(stage, turn) {
    const remaining = 100 - stage.context;
    const remainingTokens = (128 * remaining) / 100;
    const formattedTokens = remainingTokens >= 100
      ? `${Math.round(remainingTokens)}K`
      : `${remainingTokens.toFixed(1)}K`;
    faceTier = stage.tier;
    lastFaceName = '';
    conditions.label.textContent = stage.condition;
    conditions.note.textContent = stage.note;
    conditions.code.textContent = stage.code;
    conditions.token.textContent = `${formattedTokens} / 128K`;
    conditions.contextBig.textContent = `${remaining}%`;
    conditions.contextBig.classList.toggle('three-digit', remaining === 100);
    conditions.turns.textContent = String(turn).padStart(2, '0');
    conditions.pressure.textContent = `${stage.context}%`;
    conditions.recall.textContent = `${Math.max(54, Math.round(100 - stage.context * .46))}%`;
    conditions.vibes.textContent = stage.vibes;
    conditions.patience.textContent = String(Math.max(1, 100 - stage.context)).padStart(2, '0');
    conditions.tabs.textContent = String(3 + turn * 7).padStart(2, '0');
    conditions.copium.textContent = String(Math.max(0, 99 - turn * 14)).padStart(2, '0');
    conditions.todo.textContent = stage.context >= 76 ? '∞' : String(1 + turn * 4).padStart(2, '0');
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
    addSystemLine('Context window initialized · 128K tokens available');
    await wait(700, id);

    for (let index = 0; index < stages.length; index += 1) {
      if (id !== runId) return;
      const stage = stages[index];
      addMessage('user', stage.user);
      setTelemetry(stage, index + 1);
      await impact(stage, id);
      await wait(340, id);

      faceLoading = true;
      lastFaceName = '';
      const thinking = addThinking(stage, id);
      await wait(1550, id);
      faceLoading = false;
      lastFaceName = '';
      await completeThinking(thinking, stage.response, id);

      if (stage.terminal) {
        await wait(500, id);
        faceOverride = 'STFDEAD0';
        lastFaceName = '';
        conditions.label.textContent = 'Context exhausted';
        conditions.note.textContent = 'The recommendation survived. Barely.';
        conditions.code.textContent = 'GG';
        finished = true;
        conditions.advance.disabled = false;
        conditions.advance.innerHTML = 'Replay session <span>↻</span>';
        addSystemLine('Session compacted · one recommendation recovered');
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
    conditions.token.textContent = '128K / 128K';
    conditions.contextBig.textContent = '100%';
    conditions.contextBig.classList.add('three-digit');
    conditions.turns.textContent = '00';
    conditions.pressure.textContent = '0%';
    conditions.recall.textContent = '100%';
    conditions.vibes.textContent = 'Stable';
    conditions.patience.textContent = '100';
    conditions.tabs.textContent = '03';
    conditions.copium.textContent = '99';
    conditions.todo.textContent = '01';
    conditions.fill.style.setProperty('--health', 1);
    conditions.fill.className = 'meter-fill';
    conditions.monitor.className = 'face-monitor';
    conditions.meter.setAttribute('aria-valuenow', '100');
    conditions.play.querySelector('.button-icon').textContent = 'Ⅱ';
    conditions.play.querySelector('.button-copy').textContent = 'Pause';
    conditions.advance.disabled = false;
    conditions.advance.innerHTML = 'Add context <span>+16K</span>';
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
