import { applyMove, coordinate, createGame, getResult, isAdjacent, parsePuzzle, playableCellCount, restartGame, restoreGame, snapshotGame, undoMove } from '../src/games/path/engine';
import type { GameState, Puzzle } from '../src/games/path/types';
import { engineFixture as puzzle } from '../src/games/path/utils/fixture';

function play(cells: number[], board = puzzle): GameState {
  let state = createGame(board);
  for (const cell of cells) {
    const result = applyMove(state, { cell });
    if (!result.accepted) throw new Error(`Rejected ${cell}: ${result.reason}`);
    state = result.state;
  }
  return state;
}
function rejects(state: GameState, cell: number, reason: string) {
  const before = JSON.stringify(state);
  expect(applyMove(state, { cell })).toEqual({ accepted: false, reason, state });
  expect(JSON.stringify(state)).toBe(before);
}

describe('puzzle data boundaries', () => {
  test('validates and owns a frozen copy', () => {
    const source = JSON.parse(JSON.stringify(puzzle)) as Puzzle;
    const parsed = parsePuzzle(source);
    expect(parsed).toEqual(puzzle);
    expect(parsed).not.toBe(source);
    expect(Object.isFrozen(parsed.checkpoints)).toBe(true);
    expect(Object.isFrozen(parsed.checkpoints[0])).toBe(true);
    expect(playableCellCount(parsed)).toBe(6);
  });
  test.each([null, [], {}, { ...puzzle, schemaVersion: 2 }, { ...puzzle, id: '' },
    { ...puzzle, id: '  ' }, { ...puzzle, width: 0 }, { ...puzzle, height: -1 },
    { ...puzzle, width: 21 }, { ...puzzle, height: 21 }, { ...puzzle, width: 1.5 },
    { ...puzzle, height: NaN }, { ...puzzle, difficulty: 'expert' },
    { ...puzzle, blocked: null }, { ...puzzle, checkpoints: null },
    { ...puzzle, blocked: [-1] }, { ...puzzle, blocked: [6] },
    { ...puzzle, blocked: [1, 1] }, { ...puzzle, blocked: [1.5] },
    { ...puzzle, blocked: [0] }, { ...puzzle, checkpoints: [] },
    { ...puzzle, checkpoints: [{ order: 1, cell: 0 }] },
    { ...puzzle, checkpoints: [null, null] },
    { ...puzzle, checkpoints: [{ order: 1, cell: 0 }, { order: 3, cell: 2 }] },
    { ...puzzle, checkpoints: [{ order: 1, cell: 0 }, { order: 2, cell: 0 }] },
    { ...puzzle, checkpoints: [{ order: 1, cell: 0 }, { order: 2, cell: 9 }] },
  ])('rejects malformed puzzle %#', value => expect(() => parsePuzzle(value)).toThrow());
  test('rejects more checkpoints than playable cells', () => {
    expect(() => parsePuzzle({ ...puzzle, width: 1, height: 2 })).toThrow();
  });
});

describe('path rules', () => {
  test('new game is empty and checkpoint 1 is next', () => {
    expect(createGame(puzzle)).toMatchObject({ path: [], moves: 0, status: 'ready', nextCheckpoint: 1 });
    expect(getResult(createGame(puzzle))).toBeNull();
  });
  test.each([-1, 6, NaN, Infinity, 0.5])('rejects invalid cell %s', cell => rejects(createGame(puzzle), cell, 'out-of-bounds'));
  test('must begin at checkpoint one', () => rejects(createGame(puzzle), 1, 'must-start-at-one'));
  test('rejects blocked cells', () => rejects(createGame({ ...puzzle, blocked: [1] }), 1, 'blocked'));
  test('same-cell input is a no-op', () => rejects(play([0]), 0, 'same-cell'));
  test('rejects diagonal movement', () => rejects(play([0]), 4, 'not-adjacent'));
  test('rejects skipped cells', () => rejects(play([0]), 2, 'not-adjacent'));
  test('rejects row wrap', () => rejects(play([0, 1, 2]), 3, 'not-adjacent'));
  test('rejects checkpoint skipping', () => rejects(play([0]), 3, 'checkpoint-order'));
  test('cannot finish early even after earlier checkpoints', () => {
    const board = { ...puzzle, checkpoints: [{ order: 1, cell: 0 }, { order: 2, cell: 1 }, { order: 3, cell: 2 }] };
    rejects(play([0, 1], board), 2, 'final-checkpoint-too-early');
  });
  test('collision with older path cell is rejected', () => {
    const board = { ...puzzle, checkpoints: [{ order: 1, cell: 0 }, { order: 2, cell: 5 }] };
    rejects(play([0, 1, 4, 3], board), 0, 'collision');
  });
  test('adjacent predecessor backtracks one cell and rolls back checkpoint', () => {
    const state = play([0, 1, 2]);
    const result = applyMove(state, { cell: 1 });
    expect(result).toMatchObject({ accepted: true, action: 'backtrack', state: { path: [0, 1], moves: 4, nextCheckpoint: 2 } });
    expect(state.path).toEqual([0, 1, 2]);
    expect(applyMove(result.state, { cell: 2 }).state.nextCheckpoint).toBe(3);
  });
  test('undo clears start and is harmless on empty state', () => {
    const initial = createGame(puzzle);
    expect(undoMove(initial)).toBe(initial);
    expect(undoMove(play([0]))).toMatchObject({ path: [], moves: 2, status: 'ready', nextCheckpoint: 1 });
  });
  test('visiting all checkpoints in valid order and covering board wins', () => {
    const solved = play([0, 1, 2, 5, 4, 3]);
    expect(solved).toMatchObject({ status: 'completed', nextCheckpoint: 4, moves: 6 });
    expect(getResult(solved)).toEqual({ puzzleId: puzzle.id, completedCells: 6, moves: 6 });
    rejects(solved, 4, 'already-completed');
    expect(undoMove(solved)).toBe(solved);
    expect(restartGame(solved)).toEqual(createGame(puzzle));
  });
  test('blocked cells are excluded from coverage', () => {
    const board: Puzzle = { ...puzzle, blocked: [3], checkpoints: [{ order: 1, cell: 0 }, { order: 2, cell: 2 }, { order: 3, cell: 4 }] };
    expect(playableCellCount(board)).toBe(5);
    expect(play([0, 1, 2, 5, 4], board).status).toBe('completed');
  });
  test('works for a narrow board', () => {
    const board: Puzzle = { ...puzzle, width: 1, height: 3, checkpoints: [{ order: 1, cell: 0 }, { order: 2, cell: 2 }] };
    expect(play([0, 1, 2], board).status).toBe('completed');
    expect(coordinate(5, 3)).toEqual({ row: 1, column: 2 });
    expect(isAdjacent(2, 3, 3)).toBe(false);
  });
  test.each([5, 6, 7])('full coverage on square board of size %s', size => {
    const path = Array.from({ length: size * size }, (_, i) => {
      const row = Math.floor(i / size), col = i % size;
      return row * size + (row % 2 ? size - col - 1 : col);
    });
    const board: Puzzle = { ...puzzle, width: size, height: size, checkpoints: [
      { order: 1, cell: path[0]! }, { order: 2, cell: path[Math.floor(path.length / 2)]! }, { order: 3, cell: path[path.length - 1]! },
    ] };
    expect(play(path, board).status).toBe('completed');
  });
});

