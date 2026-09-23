# Bugs and delivery gates

## Critical
- No release candidate exists yet. Day 1 is a foundation, not a Play-ready application.

## High
- Android runtime startup and physical-device verification pending: workspace has no Android SDK, adb, emulator or attached phone.
- EAS account/project and signing have not been connected; no APK/AAB has been built. Start this setup before the Day 2 device test.

## Medium
- Expo template icons/splash are placeholders; replace before Play release.
- Final app name/package requires owner confirmation before Play upload.

## Low
- Online Expo compatibility lookup timed out in the managed environment. SDK-bundled dependency versions are used for installation; rerun online doctor when reachable.

## Fixed
- Repeated touch samples reject without incrementing moves.
- Row-wrap and diagonal moves reject.
- Backtracking rolls back checkpoint progress.
- Early arrival at final checkpoint rejects.
- Saved paths are validated by replay; cached completion is never trusted.

## Planned, not defects
Day 2 controls/persistence, Day 3 solver/generator, Day 4 daily/stats, Day 5 reminders, Day 6 integration, Day 7 release QA, Day 8 freeze. These features have not been started.
