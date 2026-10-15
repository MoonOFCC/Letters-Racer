'use strict';
/* =============================================
   WORD RACE CHAMPIONSHIP — Game Engine
   ============================================= */

// ───────────── CONFIGURATION ─────────────
const CFG = {
  FINISH:        [800, 1000, 1200, 1500],
  WORDS_N:       [12, 15, 18, 20],
  BASE_MOVE:     55,
  STUMBLE_DIST:  28,
  STUMBLE_MS:    500,
  ROUNDS:        4,
  ROUND_NAMES:   ['Seeding Run','Elimination Run 1','Elimination Run 2','⚡ THE FINAL ⚡'],
  DIFF_KEYS:     ['easy','easy','medium','hard','expert'],
  BOT_SPEED:     [900, 780, 650, 520],
  BOT_ERR:       [0.12, 0.09, 0.06, 0.04],
  INTERMISSION:  8,
  COUNTDOWN_SECS:3,
  CAM_AHEAD:     0.18,
  VISIBLE_UNITS: 700,
};

// ───────────── WORD BANK ─────────────
const WORDS = {
  easy: [
    'car','gas','lap','win','go','fast','race','run','red','hot','rev','top',
    'max','gap','bay','hub','rim','ace','van','bus','map','key','oil','led',
    'kit','jet','fox','cup','big','dry','end','fun','get','hit','joy','low',
    'mix','net','old','put','raw','set','try','use','way','zip','fly','sky',
    'sun','day','one','two','six','ten','box','dot','fog','hum','jam','log',
    'mud','nap','pod','rag','sip','tug','vet','wax','yak','zen','dip','gym'
  ],
  medium: [
    'drift','turbo','boost','power','shift','brake','track','wheel',
    'flame','nitro','speed','draft','gauge','motor','steer','clutch',
    'piston','chrome','drive','spark','rally','sprint','crash','quick',
    'vroom','stunt','glide','orbit','surge','blast','swift','blaze',
    'roar','rush','torque','flick','drift','curve','overtake','throttle',
    'cruise','engine','exhaust','garage','pursuit','scenic','throttle',
    'rubber','shield','bumper','impact','launch','escape','canyon'
  ],
  hard: [
    'pitstop','engines','victory','podium','circuit','steering',
    'monaco','chicane','hairpin','apex','chassis','exhaust',
    'revving','momentum','horsepower','slipstream','breakneck',
    'screeching','checkered','mechanic','qualifier','flagship',
    'aerofoil','gridlock','downforce','throttle','overtaking',
    'turbocharge','accelerate','supersonic','afterburner','tailwind',
    'roadster','dragstrip','prototype','spectacle','domination'
  ],
  expert: [
    'championship','acceleration','qualifying','competitor','elimination',
    'grandstand','disqualified','aerodynamic','turbocharged','breakthrough',
    'spectacular','straightaway','thunderbolt','performance','professional',
    'leaderboard','unstoppable','devastating','incredible','magnificent',
    'unbelievable','extraordinary','phenomenal','thunderous','electrifying',
    'breathtaking','invincible','revolutionary','overwhelming','domination',
    'precipitation','establishing','accelerating','technological','sophisticated'
  ]
};

// ───────────── AUDIO ENGINE ─────────────
const Audio = {
  ctx: null,
  on: true,
  init() {
    try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); }
    catch(e) { this.on = false; }
  },
  resume() { if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume(); },
  toggle() { this.on = !this.on; return this.on; },
  _osc(freq, dur, type='sine', vol=0.12) {
    if (!this.on || !this.ctx) return;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(vol, this.ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + dur);
    o.connect(g); g.connect(this.ctx.destination);
    o.start(); o.stop(this.ctx.currentTime + dur);
  },
  keypress() { this._osc(700, 0.03, 'sine', 0.05); },
  correct() {
    this._osc(880, 0.08, 'sine', 0.1);
    setTimeout(() => this._osc(1100, 0.1, 'sine', 0.1), 60);
  },
  wrong() {
    this._osc(180, 0.18, 'sawtooth', 0.08);
    this._osc(140, 0.22, 'square', 0.04);
  },
  boost() {
    if (!this.on || !this.ctx) return;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(300, this.ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.3);
    g.gain.setValueAtTime(0.08, this.ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);
    o.connect(g); g.connect(this.ctx.destination);
    o.start(); o.stop(this.ctx.currentTime + 0.35);
  },
  megaboost() {
    if (!this.on || !this.ctx) return;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(200, this.ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(2000, this.ctx.currentTime + 0.5);
    g.gain.setValueAtTime(0.1, this.ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);
    o.connect(g); g.connect(this.ctx.destination);
    o.start(); o.stop(this.ctx.currentTime + 0.5);
  },
  countdown() { this._osc(500, 0.25, 'square', 0.08); },
  go() {
    this._osc(800, 0.15, 'square', 0.1);
    setTimeout(() => this._osc(1200, 0.3, 'square', 0.1), 100);
  },
  finish() {
    const notes = [523, 659, 784, 1047];
    notes.forEach((n, i) => setTimeout(() => this._osc(n, 0.3, 'sine', 0.08), i * 120));
  },
  eliminate() {
    this._osc(300, 0.3, 'sine', 0.08);
    setTimeout(() => this._osc(200, 0.4, 'sine', 0.06), 200);
  },
  victory() {
    const notes = [523, 659, 784, 659, 784, 1047];
    notes.forEach((n, i) => setTimeout(() => this._osc(n, 0.25, 'sine', 0.1), i * 150));
  }
};

// ───────────── PARTICLE SYSTEM ─────────────
class Particles {
  constructor() { this.list = []; }
  emit(x, y, type, count = 10) {
    for (let i = 0; i < count; i++) {
      const speed = type === 'confetti' ? 5 : type === 'flame' ? 2 : 3;
      this.list.push({
        x, y,
        vx: (Math.random() - 0.5) * speed * 2,
        vy: type === 'flame' ? -Math.random() * 3 - 1 : (Math.random() - 0.5) * speed * 2,
        life: 1,
        decay: 0.015 + Math.random() * 0.025,
        size: type === 'confetti' ? 3 + Math.random() * 4 : 2 + Math.random() * 3,
        color: type === 'flame'
          ? ['#ff4400','#ffaa00','#ffff00'][Math.floor(Math.random()*3)]
          : type === 'confetti'
            ? ['#ff4444','#4488ff','#00ff88','#ffaa00','#cc44ff','#ff69b4'][Math.floor(Math.random()*6)]
            : '#00ff88',
        type
      });
    }
  }
  update() {
    this.list = this.list.filter(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.type === 'flame') { p.vy -= 0.08; p.vx *= 0.98; }
      if (p.type === 'confetti') p.vy += 0.04;
      p.life -= p.decay;
      return p.life > 0;
    });
  }
  draw(ctx) {
    for (const p of this.list) {
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.color;
      if (p.type === 'confetti') {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.life * 5);
        ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size * 0.6);
        ctx.restore();
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.5, p.size * p.life), 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  }
  clear() { this.list = []; }
}

