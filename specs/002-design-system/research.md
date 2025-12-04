# Research: User-Friendly Design System

**Feature**: 002-design-system
**Date**: 2025-12-04
**Status**: Complete

## Research Topics

### 1. M3 Motion & Animation Tokens

**Decision**: Use M3 standard easing curves with duration tokens

**Rationale**: M3's motion system provides consistent, polished animations that users expect from modern applications. The standard curves balance responsiveness with smoothness.

**Specifications**:

| Token | Cubic-Bezier | Use Case |
|-------|--------------|----------|
| Standard | `cubic-bezier(0.2, 0, 0, 1)` | Default animations |
| Standard Accelerate | `cubic-bezier(0.3, 0, 1, 1)` | Elements exiting |
| Standard Decelerate | `cubic-bezier(0, 0, 0, 1)` | Elements entering |
| Emphasized | `cubic-bezier(0.2, 0, 0, 1)` | Important state changes |
| Emphasized Accelerate | `cubic-bezier(0.3, 0, 0.8, 0.15)` | Exit with emphasis |
| Emphasized Decelerate | `cubic-bezier(0.05, 0.7, 0.1, 1)` | Enter with emphasis |

| Duration Token | Value | Use Case |
|----------------|-------|----------|
| Short 1-4 | 50-200ms | Micro-interactions, ripples |
| Medium 1-4 | 250-400ms | Component transitions |
| Long 1-4 | 450-600ms | Complex transitions, page changes |

**Alternatives Considered**:
- M3 Expressive Motion (physics-based): Too new (requires v1.13.0+), adds complexity
- Custom easing: Would break M3 consistency

