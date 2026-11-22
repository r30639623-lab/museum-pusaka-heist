// guards.js — patroli penjaga, vision cone kuning, dan deteksi.
// Cone menyentuh Saka -> "!" terisi 0,8 detik (tenggang adil) -> alarm naik.
(function () {
  const MP = window.MP;
  const RANGE = 230;
  const HALF = 0.61; // ~35 derajat ke tiap sisi
  const GRACE = 0.8; // detik tenggang sebelum alarm naik

  MP.updateGuards = function (level, player, dt, t, game) {
    let anyFull = false;
    for (const g of level.guards) {
      // --- gerak: selidiki koin, atau patroli antar waypoint ---
      if (g.investigate) {
        const tx = g.investigate.x, ty = g.investigate.y;
        const d = MP.dist(g.x, g.y, tx, ty);
        if (d > 8) {
          const sp = 115;
          g.dir = Math.atan2(ty - g.y, tx - g.x);
          MP.moveCircle(g, Math.cos(g.dir) * sp * dt, Math.sin(g.dir) * sp * dt, level);
        } else if (g.lookT > 0) {
          g.lookT -= dt;
          g.dir += Math.sin(t * 2.4) * dt * 1.2;
        } else {
          g.investigate = null;
        }
      } else if (g.pause > 0) {
        g.pause -= dt;
        // Menoleh saat berhenti di waypoint.
        const next = g.waypoints[g.wp];
        const base = Math.atan2(next[1] - g.y, next[0] - g.x);
        g.dir = base + Math.sin(t * 1.4 + g.scanT) * 0.6;
      } else {
        const wp = g.waypoints[g.wp];
        const d = MP.dist(g.x, g.y, wp[0], wp[1]);
        if (d < 6) {
          g.wp = (g.wp + 1) % g.waypoints.length;
          g.pause = 1.1;
        } else {
          g.dir = Math.atan2(wp[1] - g.y, wp[0] - g.x);
          MP.moveCircle(g, Math.cos(g.dir) * g.speed * dt, Math.sin(g.dir) * g.speed * dt, level);
        }
      }
      // --- deteksi ---
      const range = player.sneak ? RANGE * 0.65 : RANGE;
      const sees = !game.playerHidden() &&
        MP.canSee(g.x, g.y, g.dir, range, HALF, player.x, player.y, level);
      if (sees) {
        g.suspicion = Math.min(1, g.suspicion + dt / GRACE);
      } else {
        g.suspicion = Math.max(0, g.suspicion - dt * 2);
      }
      if (g.suspicion >= 1) anyFull = true;
    }
    return anyFull;
  };

  MP.drawGuards = function (ctx, level) {
    for (const g of level.guards) {
      MP.drawCone(ctx, g.x, g.y, g.dir, g.sneakRange || RANGE, HALF, '255,200,40', 0.15);
    }
    for (const g of level.guards) MP.drawGuard(ctx, g);
  };
})();
