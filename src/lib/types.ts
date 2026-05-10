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

export type EnemyType = 'patrol' | 'stationary' | 'sniper' | 'knife';

export interface EnemyDef {
  id: string;
  type: EnemyType;
  path: NodeId[];      // for 'knife': rotation of facing nodes (not movement path)
  startIndex: number;
  node?: NodeId;       // fixed standing position for 'knife' type
}

export interface Enemy {
  id: string;
  type: EnemyType;
  path: NodeId[];
  index: number;
  dir: 1 | -1;
  node?: NodeId;       // fixed standing position for 'knife' type
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
