// main.js — bootstrap and the turn loop: wires the rules to the table, runs
// the Warden's turn card by card so its plays stay readable, and handles
// mouse and keyboard input.

import { newGame, playCard, endTurn, canPlay, summary } from './rules.js';
import { chooseCard, narratePlay } from './ai.js';
import { sfx, toggleMute, isMuted } from './audio.js';
import { clockSeed } from './deck.js';
import { demoState } from './shots.js';
import {
  renderFighters, renderHands, showPlayed, floatNumber, shakeFighter,
  announce, showCombo, logLine, showTitle, showEnd, hideOverlay,
} from './ui.js';

const $ = (id) => document.getElementById(id);

let state = null;
let aiTimer = null;
let shotMode = null;

/** Read the demo parameters: ?shot=title|play|win|loss and ?seed=. */
function readParams() {
  const q = new URLSearchParams(location.search);
  const shot = q.get('shot');
  const seed = Number(q.get('seed') || '0') || 7;
  return { shot: ['title', 'play', 'win', 'loss'].includes(shot) ? shot : null, seed };
}

/** Render the whole table from the current state. */
function render() {
  renderFighters(state);
  renderHands(state, onPlayCard);
  if (state.lastPlayed.player) showPlayed('player', state.lastPlayed.player);
  if (state.lastPlayed.foe) showPlayed('foe', state.lastPlayed.foe);
  $('endTurnBtn').disabled = !(state.phase === 'play' && state.active === 'player');
}

/** Narrate one played card in the chronicle and the arena. */
function narrate(report) {
  const who = report.side === 'player' ? '<b>You</b>' : '<b>Warden</b>';
  const elName = report.card.element;
  showPlayed(report.side, report.card);
  if (report.combo) showCombo(elName);
  const text = narratePlay(report);
  const line = `${who} play${report.side === 'player' ? '' : 's'} <b>${report.card.name}</b> — ${text}.`;
  logLine(line, report.side === 'player' ? 'good' : 'bad');
  announce(`${report.card.name} — ${text}`);
  if (report.damage > 0) {
    const target = report.side === 'player' ? 'foeFighter' : 'playerFighter';
    floatNumber(target, `-${report.damage}`);
    shakeFighter(report.side === 'player' ? 'foe' : 'player');
    sfx.hurt();
  } else if (report.healed > 0) {
    floatNumber(report.side === 'player' ? 'playerFighter' : 'foeFighter', `+${report.healed}`, true);
    sfx.heal();
  } else if (report.shield > 0) {
    floatNumber(report.side === 'player' ? 'playerFighter' : 'foeFighter', `+${report.shield} 🛡`, true);
    sfx.shield();
  } else {
    sfx.play();
  }
  if (report.combo) sfx.combo();
}

/** After any play, check for a win or loss and show the end screen. */
function afterPlay() {
  render();
  if (state.phase === 'won' || state.phase === 'lost') {
    setTimeout(() => {
      if (state.phase === 'won') sfx.win();
      else sfx.lose();
      logLine(state.phase === 'won'
        ? '<b>You win the court!</b> The Warden bows.'
        : '<b>The Warden wins.</b> Your lantern goes out.', state.phase === 'won' ? 'good' : 'bad');
      showEnd(state);
    }, 650);
  }
}

/** The player clicked (or keyed) a card. */
function onPlayCard(card) {
  if (!state || state.phase !== 'play' || state.active !== 'player') return;
  if (!canPlay(state, 'player', card)) {
    announce('Not enough mana for that card.');
    return;
  }
  const report = playCard(state, 'player', card);
  narrate(report);
  afterPlay();
}

/** The player ends their turn; the Warden then plays, one card at a time. */
function onEndTurn() {
  if (!state || state.phase !== 'play' || state.active !== 'player') return;
  sfx.turn();
  logLine('<b>You</b> end your turn.');
  endTurn(state);
  render();
  runAiTurn();
}

/** The Warden's turn: play a card every 850 ms until it stops, then pass back. */
function runAiTurn() {
  clearTimeout(aiTimer);
  const step = () => {
    if (!state || state.phase !== 'play' || state.active !== 'foe') return;
    const card = chooseCard(state);
    if (!card) {
      logLine('<b>Warden</b> ends their turn.');
      endTurn(state);
      sfx.turn();
      render();
      return;
    }
    const report = playCard(state, 'foe', card);
    narrate(report);
    if (state.phase !== 'play') {
      afterPlay();
      return;
    }
    render();
    aiTimer = setTimeout(step, 850);
  };
  aiTimer = setTimeout(step, 700);
}

/** Start a brand-new duel. */
function newDuel() {
  clearTimeout(aiTimer);
  state = newGame(clockSeed());
  logLine('A new duel begins. <b>You</b> hold the lantern; the <b>Warden</b> holds the court.');
  hideOverlay();
  render();
}

/** Wire buttons and keys. */
function wireInput() {
  $('endTurnBtn').addEventListener('click', onEndTurn);
  $('newBtn').addEventListener('click', () => { sfx.click(); newDuel(); });
  $('muteBtn').addEventListener('click', () => {
    const m = toggleMute();
    $('muteBtn').textContent = m ? 'Sound: Off' : 'Sound: On';
  });
  $('overlayBtn').addEventListener('click', () => {
    sfx.click();
    if (state && state.phase === 'play' && shotMode === 'title') {
      hideOverlay();
      render();
      return;
    }
    newDuel();
  });
  document.addEventListener('keydown', (e) => {
    if (!state) return;
    if (e.key >= '1' && e.key <= '7') {
      const card = state.player.hand[Number(e.key) - 1];
      if (card) onPlayCard(card);
    } else if (e.key === 'Enter') {
      onEndTurn();
    } else if (e.key === 'm' || e.key === 'M') {
      const m = toggleMute();
      $('muteBtn').textContent = m ? 'Sound: Off' : 'Sound: On';
    } else if (e.key === 'n' || e.key === 'N') {
      newDuel();
    }
  });
}

/** Boot: a demo state for ?shot=, else the title screen over a fresh duel. */
function boot() {
  wireInput();
  const { shot, seed } = readParams();
  shotMode = shot;
  if (shot) {
    const demo = demoState(shot, seed);
    state = demo.state;
    render();
    if (demo.showTitle) {
      showTitle();
    } else if (state.phase === 'won' || state.phase === 'lost') {
      showEnd(state);
    } else {
      if (state.demoLog) for (const [html, kind] of state.demoLog) logLine(html, kind);
      logLine('The court is set. <b>You</b> move first — play a card or end your turn.');
      announce('Your move — play a card.');
    }
    return;
  }
  state = newGame(clockSeed());
  render();
  showTitle();
}

boot();
