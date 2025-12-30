# ETH Cash Back - UI Style

## Overview

This document defines the visual design tokens and styling guidelines for the ETH Cash Back frontend. The style is minimal, modern, and Web3-native.

## Color Palette

### Primary Colors

| Token | Value | Usage |
|-------|-------|-------|
| --color-primary | #6366F1 | Primary actions, links |
| --color-primary-hover | #4F46E5 | Primary hover state |
| --color-primary-light | #C7D2FE | Primary backgrounds |

### Semantic Colors

| Token | Value | Usage |
|-------|-------|-------|
| --color-success | #10B981 | Success states, confirmations |
| --color-success-light | #D1FAE5 | Success backgrounds |
| --color-error | #EF4444 | Error states, warnings |
| --color-error-light | #FEE2E2 | Error backgrounds |
| --color-warning | #F59E0B | Caution, pending states |
| --color-warning-light | #FEF3C7 | Warning backgrounds |

### Neutral Colors

| Token | Value | Usage |
|-------|-------|-------|
| --color-bg | #0F172A | Page background |
| --color-surface | #1E293B | Card backgrounds |
| --color-surface-elevated | #334155 | Elevated surfaces |
| --color-border | #475569 | Borders, dividers |
| --color-text | #F8FAFC | Primary text |
| --color-text-secondary | #94A3B8 | Secondary text |
| --color-text-muted | #64748B | Muted text |

### Web3 Accent Colors

| Token | Value | Usage |
|-------|-------|-------|
| --color-eth | #627EEA | ETH references |
| --color-wallet | #F6851B | Wallet indicators |
| --color-network | #16A34A | Network indicators |

## Typography

### Font Family

```css
--font-family: 'Inter', system-ui, -apple-system, sans-serif;
--font-family-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

### Font Sizes

| Token | Value | Usage |
|-------|-------|-------|
| --text-xs | 0.75rem (12px) | Labels, captions |
| --text-sm | 0.875rem (14px) | Secondary text |
| --text-base | 1rem (16px) | Body text |
| --text-lg | 1.125rem (18px) | Emphasized text |
| --text-xl | 1.25rem (20px) | Subheadings |
| --text-2xl | 1.5rem (24px) | Headings |
| --text-3xl | 1.875rem (30px) | Large headings |

### Font Weights

| Token | Value | Usage |
|-------|-------|-------|
| --font-normal | 400 | Body text |
| --font-medium | 500 | Emphasis |
| --font-semibold | 600 | Buttons, labels |
| --font-bold | 700 | Headings |

### Line Heights

| Token | Value | Usage |
|-------|-------|-------|
| --leading-tight | 1.25 | Headings |
| --leading-normal | 1.5 | Body text |
| --leading-relaxed | 1.75 | Long-form text |

## Spacing

### Base Unit

All spacing derived from 4px base unit.

| Token | Value | Usage |
|-------|-------|-------|
| --space-1 | 0.25rem (4px) | Minimal gaps |
| --space-2 | 0.5rem (8px) | Tight spacing |
| --space-3 | 0.75rem (12px) | Standard gap |
| --space-4 | 1rem (16px) | Component padding |
| --space-5 | 1.25rem (20px) | Section gaps |
| --space-6 | 1.5rem (24px) | Large gaps |
| --space-8 | 2rem (32px) | Section padding |

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| --radius-sm | 0.375rem (6px) | Inputs, small elements |
| --radius-md | 0.5rem (8px) | Buttons, cards |
| --radius-lg | 0.75rem (12px) | Large cards |
| --radius-xl | 1rem (16px) | Modal, main containers |
| --radius-full | 9999px | Pills, avatars |

## Shadows

| Token | Value | Usage |
|-------|-------|-------|
| --shadow-sm | 0 1px 2px rgba(0,0,0,0.3) | Subtle lift |
| --shadow-md | 0 4px 6px rgba(0,0,0,0.4) | Cards |
| --shadow-lg | 0 10px 15px rgba(0,0,0,0.5) | Modals |
| --shadow-glow | 0 0 20px rgba(99,102,241,0.2) | Focus glow |

## Component Styles

### Buttons

**Primary Button**:
```css
.btn-primary {
  background: var(--color-primary);
  color: white;
  font-weight: var(--font-semibold);
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-md);
  transition: background 150ms ease;
}
.btn-primary:hover {
  background: var(--color-primary-hover);
}
.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

**Secondary Button**:
```css
.btn-secondary {
  background: transparent;
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-md);
}
```

### Inputs

```css
.input {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  color: var(--color-text);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-sm);
  font-size: var(--text-base);
}
.input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: var(--shadow-glow);
}
.input::placeholder {
  color: var(--color-text-muted);
}
```

### Cards

```css
.card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  box-shadow: var(--shadow-md);
}
```

### Status Indicators

**Success**:
```css
.status-success {
  color: var(--color-success);
  background: var(--color-success-light);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-sm);
}
```

**Error**:
```css
.status-error {
  color: var(--color-error);
  background: var(--color-error-light);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-sm);
}
```

**Pending**:
```css
.status-pending {
  color: var(--color-warning);
  background: var(--color-warning-light);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-sm);
}
```

## Transitions

| Token | Value | Usage |
|-------|-------|-------|
| --transition-fast | 150ms ease | Hover states |
| --transition-normal | 200ms ease | Standard transitions |
| --transition-slow | 300ms ease | Complex animations |

## Responsive Breakpoints

| Token | Value |
|-------|-------|
| --breakpoint-sm | 640px |
| --breakpoint-md | 768px |
| --breakpoint-lg | 1024px |
| --breakpoint-xl | 1280px |

## Dark Mode

The application uses dark mode by default (no light mode toggle in MVP).

Background gradient suggestion:
```css
body {
  background: linear-gradient(
    135deg,
    var(--color-bg) 0%,
    #1a1a2e 50%,
    var(--color-bg) 100%
  );
  min-height: 100vh;
}
```

## Icon System

Use Heroicons or Lucide for consistent icon style.

Recommended sizes:
- Inline with text: 16px
- Buttons: 20px
- Large indicators: 24px

## Monospace Usage

Use monospace font for:
- Wallet addresses
- Transaction hashes
- ETH amounts
- Error codes

```css
.mono {
  font-family: var(--font-family-mono);
  letter-spacing: -0.02em;
}
```
