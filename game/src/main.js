// main.js — loop game, input keyboard/mouse, mesin state, dan mode shot.
// Mode shot (?shot=level1|level2|level3|menu|win&seed=N) membekukan satu
// frame deterministik untuk screenshot.
(function () {
  const MP = window.MP;
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');

  const game = {
    state: 'menu',           // menu | playing | paused | caught | levelwin | gamewin
    levelIndex: 0, level: null,
    player: { x: 640, y: 720, r: 13, dir: -Math.PI / 2, sneak: false },
    alarm: 0, score: 0, totalScore: 0,
    coins: 3, smokeLeft: 2, empLeft: 1,
    levelTime: 0, levelStartScore: 0,
    spotted: false, artifactTaken: false,
    smokes: [], flyingCoins: [], landedCoins: [], particles: [],
    menuLevel: 0, breakdown: null,
    keys: {}, mouse: { x: 0, y: 0 },
    t: 0, frozen: false, stepT: 0,
  };
  MP.game = game;
  window.MP = MP;

  // Saka tersembunyi bila berdiri di dalam asap.
  game.playerHidden = function () {
    for (const s of game.smokes) {
      if (MP.dist(game.player.x, game.player.y, s.x, s.y) < s.r) return true;
    }
    return false;
  };
  game.addParticles = function (x, y, color, n) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 40 + Math.random() * 90;
      game.particles.push({ x: x, y: y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, ttl: 0.6 + Math.random() * 0.4, color: color });
    }
  };

  function startLevel(i) {
    game.levelIndex = i;
    game.level = MP.buildLevel(i, MP.shotSeed || 11);
    game.player.x = game.level.start.x;
    game.player.y = game.level.start.y;
    game.player.dir = -Math.PI / 2;
    game.alarm = 0;
    game.levelTime = 0;
    game.levelStartScore = game.score;
    game.coins = 3;
    game.smokeLeft = 2;
    game.empLeft = 1;
    game.spotted = false;
    game.artifactTaken = false;
    game.smokes = [];
    game.flyingCoins = [];
    game.landedCoins = [];
    game.particles = [];
    game.state = 'playing';
  }
  MP.startLevel = startLevel;

  function restartLevel() {
    game.score = game.levelStartScore;
    startLevel(game.levelIndex);
  }

  function levelWin() {
    const lootScore = game.score - game.levelStartScore;
    const timeBonus = Math.max(0, Math.round(240 - game.levelTime)) * 5;
    const ghostBonus = game.spotted ? 0 : 500;
    const levelScore = lootScore + timeBonus + ghostBonus;
    game.totalScore += levelScore;
    game.breakdown = {
      loot: lootScore, timeBonus: timeBonus, ghostBonus: ghostBonus,
      levelScore: levelScore, totalScore: game.totalScore,
    };
    game.state = 'levelwin';
    MP.sfxWin();
  }

  function caught() {
    game.state = 'caught';
    MP.sfxCaught();
  }

  // ------------------------------------------------------------ input
  const GAME_KEYS = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '];
  window.addEventListener('keydown', function (e) {
    if (GAME_KEYS.indexOf(e.key) >= 0) e.preventDefault();
    if (e.repeat) return;
    game.keys[e.key.toLowerCase()] = true;
    const k = e.key.toLowerCase();
    if (k === 'm') {
      if (game.state === 'playing' || game.state === 'paused') {
        MP.muted = !MP.muted;
      } else {
        game.state = 'menu';
      }
      return;
    }
    if (game.state === 'menu') {
      if (k === '1' || k === '2' || k === '3') game.menuLevel = Number(k) - 1;
      if (k === 'enter') { game.score = 0; game.totalScore = 0; startLevel(game.menuLevel); }
      return;
    }
    if (game.state === 'playing') {
      if (k === 'p') { game.state = 'paused'; return; }
      if (k === 'r') { restartLevel(); return; }
      if (k === 'e') { MP.tryPickup(game.level, game.player, game); return; }
      if (k === '1') { MP.useSmoke(game.level, game.player, game); return; }
      if (k === '2') { MP.useEMP(game.level, game); return; }
      return;
    }
    if (game.state === 'paused') {
      if (k === 'p') game.state = 'playing';
      return;
    }
    if (game.state === 'caught') {
      if (k === 'r') restartLevel();
      return;
    }
    if (game.state === 'levelwin') {
      if (k === 'enter') {
        if (game.levelIndex < 2) startLevel(game.levelIndex + 1);
        else game.state = 'gamewin';
      }
      return;
    }
    if (game.state === 'gamewin') {
      if (k === 'enter') { game.score = 0; game.totalScore = 0; startLevel(0); }
      return;
    }
  });
  window.addEventListener('keyup', function (e) {
    game.keys[e.key.toLowerCase()] = false;
  });
  canvas.addEventListener('mousedown', function (e) {
    if (game.state !== 'playing' || game.frozen) return;
    const rect = canvas.getBoundingClientRect();
    const tx = (e.clientX - rect.left) * (MP.W / rect.width);
    const ty = (e.clientY - rect.top) * (MP.H / rect.height);
    MP.throwCoin(game.level, game.player, game, tx, ty);
  });

  // ------------------------------------------------------------ update
  function update(dt) {
    if (game.state !== 'playing') return;
    game.t += dt;
    game.levelTime += dt;
    const p = game.player;
    const k = game.keys;
    let dx = 0, dy = 0;
    if (k['w'] || k['arrowup']) dy -= 1;
    if (k['s'] || k['arrowdown']) dy += 1;
    if (k['a'] || k['arrowleft']) dx -= 1;
    if (k['d'] || k['arrowright']) dx += 1;
    p.sneak = !!(k['shift']);
    if (dx !== 0 || dy !== 0) {
      const len = Math.hypot(dx, dy);
      const sp = p.sneak ? 95 : 190;
      const vx = (dx / len) * sp * dt;
      const vy = (dy / len) * sp * dt;
      p.dir = Math.atan2(dy, dx);
      MP.moveCircle(p, vx, vy, game.level);
      game.stepT -= dt;
      if (game.stepT <= 0) { game.stepT = p.sneak ? 0.55 : 0.34; MP.sfxStep(); }
    }
    const guardFull = MP.updateGuards(game.level, p, dt, game.t, game);
    const camFull = MP.updateCameras(game.level, p, dt, game.t, game);
    MP.updateTools(game.level, dt, game);
    // Alarm: naik saat terlihat penuh, turun pelan saat bersembunyi.
    if (guardFull) { game.alarm += 22 * dt; game.spotted = true; }
    if (camFull) { game.alarm += 32 * dt; game.spotted = true; }
    if (!guardFull && !camFull) game.alarm = Math.max(0, game.alarm - 6 * dt);
    game.alarm = Math.min(100, game.alarm);
    MP.sfxAlarmTick(dt, game.alarm);
    for (const pt of game.particles) {
      pt.ttl -= dt;
      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt;
    }
    game.particles = game.particles.filter(function (pt) { return pt.ttl > 0; });
    if (game.alarm >= 100) { caught(); return; }
    // Menang: artefak didapat + sampai pintu keluar.
    if (game.level.exitOpen && MP.circleHitsRect(p.x, p.y, p.r, game.level.exit)) {
      levelWin();
    }
  }

  // ------------------------------------------------------------ gambar
  function drawRoom(t) {
    const level = game.level;
    MP.drawFloor(ctx, level);
    MP.drawSpotlights(ctx, level);
    MP.drawExitDoor(ctx, level.exit, level.exitOpen);
    for (const c of level.cases) MP.drawCase(ctx, c);
    if (level.safe) MP.drawSafe(ctx, level.safe);
    for (const p of level.plants) MP.drawPlant(ctx, p);
    MP.drawPedestal(ctx, level.pedestal, t);
    MP.drawLoot(ctx, level, t);
    MP.drawGuards(ctx, level);
    MP.drawCameras(ctx, level);
    MP.drawPlayer(ctx, game.player, t);
    MP.drawTools(ctx, game);
    for (const pt of game.particles) {
      ctx.globalAlpha = Math.min(1, pt.ttl * 2);
      ctx.fillStyle = pt.color;
      ctx.beginPath(); ctx.arc(pt.x, pt.y, 3, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
    MP.drawVignette(ctx);
  }

  function draw() {
    ctx.fillStyle = '#0b0b10';
    ctx.fillRect(0, 0, MP.W, MP.H);
    const t = game.frozen ? 12.3 : game.t;
    if (game.state === 'menu') {
      drawRoom(t);
      MP.drawMenu(ctx, game);
      return;
    }
    drawRoom(t);
    MP.drawHUD(ctx, game);
    if (game.state === 'caught') MP.drawCaught(ctx, game);
    else if (game.state === 'levelwin') MP.drawLevelWin(ctx, game);
    else if (game.state === 'gamewin') MP.drawGameWin(ctx, game);
    else if (game.state === 'paused') MP.drawPaused(ctx);
  }

  // ------------------------------------------------------------ loop
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (!game.frozen) update(dt);
    draw();
    requestAnimationFrame(frame);
  }

  // ------------------------------------------------------------ mode shot
  function setupShot(shot, seed) {
    MP.shotSeed = seed;
    game.frozen = true;
    if (shot === 'menu') {
      game.level = MP.buildLevel(0, seed);
      game.state = 'menu';
      return;
    }
    if (shot === 'win') {
      startLevel(2);
      game.level.artifact.taken = true;
      game.level.exitOpen = true;
      game.artifactTaken = true;
      game.score = 1750;
      game.totalScore = 6420;
      game.breakdown = { loot: 1750, timeBonus: 640, ghostBonus: 500, levelScore: 2890, totalScore: 6420 };
      game.state = 'levelwin';
      return;
    }
    const idx = shot === 'level2' ? 1 : shot === 'level3' ? 2 : 0;
    startLevel(idx);
    const L = game.level;
    // Saka di tengah ruangan, semua elemen terlihat.
    if (idx === 0) {
      game.player.x = 640; game.player.y = 470; game.player.dir = -Math.PI / 2;
      L.guards[0].x = 640; L.guards[0].y = 300; L.guards[0].dir = 0;
      L.guards[1].x = 640; L.guards[1].y = 520; L.guards[1].dir = Math.PI;
      L.guards[2].x = 180; L.guards[2].y = 400; L.guards[2].dir = 0;
      L.cameras[0].angle = 0.7; L.cameras[1].angle = Math.PI - 0.7;
      game.alarm = 34;
    } else if (idx === 1) {
      game.player.x = 640; game.player.y = 430; game.player.dir = -Math.PI / 2;
      L.guards[0].x = 240; L.guards[0].y = 300; L.guards[0].dir = 0;
      L.guards[1].x = 640; L.guards[1].y = 400; L.guards[1].dir = Math.PI / 2;
      L.guards[2].x = 920; L.guards[2].y = 420; L.guards[2].dir = -Math.PI / 2;
      L.cameras[0].angle = 0.7; L.cameras[1].angle = Math.PI - 0.7; L.cameras[2].angle = Math.PI / 2;
      game.alarm = 28;
    } else {
      game.player.x = 640; game.player.y = 500; game.player.dir = -Math.PI / 2;
      L.guards[0].x = 640; L.guards[0].y = 140; L.guards[0].dir = 0;
      L.guards[1].x = 640; L.guards[1].y = 660; L.guards[1].dir = Math.PI;
      L.guards[2].x = 250; L.guards[2].y = 400; L.guards[2].dir = Math.PI / 2;
      L.guards[3].x = 1030; L.guards[3].y = 400; L.guards[3].dir = -Math.PI / 2;
      L.cameras[0].angle = 0.7; L.cameras[1].angle = Math.PI - 0.7; L.cameras[2].angle = -Math.PI / 2;
      game.alarm = 22;
    }
  }

  // ------------------------------------------------------------ mulai
  const params = new URLSearchParams(window.location.search);
  const shot = params.get('shot');
  const seed = Number(params.get('seed')) || 11;
  game.level = MP.buildLevel(0, seed);
  if (shot) setupShot(shot, seed);
  requestAnimationFrame(frame);

  // Hook untuk playtest otomatis.
  MP.debugState = function () {
    return {
      state: game.state,
      level: game.level ? game.level.name : null,
      levelIndex: game.levelIndex,
      alarm: Math.round(game.alarm * 10) / 10,
      score: game.score,
      totalScore: game.totalScore,
      coins: game.coins,
      smokeLeft: game.smokeLeft,
      empLeft: game.empLeft,
      player: { x: Math.round(game.player.x), y: Math.round(game.player.y) },
      artifactTaken: game.artifactTaken,
      exitOpen: game.level ? game.level.exitOpen : false,
      guards: game.level ? game.level.guards.map(function (g) { return { x: Math.round(g.x), y: Math.round(g.y), suspicion: Math.round(g.suspicion * 100) / 100 }; }) : [],
      cameras: game.level ? game.level.cameras.map(function (c) { return { off: Math.round(c.off * 10) / 10, suspicion: Math.round(c.suspicion * 100) / 100 }; }) : [],
      lootTaken: game.level ? game.level.loots.filter(function (l) { return l.taken; }).length : 0,
    };
  };
})();
