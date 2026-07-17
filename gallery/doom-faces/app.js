(function () {
  'use strict';

  const manifest = window.DOOM_FACE_ASSETS;
  const data = window.DOOM_FACE_DATA;
  const ASSET_ROOT = '../data/doom-faces/assets/';
  const WIDTH = 35;
  const HEIGHT = 31;
  const spriteMeta = new Map(manifest.sprites.map((sprite) => [sprite.name, sprite]));
  const images = new Map();
  const players = [];
  let speed = 1;
  let showBackground = true;
  let globallyPlaying = true;
  let toastTimer;

  const animationGrid = document.querySelector('#animation-grid');
  const spriteGrid = document.querySelector('#sprite-grid');
  const heroCanvas = document.querySelector('#hero-face');
  const heroName = document.querySelector('#hero-name');
  const heroTime = document.querySelector('#hero-time');
  const toast = document.querySelector('#toast');

  function ticsToMs(tics) {
    return (tics / data.TIC_RATE) * 1000;
  }

  function announce(message) {
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add('show');
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
  }

  function loadImage(sprite) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => { images.set(sprite.name, img); resolve(); };
      img.onerror = () => reject(new Error(`Could not load ${sprite.file}`));
      img.src = ASSET_ROOT + sprite.file;
    });
  }

  function drawFace(canvas, name, withBackground = showBackground) {
    const context = canvas.getContext('2d', { alpha: true, willReadFrequently: true });
    context.imageSmoothingEnabled = false;
    context.clearRect(0, 0, WIDTH, HEIGHT);
    if (withBackground) context.drawImage(images.get('STFB0'), 0, 0);
    const meta = spriteMeta.get(name);
    const image = images.get(name);
    if (!meta || !image) return;
    context.drawImage(image, -meta.leftOffset, -meta.topOffset);
  }

  function frameAt(animation, elapsedMs) {
    const totalTics = animation.frames.reduce((sum, frame) => sum + frame.tics, 0);
    const tick = ((elapsedMs * data.TIC_RATE * speed) / 1000) % totalTics;
    let cursor = 0;
    for (let index = 0; index < animation.frames.length; index += 1) {
      cursor += animation.frames[index].tics;
      if (tick < cursor) return { frame: animation.frames[index], index };
    }
    return { frame: animation.frames[0], index: 0 };
  }

  function renderCard(animation, index) {
    const article = document.createElement('article');
    article.className = 'card';
    article.innerHTML = `
      <div class="card-top">
        <div>
          <p class="card-kicker">${animation.kicker}</p>
          <h3>${animation.title}</h3>
        </div>
        <span class="card-index">${String(index + 1).padStart(2, '0')}</span>
      </div>
      <div class="card-body">
        <div class="card-stage"><canvas class="face" width="35" height="31" aria-label="${animation.title} preview"></canvas></div>
        <div class="card-copy">
          <p class="card-detail">${animation.detail}</p>
          <div class="source-rule">${animation.sourceRule}</div>
          <div class="frame-readout">${animation.frames[0].name}</div>
        </div>
      </div>
      <div class="card-actions">
        <button type="button" class="toggle">Pause</button>
        <button type="button" class="export">Export GIF</button>
      </div>`;

    const player = {
      animation,
      canvas: article.querySelector('canvas'),
      readout: article.querySelector('.frame-readout'),
      button: article.querySelector('.toggle'),
      playing: true,
      start: performance.now(),
      pausedElapsed: 0,
      lastFrame: -1,
    };
    players.push(player);

    player.button.addEventListener('click', () => {
      if (player.playing) {
        player.pausedElapsed += performance.now() - player.start;
        player.playing = false;
        player.button.textContent = 'Play';
      } else {
        player.start = performance.now();
        player.playing = true;
        player.button.textContent = 'Pause';
      }
    });

    article.querySelector('.export').addEventListener('click', async (event) => {
      const button = event.currentTarget;
      button.disabled = true;
      button.textContent = 'Encoding…';
      try {
        await exportGif(animation, showBackground);
        announce(`${animation.title} exported at original 35 Hz timing`);
      } catch (error) {
        console.error(error);
        announce(`Export failed: ${error.message}`);
      } finally {
        button.disabled = false;
        button.textContent = 'Export GIF';
      }
    });

    animationGrid.appendChild(article);
  }

  function renderSpriteInventory() {
    const ordered = manifest.sprites.slice().sort((a, b) => {
      const aPlate = a.name.startsWith('STFB');
      const bPlate = b.name.startsWith('STFB');
      return aPlate - bPlate || a.name.localeCompare(b.name);
    });
    for (const sprite of ordered) {
      const figure = document.createElement('figure');
      figure.className = 'sprite-cell';
      figure.innerHTML = `<img src="${ASSET_ROOT + sprite.file}" alt="${sprite.name}" width="${sprite.width}" height="${sprite.height}" loading="lazy"><figcaption>${sprite.name}</figcaption>`;
      spriteGrid.appendChild(figure);
    }
  }

  function updatePlayer(player, now, force = false) {
    const elapsed = player.playing && globallyPlaying
      ? player.pausedElapsed + now - player.start
      : player.pausedElapsed;
    const current = frameAt(player.animation, elapsed);
    if (current.index === player.lastFrame && !force) return;
    player.lastFrame = current.index;
    drawFace(player.canvas, current.frame.name);
    player.readout.textContent = `${current.frame.name} · ${current.frame.tics} tics · ${Math.round(ticsToMs(current.frame.tics))} ms`;
  }

  function loop(now) {
    for (const player of players) updatePlayer(player, now);
    const hero = frameAt(data.animations[0], now);
    drawFace(heroCanvas, hero.frame.name);
    heroName.textContent = hero.frame.name;
    heroTime.innerHTML = `${hero.frame.tics} tics<br>${Math.round(ticsToMs(hero.frame.tics))} ms`;
    requestAnimationFrame(loop);
  }

  function setSegment(container, selected) {
    for (const button of container.querySelectorAll('button')) {
      button.classList.toggle('active', button === selected);
    }
  }

  document.querySelector('#speed-control').addEventListener('click', (event) => {
    const button = event.target.closest('[data-speed]');
    if (!button) return;
    speed = Number(button.dataset.speed);
    setSegment(event.currentTarget, button);
  });

  document.querySelector('#background-control').addEventListener('click', (event) => {
    const button = event.target.closest('[data-background]');
    if (!button) return;
    showBackground = button.dataset.background === 'true';
    setSegment(event.currentTarget, button);
    const now = performance.now();
    for (const player of players) updatePlayer(player, now, true);
    const hero = frameAt(data.animations[0], now);
    drawFace(heroCanvas, hero.frame.name);
  });

  document.querySelector('#play-all').addEventListener('click', (event) => {
    const now = performance.now();
    if (globallyPlaying) {
      for (const player of players) {
        if (player.playing) player.pausedElapsed += now - player.start;
      }
      globallyPlaying = false;
      event.currentTarget.textContent = 'Play all';
    } else {
      for (const player of players) player.start = now;
      globallyPlaying = true;
      event.currentTarget.textContent = 'Pause all';
    }
  });

  function word(value) {
    return [value & 255, (value >>> 8) & 255];
  }

  function blocks(bytes) {
    const output = [];
    for (let offset = 0; offset < bytes.length; offset += 255) {
      const length = Math.min(255, bytes.length - offset);
      output.push(length, ...bytes.slice(offset, offset + length));
    }
    output.push(0);
    return output;
  }

  // A deliberately simple, standards-valid GIF LZW stream. Clearing between
  // pixels keeps the code width fixed at 9 bits; face exports remain tiny.
  function lzwPixels(indices) {
    const clear = 256;
    const end = 257;
    const codes = [];
    for (const index of indices) codes.push(clear, index);
    codes.push(end);
    const output = [];
    let bucket = 0;
    let bitCount = 0;
    for (const code of codes) {
      bucket |= code << bitCount;
      bitCount += 9;
      while (bitCount >= 8) {
        output.push(bucket & 255);
        bucket >>>= 8;
        bitCount -= 8;
      }
    }
    if (bitCount) output.push(bucket & 255);
    return output;
  }

  function pixelsToIndices(context, palette, transparentIndex) {
    const rgba = context.getImageData(0, 0, WIDTH, HEIGHT).data;
    const lookup = new Map();
    for (let index = 0; index < 256; index += 1) {
      if (index === transparentIndex) continue;
      const offset = index * 3;
      lookup.set(`${palette[offset]},${palette[offset + 1]},${palette[offset + 2]}`, index);
    }
    const indices = new Uint8Array(WIDTH * HEIGHT);
    for (let pixel = 0; pixel < indices.length; pixel += 1) {
      const offset = pixel * 4;
      if (rgba[offset + 3] < 128) {
        indices[pixel] = transparentIndex;
        continue;
      }
      const key = `${rgba[offset]},${rgba[offset + 1]},${rgba[offset + 2]}`;
      const index = lookup.get(key);
      if (index === undefined) throw new Error(`Rendered color ${key} is outside PLAYPAL`);
      indices[pixel] = index;
    }
    return indices;
  }

  function makeGif(animation, withBackground) {
    const bytes = [];
    const ascii = (value) => Array.from(value, (char) => char.charCodeAt(0));
    bytes.push(...ascii('GIF89a'), ...word(WIDTH), ...word(HEIGHT));
    bytes.push(0xf7, 0, 0); // global 256-color table, color resolution 8 bits
    bytes.push(...manifest.palette.slice(0, 768));
    bytes.push(0x21, 0xff, 0x0b, ...ascii('NETSCAPE2.0'), 0x03, 0x01, 0x00, 0x00, 0x00);

    const canvas = document.createElement('canvas');
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    context.imageSmoothingEnabled = false;

    for (const frame of animation.frames) {
      drawFace(canvas, frame.name, withBackground);
      const indices = pixelsToIndices(context, manifest.palette, manifest.transparentIndex);
      const delay = Math.max(1, Math.round((frame.tics * 100) / data.TIC_RATE));
      const packed = withBackground ? 0x04 : 0x05;
      bytes.push(0x21, 0xf9, 0x04, packed, ...word(delay), manifest.transparentIndex, 0x00);
      bytes.push(0x2c, ...word(0), ...word(0), ...word(WIDTH), ...word(HEIGHT), 0x00);
      bytes.push(0x08, ...blocks(lzwPixels(indices)));
    }
    bytes.push(0x3b);
    return new Blob([new Uint8Array(bytes)], { type: 'image/gif' });
  }

  async function exportGif(animation, withBackground) {
    // Yield once so the disabled/encoding button paints before synchronous encoding.
    await new Promise((resolve) => requestAnimationFrame(resolve));
    const blob = makeGif(animation, withBackground);
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `doom-face-${animation.id}${withBackground ? '-plate' : '-transparent'}.gif`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  }

  async function initialize() {
    if (!manifest || !data) throw new Error('Doom face data did not load');
    await Promise.all(manifest.sprites.map(loadImage));
    data.animations.forEach(renderCard);
    renderSpriteInventory();
    requestAnimationFrame(loop);
  }

  initialize().catch((error) => {
    console.error(error);
    animationGrid.innerHTML = `<p>Viewer failed to initialize: ${error.message}</p>`;
  });
})();
