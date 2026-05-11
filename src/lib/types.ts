export type NodeId = string;

export interface GameNode {
  id: NodeId;
  x: number;
  y: number;
  isBush?: boolean;
}

export interface GameEdge {
  from: NodeId;
  to: NodeId;
}

export type EnemyType = 'patrol' | 'stationary' | 'sniper' | 'knife';

export interface EnemyDef {
  id: string;
  type: EnemyType;
  path: NodeId[];
  startIndex: number;
  node?: NodeId;
}

export interface Enemy {
  id: string;
  type: EnemyType;
  path: NodeId[];
  index: number;
  dir: 1 | -1;
  node?: NodeId;
}

export interface KilledEnemy {
  id: string;
  type: EnemyType;
  node: NodeId;
}

export interface Level {
  id: number;
  name: string;
  nodes: GameNode[];
  edges: GameEdge[];
  playerStart: NodeId;
  exit: NodeId;
  enemies: EnemyDef[];
  cans?: number;
}

export type GameStatus = 'playing' | 'dead' | 'won';

export interface GameState {
  playerNode: NodeId;
  enemies: Enemy[];
  status: GameStatus;
  moves: number;
  can: NodeId | null;
  cansLeft: number;
  killedEnemies: KilledEnemy[];
}
