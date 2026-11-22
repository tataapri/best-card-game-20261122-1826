# Ember Court

[![make.fun](https://make.fun/badge/best-card-game-20261122-1826.svg)](https://make.fun/bounty/best-card-game-20261122-1826)
[![rank](https://make.fun/badge/best-card-game-20261122-1826/tataapri/best-card-game-20261122-1826/rank.svg)](https://make.fun/bounty/best-card-game-20261122-1826)
[![reward](https://make.fun/badge/best-card-game-20261122-1826/tataapri/best-card-game-20261122-1826/reward.svg)](https://make.fun/bounty/best-card-game-20261122-1826)

**Ember Court** is an original tactical card duel: you are the Lantern Bearer, and the
Warden of Embers holds the court. Reduce the Warden to 0 life before they do the same
to you. An entry for the [best-card-game-20261122-1826 bounty](https://make.fun/bounty/best-card-game-20261122-1826) on make.fun.

## How to play

- Each turn your mana grows by 1 (up to 8) and you draw a card. Spend mana to play cards, then press **End turn**.
- **Strike** cards deal damage; **Guard** cards give shield that absorbs damage; **Mend** restores life; **Surge** and **Trick** deal damage and draw a card.
- **Elements:** Ember ▲ beats Gale ◆, Gale beats Stone ■, Stone beats Tide ●, Tide beats Ember. Striking with the element that beats your opponent's last card deals **+2 damage**.
- **Combo:** playing two cards of the same element in one turn makes the second one hit **+2 harder**. Chain three and the table will tell you.
- The Warden plays by a readable plan — it heals when hurt, guards when threatened, and hits hardest with the element that beats your last card. Read its plays and counter them.

## Controls

- Click a card (or press **1–7**) to play it · **Enter** ends your turn · **M** mutes sound · **N** starts a new game.

## Run it

```sh
node serve.ts        # serves game/ at http://localhost:8080
```

No build step, no network requests: `game/` is plain static files that run offline in a desktop browser. All sounds are synthesised with WebAudio.

## Layout

- `game/index.html` — the table
- `game/style.css` — table, cards and screens
- `game/js/cards.js` — the four elements and the 24-card catalogue
- `game/js/deck.js` — seeded shuffle and draw pile
- `game/js/rules.js` — duel state, turns, damage, combos, win/loss
- `game/js/ai.js` — the Warden's heuristic
- `game/js/audio.js` — synthesised sound effects
- `game/js/ui.js` — DOM rendering, card animations, overlays
- `game/js/shots.js` — demo states for screenshots (`?shot=title|play|win|loss`)
- `game/js/main.js` — bootstrap and the turn loop
- `main.ts` — the make.fun entry program: copies `game/` + `screenshots/` to the output and writes `dossier.json`
