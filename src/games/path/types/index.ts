/** Row-major cell ID: row * width + column. */
export type Cell = number;
export interface Coordinate { readonly row: number; readonly column: number }
export type Difficulty = 'easy' | 'medium' | 'hard';
export type Path = readonly Cell[];
export interface Checkpoint { readonly order: number; readonly cell: Cell }
export interface Puzzle {
  readonly schemaVersion: 1;
  readonly id: string;
  readonly width: number;
  readonly height: number;
  readonly difficulty: Difficulty;
  readonly blocked: readonly Cell[];
  readonly checkpoints: readonly Checkpoint[];
}
export interface GameState {
  readonly puzzle: Puzzle;
  readonly path: Path;
  readonly moves: number;
  readonly status: 'ready' | 'playing' | 'completed';
  readonly nextCheckpoint: number;
}
export type Move = { readonly cell: Cell };
export type MoveError = 'out-of-bounds' | 'blocked' | 'must-start-at-one' |
  'same-cell' | 'not-adjacent' | 'collision' | 'checkpoint-order' |
  'final-checkpoint-too-early' | 'already-completed';
export type MoveResult =
  | { readonly accepted: true; readonly action: 'extend' | 'backtrack'; readonly state: GameState }
  | { readonly accepted: false; readonly reason: MoveError; readonly state: GameState };
export interface PuzzleResult { readonly puzzleId: string; readonly completedCells: number; readonly moves: number }
export interface GameSnapshot {
  readonly schemaVersion: 1;
  readonly puzzleId: string;
  readonly path: Path;
  readonly moves: number;
}
