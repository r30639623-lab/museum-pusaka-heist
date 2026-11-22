// loot.js — artefak utama + loot kecil, dan pengambilan dengan tombol E.
(function () {
  const MP = window.MP;
  const PICKUP_R = 42;

  // Loot / artefak terdekat dalam jangkauan ambil, atau null.
  MP.nearestPickup = function (level, player) {
    let best = null, bestD = PICKUP_R;
    const consider = function (it, isArtifact) {
      const d = MP.dist(player.x, player.y, it.x, it.y);
      if (!it.taken && d < bestD) { bestD = d; best = { item: it, artifact: isArtifact }; }
    };
    for (const l of level.loots) consider(l, false);
    consider(level.artifact, true);
    return best;
  };

  // Ambil loot terdekat. Mengembalikan {item, artifact} atau null.
  MP.tryPickup = function (level, player, game) {
    const near = MP.nearestPickup(level, player);
    if (!near) return null;
    const it = near.item;
    it.taken = true;
    game.score += it.value;
    if (it.kind === 'koin') game.coins = Math.min(5, game.coins + 1);
    if (near.artifact) {
      level.exitOpen = true;
      game.artifactTaken = true;
    }
    MP.sfxPickup();
    game.addParticles(it.x, it.y, '#ffd76a', 14);
    return near;
  };

  MP.drawLoot = function (ctx, level, t) {
    for (const l of level.loots) {
      if (!l.taken) MP.drawLootIcon(ctx, l.kind, l.x, l.y, t, l.phase);
    }
    const a = level.artifact;
    if (!a.taken) {
      MP.drawArtifactIcon(ctx, a.name, a.x, a.y - 16, 1.6);
      ctx.fillStyle = 'rgba(255,220,110,0.9)';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(a.name.toUpperCase(), a.x, a.y + 26);
    }
  };
})();
