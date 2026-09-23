# Brain-Games · Mindtrail (working name)

An original, offline-first Android daily puzzle platform built with React Native, Expo SDK 57, TypeScript and Expo Router. The first game is a numbered path puzzle. **This repository currently implements Day 1 only, not a playable or release-ready product.**

## Setup and commands

Use Node 24 LTS (`.nvmrc`) and npm. Clone the repository and run:

```sh
git clone https://github.com/abhidesign-wrath/Brain-Games.git
cd Brain-Games
npm ci
npm run verify
npm run lint
npm run test:coverage
npm run export:android
npm start
```

For Android on your computer, install Android Studio / Android SDK and start an emulator or connect a USB-debugging-enabled Android phone, then `npm run android:native`. Subsequent development uses `npm run android`. A Metro server or successful JavaScript export alone does not prove Android runtime startup.

For a cloud development build, sign into your Expo account with `npx eas-cli@latest login`, run `npx eas-cli@latest init` to connect a real EAS project, then `npx eas-cli@latest build --platform android --profile development`. Install the resulting development APK on a phone and run `npm start -- --dev-client` from a reachable machine. Never commit signing keys or tokens.

## Day 1 scope

Implemented: project foundation, strict TypeScript, engine types, immutable game transitions, ordered checkpoints, orthogonal adjacency, collision checks, single-step backtracking, undo, restart, completion, validated snapshot replay, automated rule tests, and a minimal Router launch screen. Folder placeholders indicate planned boundaries, not implemented features.

Not implemented yet: touch gameplay, timer, durable AsyncStorage writes, generator, solver, production puzzles, daily date selection, streaks, stats, notifications, onboarding, final branding, or release signing. No backend and no account requirement.

## Structure

| Path | Responsibility |
| --- | --- |
| `src/app/` | Expo Router routes and launch screen |
| `src/games/path/types/` | Puzzle, coordinate, checkpoint, path, move, state, snapshot and result contracts |
| `src/games/path/engine/` | Pure rules; no React Native, storage or time dependencies |
| `src/games/path/utils/fixture.ts` | Original small test fixture, not a production puzzle |
| `src/games/path/components/` | Day 2 board and input (reserved) |
| `src/games/path/generator/`, `solver/` | Day 3 systems (reserved) |
| `src/storage/`, `stats/`, `settings/`, `notifications/` | Later shared features (reserved) |
| `tests/` | Engine tests and independent tiny-board oracle |
| `scripts/` | Validation tooling extension point |
| `assets/` | Expo template placeholders; replace before release |
| `docs/` | Decisions, bugs, handoff and verification evidence |

## Engine contract

Cells use row-major integer IDs: `row * width + column`. Dimensions are bounded at 20×20; the intended V1 sizes are 5×5, 6×6 and 7×7. Difficulty is metadata today, not a proven rating. `parsePuzzle(unknown)` validates the schema, ranges, unique cells, blocked cells and consecutive checkpoint numbering. Structural validation **does not prove solvability**.

`createGame(puzzle)` returns a frozen state. `applyMove(state, { cell })` returns either an accepted state with an action or a rejection reason and the unchanged previous state. Begin at checkpoint 1. Move one cell horizontally or vertically. No diagonals, wrapping, skips or collisions. Moving to the immediate predecessor removes the last cell; older cells reject. Undo can clear the start. The final checkpoint must be the last playable cell. Completion freezes further moves; restart explicitly resets the game.

`moves` counts accepted extensions, including initial placement, and accepted undo/backtrack operations. Invalid and same-cell inputs do not count. This is not an elapsed-time metric. `nextCheckpoint` and completion are derived from the path. Pure transition APIs accept states produced by this module; untrusted input must pass through `parsePuzzle` and `restoreGame`.

