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

## Deployment

Push to `main` triggers GitHub Actions (`.github/workflows/deploy.yml`), which SSHs into the VPS at `31.70.81.236`, runs `git pull && npm ci && npm run build`, then restarts via `pm2 restart hitmango`. Always run `npm run build` and `npx tsc --noEmit` locally before pushing.

## Architecture

**Tile Assassin** is a Hitman GO–style turn-based puzzle game built as a single-page Next.js app (App Router). All game logic runs client-side.

### Data flow

```
levels.ts  →  page.tsx  →  GameBoard.tsx
   ↓               ↓
types.ts    gameEngine.ts
```

- `src/lib/types.ts` — shared type definitions. Key types: `Level`, `GameState`, `Enemy`, `EnemyType` (`patrol | stationary | sniper | knife`), `KilledEnemy` (id, type, node — for fallen-piece rendering).
- `src/lib/levels.ts` — 12 hand-crafted levels. Each defines nodes (x/y world coords, optional `isBush`), edges (bidirectional graph), player start, exit, enemy definitions, and optional `cans` count.
- `src/lib/gameEngine.ts` — pure functions with no side effects: `initState`, `movePlayer`, `throwCan`, `getAdjacentNodes`, `getEnemyNode`, `getEnemyFacingNode`.
- `src/app/page.tsx` — top-level client component; owns all React state (`screen`, `levelIndex`, `gameState`, `completed`, `canMode`); renders either `LevelSelect` or the game view with `GameBoard`.
- `src/components/GameBoard.tsx` — pure SVG renderer; receives `level`, `state`, `onMove`, `canMode`, `onCanThrow`; no internal state. Nodes are depth-sorted by `(x + y)` before rendering to maintain correct isometric overlap.
- `src/components/LevelSelect.tsx` — mission selection screen with static board preview SVG.

### Game engine rules

- All enemies initialise with `dir: 1`. `startIndex` sets the starting path position.
- Turn order: player moves first (with optional kill), then all remaining enemies advance one step.
- Kill condition: `canPlayerKill(enemy, fromNode)` — approach from any direction except the node the enemy is currently **facing** (its next path position). Stationary enemies and enemies at a path endpoint (facing = null) can always be killed. Snipers can never be killed.
- **Bush cover** (`isBush: true` on a node): when the player is on a bush node, `patrol` and `stationary` enemies that advance onto the same node do **not** kill the player. `knife` and `sniper` enemies ignore bush cover.
- **Can throw** (`throwCan`): spends one `cansLeft`, freezes `patrol` and `stationary` enemies for that turn (knife/sniper still advance), and sets `state.can` for the visual indicator. Counts as one move.
- **Killed enemies**: when an enemy is killed it is added to `state.killedEnemies` (never removed) and rendered as a `FallenPiece` at its node.
- A player "wait" is triggered by clicking their own node (`targetNode === playerNode`); enemies still advance.
- Win condition: player moves (not waits) onto the `level.exit` node.

### Enemy types

| Type | Visual | Behaviour |
|------|--------|-----------|
| `patrol` | Blue uniform, holstered pistol | Bounces along `path` |
| `stationary` | Blue uniform, holstered pistol | Never moves; always facing=null (killable from any side) |
| `knife` | Black outfit, balaclava, blade | Fixed `node`; rotates `facing` through `path` each turn |
| `sniper` | Red uniform, scoped rifle | Fixed node; unkillable; facing shown with bright-red arrow |

### Isometric rendering

`GameBoard` applies a per-level isometric projection centred on the node bounding box:

```ts
const ISO_SX = 0.55;  // screen-x scale
const ISO_SY = 0.28;  // screen-y scale
// ox/oy centre the projected content in the 800×600 viewBox
screenX = ox + (worldX - worldY) * ISO_SX
screenY = oy + (worldX + worldY) * ISO_SY
```

Node world coordinates use ~130-unit spacing; Y values should stay in the 175–425 range so all levels display correctly inside the fixed viewBox. For larger levels (4+ rows) use ~83-unit Y spacing (e.g. 175, 258, 342, 425).

Rendering order within each node group (back-to-front, sorted by `x + y`): bush decoration → fallen pieces → node disc → live piece → click target.

### Adding levels

1. Define nodes with ~130-unit spacing; Y values in 175–425.
2. Mark hiding spots with `isBush: true`; place them on nodes that are part of a patrol path so the mechanic is required.
3. All enemies start with implicit `dir: 1`; use `startIndex` to offset their phase.
4. Verify solvability with a BFS solver: inline `gameEngine.ts` + `levels.ts` logic into a `node --input-type=module` script.
5. Snipers are unkillable routing obstacles. Knife enemies have a fixed `node` and cycle their `path` as facing directions (not movement).
