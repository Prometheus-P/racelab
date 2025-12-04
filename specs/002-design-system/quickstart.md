# Quickstart: KRace Design System

**Feature**: 002-design-system
**Date**: 2025-12-04

## Overview

The KRace Design System provides M3-compliant components, tokens, and patterns for building consistent, accessible UI across the platform.

## Installation

No additional packages required. The design system is built into the project.

## Basic Usage

### 1. Import Components

```tsx
// Individual imports
import { M3Button, M3Card, M3Chip } from '@/components/ui';
import { RaceLabLogo } from '@/components/brand';

// Or import specific component
import { M3Button } from '@/components/ui/M3Button';
```

### 2. Use Design Tokens

Tokens are available via Tailwind CSS classes:

```tsx
// Colors
<div className="bg-surface text-on-surface">
  <span className="text-horse">Horse Racing</span>
  <span className="text-cycle">Cycle Racing</span>
  <span className="text-boat">Boat Racing</span>
</div>

// Typography
<h1 className="text-headline-large">Title</h1>
<p className="text-body-medium">Body text</p>
<span className="text-label-small">Label</span>

// Elevation
<div className="shadow-m3-1">Level 1</div>
<div className="shadow-m3-3">Level 3</div>

// Spacing (4dp grid)
<div className="p-md gap-sm">Padding 16px, gap 8px</div>

// Border radius
<div className="rounded-m3-md">12px radius</div>
```

### 3. Animations

Use animation tokens in Tailwind:

```tsx
// Transition timing
<button className="transition-all duration-m3-medium ease-m3-standard">
  Hover me
</button>

// Reduced motion support is automatic
// Animations respect prefers-reduced-motion
```

---

## Component Examples

### Button

```tsx
import { M3Button } from '@/components/ui';

// Variants
<M3Button variant="filled">Primary Action</M3Button>
<M3Button variant="outlined">Secondary</M3Button>
<M3Button variant="text">Tertiary</M3Button>
<M3Button variant="elevated">Elevated</M3Button>
<M3Button variant="tonal">Tonal</M3Button>

// Colors
<M3Button color="horse">Horse Race</M3Button>
<M3Button color="cycle">Cycle Race</M3Button>
<M3Button color="boat">Boat Race</M3Button>

// States
<M3Button loading>Loading...</M3Button>
<M3Button disabled>Disabled</M3Button>

// With icons
<M3Button startIcon={<SearchIcon />}>Search</M3Button>
```

### Card

```tsx
import { M3Card } from '@/components/ui';

// Basic card
<M3Card>
  <h3>Race Results</h3>
  <p>Content here</p>
</M3Card>

// Interactive card
<M3Card interactive onClick={() => navigate('/race/123')}>
  Clickable content
</M3Card>

// Variants
<M3Card variant="elevated" elevation={2}>Elevated</M3Card>
<M3Card variant="filled">Filled background</M3Card>
<M3Card variant="outlined">Outlined border</M3Card>
```

### Chip

```tsx
import { M3Chip } from '@/components/ui';

// Filter chip (default)
<M3Chip selected={isSelected} onClick={toggle}>
  Filter Option
</M3Chip>

// Race type chips
<M3Chip color="horse" selected>경마</M3Chip>
<M3Chip color="cycle" selected>경륜</M3Chip>
<M3Chip color="boat" selected>경정</M3Chip>

// With delete
<M3Chip onDelete={handleDelete}>Removable</M3Chip>
```

### TextField

```tsx
import { M3TextField } from '@/components/ui';

<M3TextField
  label="Search"
  value={query}
  onChange={setQuery}
  placeholder="Enter jockey name..."
/>

// With validation
<M3TextField
  label="Email"
  value={email}
  onChange={setEmail}
  error={!isValid}
  errorText="Invalid email format"
  type="email"
/>
```

### SearchBar

```tsx
import { M3SearchBar } from '@/components/ui';

<M3SearchBar
  value={searchQuery}
  onChange={setSearchQuery}
  onSearch={handleSearch}
  placeholder="Search races..."
/>
```

### Dialog

```tsx
import { M3Dialog, M3Button } from '@/components/ui';

<M3Dialog
  open={isOpen}
  onClose={() => setIsOpen(false)}
  title="Confirm Action"
  actions={
    <>
      <M3Button variant="text" onClick={onCancel}>Cancel</M3Button>
      <M3Button onClick={onConfirm}>Confirm</M3Button>
    </>
  }
>
  Are you sure you want to proceed?
</M3Dialog>
```

### Snackbar

