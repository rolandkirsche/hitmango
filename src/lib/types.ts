export type NodeId = string;

export interface GameNode {
  id: NodeId;
  x: number;
  y: number;
}

export interface GameEdge {
  from: NodeId;
  to: NodeId;
}

export type EnemyType = 'patrol' | 'stationary' | 'sniper';

export interface EnemyDef {
  id: string;
  type: EnemyType;
  path: NodeId[];
  startIndex: number;
}

export interface Enemy {
  id: string;
  type: EnemyType;
  path: NodeId[];
  index: number;
  dir: 1 | -1;
}

export interface Level {
  id: number;
  name: string;
  nodes: GameNode[];
  edges: GameEdge[];
  playerStart: NodeId;
  exit: NodeId;
  enemies: EnemyDef[];
}

export type GameStatus = 'playing' | 'dead' | 'won';

export interface GameState {
  playerNode: NodeId;
  enemies: Enemy[];
  status: GameStatus;
  moves: number;
}
