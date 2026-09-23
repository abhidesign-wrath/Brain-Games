# Day 1 verification · 2026-09-23

## Scope
Engine foundation and minimal launch screen only. No Day 2 gameplay, production puzzle bank, durable storage or Play-ready binary is claimed.

## Checks
- TypeScript strict check: passed.
- ESLint: passed.
- Engine: 74 automated tests passed; 100% measured engine statements, branches, functions and lines. Includes all 720 permutations of a 3×2 board checked against an independent rule oracle and full-coverage cases for 5×5, 6×6 and 7×7 boards. This is not a generated-puzzle stress test.
- Launch-screen test: passed. Renders the actual HomeScreen and initializes the actual engine; native platform functions are mocked by Jest/Expo. **75 tests across 2 suites passed in total.** This is not an Android device test.
- Android Metro export: passed, 1,238 modules, Hermes `.hbc` bundle generated. This is JavaScript packaging, not an APK/AAB build.
- Development server: started successfully; `/status` returned `packager-status:running`, Android manifest HTTP 200, SDK 57.0.0, JavaScript launch asset.
- Clean lockfile installation: `npm ci` tested. npm reports upstream deprecation notices; do not use `--force` or `--legacy-peer-deps` to bypass compatibility problems.
- App config selects Android compile and target API 36. Expo's current versioned documentation supports API 36; the actual built native artifact must still be inspected in release QA.

## Remaining gates
- No Android SDK, adb, emulator or attached physical phone exists in this workspace. **Actual native app startup is unverified**, so the complete Day 1 acceptance checklist is not yet satisfied.
- No authenticated Expo/EAS project or signing session; no development APK, release AAB or Play closed-test submission exists.
- Generator/solver, persistence, daily/streak/stats and notifications are future milestones, not partially verified implementations.
- Expo's online React Native Directory lookup timed out. Installation uses SDK-bundled compatible versions. Online doctor and release-device checks remain required.

## Source control
Repository: https://github.com/abhidesign-wrath/Brain-Games

The existing starter README commit is preserved as the parent of the Day 1 foundation published to `main` at commit `96df1f0`. The final verification notes were synced in a follow-up documentation commit. The `v0.1-engine` milestone tag is local only. CI is configured on push and pull requests; see GitHub Actions for its status.

CI workflow repeats clean installation, typecheck, lint, tests and Android export on pushes/PRs.
