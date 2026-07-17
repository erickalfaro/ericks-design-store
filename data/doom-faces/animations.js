(function () {
  'use strict';

  const TIC_RATE = 35;
  const LOOK_TICS = Math.floor(TIC_RATE / 2); // ST_STRAIGHTFACECOUNT
  const TURN_TICS = TIC_RATE; // ST_TURNCOUNT
  const GRIN_TICS = TIC_RATE * 2; // ST_EVILGRINCOUNT
  const RAMPAGE_DELAY = TIC_RATE * 2; // ST_RAMPAGEDELAY

  // M_Random values on the ticks at which a fresh idle face is selected,
  // starting from a cleared random index. Gameplay uses a separate P_Random table.
  // rndtable indices 1, 18, 35, 52, 69, 86, 103, and 120.
  const IDLE_RANDOM = [8, 80, 249, 91, 242, 70, 77, 70];

  function painLevel(health) {
    const clamped = Math.max(0, Math.min(100, Number(health)));
    return Math.floor(((100 - clamped) * 5) / 101);
  }

  function frame(name, tics, caption) {
    return { name, tics, caption: caption || name };
  }

  function idleFrames(level, count = IDLE_RANDOM.length) {
    return IDLE_RANDOM.slice(0, count).map((value) =>
      frame(`STFST${level}${value % 3}`, LOOK_TICS, `M_Random ${value} → ${value % 3}`),
    );
  }

  function reaction(level, name) {
    return [
      frame(`STFST${level}0`, LOOK_TICS, 'idle'),
      frame(name, TURN_TICS, 'reaction'),
      frame(`STFST${level}1`, LOOK_TICS, 'return to idle'),
    ];
  }

  const tiers = [
    { level: 0, health: 100, range: '80–100%+', label: 'Unhurt' },
    { level: 1, health: 70, range: '60–79%', label: 'Bloodied' },
    { level: 2, health: 50, range: '40–59%', label: 'Wounded' },
    { level: 3, health: 30, range: '20–39%', label: 'Critical' },
    { level: 4, health: 10, range: '1–19%', label: 'Near death' },
  ];

  const animations = [
    {
      id: 'idle-rng',
      title: 'Vanilla idle',
      kicker: 'Original RNG sequence',
      detail: 'A new eye direction is chosen every 17 tics.',
      sourceRule: 'M_Random() % 3 · 17 tics each',
      frames: idleFrames(0),
    },
    {
      id: 'eye-cycle',
      title: 'Eye movement',
      kicker: 'All three idle frames',
      detail: 'Direct inspection of center, right, and left eye positions.',
      sourceRule: 'STFST00 → 01 → 02',
      frames: [0, 1, 2].map((eye) => frame(`STFST0${eye}`, LOOK_TICS)),
    },
    ...tiers.map((tier) => ({
      id: `health-${tier.level}`,
      title: tier.label,
      kicker: `${tier.range} health`,
      detail: `Pain tier ${tier.level}; eye movement remains active.`,
      sourceRule: `ST_calcPainOffset() = ${tier.level * 8}`,
      frames: idleFrames(tier.level, 3),
    })),
    {
      id: 'damage-left',
      title: 'Attack from left',
      kicker: 'Directional damage',
      detail: 'The head turns toward an attacker on the player’s left.',
      sourceRule: 'STFTL* · 35 tics',
      frames: reaction(0, 'STFTL00'),
    },
    {
      id: 'damage-right',
      title: 'Attack from right',
      kicker: 'Directional damage',
      detail: 'The head turns toward an attacker on the player’s right.',
      sourceRule: 'STFTR* · 35 tics',
      frames: reaction(0, 'STFTR00'),
    },
    {
      id: 'damage-front',
      title: 'Head-on damage',
      kicker: 'Gritted teeth',
      detail: 'Front attacks and self-inflicted damage use the rampage face.',
      sourceRule: 'STFKILL* · 35 tics',
      frames: reaction(0, 'STFKILL0'),
    },
    {
      id: 'heavy-vanilla',
      title: 'Heavy damage',
      kicker: 'Vanilla 1.9 behavior',
      detail: 'The original sign bug prevents a normal 20+ HP loss from selecting OUCH.',
      sourceRule: 'Health loss → STFKILL* (ouch bug)',
      frames: reaction(2, 'STFKILL2'),
    },
    {
      id: 'ouch-intended',
      title: 'Ouch face',
      kicker: 'Intended / fixed behavior',
      detail: 'The shipped sprite and intended heavy-hit reaction, restored by many ports.',
      sourceRule: 'STFOUCH* · 35 tics',
      frames: reaction(2, 'STFOUCH2'),
    },
    {
      id: 'evil-grin',
      title: 'Evil grin',
      kicker: 'New weapon pickup',
      detail: 'A newly owned weapon raises the grin above damage and idle states.',
      sourceRule: 'STFEVL* · 70 tics',
      frames: [
        frame('STFST00', LOOK_TICS, 'idle'),
        frame('STFEVL0', GRIN_TICS, 'weapon acquired'),
        frame('STFST01', LOOK_TICS, 'idle'),
      ],
    },
    {
      id: 'firing',
      title: 'Sustained firing',
      kicker: 'Rampage delay',
      detail: 'After two seconds holding attack, the gritted-teeth face persists.',
      sourceRule: '70-tic delay → STFKILL*',
      frames: [
        frame('STFST00', RAMPAGE_DELAY, 'attack held'),
        frame('STFKILL0', TURN_TICS, 'rampage'),
        frame('STFST01', LOOK_TICS, 'released'),
      ],
    },
    {
      id: 'god',
      title: 'God mode',
      kicker: 'Invulnerability',
      detail: 'Golden eyes while IDDQD or the invulnerability power is active.',
      sourceRule: 'STFGOD0 · held',
      frames: [frame('STFGOD0', TURN_TICS)],
    },
    {
      id: 'death',
      title: 'Death',
      kicker: 'Zero health',
      detail: 'The dead face has the highest state priority.',
      sourceRule: 'STFDEAD0 · held',
      frames: [frame('STFDEAD0', TURN_TICS)],
    },
  ];

  window.DOOM_FACE_DATA = {
    TIC_RATE,
    LOOK_TICS,
    TURN_TICS,
    GRIN_TICS,
    RAMPAGE_DELAY,
    tiers,
    animations,
    painLevel,
    idleFrames,
  };
})();
