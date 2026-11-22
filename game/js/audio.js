// audio.js — every sound is synthesised with WebAudio: no audio files, no
// network. Short blips for clicks and plays, a low thud for damage, a rising
// arpeggio for victory and a falling one for defeat.

let ctx = null;
let muted = false;

/** Lazily create the audio context on the first user gesture. */
function audioCtx() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

export function isMuted() {
  return muted;
}

export function toggleMute() {
  muted = !muted;
  return muted;
}

/** One oscillator note: frequency, seconds, shape and volume. */
function tone(freq, seconds, type = 'sine', volume = 0.12, when = 0) {
  if (muted) return;
  const ac = audioCtx();
  if (!ac) return;
  const t0 = ac.currentTime + when;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  gain.gain.setValueAtTime(0, t0);
  gain.gain.linearRampToValueAtTime(volume, t0 + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + seconds);
  osc.connect(gain).connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + seconds + 0.05);
}

export const sfx = {
  click() { tone(660, 0.06, 'triangle', 0.08); },
  deal() { tone(440, 0.08, 'triangle', 0.07); tone(554, 0.08, 'triangle', 0.06, 0.05); },
  play() { tone(523, 0.12, 'sine', 0.12); tone(784, 0.14, 'sine', 0.1, 0.07); },
  combo() { tone(659, 0.1, 'square', 0.06); tone(880, 0.12, 'square', 0.06, 0.06); tone(1175, 0.16, 'square', 0.06, 0.12); },
  hurt() { tone(110, 0.25, 'sawtooth', 0.14); tone(82, 0.3, 'sawtooth', 0.1, 0.05); },
  heal() { tone(523, 0.15, 'sine', 0.09); tone(659, 0.2, 'sine', 0.09, 0.08); },
  shield() { tone(330, 0.12, 'triangle', 0.09); tone(440, 0.14, 'triangle', 0.08, 0.06); },
  turn() { tone(392, 0.1, 'triangle', 0.08); },
  win() { [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, 0.35, 'triangle', 0.12, i * 0.11)); },
  lose() { [392, 330, 262, 196].forEach((f, i) => tone(f, 0.4, 'sine', 0.11, i * 0.14)); },
};
