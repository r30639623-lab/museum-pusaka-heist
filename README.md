[![make.fun · best-heist-game-20261122-0559](https://make.fun/badge/best-heist-game-20261122-0559.svg)](https://make.fun/bounty/best-heist-game-20261122-0559?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)
[![make.fun · best-heist-game-20261122-0559 · rank](https://make.fun/badge/best-heist-game-20261122-0559/r30639623-lab/museum-pusaka-heist/rank.svg)](https://make.fun/bounty/best-heist-game-20261122-0559/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)
[![make.fun · best-heist-game-20261122-0559 · reward](https://make.fun/badge/best-heist-game-20261122-0559/r30639623-lab/museum-pusaka-heist/reward.svg)](https://make.fun/bounty/best-heist-game-20261122-0559?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)

# Museum Pusaka: Pencurian Tengah Malam

Game pencurian top-down 2D orisinal untuk browser desktop. Saka menyelinap ke
**Museum Pusaka Nusantara** di tengah malam untuk mencuri tiga artefak —
Keris Pusaka, Prasasti Emas, dan Mahkota Pusaka — tanpa ketahuan.

## Cara main

- **WASD / Panah** — gerak. **Shift** — menyelinap (lambat, sulit terlihat).
- **E** — ambil loot / artefak saat dekat.
- **Klik mouse** — lempar koin untuk mengalihkan penjaga.
- **1** — Bom Asap (2 per level, menghalangi penglihatan 4 detik).
- **2** — EMP (1 per level, mematikan kamera 5 detik).
- **P** — jeda. **R** — ulang level. **M** — bisu.

## Aturan

- Penjaga berpatroli dengan **vision cone kuning**; kamera CCTV menyapu dengan
  **cone merah**. Cone menyentuhmu, tanda "!" terisi (0,8 detik tenggang),
  lalu **alarm naik**. Alarm 100% = tertangkap.
- Alarm turun perlahan saat kau bersembunyi di balik etalase, tanaman, atau asap.
- Ambil artefak utama, lalu kabur lewat pintu keluar yang terbuka.
- Loot kecil (vas, permata, koin) menambah skor. Bonus waktu + bonus hantu
  (tanpa pernah terdeteksi) dihitung di layar kemenangan tiap level.

## Level

1. **Galeri Pusaka** — aula pameran: etalase kaca, patung, tanaman hias.
2. **Ruang Brankas** — lorong sempit, brankas baja, kamera lebih banyak.
3. **Kubah Mahkota** — ruangan bundar, Mahkota Pusaka di podium tengah.

## Menjalankan

Buka `game/index.html` di browser desktop (tanpa server pun bisa, tanpa
jaringan). Semua gambar dan suara digambar/dibunyikan oleh kode sendiri
(canvas + WebAudio), tanpa aset eksternal.

## Struktur kode

- `game/src/main.js` — loop game, input, mesin state
- `game/src/levels.js` — tata letak 3 ruangan
- `game/src/guards.js` — patroli + vision cone + deteksi
- `game/src/cameras.js` — CCTV + cone merah
- `game/src/loot.js` — artefak + loot kecil + pengambilan
- `game/src/tools.js` — koin, bom asap, EMP
- `game/src/hud.js` — alarm meter + HUD + layar menu/menang/tertangkap
- `game/src/audio.js` — suara prosedural WebAudio
- `game/src/render.js` — helper gambar: lantai, etalase, sorot lampu

## Lisensi

MIT — lihat `LICENSE`.
