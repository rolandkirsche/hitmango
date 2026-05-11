import { Level, GameState, Enemy, NodeId, KilledEnemy } from './types';

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
    killedEnemies: [],
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

// Throw a can: patrol/stationary freeze this turn. Knife/sniper unaffected.
export function throwCan(state: GameState, targetNode: NodeId): GameState {
  if (state.status !== 'playing' || state.cansLeft <= 0) return state;

  const advancedEnemies: Enemy[] = [];
  let playerDead = false;
  for (const enemy of state.enemies) {
    if (enemy.type === 'patrol' || enemy.type === 'stationary') {
      advancedEnemies.push(enemy);
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

  const baseState = { ...state, can: null };
  const isWait = targetNode === baseState.playerNode;

  if (!isWait) {
    const adjacent = getAdjacentNodes(baseState.playerNode, level);
    if (!adjacent.includes(targetNode)) return state;
  }

  const nodeMap = new Map(level.nodes.map(n => [n.id, n]));
  let newEnemies = [...baseState.enemies];
  const newKilledEnemies: KilledEnemy[] = [...baseState.killedEnemies];
  let playerDead = false;

  if (!isWait) {
    const justKilled: string[] = [];
    for (const enemy of newEnemies) {
      const enemyNode = getEnemyNode(enemy);
      if (enemyNode === targetNode) {
        if (canPlayerKill(enemy, baseState.playerNode)) {
          justKilled.push(enemy.id);
          newKilledEnemies.push({ id: enemy.id, type: enemy.type, node: enemyNode });
        } else {
          playerDead = true;
          break;
        }
      }
    }
    if (playerDead) return { ...state, status: 'dead' };
    newEnemies = newEnemies.filter(e => !justKilled.includes(e.id));
  }

  const finalPlayerNode = isWait ? baseState.playerNode : targetNode;
  const playerInBush = nodeMap.get(finalPlayerNode)?.isBush ?? false;

  const advancedEnemies: Enemy[] = [];
  for (const enemy of newEnemies) {
    const advanced = advanceEnemy(enemy);
    const dangerNode = advanced.type === 'knife'
      ? advanced.path[advanced.index]
      : getEnemyNode(advanced);
    if (dangerNode === finalPlayerNode) {
      // Bush cover: patrol/stationary can't detect player hiding in bush
      if (playerInBush && (advanced.type === 'patrol' || advanced.type === 'stationary')) {
        advancedEnemies.push(advanced);
        continue;
      }
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
    killedEnemies: newKilledEnemies,
  };
}

export function getEnemyNode(enemy: Enemy): NodeId {
  return enemy.node ?? enemy.path[enemy.index];
}

export function getEnemyFacingNode(enemy: Enemy): NodeId | null {
  return enemyFacing(enemy);
}
