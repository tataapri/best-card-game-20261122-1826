// rules.js — the duel itself: state, turns, damage, combos and win/loss.
// One duel: two fighters, 30 life each, a 24-card deck, mana that grows to 8.
// A card played after another card of the same element in the same turn is a
// combo and hits +2 harder. An element that beats the foe's last element hits +2.

import { buildDeck } from './cards.js';
import { drawCards, makeRng, shuffle } from './deck.js';

export const MAX_LIFE = 30;
export const MAX_MANA = 8;
export const START_HAND = 5;
export const COMBO_BONUS = 2;
export const ADVANTAGE_BONUS = 2;

/** A fighter: life, mana, shield, draw pile, hand and discard pile. */
export function newFighter() {
  return { hp: MAX_LIFE, maxHp: MAX_LIFE, mana: 0, maxMana: 0, shield: 0, deck: [], hand: [], discard: [] };
}

/** A fresh duel state. `seed` drives both shuffles so a demo can replay it. */
export function newGame(seed) {
  const rng = makeRng(seed);
  const state = {
    seed,
    phase: 'play', // 'play' | 'won' | 'lost'
    turn: 1,
    active: 'player', // whose move it is
    player: newFighter(),
    foe: newFighter(),
    playedThisTurn: [], // elements played this turn, for combos
    lastElement: { player: null, foe: null }, // last element each side played
    lastPlayed: { player: null, foe: null }, // last card each side played (shown in the arena)
    log: [],
    winner: null,
  };
  for (const side of [state.player, state.foe]) {
    side.deck = shuffle(buildDeck(), rng);
    drawCards(side.deck, side.discard, side.hand, START_HAND);
  }
  startTurn(state, 'player');
  return state;
}

/** Begin a side's turn: +1 max mana (to 8), refill mana, draw one card. */
export function startTurn(state, sideName) {
  const side = state[sideName];
  side.maxMana = Math.min(MAX_MANA, side.maxMana + 1);
  side.mana = side.maxMana;
  drawCards(side.deck, side.discard, side.hand, 1);
  state.playedThisTurn = [];
  state.active = sideName;
}

/** Can this side play this card right now? */
export function canPlay(state, sideName, card) {
  return (
    state.phase === 'play' &&
    state.active === sideName &&
    state[sideName].mana >= card.cost &&
    state[sideName].hand.includes(card)
  );
}

/**
 * Play a card: pay its cost, move it to the discard pile, apply its effect,
 * and return a report the UI narrates (damage dealt, shield gained, ...).
 */
export function playCard(state, sideName, card) {
  const me = state[sideName];
  const foe = state[sideName === 'player' ? 'foe' : 'player'];
  me.mana -= card.cost;
  me.hand.splice(me.hand.indexOf(card), 1);
  me.discard.push(card);

  const sameElement = state.playedThisTurn.filter((e) => e === card.element).length;
  const combo = sameElement > 0;
  state.playedThisTurn.push(card.element);
  // Element advantage: this card's element beats the foe's last played element.
  const foeSide = sideName === 'player' ? 'foe' : 'player';
  const foeLast = state.lastElement[foeSide];
  const beats = { ember: 'gale', gale: 'stone', stone: 'tide', tide: 'ember' };
  const advantage = foeLast !== null && beats[card.element] === foeLast;
  state.lastElement[sideName] = card.element;
  state.lastPlayed[sideName] = card;

  const report = { card, side: sideName, combo, advantage, damage: 0, blocked: 0, healed: 0, shield: 0, drew: 0 };
  const bonus = (combo ? COMBO_BONUS : 0) + (advantage ? ADVANTAGE_BONUS : 0);

  if (card.kind === 'strike' || card.kind === 'heavy' || card.kind === 'surge' || card.kind === 'trick') {
    const dealt = dealDamage(state, foe, card.power + bonus);
    report.damage = dealt.total;
    report.blocked = dealt.blocked;
  }
  if (card.kind === 'guard') {
    me.shield += card.power;
    report.shield = card.power;
  }
  if (card.kind === 'mend') {
    const healed = Math.min(card.power, me.maxHp - me.hp);
    me.hp += healed;
    report.healed = healed;
  }
  if (card.kind === 'surge' || card.kind === 'trick') {
    drawCards(me.deck, me.discard, me.hand, 1);
    report.drew = 1;
  }
  checkEnd(state);
  return report;
}

/** Damage through shield first, then life. Returns what landed and what the shield ate. */
export function dealDamage(state, target, amount) {
  const blocked = Math.min(target.shield, amount);
  target.shield -= blocked;
  const total = amount - blocked;
  target.hp = Math.max(0, target.hp - total);
  return { total, blocked };
}

/** End the current side's turn and start the other's. */
export function endTurn(state) {
  if (state.phase !== 'play') return;
  const next = state.active === 'player' ? 'foe' : 'player';
  if (next === 'player') state.turn += 1;
  startTurn(state, next);
}

/** Set the phase when a fighter's life hits zero. */
export function checkEnd(state) {
  if (state.foe.hp <= 0) {
    state.phase = 'won';
    state.winner = 'player';
  } else if (state.player.hp <= 0) {
    state.phase = 'lost';
    state.winner = 'foe';
  }
}

/** A one-line summary of the duel for the end screen. */
export function summary(state) {
  return `Turn ${state.turn} · You ${state.player.hp}/${MAX_LIFE} HP · Warden ${state.foe.hp}/${MAX_LIFE} HP`;
}