// ───────────── AVATAR SYSTEM ─────────────
class AvatarSystem {
  constructor() {
    this.cfg = {
      name: 'RACER', chassis: 'kart', color: '#ff4444',
      spoiler: 'none', neon: 'off', helmet: 'classic'
    };
  }
  set(k, v) { this.cfg[k] = v; }
  get() { return { ...this.cfg }; }
  renderPreview(canvas) {
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    // BG
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#0e0e22');
    grad.addColorStop(1, '#1a1a3a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    // Grid
    ctx.strokeStyle = '#1e1e3e';
    ctx.lineWidth = 0.5;
    for (let x = 0; x < w; x += 20) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
    for (let y = 0; y < h; y += 20) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
    // Ground line
    ctx.strokeStyle = '#2a2a5a';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(40, h * 0.72); ctx.lineTo(w - 40, h * 0.72); ctx.stroke();
    // Kart
    KartRenderer.draw(ctx, w / 2, h * 0.6, this.cfg, { combo: 0, stumble: false, frame: 0 }, 1.6);
    // Label
    ctx.fillStyle = '#445';
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('— LIVE PREVIEW —', w / 2, h - 12);
  }
}

// ───────────── KART RENDERER ─────────────
const KartRenderer = {
  draw(ctx, x, y, cfg, state, scale = 1) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    if (state.stumble) {
      ctx.translate((Math.random() - 0.5) * 6, (Math.random() - 0.5) * 4);
    }
    const W = 65, H = 28;
    // Underglow
    if (cfg.neon && cfg.neon !== 'off') {
      ctx.shadowColor = cfg.neon;
      ctx.shadowBlur = 18 * scale;
      ctx.fillStyle = cfg.neon + '18';
      ctx.beginPath();
      ctx.ellipse(0, H / 2 + 6, W / 2 + 5, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath();
    ctx.ellipse(0, H / 2 + 4, W / 2, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    // Body
    this._body(ctx, W, H, cfg);
    // Wheels
    this._wheels(ctx, W, H);
    // Spoiler
    this._spoiler(ctx, W, H, cfg);
    // Driver
    this._driver(ctx, W, H, cfg);
    // Flames
    if (state.combo >= 5) {
      this._flames(ctx, W, H, state.combo, state.frame);
    }
    ctx.restore();
  },
  _body(ctx, W, H, cfg) {
    ctx.fillStyle = cfg.color;
    ctx.beginPath();
    if (cfg.chassis === 'formula') {
      ctx.moveTo(W / 2 + 8, 0);
      ctx.lineTo(W / 2, -H / 3);
      ctx.lineTo(-W / 2, -H / 2);
      ctx.lineTo(-W / 2 - 4, -H / 3);
      ctx.lineTo(-W / 2 - 4, H / 3);
      ctx.lineTo(-W / 2, H / 2);
      ctx.lineTo(W / 2, H / 3);
      ctx.closePath();
    } else if (cfg.chassis === 'muscle') {
      const r = 5;
      ctx.roundRect(-W / 2 - 4, -H / 2 - 2, W + 8, H + 4, r);
    } else {
      ctx.roundRect(-W / 2, -H / 2, W, H, 6);
    }
    ctx.fill();
    // Lighter top
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.fillRect(-W / 3, -H / 2 + 2, W * 0.5, H / 3);
    // Windshield
    ctx.fillStyle = 'rgba(120,210,255,0.35)';
    const wsx = W * 0.12;
    ctx.beginPath();
    ctx.roundRect(wsx, -H / 3, W * 0.18, H * 0.66, 3);
    ctx.fill();
    // Racing stripe
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.fillRect(-W * 0.35, -0.8, W * 0.55, 1.6);
  },
  _wheels(ctx, W, H) {
    const R = 5;
    const spots = [[-W / 3, -H / 2 - 3], [-W / 3, H / 2 + 3], [W / 3.5, -H / 2 - 3], [W / 3.5, H / 2 + 3]];
    for (const [wx, wy] of spots) {
      ctx.fillStyle = '#1a1a1a';
      ctx.beginPath(); ctx.arc(wx, wy, R, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#555';
      ctx.beginPath(); ctx.arc(wx, wy, 2, 0, Math.PI * 2); ctx.fill();
    }
  },
  _spoiler(ctx, W, H, cfg) {
    if (cfg.spoiler === 'none') return;
    ctx.fillStyle = cfg.color;
    const sx = -W / 2 - 2;
    if (cfg.spoiler === 'small') {
      ctx.fillRect(sx - 2, -H / 2 - 5, 4, H + 10);
    } else if (cfg.spoiler === 'big') {
      ctx.fillRect(sx - 5, -H / 2 - 9, 6, H + 18);
      ctx.fillRect(sx - 1, -H / 3, 3, 3);
      ctx.fillRect(sx - 1, H / 3 - 3, 3, 3);
    } else if (cfg.spoiler === 'gt') {
      ctx.fillRect(sx - 6, -H / 2 - 11, 8, H + 22);
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      ctx.fillRect(sx - 4, -H / 2 - 9, 4, H + 18);
    }
  },
  _driver(ctx, W, H, cfg) {
    const dx = W * 0.04, dy = -H / 2 - 1;
    const c = cfg.color;
    if (cfg.helmet === 'classic') {
      ctx.fillStyle = c;
      ctx.beginPath(); ctx.arc(dx, dy - 6, 8, Math.PI, 0); ctx.fill();
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(dx - 6, dy - 8, 12, 3);
    } else if (cfg.helmet === 'modern') {
      ctx.fillStyle = c;
      ctx.beginPath(); ctx.ellipse(dx, dy - 6, 9, 7, 0, Math.PI, 0); ctx.fill();
      ctx.fillStyle = 'rgba(100,200,255,0.45)';
      ctx.beginPath(); ctx.ellipse(dx + 2, dy - 6, 7, 4, 0.2, -0.5, 0.6); ctx.fill();
    } else if (cfg.helmet === 'retro') {
      ctx.fillStyle = c;
      ctx.beginPath(); ctx.arc(dx, dy - 6, 7, Math.PI, 0); ctx.fill();
      ctx.fillStyle = '#111';
      ctx.beginPath(); ctx.arc(dx, dy - 6, 7, Math.PI + 0.3, -0.3); ctx.fill();
    } else {
      ctx.fillStyle = c;
      ctx.beginPath(); ctx.arc(dx, dy - 6, 8, Math.PI, 0); ctx.fill();
      ctx.fillStyle = 'rgba(0,0,0,0.65)';
      ctx.fillRect(dx - 7, dy - 8, 14, 4);
      ctx.fillStyle = c;
      ctx.fillRect(dx - 5, dy - 8, 10, 1);
    }
  },
  _flames(ctx, W, H, combo, frame) {
    const len = combo >= 15 ? 35 : combo >= 10 ? 24 : 14;
    const fx = -W / 2 - 2;
    for (let i = 0; i < 3; i++) {
      const flicker = Math.sin((frame || 0) * 0.4 + i * 2.1) * 5;
      ctx.globalAlpha = 0.85 - i * 0.2;
      ctx.fillStyle = ['#ff3300', '#ffaa00', '#ffee00'][i];
      ctx.beginPath();
      ctx.moveTo(fx, -3 + i * 1.5);
      ctx.lineTo(fx - len - flicker, 0);
      ctx.lineTo(fx, 3 - i * 1.5);
      ctx.closePath();
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
};

// ───────────── TRACK RENDERER ─────────────
class TrackRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.stars = Array.from({ length: 50 }, () => ({
      x: Math.random(), y: Math.random(), s: Math.random() * 1.5 + 0.5
    }));
    this.particles = new Particles();
    this.frame = 0;
  }
  resize() {
    const wrap = this.canvas.parentElement;
    const dpr = window.devicePixelRatio || 1;
    const w = wrap.clientWidth;
    const h = Math.min(340, Math.max(220, window.innerHeight * 0.38));
    this.canvas.width = w * dpr;
    this.canvas.height = h * dpr;
    this.canvas.style.height = h + 'px';
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.w = w; this.h = h;
  }
  draw(state) {
    const { ctx, w, h } = this;
    this.frame++;
    ctx.clearRect(0, 0, w, h);

    // Sky
    const sky = ctx.createLinearGradient(0, 0, 0, h * 0.35);
    sky.addColorStop(0, '#050515');
    sky.addColorStop(1, '#0e0e2a');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    // Stars
    for (const s of this.stars) {
      const twinkle = 0.4 + Math.sin(this.frame * 0.02 + s.x * 100) * 0.3;
      ctx.globalAlpha = twinkle;
      ctx.fillStyle = '#aaccff';
      ctx.beginPath();
      ctx.arc(s.x * w, s.y * h * 0.32, s.s, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // City silhouette
    const cam01 = state.cameraX * 0.08;
    ctx.fillStyle = '#0a0a20';
    for (let i = 0; i < 20; i++) {
      const bx = ((i * 80 - cam01) % (w + 160)) - 80;
      const bh = 20 + Math.sin(i * 1.7) * 15 + 10;
      ctx.fillRect(bx, h * 0.35 - bh, 50, bh);
      // Windows
      ctx.fillStyle = '#1a1a40';
      for (let wy = 0; wy < bh - 6; wy += 8) {
        for (let wx = 6; wx < 44; wx += 10) {
          if (Math.sin(i * 3 + wx + wy + this.frame * 0.01) > 0.3)
            ctx.fillRect(bx + wx, h * 0.35 - bh + wy + 4, 4, 4);
        }
      }
      ctx.fillStyle = '#0a0a20';
    }

    // Track
    const trackTop = h * 0.37;
    const trackH = h * 0.52;
    ctx.fillStyle = '#1e1e2e';
    ctx.fillRect(0, trackTop, w, trackH);

    // Track texture
    ctx.fillStyle = '#22223a';
    const offset = (state.cameraX * 0.5) % 40;
    for (let tx = -offset; tx < w; tx += 40) {
      ctx.fillRect(tx, trackTop, 1, trackH);
    }

    // Lane lines
    const laneH = trackH / 4;
    for (let i = 1; i < 4; i++) {
      const ly = trackTop + i * laneH;
      ctx.strokeStyle = '#ffffff30';
      ctx.lineWidth = 1;
      ctx.setLineDash([12, 18]);
      ctx.lineDashOffset = -state.cameraX * 0.3;
      ctx.beginPath(); ctx.moveTo(0, ly); ctx.lineTo(w, ly); ctx.stroke();
      ctx.setLineDash([]);
    }

    // Barriers
    this._barrier(ctx, 0, trackTop - 6, w, '#333355', '#ff333350');
    this._barrier(ctx, 0, trackTop + trackH - 2, w, '#333355', '#ff333350');

    // Distance markers
    const scale = w / CFG.VISIBLE_UNITS;
    for (let pct = 0.25; pct <= 1; pct += 0.25) {
      const mx = (state.finishDistance * pct - state.cameraX) * scale + w * CFG.CAM_AHEAD;
      if (mx > 0 && mx < w) {
        ctx.strokeStyle = '#ffffff20';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath(); ctx.moveTo(mx, trackTop); ctx.lineTo(mx, trackTop + trackH); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = '#ffffff30';
        ctx.font = '9px Orbitron, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(Math.round(pct * 100) + '%', mx, trackTop - 10);
      }
    }

    // Start line
    const startX = (0 - state.cameraX) * scale + w * CFG.CAM_AHEAD;
    if (startX > -20 && startX < w + 20) {
      this._checkers(ctx, startX, trackTop, 8, trackH);
    }

    // Finish line
    const finX = (state.finishDistance - state.cameraX) * scale + w * CFG.CAM_AHEAD;
    if (finX > -20 && finX < w + 20) {
      this._checkers(ctx, finX - 8, trackTop, 16, trackH);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px Orbitron, monospace';
      ctx.textAlign = 'center';
      ctx.fillText('FINISH', finX, trackTop - 10);
    }

    // Cars
    const sorted = [...state.players].sort((a, b) => a.lane - b.lane);
    for (const p of sorted) {
      const cx = (p.progress - state.cameraX) * scale + w * CFG.CAM_AHEAD;
      const cy = trackTop + (p.lane + 0.5) * laneH;
      KartRenderer.draw(ctx, cx, cy, p.avatar, {
        combo: p.combo,
        stumble: p.stumbling,
        frame: this.frame
      });

      // Name tag
      ctx.fillStyle = '#ffffff90';
      ctx.font = 'bold 9px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(p.avatar.name, cx, cy - 24);

      // Combo badge
      if (p.combo >= 5) {
        const badge = p.combo >= 15 ? '🔥🔥' : p.combo >= 10 ? '🔥🔥' : '🔥';
        ctx.font = '11px sans-serif';
        ctx.fillText(badge + ' ×' + p.combo, cx, cy + 26);
      }
    }

    // Flame particles for boosting players
    for (const p of state.players) {
      if (p.combo >= 5) {
        const cx = (p.progress - state.cameraX) * scale + w * CFG.CAM_AHEAD;
        const cy = trackTop + (p.lane + 0.5) * laneH;
        if (Math.random() < 0.4) {
          this.particles.emit(cx - 25, cy, 'flame', 2);
        }
      }
    }
    this.particles.update();
    this.particles.draw(ctx);

    // Ground
    ctx.fillStyle = '#0a1a0a';
    ctx.fillRect(0, trackTop + trackH + 6, w, h);

    // Mini-map
    this._minimap(ctx, w, h, state);
  }
  _barrier(ctx, x, y, w, color, stripe) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, 6);
    ctx.fillStyle = stripe;
    for (let bx = (this.frame * 0.5) % 20 - 20; bx < w; bx += 20) {
      ctx.fillRect(bx, y, 10, 6);
    }
  }
  _checkers(ctx, x, y, w, h) {
    const sz = 6;
    const cols = Math.ceil(w / sz);
    const rows = Math.ceil(h / sz);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        ctx.fillStyle = (r + c) % 2 === 0 ? '#ffffff' : '#222222';
        ctx.fillRect(x + c * sz, y + r * sz, sz, sz);
      }
    }
  }
  _minimap(ctx, w, h, state) {
    const mw = Math.min(200, w * 0.35);
    const mh = 8;
    const mx = w - mw - 10;
    const my = 8;
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(mx - 2, my - 2, mw + 4, mh + 4);
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(mx, my, mw, mh);
    // Finish flag
    ctx.fillStyle = '#ffffff40';
    ctx.fillRect(mx + mw - 2, my, 2, mh);
    for (const p of state.players) {
      const px = mx + (p.progress / state.finishDistance) * mw;
      ctx.fillStyle = p.isLocal ? '#00ff88' : p.avatar.color;
      ctx.beginPath();
      ctx.arc(px, my + mh / 2, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  emitConfetti(x, y) { this.particles.emit(x, y, 'confetti', 30); }
}

// ───────────── AI BOT ─────────────
class Bot {
  constructor(name, avatar, roundIdx) {
    this.name = name;
    this.avatar = avatar;
    this.speed = CFG.BOT_SPEED[roundIdx] + (Math.random() - 0.5) * 200;
    this.errRate = CFG.BOT_ERR[roundIdx];
    this.timer = 0;
    this.nextTime = this.speed;
  }
  update(dt) {
    this.timer += dt;
    if (this.timer >= this.nextTime) {
      this.timer = 0;
      this.nextTime = this.speed + (Math.random() - 0.5) * this.speed * 0.4;
      return Math.random() > this.errRate ? 'correct' : 'wrong';
    }
    return null;
  }
}

// ───────────── NETWORK MANAGER ─────────────
class NetworkManager {
  constructor() {
    this.peer = null;
    this.conns = [];
    this.isHost = false;
    this.roomCode = '';
    this.onMessage = null;
    this.onPlayerJoin = null;
    this.onPlayerLeave = null;
    this.onError = null;
    this.playerId = 'p' + Math.random().toString(36).slice(2, 8);
    this.connected = false;
  }
  _genCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    let c = '';
    for (let i = 0; i < 4; i++) c += chars[Math.floor(Math.random() * chars.length)];
    return c;
  }
  createRoom(callback) {
    this.isHost = true;
    this.roomCode = this._genCode();
    const peerId = 'wr-' + this.roomCode.toLowerCase();
    try {
      this.peer = new Peer(peerId, { debug: 0 });
    } catch (e) {
      callback(null, 'PeerJS not available. Playing locally with bots.');
      return;
    }
    this.peer.on('open', () => {
      this.connected = true;
      callback(this.roomCode, null);
    });
    this.peer.on('error', (err) => {
      if (err.type === 'unavailable-id') {
        this.roomCode = this._genCode();
        this.peer = new Peer('wr-' + this.roomCode.toLowerCase(), { debug: 0 });
        this._setupHostListeners();
        setTimeout(() => { if (!this.connected) callback(null, 'Could not create room. Try again.'); }, 5000);
      } else if (this.onError) {
        this.onError(err.message || 'Connection error');
      }
    });
    this.peer.on('connection', (conn) => this._handleIncoming(conn));
  }
  _setupHostListeners() {
    this.peer.on('open', () => { this.connected = true; });
    this.peer.on('connection', (conn) => this._handleIncoming(conn));
  }
  _handleIncoming(conn) {
    conn.on('open', () => {
      this.conns.push(conn);
      conn.on('data', (msg) => {
        if (this.onMessage) this.onMessage(msg, conn.peer);
      });
      conn.on('close', () => {
        this.conns = this.conns.filter(c => c !== conn);
        if (this.onPlayerLeave) this.onPlayerLeave(conn.peer);
      });
      if (this.onPlayerJoin) this.onPlayerJoin(conn.peer);
    });
    conn.on('error', () => {});
  }
  joinRoom(code, callback) {
    this.isHost = false;
    this.roomCode = code.toUpperCase();
    const peerId = 'wr-join-' + Math.random().toString(36).slice(2, 8);
    try {
      this.peer = new Peer(peerId, { debug: 0 });
    } catch (e) {
      callback(false, 'PeerJS not available.');
      return;
    }
    this.peer.on('open', () => {
      const conn = this.peer.connect('wr-' + this.roomCode.toLowerCase(), { reliable: true });
      conn.on('open', () => {
        this.conns = [conn];
        this.connected = true;
        conn.on('data', (msg) => {
          if (this.onMessage) this.onMessage(msg, 'host');
        });
        conn.on('close', () => {
          this.connected = false;
          if (this.onPlayerLeave) this.onPlayerLeave('host');
        });
        callback(true, null);
      });
      conn.on('error', (err) => {
        callback(false, 'Could not connect. Check the room code.');
      });
    });
    this.peer.on('error', () => {
      callback(false, 'Network error. Try again.');
    });
  }
  send(data) {
    if (this.isHost) {
      for (const c of this.conns) {
        try { c.send(data); } catch (e) {}
      }
    } else if (this.conns.length > 0) {
      try { this.conns[0].send(data); } catch (e) {}
    }
  }
  broadcast(data) { this.send(data); }
  disconnect() {
    try {
      this.conns.forEach(c => { try { c.close(); } catch(e){} });
      if (this.peer) this.peer.destroy();
    } catch (e) {}
    this.peer = null;
    this.conns = [];
    this.connected = false;
  }
}

// ───────────── RACE ENGINE ─────────────
class RaceEngine {
  constructor() {
    this.players = [];
    this.roundIdx = 0;
    this.finishDistance = CFG.FINISH[0];
    this.targetWords = CFG.WORDS_N[0];
    this.running = false;
    this.finished = false;
    this.cameraX = 0;
    this.localPlayer = null;
    this.currentWord = '';
    this.wordsCompleted = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.startTime = 0;
    this.finishOrder = [];
    this.wordPool = [];
    this.wordIdx = 0;
    this.stumbleTimer = 0;
  }
  setup(players, roundIdx, localId, simBots = true) {
    this.roundIdx = roundIdx;
    this.finishDistance = CFG.FINISH[roundIdx];
    this.targetWords = CFG.WORDS_N[roundIdx];
    this.running = false;
    this.finished = false;
    this.cameraX = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.wordsCompleted = 0;
    this.finishOrder = [];
    this.stumbleTimer = 0;
    this.simBots = simBots;

    const diff = CFG.DIFF_KEYS[roundIdx];
    this.wordPool = this._shuffle([...WORDS[diff]]);
    this.wordIdx = 0;

    this.players = players.map((p, i) => ({
      id: p.id,
      avatar: p.avatar,
      lane: i,
      progress: 0,
      combo: 0,
      wordsDone: 0,
      stumbling: false,
      stumbleTimer: 0,
      finished: false,
      finishTime: 0,
      isLocal: p.id === localId,
      isBot: p.isBot || false,
      bot: p.isBot ? new Bot(p.avatar.name, p.avatar, roundIdx) : null,
    }));
    this.localPlayer = this.players.find(p => p.isLocal);
    this.currentWord = this._nextWord();
  }
  _shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
  _nextWord() {
    if (this.wordIdx >= this.wordPool.length) {
      this.wordPool = this._shuffle([...this.wordPool]);
      this.wordIdx = 0;
    }
    return this.wordPool[this.wordIdx++];
  }
  start() {
    this.running = true;
    this.startTime = performance.now();
  }
  update(dt) {
    if (!this.running || this.finished) return;
    // Update bots (only on host; clients receive positions via network)
    for (const p of this.players) {
      if (this.simBots && p.isBot && !p.finished) {
        const result = p.bot.update(dt);
        if (result === 'correct') {
          this._advancePlayer(p, false);
        } else if (result === 'wrong') {
          this._stumblePlayer(p);
        }
      }
      // Stumble recovery
      if (p.stumbling) {
        p.stumbleTimer -= dt;
        if (p.stumbleTimer <= 0) {
          p.stumbling = false;
        }
      }
    }
    // Camera
    if (this.localPlayer) {
      const target = this.localPlayer.progress - CFG.VISIBLE_UNITS * CFG.CAM_AHEAD;
      this.cameraX += (target - this.cameraX) * 0.08;
      this.cameraX = Math.max(0, Math.min(this.cameraX, this.finishDistance - CFG.VISIBLE_UNITS * 0.5));
    }
    // Check finish
    for (const p of this.players) {
      if (!p.finished && p.progress >= this.finishDistance) {
        p.finished = true;
        p.finishTime = performance.now() - this.startTime;
        this.finishOrder.push(p.id);
      }
    }
    if (this.finishOrder.length >= this.players.length) {
      this.finished = true;
    }
  }
  _comboMultiplier(combo) {
    if (combo >= 15) return 3;
    if (combo >= 10) return 2;
    if (combo >= 5) return 1.5;
    return 1;
  }
  _advancePlayer(p, isLocal) {
    const mult = this._comboMultiplier(p.combo);
    p.progress += CFG.BASE_MOVE * mult;
    p.progress = Math.min(p.progress, this.finishDistance);
    p.combo++;
    p.wordsDone++;
    if (isLocal) {
      this.combo = p.combo;
      if (p.combo > this.maxCombo) this.maxCombo = p.combo;
      this.wordsCompleted = p.wordsDone;
      this.currentWord = this._nextWord();
      if (p.combo === 5) Audio.boost();
      else if (p.combo === 10) Audio.megaboost();
      else Audio.correct();
    }
  }
  _stumblePlayer(p) {
    p.progress = Math.max(0, p.progress - CFG.STUMBLE_DIST);
    p.combo = 0;
    p.stumbling = true;
    p.stumbleTimer = CFG.STUMBLE_MS;
    if (p.isLocal) {
      this.combo = 0;
      Audio.wrong();
    }
  }
  submitWord(text) {
    if (!this.running || !this.localPlayer || this.localPlayer.finished) return 'idle';
    const trimmed = text.trim().toLowerCase();
    if (trimmed === this.currentWord.toLowerCase()) {
      this._advancePlayer(this.localPlayer, true);
      return 'correct';
    } else {
      this._stumblePlayer(this.localPlayer);
      return 'wrong';
    }
  }
  getState() {
    return {
      players: this.players.map(p => ({
        id: p.id,
        avatar: p.avatar,
        lane: p.lane,
        progress: p.progress,
        combo: p.combo,
        wordsDone: p.wordsDone,
        stumbling: p.stumbling,
        finished: p.finished,
        finishTime: p.finishTime,
        isLocal: p.isLocal,
      })),
      cameraX: this.cameraX,
      finishDistance: this.finishDistance,
      roundIdx: this.roundIdx,
      finished: this.finished,
      finishOrder: [...this.finishOrder],
    };
  }
  getPositions() {
    return [...this.players]
      .sort((a, b) => b.progress - a.progress || a.finishTime - b.finishTime)
      .map((p, i) => ({
        id: p.id,
        name: p.avatar.name,
        pos: i + 1,
        wordsDone: p.wordsDone,
        time: p.finished ? p.finishTime : null,
        finished: p.finished,
        color: p.avatar.color,
      }));
  }
}

// ───────────── PODIUM RENDERER ─────────────
class PodiumRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.frame = 0;
    this.results = [];
    this.particles = new Particles();
    this.animPhase = 0;
  }
  start(results) {
    this.results = results;
    this.frame = 0;
    this.animPhase = 0;
    this.particles.clear();
  }
  draw() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    this.frame++;
    ctx.clearRect(0, 0, w, h);

    // BG
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#050515');
    grad.addColorStop(1, '#0e0e2a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Confetti
    if (this.frame % 5 === 0) {
      this.particles.emit(Math.random() * w, -10, 'confetti', 3);
    }
    this.particles.update();
    this.particles.draw(ctx);

    if (this.results.length === 0) return;

    const podiumOrder = [1, 0, 2]; // Silver, Gold, Bronze display order
    const colors = ['#c0c0d0', '#ffaa00', '#cd7f32'];
    const heights = [120, 180, 80];
    const labels = ['2nd', '1st', '3rd'];
    const baseY = h - 50;
    const barW = 100;
    const gap = 30;
    const totalW = barW * 3 + gap * 2;
    const startX = (w - totalW) / 2;

    for (let i = 0; i < 3 && i < this.results.length; i++) {
      const pi = podiumOrder[i];
      const r = this.results[pi];
      if (!r) continue;

      const bx = startX + i * (barW + gap);
      const targetH = heights[i];
      const animH = Math.min(targetH, this.frame * 3);
      const by = baseY - animH;

      // Bar
      const barGrad = ctx.createLinearGradient(bx, by, bx, baseY);
      barGrad.addColorStop(0, colors[i] + 'aa');
      barGrad.addColorStop(1, colors[i] + '33');
      ctx.fillStyle = barGrad;
      ctx.beginPath();
      ctx.roundRect(bx, by, barW, animH, [8, 8, 0, 0]);
      ctx.fill();
      ctx.strokeStyle = colors[i];
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(bx, by, barW, animH, [8, 8, 0, 0]);
      ctx.stroke();

      // Kart
      if (animH > targetH * 0.8) {
        const kartCfg = r.avatar || { chassis: 'kart', color: colors[i], spoiler: 'none', neon: 'off', helmet: 'classic' };
        KartRenderer.draw(ctx, bx + barW / 2, by - 15, kartCfg, { combo: 0, stumble: false, frame: this.frame }, 1.2);
      }

      // Label
      ctx.fillStyle = colors[i];
      ctx.font = 'bold 14px Orbitron, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(labels[i], bx + barW / 2, baseY + 20);

      // Name
      ctx.fillStyle = '#dde';
      ctx.font = '12px Inter, sans-serif';
      ctx.fillText(r.name || '???', bx + barW / 2, baseY + 38);
    }

    // 4th place (if exists)
    if (this.results.length > 3) {
      const r4 = this.results[3];
      ctx.fillStyle = '#ff4444';
      ctx.font = 'bold 11px Orbitron, monospace';
      ctx.textAlign = 'center';
      ctx.fillText('4th: ' + (r4.name || '???'), w / 2, 30);
    }
  }
}

// ───────────── MAIN APPLICATION ─────────────
class WordRaceApp {
  constructor() {
    this.avatar = new AvatarSystem();
    this.network = new NetworkManager();
    this.race = new RaceEngine();
    this.trackRenderer = null;
    this.podiumRenderer = null;
    this.currentScreen = 'avatar';
    this.isHost = false;
    this.localId = 'p' + Math.random().toString(36).slice(2, 8);
    this.players = []; // { id, avatar, isLocal, isBot }
    this.roomCode = '';
    this.roundIdx = 0;
    this.tournamentResults = []; // per-round results
    this.gameLoop = null;
    this.raceAnimFrame = null;
    this.frame = 0;
    this.countdownTimer = null;
    this.intermissionTimer = null;
    this._pendingMessages = [];
  }
  init() {
    Audio.init();
    this.trackRenderer = new TrackRenderer(document.getElementById('race-canvas'));
    this.podiumRenderer = new PodiumRenderer(document.getElementById('podium-canvas'));
    this._bindEvents();
    this._renderAvatar();
    window.addEventListener('resize', () => {
      if (this.trackRenderer) this.trackRenderer.resize();
    });
  }
  // ── Event Binding ──
  _bindEvents() {
    // Nav
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (!btn.disabled) this.showScreen(btn.dataset.screen);
      });
    });
    // Sound toggle
    document.getElementById('btn-sound').addEventListener('click', () => {
      Audio.resume();
      const on = Audio.toggle();
      document.getElementById('btn-sound').textContent = on ? '🔊' : '🔇';
    });
    // Avatar options
    document.querySelectorAll('.opt-row .opt-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const row = btn.closest('.opt-row');
        row.querySelectorAll('.opt-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        this.avatar.set(row.dataset.key, btn.dataset.val);
        this._renderAvatar();
      });
    });
    document.querySelectorAll('.color-row .clr-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const row = btn.closest('.color-row');
        row.querySelectorAll('.clr-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        this.avatar.set(row.dataset.key, btn.dataset.val);
        this._renderAvatar();
      });
    });
    document.getElementById('driver-name').addEventListener('input', (e) => {
      const name = e.target.value.toUpperCase().replace(/[^A-Z0-9 ]/g, '').slice(0, 12);
      e.target.value = name;
      this.avatar.set('name', name || 'RACER');
      document.getElementById('preview-name-tag').textContent = name || 'RACER';
      this._renderAvatar();
    });
    // Save avatar
    document.getElementById('btn-save-avatar').addEventListener('click', () => {
      Audio.resume();
      this.showScreen('lobby');
    });
    // Create room
    document.getElementById('btn-create').addEventListener('click', () => this._createRoom());
    // Join room
    document.getElementById('btn-join').addEventListener('click', () => this._joinRoom());
    document.getElementById('input-code').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this._joinRoom();
    });
    // Start race
    document.getElementById('btn-start').addEventListener('click', () => this._startChampionship());
    // Word input
    document.getElementById('word-input').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this._submitWord();
      }
      Audio.keypress();
    });
    document.getElementById('word-input').addEventListener('input', () => {
      this._updateLetterHighlight();
    });
    // New race
    document.getElementById('btn-new-race').addEventListener('click', () => {
      this._resetAll();
      this.showScreen('lobby');
    });
  }
  // ── Screen Management ──
  showScreen(name) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const screen = document.getElementById('screen-' + name);
    if (screen) screen.classList.add('active');
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.screen === name);
    });
    this.currentScreen = name;
    if (name === 'race') {
      this.trackRenderer.resize();
      document.getElementById('word-input').focus();
    }
  }
  enableNav(name) {
    const btn = document.querySelector(`.nav-btn[data-screen="${name}"]`);
    if (btn) btn.disabled = false;
  }
  // ── Avatar ──
  _renderAvatar() {
    const canvas = document.getElementById('avatar-canvas');
    this.avatar.renderPreview(canvas);
  }
  // ── Lobby / Networking ──
  _showStatus(text) {
    document.getElementById('lobby-status-bar').classList.remove('hidden');
    document.getElementById('lobby-status-text').textContent = text;
  }
  _hideStatus() {
    document.getElementById('lobby-status-bar').classList.add('hidden');
  }
  _createRoom() {
    this._showStatus('Creating room...');
    this.isHost = true;
    this.network.createRoom((code, err) => {
      if (err) {
        this._hideStatus();
        this._showStatus(err);
        // Fallback: local play with bots
        this.isHost = true;
        this.roomCode = 'LOCAL';
        this._setupLocalLobby();
        return;
      }
      this.roomCode = code;
      this._hideStatus();
      document.getElementById('room-info').classList.remove('hidden');
      document.getElementById('room-code').textContent = code;
      document.getElementById('btn-create').disabled = true;
      document.getElementById('btn-create').textContent = 'Room Created ✓';
      this._setupLocalLobby();
      this._setupNetworkHandlers();
    });
  }
  _joinRoom() {
    const code = document.getElementById('input-code').value.toUpperCase().trim();
    if (code.length !== 4) {
      document.getElementById('input-code').classList.add('fail');
      setTimeout(() => document.getElementById('input-code').classList.remove('fail'), 500);
      return;
    }
    this._showStatus('Joining room ' + code + '...');
    this.isHost = false;
    this.network.joinRoom(code, (ok, err) => {
      if (!ok) {
        this._showStatus(err || 'Failed to join.');
        setTimeout(() => this._hideStatus(), 3000);
        return;
      }
      this.roomCode = code;
      // Set up message handlers BEFORE sending join message
      this._setupNetworkHandlers();
      // Show lobby UI for client
      document.getElementById('lobby-bottom').classList.remove('hidden');
      document.getElementById('room-info').classList.remove('hidden');
      document.getElementById('room-code').textContent = code;
      document.getElementById('btn-start').classList.add('hidden');
      this.players = [{ id: this.localId, avatar: this.avatar.get(), isLocal: true, isBot: false }];
      this._renderPlayerList();
      // Send join message to host
      this.network.send({
        type: 'player-join',
        id: this.localId,
        avatar: this.avatar.get()
      });
      this._hideStatus();
      this._showStatus('Connected! Waiting for host to start...');
    });
  }
  _setupNetworkHandlers() {
    this.network.onMessage = (msg, fromId) => {
      if (this.isHost) {
        this._handleClientMessage(msg, fromId);
      } else {
        this._handleHostMessage(msg);
      }
    };
    this.network.onPlayerJoin = (peerId) => {
      if (this.isHost) {
        // Host waits for player-join message
      }
    };
    this.network.onPlayerLeave = (peerId) => {
      this.players = this.players.filter(p => p.id !== peerId);
      this._renderPlayerList();
    };
    this.network.onError = (msg) => {
      this._showStatus('Error: ' + msg);
    };
  }
  _handleClientMessage(msg, fromId) {
    if (msg.type === 'player-join') {
      // Add player — only count real (non-bot) players for capacity
      const realCount = this.players.filter(p => !p.isBot).length;
      if (realCount >= 4) {
        this.network.send({ type: 'error', text: 'Room is full!' });
        return;
      }
      const exists = this.players.find(p => p.id === msg.id);
      if (!exists) {
        // Remove a bot to make room for the real player
        const botIdx = this.players.findIndex(p => p.isBot);
        if (botIdx !== -1) this.players.splice(botIdx, 1);
        this.players.push({
          id: msg.id,
          avatar: msg.avatar,
          isLocal: false,
          isBot: false,
          peerId: fromId
        });
        this._renderPlayerList();
        this._broadcastPlayerList();
      }
    } else if (msg.type === 'word-done') {
      // Remote player completed a word correctly
      if (this.race && this.race.running) {
        const p = this.race.players.find(pp => pp.id === msg.id);
        if (p && !p.finished) {
          this.race._advancePlayer(p, false);
        }
      }
    } else if (msg.type === 'word-fail') {
      if (this.race && this.race.running) {
        const p = this.race.players.find(pp => pp.id === msg.id);
        if (p) {
          this.race._stumblePlayer(p);
        }
      }
    }
  }
  _handleHostMessage(msg) {
    if (msg.type === 'player-list') {
      // Rebuild local player list from host, marking self as local
      this.players = msg.players.map(p => ({
        ...p,
        isLocal: p.id === this.localId
      }));
      this._renderPlayerList();
    } else if (msg.type === 'error') {
      this._showStatus(msg.text || 'An error occurred');
      setTimeout(() => this._hideStatus(), 4000);
    } else if (msg.type === 'game-start') {
      this.roundIdx = msg.roundIdx;
      // Sync full player list from host, marking self as local
      this.players = msg.players.map(p => ({
        ...p,
        isLocal: p.id === this.localId
      }));
      this._beginRace(this.players, msg.roundIdx, false);
    } else if (msg.type === 'countdown') {
      this._showCountdown(msg.value);
    } else if (msg.type === 'race-start') {
      // Start race on client side (only if not already running)
      if (!this.race.running) {
        this.race.start();
        this._startRaceLoop();
      }
    } else if (msg.type === 'race-state') {
      // Update remote player states
      for (const state of msg.players) {
        const p = this.race.players.find(pp => pp.id === state.id);
        if (p && !p.isLocal) {
          p.progress = state.progress;
          p.combo = state.combo;
          p.wordsDone = state.wordsDone;
          p.stumbling = state.stumbling;
          p.finished = state.finished;
          p.finishTime = state.finishTime;
        }
      }
      this.race.finishOrder = msg.finishOrder || this.race.finishOrder;
      if (msg.finished) this.race.finished = true;
    } else if (msg.type === 'race-end') {
      this._endRace(msg.results);
    } else if (msg.type === 'next-round') {
      // Sync updated player list from host (eliminated players removed)
      if (msg.players) {
        this.players = msg.players.map(p => ({ ...p, isLocal: p.id === this.localId }));
      }
      this._beginIntermission(msg.roundResults, msg.eliminated, msg.nextRoundIdx);
    } else if (msg.type === 'podium') {
      this._showPodium(msg.results);
    }
  }
  _broadcastPlayerList() {
    this.network.broadcast({
      type: 'player-list',
      players: this.players.map(p => ({
        id: p.id,
        avatar: p.avatar,
        isBot: p.isBot || false
      }))
    });
  }
  _setupLocalLobby() {
    this.players = [{
      id: this.localId,
      avatar: this.avatar.get(),
      isLocal: true,
      isBot: false
    }];
    document.getElementById('lobby-bottom').classList.remove('hidden');
    document.getElementById('room-info').classList.remove('hidden');
    if (this.isHost) {
      document.getElementById('btn-start').classList.remove('hidden');
      document.getElementById('btn-start').disabled = false;
    }
    if (this.roomCode && this.roomCode !== 'LOCAL') {
      document.getElementById('room-code').textContent = this.roomCode;
    } else {
      document.getElementById('room-code').textContent = 'LOCAL';
    }
    // Wire up bots checkbox (only once)
    if (!this._botsWired) {
      this._botsWired = true;
      document.getElementById('chk-bots').addEventListener('change', () => {
        this._renderPlayerList();
        // If host and connected, broadcast the updated list to clients
        if (this.isHost && this.network.connected) {
          this._broadcastPlayerList();
        }
      });
    }
    this._renderPlayerList();
  }
  _renderPlayerList() {
    const list = document.getElementById('player-list');
    const fillBots = document.getElementById('chk-bots').checked;

    // Only the host manages bots in the players array
    if (this.isHost) {
      // Strip all existing bots first for a clean slate
      this.players = this.players.filter(p => !p.isBot);
      // Re-add bots to fill slots if checkbox is on
      if (fillBots) {
        const botDefs = [
          { name: 'BOT Alpha', chassis: 'formula', color: '#4488ff', helmet: 'modern' },
          { name: 'BOT Beta',  chassis: 'muscle',  color: '#00cc66', helmet: 'retro' },
          { name: 'BOT Gamma', chassis: 'kart',    color: '#ffaa00', helmet: 'visor' },
        ];
        for (let i = 0; this.players.length < 4 && i < botDefs.length; i++) {
          const bd = botDefs[i];
          this.players.push({
            id: 'bot-' + i,
            avatar: { name: bd.name, chassis: bd.chassis, color: bd.color, spoiler: 'small', neon: 'off', helmet: bd.helmet },
            isLocal: false,
            isBot: true
          });
        }
      }
    }

    // Build display from current players (cap at 4)
    const display = this.players.slice(0, 4);
    const count = display.filter(p => !p.isBot).length;
    document.getElementById('player-count').textContent = `${count}/4`;

    list.innerHTML = '';
    for (let i = 0; i < 4; i++) {
      const p = display[i];
      const card = document.createElement('div');
      card.className = 'player-card' + (!p ? ' empty' : '') + (p && p.isLocal ? ' host' : '');
      if (p) {
        const icon = p.isBot ? '🤖' : (p.isLocal ? '⭐' : '🏎️');
        const tag = p.isBot ? 'AI Bot' : (p.isLocal ? (this.isHost ? 'Host' : 'You') : 'Player');
        card.innerHTML = `
          <span class="p-icon">${icon}</span>
          <span class="p-name" style="color:${p.avatar.color}">${p.avatar.name}</span>
          <span class="p-tag">${tag}</span>
        `;
      } else {
        card.innerHTML = `<span class="p-icon">➕</span><span class="p-name">Waiting...</span><span class="p-tag">Empty slot</span>`;
      }
      list.appendChild(card);
    }
  }
  // ── Championship Flow ──
  _startChampionship() {
    Audio.resume();
    this.roundIdx = 0;
    this.tournamentResults = [];
    // Ensure we have enough players (fill bots)
    if (document.getElementById('chk-bots').checked) {
      const botNames = ['Alpha', 'Beta', 'Gamma', 'Delta'];
      const botColors = ['#4488ff', '#00cc66', '#ffaa00', '#cc44ff'];
      const botChassis = ['formula', 'muscle', 'kart', 'formula'];
      const botHelmets = ['modern', 'retro', 'visor', 'classic'];
      while (this.players.length < 4) {
        const bi = this.players.filter(p => p.isBot).length;
        this.players.push({
          id: 'bot-' + bi,
          avatar: {
            name: 'BOT ' + (botNames[bi] || (bi + 1)),
            chassis: botChassis[bi] || 'kart',
            color: botColors[bi] || '#888',
            spoiler: 'small',
            neon: 'off',
            helmet: botHelmets[bi] || 'classic'
          },
          isLocal: false,
          isBot: true
        });
      }
    }
    // Broadcast to connected clients
    if (this.network.connected) {
      this.network.broadcast({
        type: 'game-start',
        players: this.players.map(p => ({ id: p.id, avatar: p.avatar, isBot: p.isBot })),
        roundIdx: 0
      });
    }
    this._beginRace(this.players, 0, true);
  }
  _beginRace(players, roundIdx, isHostInitiator) {
    this.roundIdx = roundIdx;
    this.enableNav('race');
    this.showScreen('race');
    // Setup round info
    document.getElementById('round-label').textContent = CFG.ROUND_NAMES[roundIdx];
    const eliminated = this.tournamentResults.length > 0
      ? this.tournamentResults[this.tournamentResults.length - 1]?.eliminated
      : null;
    document.getElementById('elim-info').textContent = eliminated
      ? `Eliminated: ${eliminated.name}`
      : '';
    // Setup race
    this.race.setup(players, roundIdx, this.localId, isHostInitiator);
    document.getElementById('stat-total').textContent = this.race.targetWords;
    document.getElementById('stat-words').textContent = '0';
    document.getElementById('stat-combo').textContent = '×0';
    document.getElementById('combo-fill').style.width = '0%';
    this._showWord(this.race.currentWord);
    this.trackRenderer.resize();
    this._renderRace(); // draw starting positions
    // Countdown
    this._runCountdown(() => {
      document.getElementById('word-input').focus();
      if (isHostInitiator) {
        // Host starts the race and tells clients
        this.race.start();
        this._startRaceLoop();
        if (this.network.connected) {
          this.network.broadcast({ type: 'race-start' });
        }
      }
      // Client waits for 'race-start' message from host
    });
  }
  _runCountdown(callback) {
    const overlay = document.getElementById('countdown-overlay');
    const text = document.getElementById('countdown-text');
    overlay.classList.remove('hidden');
    let count = CFG.COUNTDOWN_SECS;
    text.textContent = count;
    text.style.color = '#ff4444';
    Audio.countdown();
    const tick = () => {
      if (count > 0) {
        text.textContent = count;
        text.style.color = count === 3 ? '#ff4444' : count === 2 ? '#ffaa00' : '#ffff00';
        text.style.animation = 'none';
        text.offsetHeight; // reflow
        text.style.animation = 'countdown-pop .5s ease-out';
        Audio.countdown();
        count--;
        this.countdownTimer = setTimeout(tick, 900);
      } else {
        text.textContent = 'GO!';
        text.style.color = '#00ff88';
        text.style.animation = 'none';
        text.offsetHeight;
        text.style.animation = 'countdown-pop .5s ease-out';
        Audio.go();
        setTimeout(() => {
          overlay.classList.add('hidden');
          callback();
        }, 600);
      }
    };
    tick();
  }
  _startRaceLoop() {
    let lastTime = performance.now();
    const loop = () => {
      const now = performance.now();
      const dt = now - lastTime;
      lastTime = now;
      this.race.update(dt);
      this.frame++;
      // Update UI
      this._updateRaceUI();
      this._renderRace();
      // Host broadcasts state
      if (this.isHost && this.network.connected && this.frame % 6 === 0) {
        this.network.broadcast({
          type: 'race-state',
          players: this.race.players.map(p => ({
            id: p.id,
            progress: p.progress,
            combo: p.combo,
            wordsDone: p.wordsDone,
            stumbling: p.stumbling,
            finished: p.finished,
            finishTime: p.finishTime,
          })),
          finishOrder: this.race.finishOrder,
          finished: this.race.finished,
        });
      }
      // Check finish
      if (this.race.finished) {
        this._onRaceFinished();
        return;
      }
      // Check if local player finished (keep animating others)
      if (this.race.localPlayer?.finished && !this.race.finished) {
        // Continue loop to let others finish
      }
      this.raceAnimFrame = requestAnimationFrame(loop);
    };
    this.raceAnimFrame = requestAnimationFrame(loop);
  }
  _renderRace() {
    this.trackRenderer.draw(this.race.getState());
  }
  _updateRaceUI() {
    // Timer
    const elapsed = (performance.now() - this.race.startTime) / 1000;
    const mins = Math.floor(elapsed / 60);
    const secs = Math.floor(elapsed % 60);
    const tenths = Math.floor((elapsed * 10) % 10);
    document.getElementById('race-timer').textContent = `${mins}:${secs.toString().padStart(2, '0')}.${tenths}`;
    // Position
    const positions = this.race.getPositions();
    const localPos = positions.find(p => p.id === this.localId);
    if (localPos) {
      const posText = localPos.pos === 1 ? '🥇 1st' : localPos.pos === 2 ? '🥈 2nd' : localPos.pos === 3 ? '🥉 3rd' : '4th';
      document.getElementById('stat-pos').textContent = posText;
    }
    // Combo
    const combo = this.race.combo;
    document.getElementById('stat-combo').textContent = '×' + combo;
    const fill = Math.min(100, (combo / 15) * 100);
    document.getElementById('combo-fill').style.width = fill + '%';
    const comboCard = document.getElementById('combo-card');
    comboCard.classList.remove('nitro', 'mega');
    if (combo >= 15) comboCard.classList.add('mega');
    else if (combo >= 5) comboCard.classList.add('nitro');
    // Words
    document.getElementById('stat-words').textContent = this.race.wordsCompleted;
  }
  _showWord(word) {
    const container = document.getElementById('target-word');
    container.innerHTML = '';
    for (const ch of word) {
      const span = document.createElement('span');
      span.className = 'letter pending';
      span.textContent = ch.toUpperCase();
      container.appendChild(span);
    }
    const input = document.getElementById('word-input');
    input.value = '';
    input.classList.remove('success', 'fail');
    input.focus();
  }
  _updateLetterHighlight() {
    const input = document.getElementById('word-input').value.toLowerCase();
    const letters = document.querySelectorAll('#target-word .letter');
    const word = this.race.currentWord.toLowerCase();
    for (let i = 0; i < letters.length; i++) {
      letters[i].className = 'letter';
      if (i < input.length) {
        letters[i].classList.add(input[i] === word[i] ? 'correct' : 'wrong');
      } else {
        letters[i].classList.add('pending');
      }
    }
  }
  _submitWord() {
    const input = document.getElementById('word-input');
    const result = this.race.submitWord(input.value);
    if (result === 'correct') {
      input.classList.add('success');
      setTimeout(() => {
        input.classList.remove('success');
        this._showWord(this.race.currentWord);
      }, 200);
      // Notify host
      if (!this.isHost && this.network.connected) {
        this.network.send({ type: 'word-done', id: this.localId });
      }
      // Confetti on big combos
      if (this.race.combo >= 5 && this.race.combo % 5 === 0) {
        const canvas = this.trackRenderer.canvas;
        this.trackRenderer.emitConfetti(canvas.width / 2, canvas.height / 2);
      }
    } else if (result === 'wrong') {
      input.classList.add('fail');
      setTimeout(() => {
        input.classList.remove('fail');
        input.value = '';
        this._updateLetterHighlight();
      }, 400);
      if (!this.isHost && this.network.connected) {
        this.network.send({ type: 'word-fail', id: this.localId });
      }
    }
  }
  _onRaceFinished() {
    cancelAnimationFrame(this.raceAnimFrame);
    Audio.finish();
    // Show brief result overlay
    const positions = this.race.getPositions();
    const overlay = document.getElementById('result-overlay');
    const content = document.getElementById('result-content');
    let html = '<h3>🏁 Race Complete!</h3><div style="margin-top:.5rem">';
    for (const p of positions) {
      const medal = p.pos === 1 ? '🥇' : p.pos === 2 ? '🥈' : p.pos === 3 ? '🥉' : '❌';
      html += `<div style="margin:.3rem 0;font-size:.9rem">${medal} <span style="color:${p.color};font-weight:700">${p.name}</span> — ${p.wordsDone} words${p.time ? ' (' + (p.time / 1000).toFixed(1) + 's)' : ''}</div>`;
    }
    html += '</div>';
    content.innerHTML = html;
    overlay.classList.remove('hidden');

    // Broadcast race end to clients
    if (this.isHost && this.network.connected) {
      this.network.broadcast({ type: 'race-end', results: positions });
    }

    setTimeout(() => {
      overlay.classList.add('hidden');
      this._processRoundResults(positions);
    }, 3500);
  }
  _endRace(results) {
    cancelAnimationFrame(this.raceAnimFrame);
    Audio.finish();
    // Show result overlay on client side (host already shows it in _onRaceFinished)
    const overlay = document.getElementById('result-overlay');
    const content = document.getElementById('result-content');
    let html = '<h3>🏁 Race Complete!</h3><div style="margin-top:.5rem">';
    for (const p of results) {
      const medal = p.pos === 1 ? '🥇' : p.pos === 2 ? '🥈' : p.pos === 3 ? '🥉' : '❌';
      html += `<div style="margin:.3rem 0;font-size:.9rem">${medal} <span style="color:${p.color};font-weight:700">${p.name}</span> — ${p.wordsDone} words${p.time ? ' (' + (p.time / 1000).toFixed(1) + 's)' : ''}</div>`;
    }
    html += '</div>';
    content.innerHTML = html;
    overlay.classList.remove('hidden');
    // Client: just show the overlay, then wait for host's next-round/podium message
    setTimeout(() => { overlay.classList.add('hidden'); }, 3500);
  }
  _processRoundResults(positions) {
    // Determine elimination
    let eliminated = null;
    const roundResult = { positions, eliminated: null };
    if (this.roundIdx === 0) {
      // Seeding: no elimination, but set grid order for next race
      // Reorder players by seeding result
      const seedOrder = positions.map(p => this.players.find(pp => pp.id === p.id)).filter(Boolean);
      this.players = seedOrder;
    } else if (this.roundIdx === 1) {
      // Elimination 1: last place out
      eliminated = positions[positions.length - 1];
      this.players = this.players.filter(p => p.id !== eliminated.id);
    } else if (this.roundIdx === 2) {
      // Elimination 2: last place gets bronze, out
      eliminated = positions[positions.length - 1];
      this.players = this.players.filter(p => p.id !== eliminated.id);
    }
    // Final: no elimination, just determine gold/silver
    roundResult.eliminated = eliminated;
    this.tournamentResults.push(roundResult);
    const nextRound = this.roundIdx + 1;

    if (nextRound >= CFG.ROUNDS) {
      // Tournament over → podium
      setTimeout(() => {
        this._showPodiumFromResults();
      }, 1000);
    } else {
      this._beginIntermission(roundResult, eliminated, nextRound);
    }
  }
  _beginIntermission(roundResult, eliminated, nextRoundIdx) {
    this.showScreen('intermission');
    const title = document.getElementById('inter-title');
    title.textContent = this.roundIdx === 0 ? '🏁 Seeding Complete!' :
      this.roundIdx === 1 ? '⚠️ Elimination Run 1 Complete!' :
      this.roundIdx === 2 ? '⚠️ Elimination Run 2 Complete!' : '🏁 Final Complete!';

    // Results list
    const resultsDiv = document.getElementById('inter-results');
    resultsDiv.innerHTML = '';
    const pos = roundResult.positions || [];
    for (const p of pos) {
      const medal = p.pos === 1 ? '🥇' : p.pos === 2 ? '🥈' : p.pos === 3 ? '🥉' : '4️⃣';
      const posClass = p.pos === 1 ? 'gold' : p.pos === 2 ? 'silver' : p.pos === 3 ? 'bronze' : 'elim';
      const isEliminated = eliminated && p.id === eliminated.id;
      const row = document.createElement('div');
      row.className = 'result-row' + (isEliminated ? ' eliminated' : '');
      row.innerHTML = `
        <span class="r-pos ${posClass}">${medal}</span>
        <span class="r-name" style="color:${p.color}">${p.name}</span>
        <span class="r-words">${p.wordsDone} words${p.time ? ' · ' + (p.time / 1000).toFixed(1) + 's' : ''}</span>
      `;
      resultsDiv.appendChild(row);
    }

    // Elimination message
    const elimDiv = document.getElementById('inter-elimination');
    if (eliminated) {
      elimDiv.classList.remove('hidden');
      elimDiv.innerHTML = `❌ <strong style="color:${eliminated.color}">${eliminated.name}</strong> has been eliminated!`;
      Audio.eliminate();
    } else {
      elimDiv.classList.add('hidden');
    }

    // Next round info
    const nextLabel = document.getElementById('inter-next');
    if (nextRoundIdx < CFG.ROUNDS) {
      const remaining = this.players.length;
      nextLabel.textContent = `Next: ${CFG.ROUND_NAMES[nextRoundIdx]} — ${remaining} racers remaining`;
    } else {
      nextLabel.textContent = 'Championship complete! Heading to podium...';
    }

    // Countdown bar
    const countBar = document.getElementById('inter-countdown');
    countBar.innerHTML = '';
    const bar = document.createElement('div');
    bar.style.cssText = 'height:4px;border-radius:2px;background:linear-gradient(90deg,#00ff88,#4488ff);animation:countdown-shrink ' + CFG.INTERMISSION + 's linear forwards;width:100%';
    countBar.appendChild(bar);

    // Broadcast to clients (include updated player list so clients remove eliminated players)
    if (this.isHost && this.network.connected) {
      this.network.broadcast({
        type: 'next-round',
        roundResults: roundResult,
        eliminated: eliminated,
        nextRoundIdx: nextRoundIdx,
        players: this.players.map(p => ({ id: p.id, avatar: p.avatar, isBot: p.isBot || false }))
      });
    }

    // After intermission, start next race
    if (this.intermissionTimer) clearTimeout(this.intermissionTimer);
    this.intermissionTimer = setTimeout(() => {
      this._beginRace(this.players, nextRoundIdx, this.isHost);
    }, CFG.INTERMISSION * 1000);
  }
  _showPodiumFromResults() {
    // Build final standings
    const finalStandings = [];
    // Gold & Silver from final race
    const finalResult = this.tournamentResults[this.tournamentResults.length - 1];
    if (finalResult && finalResult.positions) {
      const gold = finalResult.positions[0];
      const silver = finalResult.positions[1];
      if (gold) finalStandings.push({ ...gold, medal: '🥇', pos: 1 });
      if (silver) finalStandings.push({ ...silver, medal: '🥈', pos: 2 });
    }
    // Bronze from elimination 2
    if (this.tournamentResults.length >= 3) {
      const elim2 = this.tournamentResults[2];
      if (elim2 && elim2.eliminated) {
        finalStandings.push({ ...elim2.eliminated, medal: '🥉', pos: 3 });
      }
    }
    // 4th from elimination 1
    if (this.tournamentResults.length >= 2) {
      const elim1 = this.tournamentResults[1];
      if (elim1 && elim1.eliminated) {
        finalStandings.push({ ...elim1.eliminated, medal: '4️⃣', pos: 4 });
      }
    }
    this._showPodium(finalStandings);
    if (this.isHost && this.network.connected) {
      this.network.broadcast({ type: 'podium', results: finalStandings });
    }
  }
  _showPodium(results) {
    this.enableNav('podium');
    this.showScreen('podium');
    Audio.victory();
    this.podiumRenderer.start(results);
    const drawLoop = () => {
      this.podiumRenderer.draw();
      if (this.podiumRenderer.frame < 300) {
        requestAnimationFrame(drawLoop);
      }
    };
    requestAnimationFrame(drawLoop);
    // Names
    const namesDiv = document.getElementById('podium-names');
    namesDiv.innerHTML = '';
    const order = [
      { idx: 1, label: '🥈 2nd Place', cls: 'silver' },
      { idx: 0, label: '🥇 1st Place', cls: 'gold' },
      { idx: 2, label: '🥉 3rd Place', cls: 'bronze' },
    ];
    for (const o of order) {
      const r = results[o.idx];
      if (!r) continue;
      const div = document.createElement('div');
      div.className = 'podium-name';
      div.innerHTML = `<span class="pn-pos">${o.label}</span><span class="pn-name ${o.cls}">${r.name}</span>`;
      namesDiv.appendChild(div);
    }
    // 4th
    if (results.length > 3) {
      const div = document.createElement('div');
      div.className = 'podium-name';
      div.innerHTML = `<span class="pn-pos">4th Place</span><span class="pn-name" style="color:#ff6666">${results[3].name}</span>`;
      namesDiv.appendChild(div);
    }
  }
  _resetAll() {
    cancelAnimationFrame(this.raceAnimFrame);
    if (this.countdownTimer) clearTimeout(this.countdownTimer);
    if (this.intermissionTimer) clearTimeout(this.intermissionTimer);
    this.network.disconnect();
    this.players = [];
    this.tournamentResults = [];
    this.roundIdx = 0;
    this.isHost = false;
    this.roomCode = '';
    this._botsWired = false;
    // Reset lobby UI
    document.getElementById('btn-create').disabled = false;
    document.getElementById('btn-create').textContent = 'Create Room';
    document.getElementById('room-info').classList.add('hidden');
    document.getElementById('lobby-bottom').classList.add('hidden');
    document.getElementById('lobby-status-bar').classList.add('hidden');
    document.getElementById('input-code').value = '';
    // Disable race/podium nav
    document.querySelector('.nav-btn[data-screen="race"]').disabled = true;
    document.querySelector('.nav-btn[data-screen="podium"]').disabled = true;
  }
}

// ───────────── INIT ─────────────
window.addEventListener('DOMContentLoaded', () => {
  const app = new WordRaceApp();
  app.init();
  window.app = app; // for debugging
});