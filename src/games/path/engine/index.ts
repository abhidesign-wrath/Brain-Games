import type { Cell, Coordinate, GameSnapshot, GameState, Move, MoveResult, Path, Puzzle, PuzzleResult } from '../types';

const record = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
const integer = (value: unknown): value is number => Number.isSafeInteger(value);

/** Structural validation only. Solvability/uniqueness belongs to the Day 3 solver. */
export function parsePuzzle(value: unknown): Puzzle {
  if (!record(value) || value.schemaVersion !== 1 || typeof value.id !== 'string' || !value.id.trim() ||
      !integer(value.width) || !integer(value.height) || value.width < 1 || value.height < 1 ||
      value.width > 20 || value.height > 20 ||
      !['easy', 'medium', 'hard'].includes(String(value.difficulty)) ||
      !Array.isArray(value.blocked) || !Array.isArray(value.checkpoints)) {
    throw new Error('Invalid puzzle header');
  }
  const size = value.width * value.height;
  const validCell = (cell: unknown): cell is Cell => integer(cell) && cell >= 0 && cell < size;
  const blocked = value.blocked as unknown[];
  if (!blocked.every(validCell) || new Set(blocked).size !== blocked.length) throw new Error('Invalid blocked cells');
  const points = value.checkpoints as unknown[];
  if (points.length < 2 || points.length > size - blocked.length) throw new Error('Invalid checkpoint count');
  const seen = new Set<Cell>();
  const checkpoints = points.map((point, index) => {
    if (!record(point) || point.order !== index + 1 || !validCell(point.cell) ||
        blocked.includes(point.cell) || seen.has(point.cell)) throw new Error('Invalid checkpoint sequence');
    seen.add(point.cell);
    return Object.freeze({ order: index + 1, cell: point.cell });
  });
  return Object.freeze({ schemaVersion: 1, id: value.id, width: value.width, height: value.height,
    difficulty: value.difficulty as Puzzle['difficulty'], blocked: Object.freeze([...blocked] as Cell[]),
    checkpoints: Object.freeze(checkpoints) });
}

export function coordinate(cell: Cell, width: number): Coordinate {
  return { row: Math.floor(cell / width), column: cell % width };
}
export function isAdjacent(a: Cell, b: Cell, width: number): boolean {
  const from = coordinate(a, width), to = coordinate(b, width);
  return Math.abs(from.row - to.row) + Math.abs(from.column - to.column) === 1;
}
export const playableCellCount = (puzzle: Puzzle): number => puzzle.width * puzzle.height - puzzle.blocked.length;

function stateFor(puzzle: Puzzle, path: Path, moves: number): GameState {
  const visited = new Set(path);
  const nextCheckpoint = puzzle.checkpoints.filter(point => visited.has(point.cell)).length + 1;
  const completed = path.length === playableCellCount(puzzle) && nextCheckpoint === puzzle.checkpoints.length + 1;
  return Object.freeze({ puzzle, path: Object.freeze([...path]), moves, nextCheckpoint,
    status: completed ? 'completed' : path.length ? 'playing' : 'ready' });
}

export const createGame = (puzzle: Puzzle): GameState => stateFor(parsePuzzle(puzzle), [], 0);
export const restartGame = (state: GameState): GameState => createGame(state.puzzle);

/** Accept states created by this module; use restoreGame at untrusted storage boundaries. */
export function applyMove(state: GameState, move: Move): MoveResult {
  const { puzzle, path } = state;
  const cell = move.cell;
  const reject = (reason: Extract<MoveResult, { accepted: false }>['reason']): MoveResult =>
    ({ accepted: false, reason, state });
  if (state.status === 'completed') return reject('already-completed');
  if (!integer(cell) || cell < 0 || cell >= puzzle.width * puzzle.height) return reject('out-of-bounds');
  if (puzzle.blocked.includes(cell)) return reject('blocked');
  if (!path.length) {
    if (cell !== puzzle.checkpoints[0]?.cell) return reject('must-start-at-one');
  } else {
    const head = path[path.length - 1]!;
    if (head === cell) return reject('same-cell');
    if (!isAdjacent(head, cell, puzzle.width)) return reject('not-adjacent');
    if (path.length >= 2 && path[path.length - 2] === cell) {
      return { accepted: true, action: 'backtrack', state: stateFor(puzzle, path.slice(0, -1), state.moves + 1) };
    }
    if (path.includes(cell)) return reject('collision');
    const checkpoint = puzzle.checkpoints.find(point => point.cell === cell);
    if (checkpoint && checkpoint.order !== state.nextCheckpoint) return reject('checkpoint-order');
    if (checkpoint?.order === puzzle.checkpoints.length && path.length + 1 !== playableCellCount(puzzle)) {
      return reject('final-checkpoint-too-early');
    }
  }
  return { accepted: true, action: 'extend', state: stateFor(puzzle, [...path, cell], state.moves + 1) };
}

/** An explicit undo may clear checkpoint 1. Completed games stay immutable. */
export function undoMove(state: GameState): GameState {
  if (!state.path.length || state.status === 'completed') return state;
  return stateFor(state.puzzle, state.path.slice(0, -1), state.moves + 1);
}
export function getResult(state: GameState): PuzzleResult | null {
  return state.status === 'completed' ? { puzzleId: state.puzzle.id, completedCells: state.path.length, moves: state.moves } : null;
}
export const snapshotGame = (state: GameState): GameSnapshot => ({
  schemaVersion: 1, puzzleId: state.puzzle.id, path: [...state.path], moves: state.moves,
});

/** Replays saved paths and recomputes status/checkpoints. Never trusts cached completion. */
export function restoreGame(puzzle: Puzzle, value: unknown): GameState {
  let state = createGame(puzzle);
  if (!record(value) || value.schemaVersion !== 1 || value.puzzleId !== puzzle.id ||
      !Array.isArray(value.path) || value.path.length > playableCellCount(state.puzzle) ||
      !integer(value.moves) || value.moves < value.path.length || value.moves < 0) throw new Error('Invalid snapshot');
  const path = value.path as unknown[];
  if (!path.every(integer) || new Set(path).size !== path.length) throw new Error('Invalid saved path');
  for (const cell of path as Cell[]) {
    const result = applyMove(state, { cell });
    if (!result.accepted || result.action !== 'extend') throw new Error('Illegal saved move');
    state = result.state;
  }
  return stateFor(state.puzzle, state.path, value.moves);
}
