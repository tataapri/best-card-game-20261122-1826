// ui.js — everything the player sees: the table, the cards, the overlays and
// the chronicle log. Cards are DOM, so they stay crisp and readable at any size.

import { ELEMENTS } from './cards.js';
import { MAX_LIFE } from './rules.js';

const $ = (id) => document.getElementById(id);

/** Build one face-up card element. `key` is the keyboard shortcut shown on it. */
export function cardElement(card, key = null) {
  const el = ELEMENTS[card.element];
  const div = document.createElement('div');
  div.className = `card el-${card.element}`;
  div.dataset.uid = card.uid;
  div.innerHTML =
    `<div class="cost">${card.cost}</div>` +
    `<div class="element-mark" style="color:${el.color}">${el.glyph}</div>` +
    `<div class="power">${card.power}</div>` +
    `<div class="suit-word">${el.name} · beats ${ELEMENTS[el.beats].name}</div>` +
    `<div class="name">${card.name}</div>` +
    `<div class="effect">${card.text}</div>` +
    (key !== null ? `<div class="key">${key}</div>` : '');
  return div;
}

/** Build one face-down card back for the opponent's hand. */
export function cardBackElement() {
  const div = document.createElement('div');
  div.className = 'card back';
  div.textContent = '✦';
  return div;
}

/** Render both fighters' life, mana and shield meters. */
export function renderFighters(state) {
  const set = (prefix, fighter) => {
    $(`${prefix}HpFill`).style.width = `${(fighter.hp / MAX_LIFE) * 100}%`;
    $(`${prefix}HpText`).textContent = `${fighter.hp} / ${MAX_LIFE} HP${fighter.shield > 0 ? ` · 🛡 ${fighter.shield}` : ''}`;
    $(`${prefix}Mana`).textContent = `◆ Mana ${fighter.mana}/${fighter.maxMana}`;
    $(`${prefix}Shield`).textContent = fighter.shield > 0 ? `🛡 Shield ${fighter.shield}` : '';
  };
  set('player', state.player);
  set('foe', state.foe);
  $('turnLabel').textContent = `Turn ${state.turn}`;
  $('phaseLabel').textContent =
    state.phase === 'won' ? 'You won!' :
    state.phase === 'lost' ? 'You lost' :
    state.active === 'player' ? 'Your move' : 'Warden is thinking…';
}

/** Render both hands. Player cards get click handlers and affordability marks. */
export function renderHands(state, onPlay) {
  const foeHand = $('foeHand');
  foeHand.replaceChildren();
  foeHand.classList.toggle('compact', state.foe.hand.length >= 7);
  for (const _card of state.foe.hand) foeHand.appendChild(cardBackElement());

  const playerHand = $('playerHand');
  playerHand.replaceChildren();
  playerHand.classList.toggle('compact', state.player.hand.length >= 7);
  state.player.hand.forEach((card, i) => {
    const el = cardElement(card, i + 1);
    const playable = state.phase === 'play' && state.active === 'player' && state.player.mana >= card.cost;
    el.classList.toggle('playable', playable);
    el.classList.toggle('unaffordable', !playable && state.active === 'player');
    el.tabIndex = 0;
    el.setAttribute('role', 'button');
    el.setAttribute('aria-label', `${card.name}, ${card.element}, cost ${card.cost}, power ${card.power}`);
    el.addEventListener('click', () => onPlay(card, el));
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onPlay(card, el);
      }
    });
    playerHand.appendChild(el);
  });
}

/** Show a played card in the arena, with a flip animation. */
export function showPlayed(side, card) {
  const zone = side === 'player' ? $('playerPlayed') : $('foePlayed');
  zone.replaceChildren();
  const el = cardElement(card);
  el.classList.add('flipped');
  zone.appendChild(el);
}

/** A floating damage/heal number over a fighter's panel. */
export function floatNumber(targetId, text, heal = false) {
  const anchor = $(targetId);
  const rect = anchor.getBoundingClientRect();
  const span = document.createElement('div');
  span.className = 'float-dmg' + (heal ? ' heal' : '');
  span.textContent = text;
  span.style.left = `${rect.left + rect.width / 2 - 20}px`;
  span.style.top = `${rect.top - 6}px`;
  document.body.appendChild(span);
  setTimeout(() => span.remove(), 1150);
}

