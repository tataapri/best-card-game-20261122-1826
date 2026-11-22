// deck.js — a small seeded random source and the draw pile it drives.
// The seed makes ?shot= demos and play-tests reproducible; real games use
// a seed from the clock, so every duel shuffles differently.

/** Mulberry32: a tiny deterministic PRNG from one 32-bit seed. */
export function makeRng(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A seed from the clock, for real games (demos pass their own seed). */
export function clockSeed() {
  return (Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0;
}

/** Fisher–Yates shuffle, in place, driven by the given rng. */
export function shuffle(deck, rng) {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

/** The most cards a hand may hold; draws past it are skipped. */
export const HAND_LIMIT = 7;

/** Draw n cards from a pile into a hand; reshuffles the discard when empty. */
export function drawCards(pile, discard, hand, n) {
  for (let k = 0; k < n; k++) {
    if (hand.length >= HAND_LIMIT) return;
    if (pile.length === 0) {
      if (discard.length === 0) return;
      pile.push(...discard.splice(0));
      shuffle(pile, makeRng((Date.now() ^ pile.length) >>> 0));
    }
    hand.push(pile.pop());
  }
}
