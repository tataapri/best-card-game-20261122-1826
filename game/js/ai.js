// ai.js — the Warden's brain: a readable heuristic, not a black box.
// It plays its cards in a fixed priority order so a human can read its plan
// and counter it: heal when hurt, guard when threatened, then hit hard with
// the element that beats what you just played.

import { ELEMENTS } from './cards.js';
import { canPlay } from './rules.js';

/** Score one card for the Warden in this position; higher means play it sooner. */
export function scoreCard(state, card) {
  const foe = state.foe;
  const player = state.player;
  let score = card.power;

  if (card.kind === 'mend') {
    // Mend matters most when the Warden is hurt, and not at all when full.
    const missing = foe.maxHp - foe.hp;
    score = missing <= 0 ? -100 : card.power + missing * 0.6;
  }
  if (card.kind === 'guard') {
    // Guard when the player's hand looks dangerous, or when low on life.
    score = player.hand.length >= 4 || foe.hp <= 12 ? card.power + 3 : card.power - 2;
  }
  if (card.kind === 'strike' || card.kind === 'heavy' || card.kind === 'surge' || card.kind === 'trick') {
    // Favour the element that beats the player's last played card.
    const last = state.lastElement.player;
    if (last && ELEMENTS[card.element].beats === last) score += 4;
    // A heavy card that would finish the player jumps the queue.
    if (card.kind === 'heavy' && player.hp - player.shield <= card.power) score += 50;
    // Cheap damage early, heavy damage late: spend mana, never hoard it.
    if (card.cost >= 3 && foe.mana >= 6) score += 2;
  }
  if (card.kind === 'surge' || card.kind === 'trick') {
    // Drawing matters more when the Warden's hand is running dry.
    if (foe.hand.length <= 2) score += 3;
  }
  // Combo: a second card of the same element this turn hits +2 harder.
  if (state.playedThisTurn.includes(card.element)) score += 3;
  // Cost efficiency: prefer getting value out of every mana.
  score += card.power / Math.max(1, card.cost) * 0.2;
  return score;
}

/**
 * Pick the Warden's next card, or null when it should stop. The Warden plays
 * while it can afford a card worth playing, then ends its turn.
 */
export function chooseCard(state) {
  const playable = state.foe.hand.filter((c) => canPlay(state, 'foe', c));
  if (playable.length === 0) return null;
  let best = null;
  let bestScore = 0;
  for (const card of playable) {
    const s = scoreCard(state, card);
    if (s > bestScore) {
      best = card;
      bestScore = s;
    }
  }
  return best;
}

/** One sentence explaining a Warden play, for the chronicle log. */
export function narratePlay(report) {
  const { card } = report;
  const bits = [];
  if (report.damage > 0) bits.push(`deals ${report.damage} damage`);
  if (report.blocked > 0) bits.push(`${report.blocked} absorbed by shield`);
  if (report.shield > 0) bits.push(`gains ${report.shield} shield`);
  if (report.healed > 0) bits.push(`restores ${report.healed} life`);
  if (report.drew > 0) bits.push('draws a card');
  if (report.combo) bits.push('COMBO +2');
  if (report.advantage) bits.push('element advantage +2');
  return bits.length ? bits.join(' · ') : 'plays a quiet card';
}
