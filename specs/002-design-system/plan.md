# Implementation Plan: User-Friendly Design System

**Branch**: `002-design-system` | **Date**: 2025-12-04 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-design-system/spec.md`

## Summary

Establish a comprehensive M3-based design system for the KRace platform including: RaceLab logo integration (balanced gate symbol with horse/cycle/boat colors), centralized design tokens (colors, typography, spacing, elevation, motion), core UI components with consistent APIs, and animation system supporting reduced motion preferences. The system targets 40-60대 Korean users requiring generous touch targets (48dp minimum) and clear visual hierarchy.

## Technical Context

**Language/Version**: TypeScript 5.9 + Next.js 14.2 (App Router), React 18.3, Tailwind CSS 3.4
**Primary Dependencies**: Tailwind CSS (styling), Pretendard (typography), existing M3 tokens in `src/styles/tokens.ts`
**Storage**: N/A (design system - no data persistence)
**Testing**: Jest 30.2 (jsdom for UI), Playwright (E2E visual regression)
**Target Platform**: Web (responsive: mobile-first, tablet 768px, desktop 1024px)
**Project Type**: Web application (frontend-only for this feature)
**Performance Goals**: Animations complete within 500ms, visual feedback within 100ms
**Constraints**: WCAG AA contrast compliance, 48x48dp touch targets, `prefers-reduced-motion` support
**Scale/Scope**: 15+ documented M3 components, 6 user stories, light mode only (dark mode deferred)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Test-Driven Development | ✅ PASS | Component tests required before implementation |
| II. Structural-Behavioral Separation | ✅ PASS | Token files (structure) separate from component behavior |
| III. Simplicity First | ✅ PASS | Building on existing tokens.ts, minimal abstraction |
| IV. Clear Data Flow | ✅ PASS | Design tokens → Tailwind config → Components (unidirectional) |
| V. Mobile-First Responsive | ✅ PASS | Mobile default, tablet (md:), desktop (lg:) breakpoints |

**Gate Status**: ✅ PASSED - All constitution principles satisfied

## Project Structure

### Documentation (this feature)

```text
specs/002-design-system/
├── plan.md              # This file
├── research.md          # Phase 0: M3 best practices, animation patterns
├── data-model.md        # Phase 1: Design token schema, component props
├── quickstart.md        # Phase 1: Usage guide for design system
├── contracts/           # Phase 1: Component API contracts (TypeScript interfaces)
└── tasks.md             # Phase 2: Implementation tasks (/speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── ui/              # M3 base components (Button, Card, Chip, etc.)
│   │   ├── M3Button.tsx
│   │   ├── M3Card.tsx   # Existing
│   │   ├── M3Chip.tsx   # Existing
│   │   ├── M3TextField.tsx
│   │   ├── M3SearchBar.tsx # Existing
│   │   ├── M3Dialog.tsx
│   │   ├── M3Snackbar.tsx
│   │   ├── Skeleton.tsx
│   │   └── index.ts     # Barrel export
│   └── brand/
│       ├── RaceLabLogo.tsx
│       └── index.ts
├── styles/
│   ├── tokens.ts        # Existing - extend with animation tokens
│   ├── animations.css   # Keyframe animations (shimmer, ripple)
│   └── globals.css      # Global styles, reduced-motion queries
└── hooks/
    └── useReducedMotion.ts

public/
├── racelab-logo.svg     # Extracted from HTML files
├── racelab-symbol.svg   # Symbol-only variant
└── favicon.svg          # Logo as favicon

tailwind.config.ts       # Extend with new M3 tokens
```

**Structure Decision**: Extending existing Next.js web application structure. Design system components in `src/components/ui/`, brand assets in `src/components/brand/`, tokens in `src/styles/tokens.ts`.

## Complexity Tracking

> No violations - design system uses minimal complexity with existing patterns.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | - | - |
