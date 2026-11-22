// shots.js — demo states for screenshots: the same game code renders each
// screen from a real duel state, so every screenshot is a render of the game
// itself. ?shot=title | play | win | loss, with an optional &seed= number.

import { newGame, playCard } from './rules.js';
import { drawCards } from './deck.js';

/**
 * Build the state for a ?shot= demo. Returns { state, showTitle }.
 * - title: a fresh duel behind the title overlay.
 * - play: a duel a few turns in, both hands full, life totals mid-fight.
 * - win: the Warden at 0 life with the victory screen up.
 * - loss: you at 0 life with the defeat screen up.
 */
export function demoState(shot, seed) {
  if (shot === 'title') {
    return { state: newGame(seed), showTitle: true };
  }
  if (shot === 'win') {
    const state = newGame(seed);
    state.foe.hp = 1;
    state.foe.mana = 3;
    state.foe.maxMana = 3;
    const finisher = state.player.hand.find((c) => c.kind === 'strike' || c.kind === 'heavy');
    if (finisher) playCard(state, 'player', finisher);
    if (state.phase !== 'won') state.foe.hp = 0;
    state.phase = 'won';
    state.winner = 'player';
    return { state, showTitle: false };
  }
  if (shot === 'loss') {
    const state = newGame(seed);
    state.player.hp = 2;
    // Let the Warden land the finishing blow through the real rules.
    state.active = 'foe';
    state.foe.mana = 8;
    state.foe.maxMana = 8;
    const finisher = state.foe.hand.find((c) => c.kind === 'heavy' || c.kind === 'strike');
    if (finisher) playCard(state, 'foe', finisher);
    if (state.phase !== 'lost') state.player.hp = 0;
    state.phase = 'lost';
    state.winner = 'foe';
    return { state, showTitle: false };
  }
  // play: simulate a few real turns so the table looks lived-in.
  const state = newGame(seed);
  const scripted = [
    ['player', 'strike'],
    ['foe', 'strike'],
    ['player', 'guard'],
    ['foe', 'surge'],
    ['player', 'mend'],
    ['foe', 'guard'],
  ];
  const demoLog = [];
  for (const [side, kind] of scripted) {
    if (state.phase !== 'play') break;
    state.active = side;
    state[side].mana = 8;
    state[side].maxMana = 8;
    const card = state[side].hand.find((c) => c.kind === kind);
    if (card) {
      const report = playCard(state, side, card);
      const who = side === 'player' ? '<b>You</b>' : '<b>Warden</b>';
      demoLog.push([`${who} play${side === 'player' ? '' : 's'} <b>${card.name}</b> — ${report.damage > 0 ? `deals ${report.damage} damage` : report.shield > 0 ? `gains ${report.shield} shield` : report.healed > 0 ? `restores ${report.healed} life` : 'draws a card'}.`, side === 'player' ? 'good' : 'bad']);
    }
  }
  // Top both hands back up so the table looks full, and set the turn to mid-duel.
  drawCards(state.player.deck, state.player.discard, state.player.hand, 3);
  drawCards(state.foe.deck, state.foe.discard, state.foe.hand, 3);
  state.active = 'player';
  state.player.mana = 5;
  state.player.maxMana = 5;
  state.foe.mana = 8;
  state.foe.maxMana = 8;
  state.turn = 3;
  state.demoLog = demoLog;
  return { state, showTitle: false };
}