```tsx
import { M3Snackbar } from '@/components/ui';

<M3Snackbar
  open={showNotification}
  message="Results saved successfully"
  severity="success"
  onClose={() => setShowNotification(false)}
/>
```

### Skeleton

```tsx
import { Skeleton } from '@/components/ui';

// Text placeholder
<Skeleton variant="text" width="80%" />

// Rectangle
<Skeleton variant="rectangular" width={200} height={100} />

// Circular (for avatars)
<Skeleton variant="circular" width={48} height={48} />

// No animation
<Skeleton animation={false} />
```

### Logo

```tsx
import { RaceLabLogo } from '@/components/brand';

// Full logo (default)
<RaceLabLogo />

// Symbol only (for small spaces)
<RaceLabLogo variant="symbol" size="sm" />

// Clickable (links to home)
<RaceLabLogo onClick={() => navigate('/')} />
```

---

## Hooks

### useReducedMotion

```tsx
import { useReducedMotion } from '@/hooks/useReducedMotion';

function AnimatedComponent() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      animate={{ opacity: 1 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
    >
      Content
    </motion.div>
  );
}
```

---

## Design Tokens Reference

### Colors

| Token | Tailwind Class | Value |
|-------|----------------|-------|
| Primary | `text-primary`, `bg-primary` | #1d4ed8 |
| Horse | `text-horse`, `bg-horse` | #2d5a27 |
| Cycle | `text-cycle`, `bg-cycle` | #dc2626 |
| Boat | `text-boat`, `bg-boat` | #0369a1 |
| Surface | `bg-surface` | #ffffff |
| On-Surface | `text-on-surface` | #1e293b |
| Outline | `border-outline` | #94a3b8 |

### Typography

| Scale | Tailwind Class | Size/Line Height |
|-------|----------------|------------------|
| Display Large | `text-display-large` | 57px/64px |
| Headline Large | `text-headline-large` | 32px/40px |
| Title Large | `text-title-large` | 22px/28px |
| Body Large | `text-body-large` | 16px/24px |
| Body Medium | `text-body-medium` | 14px/20px |
| Label Large | `text-label-large` | 14px/20px |

### Elevation

| Level | Tailwind Class | Usage |
|-------|----------------|-------|
| 0 | - | Flat surfaces |
| 1 | `shadow-m3-1` | Cards at rest |
| 2 | `shadow-m3-2` | Cards on hover |
| 3 | `shadow-m3-3` | Dialogs |
| 4 | `shadow-m3-4` | Navigation drawers |
| 5 | `shadow-m3-5` | Modal overlays |

### Motion

| Token | Tailwind Class | Value |
|-------|----------------|-------|
| Duration Short | `duration-m3-short` | 150ms |
| Duration Medium | `duration-m3-medium` | 300ms |
| Duration Long | `duration-m3-long` | 500ms |
| Ease Standard | `ease-m3-standard` | cubic-bezier(0.2, 0, 0, 1) |
| Ease Emphasized | `ease-m3-emphasized` | cubic-bezier(0.2, 0, 0, 1) |

---

## Best Practices

### Touch Targets

All interactive elements must be at least 48x48dp:

```tsx
// ✅ Good - meets touch target
<M3Button size="md">Click me</M3Button>

// ❌ Bad - too small
<button className="w-6 h-6">X</button>

// ✅ Fixed - extended hit area
<button className="w-6 h-6 min-w-[48px] min-h-[48px]">X</button>
```

### Contrast

Ensure WCAG AA compliance (4.5:1 for text):

```tsx
// ✅ Good - sufficient contrast
<p className="text-on-surface bg-surface">Dark on light</p>

// ❌ Bad - low contrast
<p className="text-outline bg-surface-container">Light on light</p>
```

### Reduced Motion

Always respect user preferences:

```tsx
// ✅ Automatic - components handle this
<M3Button>Ripple respects prefers-reduced-motion</M3Button>

// ✅ Manual check when needed
const prefersReducedMotion = useReducedMotion();
const animationDuration = prefersReducedMotion ? 0 : 300;
```

### Mobile First

Design for mobile, enhance for desktop:

```tsx
// ✅ Good - mobile first
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  {/* Cards stack on mobile, grid on larger screens */}
</div>

// ❌ Bad - desktop first
<div className="grid grid-cols-3 sm:grid-cols-1">
  {/* Harder to maintain */}
</div>
```

---

## Testing

Components include test IDs for automated testing:

```tsx
// In component
<M3Button data-testid="submit-button">Submit</M3Button>

// In test
const button = screen.getByTestId('submit-button');
expect(button).toBeInTheDocument();
```

Visual regression tests verify consistency:

```bash
# Run visual tests
npm run test:e2e -- --grep "visual"
```
