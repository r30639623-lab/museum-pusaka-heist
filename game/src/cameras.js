// cameras.js — CCTV dengan cone merah yang menyapu ruangan.
// Terlihat kamera -> alarm naik lebih cepat daripada terlihat penjaga.
(function () {
  const MP = window.MP;
  const GRACE = 0.4; // tenggang kamera lebih singkat: lebih berbahaya

  MP.updateCameras = function (level, player, dt, t, game) {
    let anyFull = false;
    for (const c of level.cameras) {
      c.angle = c.base + Math.sin(t * 0.7 + c.phase) * c.sweep;
      if (c.off > 0) {
        c.off -= dt;
        c.suspicion = 0;
        continue;
      }
      const range = player.sneak ? c.range * 0.65 : c.range;
      const sees = !game.playerHidden() &&
        MP.canSee(c.x, c.y, c.angle, range, c.half, player.x, player.y, level);
      if (sees) {
        c.suspicion = Math.min(1, c.suspicion + dt / GRACE);
      } else {
        c.suspicion = Math.max(0, c.suspicion - dt * 2);
      }
      if (c.suspicion >= 1) anyFull = true;
    }
    return anyFull;
  };

  MP.drawCameras = function (ctx, level) {
    for (const c of level.cameras) {
      if (c.off <= 0) MP.drawCone(ctx, c.x, c.y, c.angle, c.range, c.half, '255,60,50', 0.14);
    }
    for (const c of level.cameras) MP.drawCamera(ctx, c);
  };
})();
