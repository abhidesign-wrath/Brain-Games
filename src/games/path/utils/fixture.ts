import type { Puzzle } from '../types';

/** Original small engine fixture; not a production level or generator. */
export const engineFixture: Puzzle = {
  schemaVersion: 1, id: 'engine-fixture-v1', width: 3, height: 2, difficulty: 'easy', blocked: [],
  checkpoints: [{ order: 1, cell: 0 }, { order: 2, cell: 2 }, { order: 3, cell: 3 }],
};
