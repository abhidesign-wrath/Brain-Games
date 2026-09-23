# Continue from Day 1

Read README, DECISIONS, BUGS and VERIFICATION before editing. The current milestone is the engine foundation. Do not describe it as release-ready.

## Next authorized phase when the owner requests Day 2

1. Run `npm ci`, `npm run verify`, `npm run lint` and coverage. Confirm clean Git state.
2. Set up Expo account/project and generate/install a development client. Confirm actual Android startup before adding much UI.
3. Add a board component with SVG and gesture handling through `npx expo install`. Map touch coordinates to row-major cells. Engine handles all rule decisions.
4. Handle slow/fast drag, leaving board, re-entry, diagonal jumps, predecessor backtracking, repeated samples and restart. Do not use solver search in render/gesture work.
5. Add timer outside the engine and AsyncStorage save/resume with serialized writes. Persist on background/navigation; validate corrupt state and abrupt shutdown behavior on device.
6. Test on real Android. Browser/Metro checks are supporting evidence only.
7. Run gates, inspect status, commit and push the stable Day 2 milestone.

Later retain the original eight-day sequence: generator/solver; daily/streak/stats; notifications/settings; integration; release QA; freeze. No new games, backend, ads or monetization during the initial window.

## Owner/account items

- Final name/package before first Play upload.
- Expo login/project connection and signing workflow.
- Play Console access and actual account-specific closed-test requirements.
- Physical Android phone for acceptance testing.

Never paste account credentials into tracked files. Keep all project source in GitHub so development can continue independently of this conversation.
