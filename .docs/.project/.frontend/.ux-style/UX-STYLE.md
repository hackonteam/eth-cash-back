# ETH Cash Back - UX Style

## Overview

This document defines the interaction patterns, feedback styles, and behavioral guidelines for the ETH Cash Back frontend.

## Interaction Patterns

### Click Behavior

| Element | Click Response |
|---------|----------------|
| Button | Immediate visual feedback (scale 0.98) |
| Link | Color change + cursor |
| Input | Focus with border highlight |
| Card | Subtle highlight if interactive |

### Hover States

| Element | Hover Response |
|---------|----------------|
| Button | Background color shift, cursor pointer |
| Link | Underline or color shift |
| Interactive card | Subtle border highlight |
| Disabled elements | No change, cursor not-allowed |

### Focus States

All interactive elements must have visible focus indicators for keyboard navigation.

```css
*:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
```

## Loading States

### Skeleton Loaders

Use skeleton placeholders for content that is loading:

```
[░░░░░░░░░░░░░░░] Balance loading
[░░░░░░░] Cashback preview loading
```

Skeleton style:
```css
.skeleton {
  background: linear-gradient(
    90deg,
    var(--color-surface) 25%,
    var(--color-surface-elevated) 50%,
    var(--color-surface) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
```

### Button Loading

Replace button text with spinner during async operations:

```
[Submit Transaction]  →  [● Processing...]
```

Button remains same size to prevent layout shift.

### Full-Page Loading

Minimal: centered spinner with optional message.

```
    ●
Loading...
```

## Transition Timings

| Transition Type | Duration | Easing |
|-----------------|----------|--------|
| Hover state | 150ms | ease-out |
| Focus | 100ms | ease-in |
| Modal open | 200ms | ease-out |
| Modal close | 150ms | ease-in |
| State change | 200ms | ease-in-out |
| Page transition | 300ms | ease-in-out |

## Feedback Messages

### Success Messages

Format: Positive statement + detail

```
✓ Transaction confirmed!
  You received 0.02 ETH cashback
```

Duration: Display for 5 seconds or until dismissed.

### Error Messages

Format: What went wrong + what to do

```
✗ Transaction failed
  The network rejected your transaction. Please try again.
  [Retry]
```

Duration: Persist until dismissed or resolved.

### Info Messages

Format: Neutral statement + context

```
ℹ Waiting for wallet confirmation
  Please check your wallet and approve the transaction
```

Duration: While action is pending.

### Warning Messages

Format: Caution + recommendation

```
⚠ Low balance
  You may not have enough ETH for gas. Consider adding funds.
```

## Toast Notifications

Position: Top-right on desktop, bottom-center on mobile.

Animation:
- Enter: Slide in from edge + fade in
- Exit: Slide out + fade out

Auto-dismiss:
- Success: 5 seconds
- Error: No auto-dismiss
- Info: While relevant
- Warning: 8 seconds

## Modal Behavior

### Opening

1. Fade in backdrop (150ms)
2. Scale + fade in modal content (200ms)
3. Focus first interactive element

### Closing

1. Scale + fade out modal content (150ms)
2. Fade out backdrop (100ms)
3. Return focus to trigger element

### Backdrop Behavior

Click outside to close for non-critical modals.

Critical modals (transaction in progress) do not close on backdrop click.

## Form Validation

### Inline Validation

Validate on blur (field exit), not on every keystroke.

Error display:
- Red border on input
- Error message below input
- Error icon in input (optional)

### Validation Messages

| Field | Valid | Invalid Message |
|-------|-------|-----------------|
| Amount | > 0, numeric | "Enter a valid amount" |
| Amount | <= balance | "Insufficient balance" |

## Micro-Animations

### Button Press

```css
.btn:active {
  transform: scale(0.98);
  transition: transform 50ms ease;
}
```

### Success Checkmark

Animated checkmark drawing for confirmation:
- Duration: 400ms
- Easing: ease-out

### Spinner

Smooth rotation, not stepped:
```css
.spinner {
  animation: spin 1s linear infinite;
}
```

### Number Transitions

Animate number changes (e.g., balance updates):
- Duration: 300ms
- Use counter animation for increasing values

## Empty States

### No Transactions Yet

```
┌──────────────────────────────┐
│                              │
│      📦 No transactions      │
│                              │
│   Your cashback journey      │
│   starts with your first     │
│   transaction.               │
│                              │
│   [Submit a Transaction]     │
│                              │
└──────────────────────────────┘
```

### Wallet Not Connected

```
┌──────────────────────────────┐
│                              │
│      🔗 Connect Your Wallet  │
│                              │
│   Connect your wallet to     │
│   start receiving cashback.  │
│                              │
│   [Connect Wallet]           │
│                              │
└──────────────────────────────┘
```

## Confirmation Patterns

### Transaction Confirmation

Before submitting transaction, show summary:

```
Transaction Summary
───────────────────────────────
Amount:      1.0 ETH
Gas (est.):  0.002 ETH
Cashback:    0.02 ETH
───────────────────────────────
Net Cost:    0.982 ETH

[Cancel]  [Confirm Transaction]
```

Note: This is informational. Actual confirmation happens in wallet.

## Scroll Behavior

### Main Content

Smooth scroll for anchor links:
```css
html {
  scroll-behavior: smooth;
}
```

### Within Components

Lists and tables scroll naturally within their containers.

## Touch Interactions

### Touch Feedback

On touch devices, provide immediate feedback:
- Background color change on touch start
- Slight scale reduction

### Swipe (if applicable)

Not used in MVP. Transaction flow is button-based.

## Accessibility Interactions

### Keyboard Navigation

Tab order follows visual order:
1. Header (wallet, network)
2. Amount input
3. Submit button
4. Status/result area

### Screen Reader Announcements

Announce state changes:
```html
<div role="status" aria-live="polite">
  Transaction pending...
</div>
```

Update when state changes to confirmed/error.

### Reduced Motion

Respect user preference:
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```
