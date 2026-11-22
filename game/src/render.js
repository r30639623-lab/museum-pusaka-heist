// render.js — helper gambar + matematika untuk Museum Pusaka.
// Semua gambar digambar dengan canvas, tanpa aset eksternal.
(function () {
  const MP = window.MP;
  MP.W = 1280;
  MP.H = 800;

  MP.clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  MP.dist = function (x1, y1, x2, y2) { return Math.hypot(x2 - x1, y2 - y1); };
  MP.angDiff = function (a, b) {
    let d = a - b;
    while (d > Math.PI) d -= 2 * Math.PI;
    while (d < -Math.PI) d += 2 * Math.PI;
    return d;
  };
  MP.mulberry32 = function (seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };
  MP.pointInRect = function (x, y, r) {
    return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
  };
  MP.circleHitsRect = function (cx, cy, cr, r) {
    const nx = MP.clamp(cx, r.x, r.x + r.w);
    const ny = MP.clamp(cy, r.y, r.y + r.h);
    return (cx - nx) * (cx - nx) + (cy - ny) * (cy - ny) < cr * cr;
  };
  MP.segHitsRect = function (x1, y1, x2, y2, r) {
    const d = MP.dist(x1, y1, x2, y2);
    const n = Math.max(1, Math.ceil(d / 10));
    for (let i = 1; i < n; i++) {
      const t = i / n;
      if (MP.pointInRect(x1 + (x2 - x1) * t, y1 + (y2 - y1) * t, r)) return true;
    }
    return false;
  };
  MP.segHitsCircle = function (x1, y1, x2, y2, cx, cy, cr) {
    const dx = x2 - x1, dy = y2 - y1;
    const len2 = dx * dx + dy * dy;
    let t = len2 ? ((cx - x1) * dx + (cy - y1) * dy) / len2 : 0;
    t = MP.clamp(t, 0, 1);
    const px = x1 + dx * t, py = y1 + dy * t;
    return (px - cx) * (px - cx) + (py - cy) * (py - cy) < cr * cr;
  };
  // Garis pandang bersih? (dinding, etalase, brankas, podium, tanaman menghalangi)
  MP.losClear = function (x1, y1, x2, y2, level) {
    for (const r of level.losRects) if (MP.segHitsRect(x1, y1, x2, y2, r)) return false;
    for (const p of level.plants) if (MP.segHitsCircle(x1, y1, x2, y2, p.x, p.y, p.r)) return false;
    return true;
  };
  MP.hitsAny = function (x, y, r, level) {
    for (const b of level.blockers) if (MP.circleHitsRect(x, y, r, b)) return true;
    return false;
  };
  // Gerak lingkaran dengan tabrakan, sumbu demi sumbu (bisa meluncur di dinding).
  MP.moveCircle = function (e, dx, dy, level) {
    const nx = e.x + dx;
    if (!MP.hitsAny(nx, e.y, e.r, level)) e.x = nx;
    const ny = e.y + dy;
    if (!MP.hitsAny(e.x, ny, e.r, level)) e.y = ny;
  };
  // Apakah pengamat di (x,y) menghadap dir bisa melihat titik (px,py)?
  MP.canSee = function (x, y, dir, range, half, px, py, level) {
    const d = MP.dist(x, y, px, py);
    if (d > range) return false;
    if (Math.abs(MP.angDiff(Math.atan2(py - y, px - x), dir)) > half) return false;
    return MP.losClear(x, y, px, py, level);
  };

  // ------------------------------------------------------------ gambar lantai
  MP.drawFloor = function (ctx, level) {
    ctx.fillStyle = '#241b13';
    ctx.fillRect(0, 64, MP.W, MP.H - 64);
    // Ubin lantai 64px, dua corak berselang-seling + nat gelap.
    for (let ty = 0; ty < 12; ty++) {
      for (let tx = 0; tx < 20; tx++) {
        const x = tx * 64, y = 64 + ty * 64;
        ctx.fillStyle = (tx + ty) % 2 === 0 ? '#271e15' : '#211811';
        ctx.fillRect(x, y, 64, 64);
        ctx.strokeStyle = 'rgba(0,0,0,0.28)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 0.5, y + 0.5, 64, 64);
      }
    }
    // Kilau lantai: garis pantul samar.
    ctx.strokeStyle = 'rgba(255,210,120,0.05)';
    ctx.lineWidth = 10;
    ctx.beginPath(); ctx.moveTo(120, 700); ctx.lineTo(1160, 180); ctx.stroke();
    // Karpet / permadani.
    for (const rug of level.rugs) {
      ctx.fillStyle = '#5c1d1d';
      ctx.fillRect(rug.x, rug.y, rug.w, rug.h);
      ctx.strokeStyle = '#c9a24a';
      ctx.lineWidth = 3;
      ctx.strokeRect(rug.x + 6, rug.y + 6, rug.w - 12, rug.h - 12);
      ctx.strokeStyle = 'rgba(201,162,74,0.5)';
      ctx.lineWidth = 1;
      ctx.strokeRect(rug.x + 14, rug.y + 14, rug.w - 28, rug.h - 28);
    }
    // Kubah level 3: lingkaran konsentris di lantai.
    if (level.dome) {
      ctx.strokeStyle = 'rgba(201,162,74,0.35)';
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(640, 400, 300, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = 'rgba(201,162,74,0.18)';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(640, 400, 240, 0, Math.PI * 2); ctx.stroke();
    }
  };

  MP.drawWalls = function (ctx, level) {
    for (const w of level.walls) {
      ctx.fillStyle = '#171008';
      ctx.fillRect(w.x, w.y, w.w, w.h);
      ctx.fillStyle = '#3a2a18';
      if (w.h <= 24) ctx.fillRect(w.x, w.y + w.h - 5, w.w, 5);
      else ctx.fillRect(w.x + w.w - 5, w.y, 5, w.h);
      ctx.strokeStyle = '#c9a24a';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(w.x + 1, w.y + 1, w.w - 2, w.h - 2);
    }
    // Lampu dinding hangat di dinding atas.
    for (const lx of [180, 460, 740, 1020]) {
      const g = ctx.createRadialGradient(lx, 82, 2, lx, 82, 70);
      g.addColorStop(0, 'rgba(255,200,110,0.5)');
      g.addColorStop(1, 'rgba(255,200,110,0)');
      ctx.fillStyle = g;
      ctx.fillRect(lx - 70, 64, 140, 90);
      ctx.fillStyle = '#ffd98a';
      ctx.beginPath(); ctx.arc(lx, 82, 4, 0, Math.PI * 2); ctx.fill();
    }
  };

  // Sorot lampu hangat di atas tiap etalase.
  MP.drawSpotlights = function (ctx, level) {
    for (const c of level.cases) {
      const cx = c.x + c.w / 2, cy = c.y + c.h / 2;
      const g = ctx.createRadialGradient(cx, cy, 8, cx, cy, 150);
      g.addColorStop(0, 'rgba(255,196,100,0.16)');
      g.addColorStop(1, 'rgba(255,196,100,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(cx, cy, 150, 0, Math.PI * 2); ctx.fill();
    }
  };

  MP.drawCase = function (ctx, c) {
    // Alas kayu gelap.
    ctx.fillStyle = '#2e2013';
    ctx.fillRect(c.x, c.y, c.w, c.h);
    ctx.strokeStyle = '#6b4d26';
    ctx.lineWidth = 2;
    ctx.strokeRect(c.x + 1, c.y + 1, c.w - 2, c.h - 2);
    // Kaca: panel biru bening dengan kilau diagonal.
    ctx.fillStyle = 'rgba(150,200,235,0.20)';
    ctx.fillRect(c.x + 8, c.y + 8, c.w - 16, c.h - 16);
    ctx.strokeStyle = 'rgba(200,230,255,0.55)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(c.x + 14, c.y + c.h - 10);
    ctx.lineTo(c.x + c.w - 30, c.y + 10);
    ctx.moveTo(c.x + 26, c.y + c.h - 10);
    ctx.lineTo(c.x + c.w - 18, c.y + 10);
    ctx.stroke();
    // Benda pameran kecil di dalam etalase.
    ctx.fillStyle = '#d8b25a';
    ctx.beginPath();
    ctx.arc(c.x + c.w / 2, c.y + c.h / 2, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#8a6a20';
    ctx.fillRect(c.x + c.w / 2 - 9, c.y + c.h / 2 + 5, 18, 4);
  };

  MP.drawPlant = function (ctx, p) {
    ctx.fillStyle = '#1d3319';
    ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#2e5226';
    ctx.beginPath(); ctx.arc(p.x - 7, p.y - 6, p.r * 0.55, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(p.x + 8, p.y + 5, p.r * 0.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#3f7031';
    ctx.beginPath(); ctx.arc(p.x + 2, p.y - 9, p.r * 0.35, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#6b4d26';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.stroke();
  };

  MP.drawSafe = function (ctx, s) {
    ctx.fillStyle = '#20262e';
    ctx.fillRect(s.x, s.y, s.w, s.h);
    ctx.strokeStyle = '#5a6672';
    ctx.lineWidth = 3;
    ctx.strokeRect(s.x + 2, s.y + 2, s.w - 4, s.h - 4);
    ctx.strokeStyle = '#39424c';
    ctx.lineWidth = 1;
    ctx.strokeRect(s.x + 14, s.y + 14, s.w - 28, s.h - 28);
    // Roda kombinasi + gagang.
    ctx.fillStyle = '#c9a24a';
    ctx.beginPath(); ctx.arc(s.x + s.w / 2, s.y + s.h / 2 - 20, 22, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#20262e';
    ctx.beginPath(); ctx.arc(s.x + s.w / 2, s.y + s.h / 2 - 20, 14, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#c9a24a';
    ctx.fillRect(s.x + s.w / 2 - 3, s.y + s.h / 2 - 42, 6, 44);
    ctx.fillStyle = '#8a94a0';
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('BRANKAS', s.x + s.w / 2, s.y + s.h - 26);
    ctx.fillStyle = '#5a6672';
    ctx.font = '12px sans-serif';
    ctx.fillText('No. 07 — Pusaka Nusantara', s.x + s.w / 2, s.y + s.h - 10);
  };

  MP.drawPedestal = function (ctx, ped, t) {
    const x = ped.x - ped.w / 2, y = ped.y - ped.h / 2;
    // Berkas cahaya dari atas.
    const beam = ctx.createLinearGradient(0, 64, 0, ped.y);
    beam.addColorStop(0, 'rgba(255,220,130,0.10)');
    beam.addColorStop(1, 'rgba(255,220,130,0.02)');
    ctx.fillStyle = beam;
    ctx.fillRect(ped.x - 26, 64, 52, ped.y - 64);
    // Podium batu.
    ctx.fillStyle = '#3d3a35';
    ctx.fillRect(x, y, ped.w, ped.h);
    ctx.fillStyle = '#57534c';
    ctx.fillRect(x, y, ped.w, 10);
    ctx.strokeStyle = '#c9a24a';
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 1, y + 1, ped.w - 2, ped.h - 2);
    // Cahaya berdenyut di atas podium.
    const pulse = 0.5 + 0.5 * Math.sin(t * 2.2);
    const g = ctx.createRadialGradient(ped.x, ped.y - 16, 4, ped.x, ped.y - 16, 60 + pulse * 22);
    g.addColorStop(0, 'rgba(255,215,110,0.55)');
    g.addColorStop(1, 'rgba(255,215,110,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(ped.x, ped.y - 16, 60 + pulse * 22, 0, Math.PI * 2); ctx.fill();
  };

  // Ikon artefak menurut namanya.
  MP.drawArtifactIcon = function (ctx, name, x, y, s) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    ctx.fillStyle = '#ffd76a';
    ctx.strokeStyle = '#8a6a20';
    ctx.lineWidth = 1.5;
    if (name === 'Keris Pusaka') {
      // Bilah keris melengkung + gagang.
      ctx.beginPath();
      ctx.moveTo(0, -16);
      ctx.quadraticCurveTo(10, -4, 2, 12);
      ctx.quadraticCurveTo(-2, 4, -6, -12);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#6b3a1a';
      ctx.fillRect(-2, 12, 4, 7);
    } else if (name === 'Prasasti Emas') {
      ctx.fillRect(-11, -14, 22, 28);
      ctx.strokeRect(-11, -14, 22, 28);
      ctx.strokeStyle = '#8a6a20';
      ctx.beginPath();
      ctx.moveTo(-6, -6); ctx.lineTo(6, -6);
      ctx.moveTo(-6, 0); ctx.lineTo(6, 0);
      ctx.moveTo(-6, 6); ctx.lineTo(2, 6);
      ctx.stroke();
    } else {
      // Mahkota Pusaka: mahkota zigzag + permata merah.
      ctx.beginPath();
      ctx.moveTo(-13, 10); ctx.lineTo(-13, -6); ctx.lineTo(-6, 2);
      ctx.lineTo(0, -12); ctx.lineTo(6, 2); ctx.lineTo(13, -6);
      ctx.lineTo(13, 10); ctx.closePath();
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#c22';
      ctx.beginPath(); ctx.arc(0, 2, 3, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  };

  MP.drawLootIcon = function (ctx, kind, x, y, t, phase) {
    const bob = Math.sin(t * 2 + phase) * 2;
    const glow = 0.45 + 0.35 * Math.sin(t * 3 + phase);
    const g = ctx.createRadialGradient(x, y + bob, 2, x, y + bob, 26);
    g.addColorStop(0, 'rgba(255,210,90,' + glow.toFixed(2) + ')');
    g.addColorStop(1, 'rgba(255,210,90,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(x, y + bob, 26, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffd76a';
    ctx.strokeStyle = '#8a6a20';
    ctx.lineWidth = 1.5;
    if (kind === 'vas') {
      ctx.beginPath();
      ctx.moveTo(x - 6, y + bob - 8);
      ctx.quadraticCurveTo(x - 10, y + bob + 6, x, y + bob + 9);
      ctx.quadraticCurveTo(x + 10, y + bob + 6, x + 6, y + bob - 8);
      ctx.closePath(); ctx.fill(); ctx.stroke();
    } else if (kind === 'permata') {
      ctx.beginPath();
      ctx.moveTo(x, y + bob - 10); ctx.lineTo(x + 8, y + bob);
      ctx.lineTo(x, y + bob + 10); ctx.lineTo(x - 8, y + bob);
      ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#bfe9ff';
      ctx.beginPath();
      ctx.moveTo(x, y + bob - 10); ctx.lineTo(x + 4, y + bob - 2); ctx.lineTo(x - 4, y + bob - 2);
      ctx.closePath(); ctx.fill();
    } else {
      ctx.beginPath(); ctx.arc(x, y + bob, 8, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#8a6a20';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Rp', x, y + bob + 3.5);
    }
  };

  MP.drawExitDoor = function (ctx, exit, open) {
    const g = ctx.createRadialGradient(exit.x + exit.w / 2, exit.y + exit.h / 2, 4,
      exit.x + exit.w / 2, exit.y + exit.h / 2, 90);
    if (open) {
      g.addColorStop(0, 'rgba(90,255,140,0.5)');
      g.addColorStop(1, 'rgba(90,255,140,0)');
    } else {
      g.addColorStop(0, 'rgba(255,80,60,0.25)');
      g.addColorStop(1, 'rgba(255,80,60,0)');
    }
    ctx.fillStyle = g;
    ctx.fillRect(exit.x - 70, exit.y - 40, exit.w + 140, exit.h + 80);
    ctx.fillStyle = open ? '#1d5c2e' : '#3a1414';
    ctx.fillRect(exit.x, exit.y, exit.w, exit.h);
    ctx.strokeStyle = open ? '#5aff8c' : '#c9a24a';
    ctx.lineWidth = 2;
    ctx.strokeRect(exit.x + 1, exit.y + 1, exit.w - 2, exit.h - 2);
    ctx.fillStyle = open ? '#b6ffc9' : '#e8c98a';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.save();
    ctx.translate(exit.x + exit.w / 2, exit.y + exit.h / 2);
    ctx.rotate(exit.x < 100 ? -Math.PI / 2 : Math.PI / 2);
    ctx.fillText(open ? 'KELUAR' : 'TERKUNCI', 0, 4);
    ctx.restore();
  };

  // Kerucut penglihatan (kuning penjaga / merah kamera).
  MP.drawCone = function (ctx, x, y, dir, range, half, rgb, alpha) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.arc(x, y, range, dir - half, dir + half);
    ctx.closePath();
    ctx.fillStyle = 'rgba(' + rgb + ',' + alpha + ')';
    ctx.fill();
    ctx.strokeStyle = 'rgba(' + rgb + ',0.4)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  };

  MP.drawGuard = function (ctx, g) {
    // Bayangan.
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath(); ctx.ellipse(g.x, g.y + 10, 13, 5, 0, 0, Math.PI * 2); ctx.fill();
    // Badan seragam biru gelap + topi.
    ctx.fillStyle = '#2c4a7a';
    ctx.beginPath(); ctx.arc(g.x, g.y, g.r, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#16233a';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#16233a';
    ctx.beginPath(); ctx.arc(g.x, g.y - 4, 8, Math.PI, 0); ctx.fill();
    // Arah hadap.
    ctx.strokeStyle = '#ffd76a';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(g.x, g.y);
    ctx.lineTo(g.x + Math.cos(g.dir) * 18, g.y + Math.sin(g.dir) * 18);
    ctx.stroke();
    // Tanda "!" saat mulai curiga.
    if (g.suspicion > 0.02) {
      ctx.font = 'bold ' + Math.round(16 + g.suspicion * 10) + 'px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(255,220,60,' + Math.min(1, g.suspicion * 1.4).toFixed(2) + ')';
      ctx.fillText('!', g.x, g.y - 22 - g.suspicion * 6);
    }
  };

  MP.drawCamera = function (ctx, c) {
    const off = c.off > 0;
    ctx.fillStyle = off ? '#3a3a3a' : '#c22';
    ctx.beginPath(); ctx.arc(c.x, c.y, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#22262c';
    ctx.save();
    ctx.translate(c.x, c.y);
    ctx.rotate(c.angle);
    ctx.fillRect(0, -5, 16, 10);
    ctx.restore();
    ctx.strokeStyle = '#5a6672';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(c.x, c.y, 9, 0, Math.PI * 2); ctx.stroke();
    if (off) {
      ctx.fillStyle = '#888';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('EMP ' + Math.ceil(c.off) + 's', c.x, c.y - 16);
    } else if (c.suspicion > 0.02) {
      ctx.fillStyle = 'rgba(255,60,50,' + Math.min(1, c.suspicion * 1.4).toFixed(2) + ')';
      ctx.font = 'bold 18px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('!', c.x, c.y - 18);
    }
  };

  MP.drawPlayer = function (ctx, p, t) {
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.beginPath(); ctx.ellipse(p.x, p.y + 10, 12, 5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = p.sneak ? 0.85 : 1;
    ctx.fillStyle = '#232733';
    ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#d8b25a';
    ctx.lineWidth = 2;
    ctx.stroke();
    // Tudung + arah hadap.
    ctx.fillStyle = '#31364a';
    ctx.beginPath(); ctx.arc(p.x, p.y - 2, 8, Math.PI, 0); ctx.fill();
    ctx.strokeStyle = '#e8c98a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(p.x + Math.cos(p.dir) * 16, p.y + Math.sin(p.dir) * 16);
    ctx.stroke();
    ctx.globalAlpha = 1;
    if (p.sneak) {
      ctx.fillStyle = 'rgba(200,220,255,0.8)';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('menyelinap', p.x, p.y - 20);
    }
  };

  MP.drawSmoke = function (ctx, s) {
    const a = Math.min(0.55, s.ttl * 0.2);
    const g = ctx.createRadialGradient(s.x, s.y, 4, s.x, s.y, s.r);
    g.addColorStop(0, 'rgba(200,200,210,' + a.toFixed(2) + ')');
    g.addColorStop(1, 'rgba(200,200,210,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
  };

  // Vignette malam: gelap di tepi layar.
  MP.drawVignette = function (ctx) {
    const g = ctx.createRadialGradient(640, 430, 260, 640, 430, 760);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(1, 'rgba(0,0,0,0.5)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 64, MP.W, MP.H - 64);
  };
})();
