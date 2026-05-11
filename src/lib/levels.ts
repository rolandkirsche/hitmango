import { Level } from './types';

// Column/row shorthands used across levels
// cols: 80 210 340 470 600 730
// rows: 175 300 425 (3-row) | 175 258 342 425 (4-row)

export const levels: Level[] = [
  // ── 01 ─────────────────────────────────────────────────────────────────────
  {
    id: 1,
    name: 'The Alley',
    // Linear corridor — one patrol bounces at far end.
    // Solution: s→a → a→b(kill) → b→c → c→d → d→ex  (5 moves)
    nodes: [
      { id: 's',   x:  80, y: 300 },
      { id: 'a',   x: 210, y: 300 },
      { id: 'b',   x: 340, y: 300 },
      { id: 'c',   x: 470, y: 300 },
      { id: 'd',   x: 600, y: 300 },
      { id: 'ex',  x: 730, y: 300 },
      { id: 'dead',x: 340, y: 425 },
    ],
    edges: [
      { from: 's',  to: 'a'   },
      { from: 'a',  to: 'b'   },
      { from: 'b',  to: 'c'   },
      { from: 'c',  to: 'd'   },
      { from: 'd',  to: 'ex'  },
      { from: 'b',  to: 'dead'},
    ],
    playerStart: 's',
    exit: 'ex',
    enemies: [
      // starts at c (index=1), bounces toward b on T1
      { id: 'g1', type: 'patrol', path: ['b', 'c'], startIndex: 1 },
    ],
  },

  // ── 02 ─────────────────────────────────────────────────────────────────────
  {
    id: 2,
    name: 'The Junction',
    // Cross-shaped. Two kills required: patrol then stationary.
    // Solution: s→a → a→b(kill g1) → b→d(kill g2) → d→ex  (4 moves)
    nodes: [
      { id: 's',  x:  80, y: 300 },
      { id: 'a',  x: 210, y: 300 },
      { id: 'b',  x: 340, y: 300 },
      { id: 'c',  x: 340, y: 425 },
      { id: 'd',  x: 470, y: 300 },
      { id: 'e',  x: 470, y: 425 },
      { id: 'top',x: 340, y: 175 },
      { id: 'ex', x: 600, y: 300 },
    ],
    edges: [
      { from: 's',   to: 'a'   },
      { from: 'a',   to: 'b'   },
      { from: 'b',   to: 'c'   },
      { from: 'b',   to: 'd'   },
      { from: 'b',   to: 'top' },
      { from: 'd',   to: 'e'   },
      { from: 'd',   to: 'ex'  },
    ],
    playerStart: 's',
    exit: 'ex',
    enemies: [
      { id: 'g1', type: 'patrol',     path: ['b', 'c'],  startIndex: 1 },
      { id: 'g2', type: 'stationary', path: ['d'],       startIndex: 0 },
    ],
  },

  // ── 03 ─────────────────────────────────────────────────────────────────────
  {
    id: 3,
    name: 'The Garden',
    // Introduces bush cover. Guard patrols through b(bush).
    // Patrol lands on bush while player hides there — player survives.
    // Solution: s→a → a→b(bush,safe!) → b→c → c→d(kill g2) → d→ex  (5 moves)
    nodes: [
      { id: 's',  x:  80, y: 300 },
      { id: 'a',  x: 210, y: 300 },
      { id: 'b',  x: 340, y: 300, isBush: true },
      { id: 'c',  x: 470, y: 300 },
      { id: 'd',  x: 600, y: 300 },
      { id: 'ex', x: 730, y: 300 },
      { id: 'bt', x: 340, y: 175, isBush: true },
      { id: 'bb', x: 340, y: 425 },
    ],
    edges: [
      { from: 's',  to: 'a'  },
      { from: 'a',  to: 'b'  },
      { from: 'b',  to: 'c'  },
      { from: 'c',  to: 'd'  },
      { from: 'd',  to: 'ex' },
      { from: 'b',  to: 'bt' },
      { from: 'b',  to: 'bb' },
    ],
    playerStart: 's',
    exit: 'ex',
    enemies: [
      // at b (index=1, dir=1) — bounces to c first, then back through bush
      { id: 'g1', type: 'patrol',     path: ['a', 'b', 'c'], startIndex: 1 },
      { id: 'g2', type: 'stationary', path: ['d'],           startIndex: 0 },
    ],
  },

  // ── 04 ─────────────────────────────────────────────────────────────────────
  {
    id: 4,
    name: 'The Warehouse',
    // 3×3 grid. Guards on top and bottom rows; middle route + kills needed.
    // Solution: s→d → d→e(kill g3) → e→f → f→j(kill g4) → j→ex  (5 moves)
    nodes: [
      { id: 's',  x:  80, y: 300 },
      { id: 'a',  x: 210, y: 175 },
      { id: 'b',  x: 340, y: 175 },
      { id: 'c',  x: 470, y: 175 },
      { id: 'd',  x: 210, y: 300 },
      { id: 'e',  x: 340, y: 300 },
      { id: 'f',  x: 470, y: 300 },
      { id: 'g',  x: 210, y: 425 },
      { id: 'h',  x: 340, y: 425 },
      { id: 'i',  x: 470, y: 425 },
      { id: 'j',  x: 600, y: 300 },
      { id: 'ex', x: 730, y: 300 },
    ],
    edges: [
      { from: 's', to: 'd'  },
      { from: 'a', to: 'b'  }, { from: 'b', to: 'c'  },
      { from: 'd', to: 'e'  }, { from: 'e', to: 'f'  },
      { from: 'g', to: 'h'  }, { from: 'h', to: 'i'  },
      { from: 'a', to: 'd'  }, { from: 'b', to: 'e'  }, { from: 'c', to: 'f'  },
      { from: 'd', to: 'g'  }, { from: 'e', to: 'h'  }, { from: 'f', to: 'i'  },
      { from: 'f', to: 'j'  }, { from: 'j', to: 'ex' },
    ],
    playerStart: 's',
    exit: 'ex',
    enemies: [
      { id: 'g1', type: 'patrol',     path: ['a', 'b', 'c'], startIndex: 0 },
      { id: 'g2', type: 'patrol',     path: ['g', 'h', 'i'], startIndex: 2 },
      { id: 'g3', type: 'stationary', path: ['e'],           startIndex: 0 },
      { id: 'g4', type: 'stationary', path: ['j'],           startIndex: 0 },
    ],
  },

  // ── 05 ─────────────────────────────────────────────────────────────────────
  {
    id: 5,
    name: 'The Knife Room',
    // Introduces knife guards. Approach timing matters.
    // km1 faces 'b' initially — wait one turn so it faces 'ex', then kill.
    // Solution: wait → s→a → a→k1(kill km1) → k1→b → b→k2(kill km2) → k2→ex  (6)
    nodes: [
      { id: 's',  x:  80, y: 300 },
      { id: 'a',  x: 210, y: 300 },
      { id: 'k1', x: 340, y: 300 },
      { id: 'b',  x: 470, y: 300 },
      { id: 'k2', x: 600, y: 300 },
      { id: 'ex', x: 730, y: 300 },
      { id: 't1', x: 340, y: 175 },
      { id: 't2', x: 600, y: 175 },
    ],
    edges: [
      { from: 's',  to: 'a'  },
      { from: 'a',  to: 'k1' },
      { from: 'k1', to: 'b'  },
      { from: 'k1', to: 't1' },
      { from: 'b',  to: 'k2' },
      { from: 'k2', to: 'ex' },
      { from: 'k2', to: 't2' },
    ],
    playerStart: 's',
    exit: 'ex',
    enemies: [
      { id: 'km1', type: 'knife', node: 'k1', path: ['a', 'b'],   startIndex: 1 },
      { id: 'km2', type: 'knife', node: 'k2', path: ['b', 'ex'],  startIndex: 0 },
    ],
  },

  // ── 06 ─────────────────────────────────────────────────────────────────────
  {
    id: 6,
    name: 'The Watchtower',
    // Introduces sniper (unkillable). Must route around.
    // Solution: s→a → a→b(kill g1) → wait → b→e → e→f(kill km1) → f→ex  (6)
    nodes: [
      { id: 's',  x:  80, y: 300 },
      { id: 'a',  x: 210, y: 175 },
      { id: 'b',  x: 340, y: 175 },
      { id: 'c',  x: 470, y: 175 },
      { id: 'd',  x: 210, y: 300 },
      { id: 'e',  x: 340, y: 300 },
      { id: 'f',  x: 470, y: 300 },
      { id: 'ex', x: 600, y: 300 },
    ],
    edges: [
      { from: 's', to: 'a'  }, { from: 's', to: 'd'  },
      { from: 'a', to: 'b'  }, { from: 'b', to: 'c'  },
      { from: 'a', to: 'd'  }, { from: 'b', to: 'e'  }, { from: 'c', to: 'f'  },
      { from: 'd', to: 'e'  }, { from: 'e', to: 'f'  },
      { from: 'f', to: 'ex' },
    ],
    playerStart: 's',
    exit: 'ex',
    enemies: [
      { id: 'sn1', type: 'sniper',     path: ['c'],              startIndex: 0 },
      { id: 'g1',  type: 'patrol',     path: ['b', 'e'],         startIndex: 1 },
      { id: 'st1', type: 'stationary', path: ['d'],              startIndex: 0 },
      { id: 'km1', type: 'knife',      node: 'f', path: ['e','ex'], startIndex: 0 },
    ],
  },

  // ── 07 ─────────────────────────────────────────────────────────────────────
  {
    id: 7,
    name: 'The Greenhouse',
    // Bushes + knife + can. Throw can to freeze patrol; hide in bush; kill knife.
    // Solution: throw→can→s→a → a→b(bush,safe!) → b→c(kill g2) → c→d(kill km) → d→ex
    nodes: [
      { id: 's',  x:  80, y: 300 },
      { id: 'a',  x: 210, y: 300 },
      { id: 'b',  x: 340, y: 300, isBush: true },
      { id: 'c',  x: 470, y: 300 },
      { id: 'd',  x: 600, y: 300 },
      { id: 'ex', x: 730, y: 300 },
      { id: 'bt', x: 210, y: 175, isBush: true },
      { id: 'bb', x: 210, y: 425 },
      { id: 'ct', x: 470, y: 175, isBush: true },
      { id: 'cb', x: 470, y: 425 },
    ],
    edges: [
      { from: 's',  to: 'a'  },
      { from: 'a',  to: 'b'  }, { from: 'b', to: 'c'  }, { from: 'c', to: 'd'  },
      { from: 'd',  to: 'ex' },
      { from: 'a',  to: 'bt' }, { from: 'a', to: 'bb' },
      { from: 'c',  to: 'ct' }, { from: 'c', to: 'cb' },
    ],
    playerStart: 's',
    exit: 'ex',
    cans: 1,
    enemies: [
      // patrols a-b-c; frozen by can so player can slip through bush
      { id: 'g1',  type: 'patrol',     path: ['a', 'b', 'c'],     startIndex: 1 },
      { id: 'g2',  type: 'stationary', path: ['c'],               startIndex: 0 },
      { id: 'km1', type: 'knife',      node: 'd', path: ['ex','c'], startIndex: 0 },
    ],
  },

  // ── 08 ─────────────────────────────────────────────────────────────────────
  {
    id: 8,
    name: 'The Loop',
    // 3×3 grid with two bush hideouts near start. Classic circular patrol timing.
    nodes: [
      { id: 's',  x:  80, y: 300 },
      { id: 'a',  x: 210, y: 175 },
      { id: 'b',  x: 340, y: 175 },
      { id: 'c',  x: 470, y: 175 },
      { id: 'd',  x: 210, y: 300 },
      { id: 'e',  x: 340, y: 300 },
      { id: 'f',  x: 470, y: 300 },
      { id: 'g',  x: 210, y: 425 },
      { id: 'h',  x: 340, y: 425 },
      { id: 'i',  x: 470, y: 425 },
      { id: 'ex', x: 600, y: 300 },
      { id: 'bs', x:  80, y: 175, isBush: true },
      { id: 'bg', x:  80, y: 425, isBush: true },
    ],
    edges: [
      { from: 's',  to: 'd'   }, { from: 's', to: 'bs' }, { from: 's', to: 'bg' },
      { from: 'bs', to: 'a'   }, { from: 'bg', to: 'g' },
      { from: 'a',  to: 'b'   }, { from: 'b', to: 'c'  },
      { from: 'a',  to: 'd'   }, { from: 'b', to: 'e'  }, { from: 'c', to: 'f'  },
      { from: 'd',  to: 'e'   }, { from: 'e', to: 'f'  },
      { from: 'd',  to: 'g'   }, { from: 'e', to: 'h'  }, { from: 'f', to: 'i'  },
      { from: 'g',  to: 'h'   }, { from: 'h', to: 'i'  },
      { from: 'f',  to: 'ex'  }, { from: 'i', to: 'ex' },
    ],
    playerStart: 's',
    exit: 'ex',
    enemies: [
      { id: 'g1', type: 'patrol',     path: ['a', 'b', 'c'], startIndex: 0 },
      { id: 'g2', type: 'patrol',     path: ['g', 'h', 'i'], startIndex: 2 },
      { id: 'g3', type: 'patrol',     path: ['d', 'e', 'f'], startIndex: 1 },
      { id: 'g4', type: 'stationary', path: ['c'],           startIndex: 0 },
    ],
  },

  // ── 09 ─────────────────────────────────────────────────────────────────────
  {
    id: 9,
    name: 'The Embassy',
    // 3×3 grid — sniper locks top-left, knife at bottom-right, 1 can, 2 bushes.
    nodes: [
      { id: 's',  x:  80, y: 300 },
      { id: 'a',  x: 210, y: 175, isBush: true },
      { id: 'b',  x: 340, y: 175 },
      { id: 'c',  x: 470, y: 175 },
      { id: 'd',  x: 210, y: 300 },
      { id: 'e',  x: 340, y: 300 },
      { id: 'f',  x: 470, y: 300 },
      { id: 'g',  x: 210, y: 425, isBush: true },
      { id: 'h',  x: 340, y: 425 },
      { id: 'i',  x: 470, y: 425 },
      { id: 'ex', x: 600, y: 300 },
    ],
    edges: [
      { from: 's', to: 'd'  },
      { from: 'a', to: 'b'  }, { from: 'b', to: 'c'  },
      { from: 'a', to: 'd'  }, { from: 'b', to: 'e'  }, { from: 'c', to: 'f'  },
      { from: 'd', to: 'e'  }, { from: 'e', to: 'f'  },
      { from: 'd', to: 'g'  }, { from: 'e', to: 'h'  }, { from: 'f', to: 'i'  },
      { from: 'g', to: 'h'  }, { from: 'h', to: 'i'  },
      { from: 'f', to: 'ex' },
    ],
    playerStart: 's',
    exit: 'ex',
    cans: 1,
    enemies: [
      { id: 'g1',  type: 'patrol',     path: ['b', 'c'],           startIndex: 0 },
      { id: 'sn1', type: 'sniper',     path: ['a'],                startIndex: 0 },
      { id: 'st1', type: 'stationary', path: ['h'],                startIndex: 0 },
      { id: 'km1', type: 'knife',      node: 'i', path: ['h','f'], startIndex: 0 },
    ],
  },

  // ── 10 ─────────────────────────────────────────────────────────────────────
  {
    id: 10,
    name: 'The Estate',
    // 4×3 grid — all four enemy types, 2 bushes, 2 cans.
    nodes: [
      { id: 's',  x:  80, y: 300 },
      { id: 'a',  x: 210, y: 175 },
      { id: 'b',  x: 340, y: 175 },
      { id: 'c',  x: 470, y: 175 },
      { id: 'd',  x: 210, y: 300 },
      { id: 'e',  x: 340, y: 300, isBush: true },
      { id: 'f',  x: 470, y: 300 },
      { id: 'g',  x: 210, y: 425, isBush: true },
      { id: 'h',  x: 340, y: 425 },
      { id: 'i',  x: 470, y: 425 },
      { id: 'j',  x: 600, y: 175 },
      { id: 'k',  x: 600, y: 300 },
      { id: 'l',  x: 600, y: 425 },
      { id: 'ex', x: 730, y: 300 },
    ],
    edges: [
      { from: 's', to: 'd'  },
      { from: 'a', to: 'b'  }, { from: 'b', to: 'c'  }, { from: 'c', to: 'j'  },
      { from: 'a', to: 'd'  }, { from: 'b', to: 'e'  }, { from: 'c', to: 'f'  },
      { from: 'd', to: 'e'  }, { from: 'e', to: 'f'  }, { from: 'f', to: 'k'  },
      { from: 'd', to: 'g'  }, { from: 'e', to: 'h'  }, { from: 'f', to: 'i'  },
      { from: 'g', to: 'h'  }, { from: 'h', to: 'i'  }, { from: 'i', to: 'l'  },
      { from: 'j', to: 'k'  }, { from: 'k', to: 'l'  },
      { from: 'k', to: 'ex' },
    ],
    playerStart: 's',
    exit: 'ex',
    cans: 2,
    enemies: [
      { id: 'g1',  type: 'patrol',     path: ['a','b','c'],         startIndex: 1 },
      { id: 'g2',  type: 'patrol',     path: ['g','h','i'],         startIndex: 1 },
      { id: 'km1', type: 'knife',      node: 'e', path: ['d','h','f'], startIndex: 0 },
      { id: 'sn1', type: 'sniper',     path: ['a'],                 startIndex: 0 },
      { id: 'st1', type: 'stationary', path: ['l'],                 startIndex: 0 },
    ],
  },

  // ── 11 ─────────────────────────────────────────────────────────────────────
  {
    id: 11,
    name: 'The Fortress',
    // 4×3 grid — all types, 2 bushes, 3 cans, heavy patrol density.
    nodes: [
      { id: 's',  x:  80, y: 300 },
      { id: 'a',  x: 210, y: 175, isBush: true },
      { id: 'b',  x: 340, y: 175 },
      { id: 'c',  x: 470, y: 175 },
      { id: 'd',  x: 210, y: 300 },
      { id: 'e',  x: 340, y: 300 },
      { id: 'f',  x: 470, y: 300 },
      { id: 'g',  x: 210, y: 425 },
      { id: 'h',  x: 340, y: 425 },
      { id: 'i',  x: 470, y: 425, isBush: true },
      { id: 'j',  x: 600, y: 175 },
      { id: 'k',  x: 600, y: 300 },
      { id: 'l',  x: 600, y: 425 },
      { id: 'ex', x: 730, y: 300 },
    ],
    edges: [
      { from: 's', to: 'd'  },
      { from: 'a', to: 'b'  }, { from: 'b', to: 'c'  }, { from: 'c', to: 'j'  },
      { from: 'a', to: 'd'  }, { from: 'b', to: 'e'  }, { from: 'c', to: 'f'  },
      { from: 'd', to: 'e'  }, { from: 'e', to: 'f'  }, { from: 'f', to: 'k'  },
      { from: 'd', to: 'g'  }, { from: 'e', to: 'h'  }, { from: 'f', to: 'i'  },
      { from: 'g', to: 'h'  }, { from: 'h', to: 'i'  }, { from: 'i', to: 'l'  },
      { from: 'j', to: 'k'  }, { from: 'k', to: 'l'  },
      { from: 'k', to: 'ex' },
    ],
    playerStart: 's',
    exit: 'ex',
    cans: 3,
    enemies: [
      { id: 'g1',  type: 'patrol',     path: ['a','b','c'],       startIndex: 1 },
      { id: 'g2',  type: 'patrol',     path: ['e','h'],           startIndex: 0 },
      { id: 'km1', type: 'knife',      node: 'd', path: ['a','e','g'], startIndex: 0 },
      { id: 'km2', type: 'knife',      node: 'i', path: ['f','l','h'], startIndex: 1 },
      { id: 'sn1', type: 'sniper',     path: ['j'],               startIndex: 0 },
      { id: 'st1', type: 'stationary', path: ['k'],               startIndex: 0 },
    ],
  },

  // ── 12 ─────────────────────────────────────────────────────────────────────
  {
    id: 12,
    name: 'The Finale',
    // 5×3 grid — the ultimate challenge. All enemy types, 4 bushes, 3 cans.
    // x cols: 150 266 382 498 614   y rows: 175 300 425
    nodes: [
      { id: 's',  x:  80, y: 300 },
      // top row
      { id: 'a',  x: 150, y: 175, isBush: true },
      { id: 'b',  x: 266, y: 175 },
      { id: 'c',  x: 382, y: 175 },
      { id: 'd',  x: 498, y: 175 },
      { id: 'e',  x: 614, y: 175 },
      // mid row
      { id: 'f',  x: 150, y: 300 },
      { id: 'g',  x: 266, y: 300 },
      { id: 'h',  x: 382, y: 300, isBush: true },
      { id: 'i',  x: 498, y: 300 },
      { id: 'j',  x: 614, y: 300 },
      // bot row
      { id: 'k',  x: 150, y: 425 },
      { id: 'l',  x: 266, y: 425, isBush: true },
      { id: 'm',  x: 382, y: 425 },
      { id: 'n',  x: 498, y: 425 },
      { id: 'o',  x: 614, y: 425, isBush: true },
      { id: 'ex', x: 730, y: 300 },
    ],
    edges: [
      { from: 's', to: 'f'  },
      // top row
      { from: 'a', to: 'b'  }, { from: 'b', to: 'c'  }, { from: 'c', to: 'd'  }, { from: 'd', to: 'e'  },
      // mid row
      { from: 'f', to: 'g'  }, { from: 'g', to: 'h'  }, { from: 'h', to: 'i'  }, { from: 'i', to: 'j'  },
      // bot row
      { from: 'k', to: 'l'  }, { from: 'l', to: 'm'  }, { from: 'm', to: 'n'  }, { from: 'n', to: 'o'  },
      // verticals
      { from: 'a', to: 'f'  }, { from: 'b', to: 'g'  }, { from: 'c', to: 'h'  }, { from: 'd', to: 'i'  }, { from: 'e', to: 'j'  },
      { from: 'f', to: 'k'  }, { from: 'g', to: 'l'  }, { from: 'h', to: 'm'  }, { from: 'i', to: 'n'  }, { from: 'j', to: 'o'  },
      // exit
      { from: 'j', to: 'ex' },
    ],
    playerStart: 's',
    exit: 'ex',
    cans: 3,
    enemies: [
      { id: 'g1',  type: 'patrol',     path: ['a','b','c'],           startIndex: 0 },
      { id: 'g2',  type: 'patrol',     path: ['k','l','m'],           startIndex: 2 },
      { id: 'g3',  type: 'patrol',     path: ['f','g','h'],           startIndex: 1 },
      { id: 'km1', type: 'knife',      node: 'i', path: ['h','j'],    startIndex: 0 },
      { id: 'km2', type: 'knife',      node: 'm', path: ['l','n'],    startIndex: 1 },
      { id: 'sn1', type: 'sniper',     path: ['e'],                   startIndex: 0 },
      { id: 'st1', type: 'stationary', path: ['d'],                   startIndex: 0 },
    ],
  },
];
