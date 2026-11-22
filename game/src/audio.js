// audio.js — suara prosedural WebAudio (tanpa file suara).
// Langkah, denting loot, koin, asap, EMP, alarm, sting tertangkap.
(function () {
  const MP = window.MP;
  let ctx = null;
  let alarmTimer = 0;

  function ac() {
    if (MP.muted) return null;
    if (!ctx) {
      try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; }
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function tone(freq, dur, type, vol, slideTo) {
    const a = ac();
    if (!a) return;
    const o = a.createOscillator();
    const g = a.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(freq, a.currentTime);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, a.currentTime + dur);
    g.gain.setValueAtTime(vol || 0.12, a.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + dur);
    o.connect(g); g.connect(a.destination);
    o.start();
    o.stop(a.currentTime + dur);
  }

  MP.sfxStep = function () { tone(140 + Math.random() * 40, 0.05, 'triangle', 0.05); };
  MP.sfxPickup = function () {
    tone(660, 0.09, 'sine', 0.14);
    setTimeout(function () { tone(880, 0.12, 'sine', 0.14); }, 70);
    setTimeout(function () { tone(1320, 0.16, 'sine', 0.12); }, 140);
  };
  MP.sfxCoin = function () { tone(1200, 0.06, 'square', 0.06, 900); };
  MP.sfxSmoke = function () { tone(300, 0.4, 'sawtooth', 0.08, 90); };
  MP.sfxEMP = function () { tone(900, 0.3, 'sawtooth', 0.1, 120); };
  MP.sfxCaught = function () {
    tone(220, 0.5, 'sawtooth', 0.16, 110);
    setTimeout(function () { tone(165, 0.7, 'sawtooth', 0.16, 82); }, 300);
  };
  MP.sfxWin = function () {
    const notes = [523, 659, 784, 1047];
    notes.forEach(function (f, i) {
      setTimeout(function () { tone(f, 0.22, 'sine', 0.14); }, i * 110);
    });
  };
  // Bunyi alarm berdenyut selagi meter tinggi.
  MP.sfxAlarmTick = function (dt, alarm) {
    if (alarm < 40) return;
    alarmTimer -= dt;
    if (alarmTimer <= 0) {
      alarmTimer = alarm > 75 ? 0.45 : 0.8;
      tone(alarm > 75 ? 980 : 740, 0.12, 'square', 0.07, alarm > 75 ? 700 : 620);
    }
  };
})();
