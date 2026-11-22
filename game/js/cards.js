// cards.js — the four elements, the card catalogue and what each card does.
// Ember Court is an original game: no names, art or rules are copied from any
// published card game. Elements are told apart by colour AND shape, never text alone.

/** The four elements, each with a colour, a shape glyph and the element it beats. */
export const ELEMENTS = {
  ember: { name: 'Ember', glyph: '▲', color: '#e5484d', beats: 'gale', weakTo: 'tide' },
  gale: { name: 'Gale', glyph: '◆', color: '#46b96b', beats: 'stone', weakTo: 'ember' },
  stone: { name: 'Stone', glyph: '■', color: '#d99a3d', beats: 'tide', weakTo: 'gale' },
  tide: { name: 'Tide', glyph: '●', color: '#3e9bdc', beats: 'ember', weakTo: 'stone' },
};

/** Card kinds and what they do on the table. */
export const KINDS = {
  strike: 'Deal damage to the opponent.',
  heavy: 'Deal heavy damage to the opponent.',
  guard: 'Gain shield that absorbs damage.',
  surge: 'Deal damage and draw a card.',
  mend: 'Restore your own life.',
  trick: 'Deal a little damage and draw a card. Costs nothing.',
};

/**
 * One card definition: id, display name, element, kind, mana cost, power and
 * one line of rules text. 24 distinct cards make one deck (6 per element).
 */
export const CARD_DEFS = [
  { id: 'ember-spark', name: 'Spark', element: 'ember', kind: 'strike', cost: 1, power: 4, text: 'Deal 4 damage.' },
  { id: 'ember-flare', name: 'Flare', element: 'ember', kind: 'heavy', cost: 3, power: 7, text: 'Deal 7 damage.' },
  { id: 'ember-ashwall', name: 'Ash Wall', element: 'ember', kind: 'guard', cost: 1, power: 5, text: 'Gain 5 shield.' },
  { id: 'ember-wildfire', name: 'Wildfire', element: 'ember', kind: 'surge', cost: 2, power: 3, text: 'Deal 3 damage. Draw a card.' },
  { id: 'ember-emberheart', name: 'Emberheart', element: 'ember', kind: 'mend', cost: 2, power: 5, text: 'Restore 5 life.' },
  { id: 'ember-cinder', name: 'Cinder', element: 'ember', kind: 'trick', cost: 0, power: 2, text: 'Deal 2 damage. Draw a card.' },
  { id: 'gale-gust', name: 'Gust', element: 'gale', kind: 'strike', cost: 1, power: 4, text: 'Deal 4 damage.' },
  { id: 'gale-tempest', name: 'Tempest', element: 'gale', kind: 'heavy', cost: 3, power: 7, text: 'Deal 7 damage.' },
  { id: 'gale-thicket', name: 'Thicket', element: 'gale', kind: 'guard', cost: 1, power: 5, text: 'Gain 5 shield.' },
  { id: 'gale-cyclone', name: 'Cyclone', element: 'gale', kind: 'surge', cost: 2, power: 3, text: 'Deal 3 damage. Draw a card.' },
  { id: 'gale-bloom', name: 'Bloom', element: 'gale', kind: 'mend', cost: 2, power: 5, text: 'Restore 5 life.' },
  { id: 'gale-zephyr', name: 'Zephyr', element: 'gale', kind: 'trick', cost: 0, power: 2, text: 'Deal 2 damage. Draw a card.' },
  { id: 'stone-pebble', name: 'Pebble', element: 'stone', kind: 'strike', cost: 1, power: 4, text: 'Deal 4 damage.' },
  { id: 'stone-avalanche', name: 'Avalanche', element: 'stone', kind: 'heavy', cost: 3, power: 7, text: 'Deal 7 damage.' },
  { id: 'stone-bulwark', name: 'Bulwark', element: 'stone', kind: 'guard', cost: 1, power: 5, text: 'Gain 5 shield.' },
  { id: 'stone-quake', name: 'Quake', element: 'stone', kind: 'surge', cost: 2, power: 3, text: 'Deal 3 damage. Draw a card.' },
  { id: 'stone-moss', name: 'Moss', element: 'stone', kind: 'mend', cost: 2, power: 5, text: 'Restore 5 life.' },
  { id: 'stone-shard', name: 'Shard', element: 'stone', kind: 'trick', cost: 0, power: 2, text: 'Deal 2 damage. Draw a card.' },
  { id: 'tide-ripple', name: 'Ripple', element: 'tide', kind: 'strike', cost: 1, power: 4, text: 'Deal 4 damage.' },
  { id: 'tide-deluge', name: 'Deluge', element: 'tide', kind: 'heavy', cost: 3, power: 7, text: 'Deal 7 damage.' },
  { id: 'tide-reef', name: 'Reef', element: 'tide', kind: 'guard', cost: 1, power: 5, text: 'Gain 5 shield.' },
  { id: 'tide-undertow', name: 'Undertow', element: 'tide', kind: 'surge', cost: 2, power: 3, text: 'Deal 3 damage. Draw a card.' },
  { id: 'tide-spring', name: 'Spring', element: 'tide', kind: 'mend', cost: 2, power: 5, text: 'Restore 5 life.' },
  { id: 'tide-droplet', name: 'Droplet', element: 'tide', kind: 'trick', cost: 0, power: 2, text: 'Deal 2 damage. Draw a card.' },
];

export const CARD_BY_ID = new Map(CARD_DEFS.map((c) => [c.id, c]));

/** How many distinct cards one deck holds (24: six per element). */
export const DECK_SIZE = CARD_DEFS.length;

/** A fresh deck: one copy of each of the 24 cards, in catalogue order. */
export function buildDeck() {
  return CARD_DEFS.map((def) => ({ ...def, uid: def.id }));
}

/** Damage bonus when the attacker's element beats the defender's last played element. */
export function elementAdvantage(attackerElement, defenderElement) {
  if (!attackerElement || !defenderElement) return 0;
  return ELEMENTS[attackerElement].beats === defenderElement ? 2 : 0;
}

/** The element a card's element beats, for the on-card hint line. */
export function beatsElement(element) {
  return ELEMENTS[element].beats;
}
