---
name: react-i18n-ux-parity-migration
description: Enforces i18n-complete and user-friendly React migrations in HiveFive by removing hardcoded UI strings, preserving usability flows, and standardizing loading/error/empty states. Use when migrating JET screens or polishing migrated React pages.
disable-model-invocation: true
---

# React i18n + UX Parity Migration

## Goal
Guarantee migrated React screens are fully translatable and UX-complete.

## Use this skill when
- A migrated screen still has mixed literals and translations.
- User asks to improve UX parity from legacy behavior.
- Final migration pass before declaring a screen complete.

## Mandatory i18n scope
All visible strings must use `t(key)`:
- titles/subtitles
- labels and placeholders
- buttons and links
- status/error/empty texts
- `aria-label` and related accessibility text.

## UX parity checklist
- [ ] clear loading state
- [ ] clear error state
- [ ] clear empty state
- [ ] primary action visible
- [ ] destructive actions confirmed
- [ ] disabled/hover/focus states coherent

## Workflow
1. Scan page/component for literal UI strings.
2. Add missing keys in i18n dictionaries.
3. Replace literals with `t(key)` calls.
4. Validate loading/error/empty feedback matches migrated feature expectations.
5. Verify translated behavior in tests where feasible.

## Definition of done
- No hardcoded user-facing text remains in touched React UI.
- Screen is usable and understandable in both ES and EN.
- Migration quality is consistent with project UX conventions.