**Sources**: [M3 Motion Specs](https://m3.material.io/styles/motion/overview/specs), [Easing & Duration](https://m3.material.io/styles/motion/easing-and-duration/tokens-specs)

---

### 2. Button Ripple Effect Implementation

**Decision**: Pure CSS ripple with JavaScript position tracking

**Rationale**: Pure CSS ripples are limited to center-origin only. JavaScript position tracking provides authentic M3 behavior where ripple originates from click/tap point.

**Implementation Approach**:
```tsx
// Ripple emerges from click point, not center
const handleClick = (e: React.MouseEvent) => {
  const rect = e.currentTarget.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  // Create ripple at (x, y)
};
```

**CSS Animation**:
```css
@keyframes ripple {
  from {
    transform: scale(0);
    opacity: 0.4;
  }
  to {
    transform: scale(4);
    opacity: 0;
  }
}
```

**Duration**: 300ms with ease-out easing per spec table

**Alternatives Considered**:
- Pure CSS `:active` ripple: Cannot track click position
- M3-Ripple library: External dependency, prefer in-house
- No ripple: Violates FR-010, FR-017 requirements

**Sources**: [CSS-Tricks Ripple Tutorial](https://css-tricks.com/how-to-recreate-the-ripple-effect-of-material-design-buttons/), [Pure CSS Ripple](https://codepen.io/finnhvman/pen/jLXKJw)

---

### 3. M3 Elevation System

**Decision**: 5-level elevation system using dual-shadow technique

**Rationale**: M3 uses two shadow layers per elevation level - a closer "umbra" shadow and a distant "penumbra" shadow - creating realistic depth perception.

**Specifications**:

| Level | Box Shadow |
|-------|------------|
| 0 | none |
| 1 | `0px 1px 2px 0px rgb(0 0 0 / 30%), 0px 1px 3px 1px rgb(0 0 0 / 15%)` |
| 2 | `0px 1px 2px 0px rgb(0 0 0 / 30%), 0px 2px 6px 2px rgb(0 0 0 / 15%)` |
| 3 | `0px 1px 3px 0px rgb(0 0 0 / 30%), 0px 4px 8px 3px rgb(0 0 0 / 15%)` |
| 4 | `0px 2px 3px 0px rgb(0 0 0 / 30%), 0px 6px 10px 4px rgb(0 0 0 / 15%)` |
| 5 | `0px 4px 4px 0px rgb(0 0 0 / 30%), 0px 8px 12px 6px rgb(0 0 0 / 15%)` |

**Component Mapping**:
- Level 0: Flat surfaces (backgrounds)
- Level 1: Cards at rest, elevated buttons
- Level 2: Cards on hover, app bars
- Level 3: Dialogs, floating action buttons
- Level 4: Navigation drawers
- Level 5: Modal overlays

**Alternatives Considered**:
- Single shadow: Less realistic, not M3 compliant
- CSS `filter: drop-shadow()`: Performance impact, less control

**Sources**: [M3 Elevation Tokens](https://m3.material.io/styles/elevation/tokens)

---

### 4. Skeleton Loading Animation

**Decision**: CSS shimmer animation with linear gradient

**Rationale**: Shimmer effect provides visual feedback that content is loading without being distracting. Linear animation maintains M3's subtle motion principle.

**Implementation**:
```css
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.skeleton {
  background: linear-gradient(
    90deg,
    var(--surface-container) 25%,
    var(--surface-container-high) 50%,
    var(--surface-container) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s linear infinite;
}
```

**Duration**: 1.5s continuous loop per spec table

**Alternatives Considered**:
- Pulse opacity: Less engaging
- Spinner: Doesn't match content shape
- No animation: Static gray blocks feel broken

---

### 5. Touch Target Sizing

**Decision**: 48x48dp minimum with extended hit areas

**Rationale**: WCAG 2.1 Level AAA and M3 both specify 48dp minimum for touch targets. Extended hit areas (larger tap zone than visual element) improve accessibility for users with motor impairments.

**Implementation**:
```css
.touch-target {
  min-width: 48px;
  min-height: 48px;
  position: relative;
}

/* Extended hit area for small visual elements */
.touch-target::before {
  content: '';
  position: absolute;
  inset: -8px; /* Extends hit area by 8px on all sides */
}
```

**Alternatives Considered**:
- 44x44dp (Apple HIG): Doesn't meet M3 spec
- No extension: Harder for imprecise taps

---

### 6. Reduced Motion Preferences

**Decision**: Respect `prefers-reduced-motion` media query

**Rationale**: Accessibility requirement (FR-016). Users with vestibular disorders or motion sensitivity can disable animations system-wide.

**Implementation**:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

**React Hook**:
```tsx
function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const listener = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  return prefersReducedMotion;
}
```

**Alternatives Considered**:
- User toggle only: Ignores system preference
- No reduced motion support: Accessibility violation

---

### 7. Logo SVG Extraction

**Decision**: Extract and optimize SVG from `racelab_logo_clean.html`

**Rationale**: The logo HTML files contain the authoritative balanced gate design. Extract clean SVG without texture filters for web use.

**Logo Structure**:
```svg
<svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Roof (Horse - Green) -->
  <path d="M60 130 C 60 130, 140 150, 200 150 C 260 150, 340 130, 340 130"
        stroke="#81C784" stroke-width="20" stroke-linecap="round" fill="none" />

  <!-- Core (Cycle - Red) -->
  <rect x="120" y="190" width="160" height="20" rx="10" fill="#E57373" />

  <!-- Base (Boat - Blue) -->
  <path d="M100 240 L 100 320 M 300 240 L 300 320"
        stroke="#64B5F6" stroke-width="20" stroke-linecap="round" />
  <path d="M100 240 C 100 240, 140 270, 200 270 C 260 270, 300 240, 300 240"
        stroke="#64B5F6" stroke-width="20" stroke-linecap="round" fill="none" />

  <!-- Data Nodes -->
  <circle cx="200" cy="150" r="6" fill="#81C784" />
  <circle cx="200" cy="200" r="6" fill="#E57373" />
  <circle cx="200" cy="270" r="6" fill="#64B5F6" />
</svg>
```

**Variants Needed**:
1. Full logo (symbol + text): Header, splash screens
2. Symbol only: Favicon, small spaces
3. Text only: Print contexts

**Color Mapping**:
| Element | Logo Color | Race Type Color |
|---------|------------|-----------------|
| Roof | #81C784 | Horse (#2d5a27) |
| Core | #E57373 | Cycle (#dc2626) |
| Base | #64B5F6 | Boat (#0369a1) |

Note: Logo uses lighter M3-friendly palette while race type colors use darker semantic accents.

---

## Summary

All research topics resolved. No NEEDS CLARIFICATION items remain.

| Topic | Decision | Impact |
|-------|----------|--------|
| Motion tokens | M3 standard curves | FR-013, FR-014 |
| Ripple effect | JS position + CSS animation | FR-010, FR-017 |
| Elevation | 5-level dual-shadow | FR-008 |
| Skeleton | CSS shimmer | FR-015 |
| Touch targets | 48dp + extended hit areas | FR-009, SC-001 |
| Reduced motion | Media query + hook | FR-016 |
| Logo | Extract SVG from HTML | FR-001, FR-002 |