/** Shake a fighter's panel when it takes damage. */
export function shakeFighter(side) {
  const el = side === 'player' ? $('playerFighter') : $('foeFighter');
  el.classList.remove('shake');
  void el.offsetWidth;
  el.classList.add('shake');
}

/** Announce a line in the middle of the arena, and in the chronicle. */
export function announce(text) {
  $('announce').textContent = text;
}

/** Flash the combo banner when a same-element card chains. */
export function showCombo(elementName) {
  const banner = $('comboBanner');
  banner.textContent = `COMBO! ${elementName} chains +2`;
  banner.classList.remove('pop');
  void banner.offsetWidth;
  banner.classList.add('pop');
  setTimeout(() => { banner.textContent = ''; }, 1600);
}

/** Append a line to the chronicle log (keeps the last 6). */
export function logLine(html, kind = '') {
  const log = $('log');
  const li = document.createElement('li');
  if (kind) li.className = kind;
  li.innerHTML = html;
  log.appendChild(li);
  while (log.children.length > 6) log.removeChild(log.firstChild);
}

/** The element legend shown on the title screen. */
export function legendHtml() {
  return Object.values(ELEMENTS)
    .map((e) => `<span class="leg"><span class="swatch" style="color:${e.color}">${e.glyph}</span> ${e.name} beats ${ELEMENTS[e.beats].name}</span>`)
    .join('');
}

/** Show the title screen overlay. */
export function showTitle() {
  const overlay = $('overlay');
  overlay.classList.remove('hidden');
  $('overlayKicker').textContent = 'A duel of cards · best played with mouse and keys';
  $('overlayTitle').textContent = 'EMBER COURT';
  $('overlayTitle').classList.remove('lost');
  $('overlayText').textContent =
    'You are the Lantern Bearer. The Warden of Embers holds the court — beat them to 0 life before they do the same to you. ' +
    'Each turn your mana grows: spend it on cards, chain the same element for combos, and strike with the element that beats theirs.';
  $('overlayStats').textContent = '30 life each · 24-card decks · mana grows to 8 · combos +2 · element advantage +2';
  $('legend').innerHTML = legendHtml();
  $('overlayBtn').textContent = 'Take your seat';
}

/** Show the win or loss screen overlay, with a flourish on a win. */
export function showEnd(state) {
  const won = state.phase === 'won';
  $('overlay').classList.remove('hidden');
  $('overlayKicker').textContent = won ? 'The court is yours' : 'The lantern goes out';
  const title = $('overlayTitle');
  title.textContent = won ? 'VICTORY' : 'DEFEAT';
  title.classList.toggle('lost', !won);
  $('overlayText').textContent = won
    ? 'The Warden bows and the embers settle. Your lantern burns brightest in the court tonight.'
    : 'The Warden keeps the court — this time. Study their plays, chain your elements, and challenge them again.';
  $('overlayStats').textContent =
    `Turns played: ${state.turn} · Your life: ${state.player.hp}/${MAX_LIFE} · Warden's life: ${state.foe.hp}/${MAX_LIFE}`;
  $('legend').innerHTML = '';
  $('overlayBtn').textContent = 'Play again';
  if (won) launchConfetti();
}

/** Hide the overlay and return to the table. */
export function hideOverlay() {
  $('overlay').classList.add('hidden');
}

/** A burst of falling confetti for a win. */
export function launchConfetti() {
  const box = $('confetti');
  box.replaceChildren();
  const colors = ['#e8b64c', '#e5484d', '#3e9bdc', '#46b96b', '#d99a3d', '#f4ead2'];
  for (let i = 0; i < 90; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetto';
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.background = colors[i % colors.length];
    piece.style.animationDuration = `${2.2 + Math.random() * 2}s`;
    piece.style.animationDelay = `${Math.random() * 0.9}s`;
    piece.style.transform = `rotate(${Math.random() * 360}deg)`;
    box.appendChild(piece);
  }
  setTimeout(() => box.replaceChildren(), 6000);
}