describe('snapshot validation and deterministic resume', () => {
  test.each([{ cells: [] }, { cells: [0] }, { cells: [0, 1, 2] }, { cells: [0, 1, 2, 5, 4, 3] }])('round trips $cells', ({ cells }) => {
    const state = play(cells);
    expect(restoreGame(puzzle, JSON.parse(JSON.stringify(snapshotGame(state))))).toEqual(state);
  });
  test('preserves move count after backtracking', () => {
    const state = play([0, 1, 2, 1]);
    expect(restoreGame(puzzle, snapshotGame(state))).toEqual(state);
  });
  test('snapshot owns its path', () => {
    const state = play([0, 1]);
    expect(snapshotGame(state).path).not.toBe(state.path);
  });
  test.each([null, [], {}, { schemaVersion: 2, puzzleId: puzzle.id, path: [], moves: 0 },
    { schemaVersion: 1, puzzleId: 'other', path: [], moves: 0 },
    { schemaVersion: 1, puzzleId: puzzle.id, path: null, moves: 0 },
    { schemaVersion: 1, puzzleId: puzzle.id, path: [], moves: -1 },
    { schemaVersion: 1, puzzleId: puzzle.id, path: [], moves: 0.5 },
    { schemaVersion: 1, puzzleId: puzzle.id, path: [0, 1], moves: 1 },
    { schemaVersion: 1, puzzleId: puzzle.id, path: [0, '1'], moves: 2 },
    { schemaVersion: 1, puzzleId: puzzle.id, path: [0, 1, 0], moves: 3 },
    { schemaVersion: 1, puzzleId: puzzle.id, path: [1], moves: 1 },
    { schemaVersion: 1, puzzleId: puzzle.id, path: [0, 2], moves: 2 },
    { schemaVersion: 1, puzzleId: puzzle.id, path: [0, 3], moves: 2 },
    { schemaVersion: 1, puzzleId: puzzle.id, path: [0, 1, 2, 3, 4, 5, 6], moves: 7 },
  ])('rejects corrupted snapshot %#', value => expect(() => restoreGame(puzzle, value)).toThrow());
  test('ignores forged cached completion fields', () => {
    expect(restoreGame(puzzle, { ...snapshotGame(play([0])), status: 'completed', nextCheckpoint: 99 }).status).toBe('playing');
  });
});

describe('exhaustive tiny-board solution oracle', () => {
  test('all 720 cell permutations match an independently expressed rule oracle', () => {
    function permutations(rest: number[], prefix: number[] = []): number[][] {
      return rest.length ? rest.flatMap((cell, index) => permutations(rest.filter((_, i) => i !== index), [...prefix, cell])) : [prefix];
    }
    for (const path of permutations([0, 1, 2, 3, 4, 5])) {
      const ordered = path.indexOf(0) < path.indexOf(2) && path.indexOf(2) < path.indexOf(3);
      const connected = path.every((cell, i) => {
        if (!i) return true;
        const prev = path[i - 1]!;
        return (Math.floor(cell / 3) === Math.floor(prev / 3) && Math.abs(cell - prev) === 1) || Math.abs(cell - prev) === 3;
      });
      const expected = path[0] === 0 && path[5] === 3 && ordered && connected;
      let state = createGame(puzzle), valid = true;
      for (const cell of path) {
        const result = applyMove(state, { cell });
        if (!result.accepted) { valid = false; break; }
        state = result.state;
      }
      expect(valid && state.status === 'completed').toBe(expected);
    }
  });
});
