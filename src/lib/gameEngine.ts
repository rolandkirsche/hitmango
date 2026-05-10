import { Level, GameState, Enemy, NodeId } from './types';

export function initState(level: Level): GameState {
  return {
    playerNode: level.playerStart,
    enemies: level.enemies.map(e => ({
      id: e.id,
      type: e.type,
      path: e.path,
      index: e.startIndex,
      dir: 1 as const,
      node: e.node,
    })),
    status: 'playing',
    moves: 0,
    can: null,
    cansLeft: level.cans ?? 0,
  };
}

export function getAdjacentNodes(nodeId: NodeId, level: Level): NodeId[] {
  const adj: NodeId[] = [];
  for (const edge of level.edges) {
    if (edge.from === nodeId) adj.push(edge.to);
    if (edge.to === nodeId) adj.push(edge.from);
  }
  return adj;
}

function enemyFacing(enemy: Enemy): NodeId | null {
  if (enemy.type === 'knife') return enemy.path[enemy.index];
  const nextIndex = enemy.index + enemy.dir;
  if (nextIndex >= 0 && nextIndex < enemy.path.length) {
    return enemy.path[nextIndex];
  }
  return null;
}

function canPlayerKill(enemy: Enemy, fromNode: NodeId): boolean {
  if (enemy.type === 'sniper') return false;
  const facing = enemyFacing(enemy);
  if (facing === null) return true;
  return fromNode !== facing;
}

function advanceEnemy(enemy: Enemy): Enemy {
  if (enemy.type === 'stationary') return enemy;
  if (enemy.type === 'knife') {
    return { ...enemy, index: (enemy.index + 1) % enemy.path.length };
  }
  const next = { ...enemy };
  const nextIndex = next.index + next.dir;
  if (nextIndex >= next.path.length) {
    next.dir = -1;
    next.index -= 1;
  } else if (nextIndex < 0) {
    next.dir = 1;
    next.index += 1;
  } else {
    next.index = nextIndex;
  }
  return next;
}

// Throw a can: enemies (patrol/stationary) freeze this turn. Knife/sniper unaffected.
export function throwCan(state: GameState, targetNode: NodeId): GameState {
  if (state.status !== 'playing' || state.cansLeft <= 0) return state;

  // Only knife enemies advance; patrol/stationary are distracted
  const advancedEnemies: Enemy[] = [];
  let playerDead = false;
  for (const enemy of state.enemies) {
    if (enemy.type === 'patrol' || enemy.type === 'stationary') {
      advancedEnemies.push(enemy); // frozen
      continue;
    }
    const advanced = advanceEnemy(enemy);
    if (advanced.type === 'knife' && advanced.path[advanced.index] === state.playerNode) {
      playerDead = true;
      break;
    }
    advancedEnemies.push(advanced);
  }

  if (playerDead) return { ...state, status: 'dead' };

  return {
    ...state,
    enemies: advancedEnemies,
    can: targetNode,
    cansLeft: state.cansLeft - 1,
    moves: state.moves + 1,
  };
}

export function movePlayer(state: GameState, targetNode: NodeId, level: Level): GameState {
  if (state.status !== 'playing') return state;

  // Clear can visual on any new action
  const baseState = { ...state, can: null };

  const isWait = targetNode === baseState.playerNode;

  if (!isWait) {
    const adjacent = getAdjacentNodes(baseState.playerNode, level);
    if (!adjacent.includes(targetNode)) return state;
  }

  let newEnemies = [...baseState.enemies];
  let playerDead = false;

  if (!isWait) {
    const killed: string[] = [];
    for (const enemy of newEnemies) {
      const enemyNode = getEnemyNode(enemy);
      if (enemyNode === targetNode) {
        if (canPlayerKill(enemy, baseState.playerNode)) {
          killed.push(enemy.id);
        } else {
          playerDead = true;
          break;
        }
      }
    }
    if (playerDead) return { ...state, status: 'dead' };
    newEnemies = newEnemies.filter(e => !killed.includes(e.id));
  }

  const finalPlayerNode = isWait ? baseState.playerNode : targetNode;

  const advancedEnemies: Enemy[] = [];
  for (const enemy of newEnemies) {
    const advanced = advanceEnemy(enemy);
    const dangerNode = advanced.type === 'knife'
      ? advanced.path[advanced.index]
      : getEnemyNode(advanced);
    if (dangerNode === finalPlayerNode) {
      playerDead = true;
      break;
    }
    advancedEnemies.push(advanced);
  }

  if (playerDead) return { ...state, status: 'dead' };

  const won = !isWait && finalPlayerNode === level.exit;

  return {
    ...baseState,
    playerNode: finalPlayerNode,
    enemies: advancedEnemies,
    status: won ? 'won' : 'playing',
    moves: baseState.moves + 1,
  };
}

export function getEnemyNode(enemy: Enemy): NodeId {
  return enemy.node ?? enemy.path[enemy.index];
}

export function getEnemyFacingNode(enemy: Enemy): NodeId | null {
  return enemyFacing(enemy);
}
