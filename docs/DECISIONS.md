# Technical decisions

## 2026-09-23 · Expo SDK 57 / native Android
Decision: current stable SDK from create-expo-app, React Native 0.86, React 19.2.3, Router, strict TypeScript, npm lockfile and Node 24.
Reason: native UI and an EAS AAB path with API 36, minimizing native project maintenance during the eight-day window.
Alternative rejected: website wrapper/Netlify deployment for the mobile application.
Future: CNG generates native projects; EAS account and signing must be configured before builds.

Dependency note: pin Expo's compatible React DOM and Worklets/Reanimated versions even though Android is the only target. Router's transitive peers otherwise selected newer incompatible packages. Testing Library is kept on major 13 to match React 19.2 / React Test Renderer; major 14 pulled a React 19.3 reconciler. Never resolve this by disabling peer checks.

## Pure immutable path engine
Decision: row-major integer cells, frozen state, explicit transition results, unknown-input parsers.
Reason: simple rendering integration, deterministic tests and trustworthy restore boundaries.
Alternative rejected: embedding validation inside touch components or accepting cached completion flags.
Future: solver and generator can reuse data types; solver must independently validate output.

## End at final checkpoint / one-step backtracking
Decision: final checkpoint is accepted only on full coverage; dragging backward removes only the current end cell. Explicit undo can clear checkpoint 1. Solved states cannot be edited except by restart.
Reason: predictable endpoint semantics, no implicit path truncation through an older cell.
Alternative rejected: completing the checkpoint sequence and continuing past the last number.
Future: Day 2 gesture interpolation must submit adjacent steps rather than jump cells. Invalid diagonal input must not invent a route.

## Local first, no backend, no state library yet
Decision: snapshot contracts now; AsyncStorage adapter later. Avoid Zustand until UI complexity warrants it.
Reason: scope control and independent rules testing. A snapshot function is not durable persistence.
Alternative rejected: accounts, Supabase and cloud sync in V1 foundation.
Future: versioned payloads, stable puzzle IDs and idempotent results will support later repository adapters.

## Generator/solver deferred to Day 3
Decision: structural puzzle checks only on Day 1. Original 3×2 fixture and constructed test paths are not production puzzles.
Reason: obey Day 1 scope; do not pretend shape validation proves uniqueness or solvability.
Alternative rejected: hand-authoring production level inventory today.
Future: bounded search with explicit unknown/timeout outcome and versioned pre-generated banks if runtime costs are excessive.

## Provisional identity
Decision: Mindtrail, scheme mindtrail, package com.abhidesignwrath.mindtrail.
Reason: concrete runnable configuration without blocking foundation work on naming.
Alternative rejected: committing fake EAS project IDs or signing credentials.
Future: owner confirms final identity before first Play upload; template icons must be replaced.

## Existing GitHub repository
Decision: use abhidesign-wrath/Brain-Games and preserve its initial README history.
Reason: user explicitly requested GitHub backup and this is the accessible matching project repository.
Alternative rejected: repurposing unrelated projects or leaving the only code copy in this session.
Future: keep milestones committed and synchronized; record any transport limitations in verification.

## Native APK before Day 2
Decision: use Expo prebuild and native Gradle on the existing GitHub runner to generate a standalone, test-signed APK while Expo account access is unavailable. Keep EAS preview APK and production AAB profiles.
Reason: verify the actual native compilation pipeline without fabricating credentials or blocking on account setup.
Future: production signing and Play AAB remain EAS release gates; generated android files remain ignored and configuration stays in Expo config/plugins. The native release test APK includes Hermes and a bundled JS entry, with no Metro dependency.