`snapshotGame` exports versioned JSON-compatible state, keyed to an immutable puzzle ID. `restoreGame(puzzle, unknown)` validates and replays every saved move, rejects duplicate/illegal cells and mismatched puzzle IDs, and recomputes derived fields. It throws for invalid data. The later storage adapter must catch errors and offer safe recovery; it must not silently replace an already-completed daily result. Puzzle content must never change under the same ID.

## Planned systems (not implemented)

- **Generation/solver, Day 3:** seeded complete path → checkpoints → independent bounded solver → validation/uniqueness → difficulty → accept/reject. Prefer pre-generated, versioned bundled banks if searching blocks mobile rendering. Solver timeout means unknown, never proof of uniqueness. Stress-test 1,000 generated puzzles before shipping any bank.
- **Daily, Day 4:** local calendar date key selects a versioned deterministic puzzle. Pin the puzzle date at session start; define treatment of an unfinished game crossing midnight. Store daily results idempotently. Calendar dates, not elapsed 24-hour differences, determine consecutive days. Device clock manipulation cannot be prevented offline.
- **Practice/stats:** practice never advances the daily streak. Key completed sessions to prevent duplicate aggregation. Version shared records independently of game-specific snapshots.
- **Storage, Day 2/4:** AsyncStorage for non-sensitive local records; serialize writes, debounce drag updates, flush on background/navigation and test kill/relaunch. Strict persistence guarantees during abrupt OS termination require device verification and a deliberate write policy. No persistence adapter exists today.
- **Notifications, Day 5:** request permission only after explicit opt-in; schedule native local reminders with a configurable local time, cancel today's reminder after completion, and route taps to Daily. Reconcile schedules on launch and timezone/time changes. Local notifications while the app never reopens cannot recompute live streak text; use truthful fallback copy.
- **Cloud later:** add a repository adapter and versioned per-game payloads; retain stable puzzle/session IDs and idempotent completion records. Supabase auth and conflict policies are future work, not Day 1 abstractions.
- **More games:** add a separate `src/games/<game>/` engine, types, tests and route. Keep dates, settings and persistence outside the game. Introduce a shared game interface only when a second implementation demonstrates the need.

## Android release preparation

`app.json` explicitly selects compile/target API 36, version `0.1.0`, versionCode 1, and provisional package `com.abhidesignwrath.mindtrail`. Confirm final name/package before the first Play upload. Icons are Expo template placeholders. EAS remote version management and auto-increment are configured; future build version codes are assigned by EAS, not solely this initial app.json value.

| Profile | Output | Use |
| --- | --- | --- |
| development | Development client | Device engineering and debugging |
| preview | APK | Installable internal testing |
| closed-test | AAB | Play Console closed testing |
| production | AAB | Store release candidate |

After EAS login/init and package confirmation:

```sh
npx eas-cli@latest build --platform android --profile preview
npx eas-cli@latest build --platform android --profile closed-test
npx eas-cli@latest build --platform android --profile production
```

EAS project ID, account, signing and Play Console setup must be real; no dummy IDs are checked in. A configured profile is not a successful release build. Complete physical-device tests, icon/splash replacement, privacy/support content, current Play policy checks and account-specific closed testing before release. Feature freeze is Day 8; Play approval timing is outside that engineering deadline.

## Verification and continuity

See `docs/VERIFICATION.md` for checks actually run and remaining gates, `docs/BUGS.md` for tracked blockers, `docs/DECISIONS.md` for rationale and `docs/HANDOFF.md` for the next task. Run typecheck, lint and tests before each stable milestone, inspect the diff/status, commit and push. Day 2 is intentionally not started.

Primary references checked on 2026-09-23:

- https://docs.expo.dev/versions/v57.0.0/
- https://docs.expo.dev/router/installation/
- https://docs.expo.dev/develop/unit-testing/
- https://docs.expo.dev/build/eas-json/
- https://docs.expo.dev/versions/v57.0.0/sdk/build-properties/
- https://support.google.com/googleplay/android-developer/answer/11926878

The included MIT license is the upstream Expo template license. Retain its notice; final project licensing and brand clearance remain owner decisions.
