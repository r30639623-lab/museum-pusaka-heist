// tools.js — koin lempar, bom asap, EMP. Semua berbayar / terbatas per level.
(function () {
  const MP = window.MP;

  // Lempar koin ke titik (tx,ty): penjaga di sekitar titik itu pergi menyelidiki.
  MP.throwCoin = function (level, player, game, tx, ty) {
    if (game.coins <= 0) return false;
    const d = MP.dist(player.x, player.y, tx, ty);
    if (d > 340) return false;
    game.coins--;
    game.flyingCoins.push({ x: player.x, y: player.y, tx: tx, ty: ty, t: 0 });
    MP.sfxCoin();
    return true;
  };

  MP.landCoin = function (level, coin, game) {
    game.landedCoins.push({ x: coin.tx, y: coin.ty, ttl: 6 });
    for (const g of level.guards) {
      if (MP.dist(g.x, g.y, coin.tx, coin.ty) < 260) {
        g.investigate = { x: coin.tx, y: coin.ty };
        g.lookT = 2;
        g.suspicion = 0;
      }
    }
  };

  // Bom asap: 2 per level, menghalangi penglihatan 4 detik.
  MP.useSmoke = function (level, player, game) {
    if (game.smokeLeft <= 0) return false;
    game.smokeLeft--;
    game.smokes.push({ x: player.x, y: player.y, r: 95, ttl: 4 });
    MP.sfxSmoke();
    return true;
  };

  // EMP: 1 per level, mematikan semua kamera 5 detik.
  MP.useEMP = function (level, game) {
    if (game.empLeft <= 0) return false;
    game.empLeft--;
    for (const c of level.cameras) { c.off = 5; c.suspicion = 0; }
    MP.sfxEMP();
    return true;
  };

  MP.updateTools = function (level, dt, game) {
    for (const c of game.flyingCoins) {
      c.t += dt / 0.28;
      if (c.t >= 1) MP.landCoin(level, c, game);
    }
    game.flyingCoins = game.flyingCoins.filter(function (c) { return c.t < 1; });
    for (const c of game.landedCoins) c.ttl -= dt;
    game.landedCoins = game.landedCoins.filter(function (c) { return c.ttl > 0; });
    for (const s of game.smokes) s.ttl -= dt;
    game.smokes = game.smokes.filter(function (s) { return s.ttl > 0; });
  };

  MP.drawTools = function (ctx, game) {
    for (const s of game.smokes) MP.drawSmoke(ctx, s);
    for (const c of game.flyingCoins) {
      const x = c.x + (c.tx - c.x) * c.t;
      const y = c.y + (c.ty - c.y) * c.t - Math.sin(c.t * Math.PI) * 30;
      ctx.fillStyle = '#ffd76a';
      ctx.beginPath(); ctx.arc(x, y, 6, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#8a6a20';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
    for (const c of game.landedCoins) {
      ctx.globalAlpha = Math.min(1, c.ttl);
      ctx.fillStyle = '#ffd76a';
      ctx.beginPath(); ctx.arc(c.x, c.y, 6, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#8a6a20';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  };
})();
