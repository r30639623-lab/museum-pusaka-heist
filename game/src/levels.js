// levels.js — tata letak 3 ruangan Museum Pusaka Nusantara.
// Tiap ruangan muat penuh dalam satu frame 1280x800 (area main y 80..784).
(function () {
  const MP = window.MP;
  const OUTER = [
    { x: 0, y: 64, w: 1280, h: 16 },    // atas (di bawah HUD)
    { x: 0, y: 784, w: 1280, h: 16 },   // bawah
    { x: 0, y: 64, w: 16, h: 736 },     // kiri
    { x: 1264, y: 64, w: 16, h: 736 },  // kanan
  ];

  MP.LEVEL_DEFS = [
    {
      name: 'Galeri Pusaka',
      sub: 'Level 1 — Aula pameran utama',
      walls: OUTER.slice(),
      cases: [
        { x: 200, y: 170, w: 170, h: 70 }, { x: 555, y: 170, w: 170, h: 70 }, { x: 910, y: 170, w: 170, h: 70 },
        { x: 200, y: 560, w: 170, h: 70 }, { x: 555, y: 560, w: 170, h: 70 }, { x: 910, y: 560, w: 170, h: 70 },
      ],
      plants: [
        { x: 70, y: 130, r: 26 }, { x: 1210, y: 130, r: 26 },
        { x: 70, y: 730, r: 26 }, { x: 1210, y: 730, r: 26 },
      ],
      rugs: [{ x: 440, y: 300, w: 400, h: 200 }],
      pedestal: { x: 640, y: 400, w: 80, h: 80 },
      guards: [
        { waypoints: [[220, 300], [1060, 300]], speed: 65 },
        { waypoints: [[220, 520], [1060, 520]], speed: 65 },
        { waypoints: [[180, 180], [180, 640]], speed: 60 },
      ],
      cameras: [
        { x: 40, y: 100, base: 0.7, sweep: 0.5 },
        { x: 1240, y: 100, base: Math.PI - 0.7, sweep: 0.5 },
      ],
      loot: [
        { x: 380, y: 300, kind: 'vas', value: 150 },
        { x: 900, y: 300, kind: 'permata', value: 300 },
        { x: 380, y: 520, kind: 'koin', value: 50 },
        { x: 900, y: 520, kind: 'permata', value: 300 },
        { x: 640, y: 640, kind: 'vas', value: 150 },
      ],
      artifact: { x: 640, y: 400, name: 'Keris Pusaka', value: 1000 },
      exit: { x: 1240, y: 370, w: 24, h: 70 },
      start: { x: 640, y: 720 },
    },
    {
      name: 'Ruang Brankas',
      sub: 'Level 2 — Lorong sempit & brankas baja',
      walls: OUTER.concat([
        { x: 400, y: 80, w: 24, h: 280 },
        { x: 400, y: 500, w: 24, h: 284 },
        { x: 856, y: 80, w: 24, h: 280 },
        { x: 856, y: 500, w: 24, h: 284 },
      ]),
      cases: [
        { x: 120, y: 170, w: 150, h: 70 },
        { x: 120, y: 560, w: 150, h: 70 },
        { x: 700, y: 170, w: 150, h: 70 },
      ],
      plants: [
        { x: 70, y: 730, r: 26 }, { x: 1210, y: 130, r: 26 },
      ],
      rugs: [],
      safe: { x: 980, y: 300, w: 200, h: 200 },
      pedestal: { x: 950, y: 400, w: 70, h: 70 },
      guards: [
        { waypoints: [[120, 300], [360, 300]], speed: 70 },
        { waypoints: [[640, 150], [640, 640]], speed: 70 },
        { waypoints: [[920, 220], [920, 620]], speed: 65 },
      ],
      cameras: [
        { x: 40, y: 100, base: 0.7, sweep: 0.5 },
        { x: 1240, y: 100, base: Math.PI - 0.7, sweep: 0.5 },
        { x: 640, y: 100, base: Math.PI / 2, sweep: 0.6 },
      ],
      loot: [
        { x: 200, y: 650, kind: 'koin', value: 50 },
        { x: 700, y: 700, kind: 'vas', value: 150 },
        { x: 1150, y: 650, kind: 'permata', value: 300 },
        { x: 640, y: 300, kind: 'koin', value: 50 },
      ],
      artifact: { x: 950, y: 400, name: 'Prasasti Emas', value: 1000 },
      exit: { x: 16, y: 700, w: 24, h: 70 },
      start: { x: 640, y: 720 },
    },
    {
      name: 'Kubah Mahkota',
      sub: 'Level 3 — Ruangan bundar, Mahkota Pusaka di tengah',
      walls: OUTER.slice(),
      cases: [
        { x: 380, y: 195, w: 100, h: 70 }, { x: 800, y: 195, w: 100, h: 70 },
        { x: 380, y: 535, w: 100, h: 70 }, { x: 800, y: 535, w: 100, h: 70 },
      ],
      plants: [
        { x: 250, y: 200, r: 26 }, { x: 1030, y: 200, r: 26 },
        { x: 250, y: 600, r: 26 }, { x: 1030, y: 600, r: 26 },
      ],
      rugs: [],
      dome: true,
      pedestal: { x: 640, y: 400, w: 90, h: 90 },
      guards: [
        { waypoints: [[250, 140], [1030, 140]], speed: 75 },
        { waypoints: [[250, 660], [1030, 660]], speed: 75 },
        { waypoints: [[250, 140], [250, 660]], speed: 70 },
        { waypoints: [[1030, 140], [1030, 660]], speed: 70 },
      ],
      cameras: [
        { x: 40, y: 100, base: 0.7, sweep: 0.5 },
        { x: 1240, y: 100, base: Math.PI - 0.7, sweep: 0.5 },
        { x: 640, y: 762, base: -Math.PI / 2, sweep: 0.5 },
      ],
      loot: [
        { x: 640, y: 250, kind: 'permata', value: 300 },
        { x: 400, y: 400, kind: 'koin', value: 50 },
        { x: 880, y: 400, kind: 'vas', value: 150 },
        { x: 640, y: 560, kind: 'permata', value: 300 },
      ],
      artifact: { x: 640, y: 400, name: 'Mahkota Pusaka', value: 1000 },
      exit: { x: 1240, y: 370, w: 24, h: 70 },
      start: { x: 640, y: 720 },
    },
  ];

  // Bangun state runtime sebuah level dari definisinya (seed menentukan
  // fase denyut loot saja; tata letak selalu sama dan deterministik).
  MP.buildLevel = function (i, seed) {
    const def = MP.LEVEL_DEFS[i];
    const rng = MP.mulberry32(seed || 11);
    const level = {
      index: i, name: def.name, sub: def.sub,
      walls: def.walls, cases: def.cases, plants: def.plants,
      rugs: def.rugs || [], dome: !!def.dome,
      safe: def.safe || null, pedestal: def.pedestal,
      exit: def.exit, start: def.start, exitOpen: false,
    };
    const pedRect = {
      x: def.pedestal.x - def.pedestal.w / 2, y: def.pedestal.y - def.pedestal.h / 2,
      w: def.pedestal.w, h: def.pedestal.h,
    };
    level.blockers = level.walls.concat(
      level.cases.map(function (c) { return { x: c.x, y: c.y, w: c.w, h: c.h }; }),
      level.safe ? [level.safe] : [],
      [pedRect],
    );
    level.losRects = level.blockers;
    level.guards = def.guards.map(function (g) {
      return {
        x: g.waypoints[0][0], y: g.waypoints[0][1], r: 14,
        waypoints: g.waypoints, wp: 1, speed: g.speed || 65,
        dir: 0, pause: 0, suspicion: 0,
        investigate: null, lookT: 0, scanT: rng() * 6,
      };
    });
    level.cameras = def.cameras.map(function (c) {
      return {
        x: c.x, y: c.y, base: c.base, sweep: c.sweep,
        range: 280, half: 0.5, angle: c.base,
        suspicion: 0, off: 0, phase: rng() * 6,
      };
    });
    level.loots = def.loot.map(function (l) {
      return { x: l.x, y: l.y, kind: l.kind, value: l.value, taken: false, phase: rng() * 6.28 };
    });
    level.artifact = {
      x: def.artifact.x, y: def.artifact.y,
      name: def.artifact.name, value: def.artifact.value, taken: false,
    };
    return level;
  };
})();
