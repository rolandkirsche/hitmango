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
  // knife: current index IS the facing node (cycles through path)
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
  // knife rotates facing through path in a cycle (no bounce)
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

export function movePlayer(state: GameState, targetNode: NodeId, level: Level): GameState {
  if (state.status !== 'playing') return state;

  const isWait = targetNode === state.playerNode;

  if (!isWait) {
    const adjacent = getAdjacentNodes(state.playerNode, level);
    if (!adjacent.includes(targetNode)) return state;
  }

  let newEnemies = [...state.enemies];
  let playerDead = false;

  if (!isWait) {
    const killed: string[] = [];
    for (const enemy of newEnemies) {
      const enemyNode = getEnemyNode(enemy);
      if (enemyNode === targetNode) {
        if (canPlayerKill(enemy, state.playerNode)) {
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

  const finalPlayerNode = isWait ? state.playerNode : targetNode;

  // Advance enemies
  const advancedEnemies: Enemy[] = [];
  for (const enemy of newEnemies) {
    const advanced = advanceEnemy(enemy);
    // knife: kills if new facing === player node; patrol: kills if new position === player node
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
    playerNode: finalPlayerNode,
    enemies: advancedEnemies,
    status: won ? 'won' : 'playing',
    moves: state.moves + 1,
  };
}

export function getEnemyNode(enemy: Enemy): NodeId {
  return enemy.node ?? enemy.path[enemy.index];
}

export function getEnemyFacingNode(enemy: Enemy): NodeId | null {
  return enemyFacing(enemy);
}
