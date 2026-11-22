// hud.js — HUD (alarm meter, loot, tools, timer, skor) + layar menu / menang / tertangkap.
(function () {
  const MP = window.MP;

  function alarmColor(v) {
    if (v < 40) return '#4caf50';
    if (v < 70) return '#ffb300';
    return '#e53935';
  }

  MP.drawHUD = function (ctx, game) {
    const level = game.level;
    // Panel atas.
    ctx.fillStyle = 'rgba(10,8,6,0.92)';
    ctx.fillRect(0, 0, MP.W, 64);
    ctx.strokeStyle = '#c9a24a';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, 63.5); ctx.lineTo(MP.W, 63.5); ctx.stroke();
    ctx.textAlign = 'left';
    ctx.fillStyle = '#e8c98a';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText(level.name.toUpperCase(), 20, 27);
    ctx.fillStyle = '#9a8a6a';
    ctx.font = '13px sans-serif';
    ctx.fillText(level.sub, 20, 48);
    // Alarm meter (tengah).
    const ax = 470, ay = 16, aw = 300, ah = 20;
    ctx.fillStyle = '#cfd8dc';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('ALARM', ax, ay + 14);
    ctx.fillStyle = '#1c1c1c';
    ctx.fillRect(ax + 62, ay, aw - 62, ah);
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 1;
    ctx.strokeRect(ax + 62.5, ay + 0.5, aw - 62, ah);
    const fillW = (aw - 62) * Math.min(1, game.alarm / 100);
    ctx.fillStyle = alarmColor(game.alarm);
    ctx.fillRect(ax + 62, ay, fillW, ah);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(Math.round(game.alarm) + '%', ax + 62 + (aw - 62) / 2, ay + 14.5);
    // Kanan: skor, waktu, loot, tools.
    ctx.textAlign = 'right';
    ctx.fillStyle = '#e8c98a';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('SKOR ' + game.score, 1260, 24);
    ctx.fillStyle = '#cfd8dc';
    ctx.font = '13px sans-serif';
    const mm = Math.floor(game.levelTime / 60);
    const ss = Math.floor(game.levelTime % 60);
    const lootGot = level.loots.filter(function (l) { return l.taken; }).length;
    ctx.fillText(
      'Waktu ' + mm + ':' + String(ss).padStart(2, '0') +
      '   Loot ' + lootGot + '/' + level.loots.length +
      '   Koin ' + game.coins + '   Asap ' + game.smokeLeft + '   EMP ' + game.empLeft,
      1260, 46,
    );
    // Petunjuk bawah.
    ctx.fillStyle = 'rgba(10,8,6,0.75)';
    ctx.fillRect(0, MP.H - 26, MP.W, 26);
    ctx.fillStyle = '#9a8a6a';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(
      'WASD / Panah gerak   •   Shift menyelinap   •   E ambil loot   •   Klik lempar koin   •   1 Bom Asap   •   2 EMP   •   P jeda   •   R ulang level   •   M bisu',
      MP.W / 2, MP.H - 9,
    );
    // Petunjuk ambil saat dekat loot.
    if (game.state === 'playing') {
      const near = MP.nearestPickup(level, game.player);
      if (near) {
        ctx.fillStyle = '#ffd76a';
        ctx.font = 'bold 15px sans-serif';
        ctx.textAlign = 'center';
        const label = near.artifact ? 'Tekan E — ambil ' + near.item.name : 'Tekan E — ambil ' + near.item.kind;
        ctx.fillText(label, game.player.x, game.player.y - 30);
      } else if (level.exitOpen) {
        ctx.fillStyle = '#7dff9b';
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Artefak didapat! Menuju pintu KELUAR →', MP.W / 2, 96);
      }
    }
  };

  function overlay(ctx, rgba) {
    ctx.fillStyle = rgba;
    ctx.fillRect(0, 0, MP.W, MP.H);
  }
  function title(ctx, text, y, color, size) {
    ctx.fillStyle = color;
    ctx.font = 'bold ' + size + 'px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText(text, MP.W / 2, y);
  }
  function line(ctx, text, y, color, size) {
    ctx.fillStyle = color || '#d8cdb4';
    ctx.font = (size || 16) + 'px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(text, MP.W / 2, y);
  }

  MP.drawMenu = function (ctx, game) {
    overlay(ctx, 'rgba(8,6,4,0.88)');
    title(ctx, 'MUSEUM PUSAKA', 150, '#e8c98a', 64);
    title(ctx, 'Pencurian Tengah Malam', 195, '#c9a24a', 26);
    line(ctx, 'Saka menyelinap ke Museum Pusaka Nusantara. Curi artefaknya,', 250);
    line(ctx, 'hindari cone kuning penjaga dan cone merah CCTV — alarm 100% berarti tertangkap.', 276);
    line(ctx, 'Tiga ruangan: Galeri Pusaka  •  Ruang Brankas  •  Kubah Mahkota', 316, '#ffd76a', 17);
    line(ctx, 'WASD / Panah — gerak      Shift — menyelinap (sulit terlihat)', 380, '#bfae8a', 15);
    line(ctx, 'E — ambil loot      Klik — lempar koin (alihkan penjaga)', 406, '#bfae8a', 15);
    line(ctx, '1 — Bom Asap (2/level)      2 — EMP (1/level, matikan kamera 5 detik)', 432, '#bfae8a', 15);
    line(ctx, 'P — jeda      R — ulang level      M — bisu', 458, '#bfae8a', 15);
    title(ctx, 'TEKAN 1 / 2 / 3 UNTUK MEMILIH LEVEL — LALU ENTER', 540, '#ffd76a', 20);
    for (let i = 0; i < 3; i++) {
      const x = 400 + i * 160;
      const sel = game.menuLevel === i;
      ctx.fillStyle = sel ? 'rgba(201,162,74,0.35)' : 'rgba(255,255,255,0.06)';
      ctx.fillRect(x, 580, 140, 84);
      ctx.strokeStyle = sel ? '#ffd76a' : '#6b5a3a';
      ctx.lineWidth = sel ? 3 : 1.5;
      ctx.strokeRect(x + 1, 580, 138, 82);
      ctx.fillStyle = '#e8c98a';
      ctx.font = 'bold 15px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText((i + 1) + '. ' + MP.LEVEL_DEFS[i].name, x + 70, 612);
      ctx.fillStyle = '#9a8a6a';
      ctx.font = '12px sans-serif';
      const shortSub = ['Aula pameran', 'Lorong brankas', 'Kubah bundar'][i];
      ctx.fillText(shortSub, x + 70, 636);
    }
    line(ctx, 'Game orisinal — digambar dengan canvas, tanpa aset luar.', 720, '#6b5a3a', 12);
  };

  MP.drawCaught = function (ctx, game) {
    overlay(ctx, 'rgba(40,4,4,0.82)');
    title(ctx, 'TERTANGKAP!', 300, '#ff5a4a', 72);
    line(ctx, 'Alarm mencapai 100%. Penjaga museum menangkap Saka di ' + game.level.name + '.', 360, '#f0b0a8', 18);
    line(ctx, 'Skor level ini hangus — tapi artefak yang sudah dicuri di level sebelumnya tetap aman.', 392);
    line(ctx, 'R — coba lagi level ini      M — menu utama', 470, '#ffd76a', 18);
  };

  MP.drawLevelWin = function (ctx, game) {
    const b = game.breakdown;
    overlay(ctx, 'rgba(6,20,10,0.85)');
    title(ctx, 'ARTEFAK DICURI!', 220, '#7dff9b', 56);
    line(ctx, game.level.name + ' berhasil — Saka lolos lewat pintu keluar.', 280, '#d8cdb4', 18);
    const rows = [
      ['Loot yang dicuri', b.loot],
      ['Bonus waktu', b.timeBonus],
      ['Bonus hantu (tanpa terdeteksi)', b.ghostBonus],
      ['Skor level', b.levelScore],
      ['Skor total', b.totalScore],
    ];
    rows.forEach(function (r, i) {
      const y = 350 + i * 34;
      ctx.fillStyle = i >= 3 ? '#ffd76a' : '#d8cdb4';
      ctx.font = (i >= 3 ? 'bold ' : '') + '18px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(r[0], 440, y);
      ctx.textAlign = 'right';
      ctx.fillText(String(r[1]), 840, y);
    });
    line(ctx, game.levelIndex < 2 ? 'ENTER — lanjut ke level berikut' : 'ENTER — lihat hasil akhir', 580, '#ffd76a', 20);
  };

  MP.drawGameWin = function (ctx, game) {
    overlay(ctx, 'rgba(6,20,10,0.88)');
    title(ctx, 'PENCURIAN SEMPURNA!', 240, '#ffd76a', 56);
    line(ctx, 'Saka mencuri Keris Pusaka, Prasasti Emas, dan Mahkota Pusaka —', 310, '#d8cdb4', 18);
    line(ctx, 'lalu menghilang ke dalam malam sebelum fajar menyingsing.', 338, '#d8cdb4', 18);
    title(ctx, 'SKOR AKHIR: ' + game.totalScore, 430, '#7dff9b', 36);
    line(ctx, game.totalScore >= 4500 ? 'Legenda museum. Tak satu pun penjaga sadar kau pernah ada.' :
      game.totalScore >= 3500 ? 'Pencurian yang rapi. Museum baru sadar keesokan paginya.' :
      'Lolos — tapi alarm sempat meraung-raung. Lain kali lebih senyap.', 490, '#bfae8a', 16);
    line(ctx, 'ENTER — main lagi dari level 1      M — menu utama', 580, '#ffd76a', 18);
  };

  MP.drawPaused = function (ctx) {
    overlay(ctx, 'rgba(0,0,0,0.6)');
    title(ctx, 'JEDA', 380, '#e8c98a', 56);
    line(ctx, 'P — lanjut main', 440, '#d8cdb4', 18);
  };
})();
