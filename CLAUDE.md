# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Critical: Next.js version

This project runs **Next.js 16.2.6** — a version with breaking changes relative to training data. Before touching any Next.js-specific APIs, routing, or configuration, read the relevant guide in `node_modules/next/dist/docs/`. Heed deprecation notices in compiler output.

## Commands

```bash
npm run dev      # start dev server at localhost:3000 (Turbopack)
npm run build    # production build
npm run lint     # ESLint
npx tsc --noEmit # type-check without emitting (no test suite exists)
```

There are no automated tests. Verify changes by playing through the game in the browser.

## Architecture

**Hitmango** is a Hitman GO–style turn-based puzzle game built as a single-page Next.js app (App Router). All game logic runs client-side.

### Data flow

```
levels.ts  →  page.tsx  →  GameBoard.tsx
   ↓               ↓
types.ts    gameEngine.ts
```

- `src/lib/types.ts` — shared type definitions (`Level`, `GameState`, `Enemy`, `EnemyType`, etc.)
- `src/lib/levels.ts` — array of 12 hand-crafted levels; each level defines nodes (x/y world coords), edges (bidirectional graph), player start, exit node, and enemy definitions
- `src/lib/gameEngine.ts` — pure functions: `initState`, `movePlayer`, `getAdjacentNodes`, `getEnemyNode`, `getEnemyFacingNode`. No side effects.
- `src/app/page.tsx` — top-level client component; owns all React state (`screen`, `levelIndex`, `gameState`, `completed`); renders either `LevelSelect` or the game view with `GameBoard`
- `src/components/GameBoard.tsx` — pure SVG renderer; receives level + state + onMove callback; no internal state
- `src/components/LevelSelect.tsx` — mission selection screen

### Game engine rules

- All enemies initialise with `dir: 1`. `startIndex` sets the starting path position.
- Turn order: player moves first (with optional kill), then all remaining enemies advance one step.
- Kill condition: `canPlayerKill(enemy, fromNode)` — approach from any direction except the node the enemy is currently **facing** (its next path position). Stationary enemies and enemies at a path endpoint (facing = null) can always be killed. Snipers can never be killed.
- A player "wait" is triggered by clicking their own node (`targetNode === playerNode`); enemies still advance.
- Win condition: player moves (not waits) onto the `level.exit` node.

### Isometric rendering

`GameBoard` applies a per-level isometric projection centred on the node bounding box:

```ts
const ISO_SX = 0.55;  // screen-x scale
const ISO_SY = 0.28;  // screen-y scale
// ox/oy are computed to centre the projected content in the 800×600 viewBox
screenX = ox + (worldX - worldY) * ISO_SX
screenY = oy + (worldX + worldY) * ISO_SY
```

Node world coordinates in `levels.ts` use ~130-unit spacing and a Y range of 175–425 so that all levels display correctly inside the fixed viewBox.

### Adding levels

1. Define nodes with ~130-unit spacing; Y values should stay in the 175–425 range.
2. All enemies start with implicit `dir: 1`; use `startIndex` to offset their phase.
3. Verify solvability with a BFS solver (see inline script used during development — inline the engine logic from `gameEngine.ts` and `levels.ts` into a `node --input-type=module` script).
4. Snipers (`type: 'sniper'`) are unkillable and act as permanent routing obstacles.
