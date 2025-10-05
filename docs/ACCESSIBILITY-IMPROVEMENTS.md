# Accessibility Improvements Documentation

## Overview

This document outlines the accessibility improvements implemented in the Academic Insight PWA application to ensure WCAG 2.1 Level AA compliance and provide an inclusive user experience for all users, including those using assistive technologies.

## Key Improvements

### 1. Keyboard Navigation

#### Skip to Main Content Link
- Added a skip navigation link that appears when focused
- Allows keyboard users to bypass repetitive navigation
- Located at the top of every page
- Styled to be visible only when focused

```tsx
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-md focus:shadow-lg"
>
  Lewati ke konten utama
</a>
```

#### Focus Management
- All interactive elements have visible focus indicators
- Focus ring with 2px offset for better visibility
- Consistent focus styles across all components
- Tab order follows logical reading order

#### Keyboard Shortcuts
- Sidebar navigation fully keyboard accessible
- Modal dialogs trap focus within the dialog
- Escape key closes modals and dropdowns
- Enter/Space activates buttons and links

### 2. ARIA Labels and Attributes

#### Form Elements
All form inputs include:
- `aria-label` or associated `<label>` elements
- `aria-required="true"` for required fields
- `aria-invalid="true"` when validation fails
- `aria-describedby` linking to error messages and help text
- Unique IDs using React's `useId()` hook

Example:
```tsx
<input
  id={`${formId}-nim`}
  name="nim"
  aria-required="true"
  aria-invalid={!!errors.nim}
  aria-describedby={errors.nim ? `${formId}-nim-error` : undefined}
/>
{errors.nim && (
  <p id={`${formId}-nim-error`} role="alert">
    {errors.nim}
  </p>
)}
```

#### Navigation
- `aria-current="page"` on active navigation links
- `aria-label` on navigation landmarks
- `aria-expanded` on expandable menu buttons
- `role="dialog"` and `aria-modal="true"` on modals

#### Loading States
- `role="status"` on loading spinners
- `aria-live="polite"` for non-critical updates
- `aria-live="assertive"` for errors
- `aria-busy="true"` on loading buttons

### 3. Screen Reader Support

#### Announcements
Created utility function to announce messages to screen readers:

```typescript
export function announceToScreenReader(
  message: string, 
  priority: 'polite' | 'assertive' = 'polite'
) {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}
```

#### Screen Reader Only Content
- `.sr-only` utility class for visually hidden content
- Descriptive text for icons and graphics
- Alternative text for images
- Hidden decorative elements with `aria-hidden="true"`

### 4. Semantic HTML

#### Proper Heading Hierarchy
- Single `<h1>` per page
- Logical heading structure (h1 → h2 → h3)
- No skipped heading levels

#### Landmark Regions
- `<main>` for primary content
- `<nav>` for navigation
- `<header>` for page headers
- `<form>` for form sections

#### Lists and Tables
- Proper `<ul>`, `<ol>`, and `<li>` structure
- Table headers with `<th>` elements
- `scope` attributes on table headers

### 5. Color and Contrast

#### Color Contrast Ratios
- Text: minimum 4.5:1 contrast ratio
- Large text: minimum 3:1 contrast ratio
- Interactive elements: minimum 3:1 contrast ratio

#### Color Independence
- Information not conveyed by color alone
- Icons and text labels used together
- Error states indicated by icons + text + color

#### Design Tokens
Created consistent color palette with accessible contrast:

```typescript
export const colors = {
  primary: {
    600: '#2563eb', // Main blue - passes WCAG AA
    700: '#1d4ed8', // Darker blue for hover states
  },
  gray: {
    700: '#374151', // Text color - 4.5:1 on white
    900: '#111827', // Headings - 7:1 on white
  },
  error: {
    500: '#ef4444', // Error red - passes WCAG AA
  },
};
```

### 6. Form Accessibility

#### Input Labels
- All inputs have associated labels
- Labels use `htmlFor` attribute
- Required fields marked with asterisk and `aria-required`
- Help text linked with `aria-describedby`

#### Error Handling
- Inline error messages with `role="alert"`
- Error summary at form top for multiple errors
- Focus moved to first error on submission
- Clear, descriptive error messages in Indonesian

#### Input Types
- Appropriate input types (`email`, `number`, `tel`)
- `autocomplete` attributes for common fields
- `pattern` attributes for format validation
- `min`, `max`, `step` for numeric inputs

### 7. Responsive Design

#### Mobile Accessibility
- Touch targets minimum 44x44px
- Sufficient spacing between interactive elements
- Pinch-to-zoom enabled
- Viewport meta tag properly configured

#### Responsive Breakpoints
```typescript
export const breakpoints = {
  sm: '640px',   // Mobile landscape
  md: '768px',   // Tablet
  lg: '1024px',  // Desktop
  xl: '1280px',  // Large desktop
  '2xl': '1536px', // Extra large
};
```

#### Flexible Layouts
- Fluid typography with relative units
- Flexible grid layouts
- Responsive images with `srcset`
- Mobile-first CSS approach

### 8. Loading and Error States

#### Loading Indicators
- Visible loading spinners with `role="status"`
- Loading text for screen readers
- Disabled state on buttons during loading
- Skeleton screens for content loading

#### Error Messages
- Clear, actionable error messages
- Error boundaries for React errors
- Retry mechanisms for failed requests
- Offline indicators

## Testing

### Automated Testing
Created comprehensive accessibility test suite:

```bash
# Run accessibility tests
npx playwright test e2e/accessibility.spec.ts
```

Test coverage includes:
- Keyboard navigation
- ARIA attributes
- Form accessibility
- Focus management
- Screen reader announcements
- Responsive design
- Color contrast

### Manual Testing Checklist

#### Keyboard Navigation
- [ ] Tab through all interactive elements
- [ ] Shift+Tab navigates backwards
- [ ] Enter/Space activates buttons
- [ ] Escape closes modals
- [ ] Arrow keys navigate menus
- [ ] Focus visible on all elements

#### Screen Reader Testing
- [ ] Test with NVDA (Windows)
- [ ] Test with JAWS (Windows)
- [ ] Test with VoiceOver (macOS/iOS)
- [ ] Test with TalkBack (Android)
- [ ] All content announced correctly
- [ ] Form labels read properly
- [ ] Error messages announced

#### Visual Testing
- [ ] Zoom to 200% - content still usable
- [ ] High contrast mode works
- [ ] Dark mode (if implemented)
- [ ] Color blindness simulation
- [ ] Text spacing adjustments

### Browser Testing
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Android)

## Accessibility Utilities

### Focus Ring Utility
```typescript
export const focusRing = {
  default: 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
  error: 'focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2',
};
```

### Trap Focus in Modal
```typescript
export function trapFocus(element: HTMLElement) {
  const focusableElements = element.querySelectorAll<HTMLElement>(
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
  );
  
  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];
  
  const handleTabKey = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;
    
    if (e.shiftKey) {
      if (document.activeElement === firstFocusable) {
        lastFocusable.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === lastFocusable) {
        firstFocusable.focus();
        e.preventDefault();
      }
    }
  };
  
  element.addEventListener('keydown', handleTabKey);
  firstFocusable?.focus();
  
  return () => {
    element.removeEventListener('keydown', handleTabKey);
  };
}
```

## Best Practices

### Do's
✅ Use semantic HTML elements
✅ Provide text alternatives for images
✅ Ensure sufficient color contrast
✅ Make all functionality keyboard accessible
✅ Use ARIA attributes appropriately
✅ Test with real assistive technologies
✅ Provide clear error messages
✅ Use consistent navigation patterns

### Don'ts
❌ Don't rely on color alone to convey information
❌ Don't use `div` or `span` for interactive elements
❌ Don't remove focus indicators
❌ Don't use placeholder text as labels
❌ Don't auto-play audio or video
❌ Don't use ARIA when HTML semantics suffice
❌ Don't create keyboard traps
❌ Don't use very small text (< 14px)

## Resources

### WCAG Guidelines
- [WCAG 2.1 Level AA](https://www.w3.org/WAI/WCAG21/quickref/?versions=2.1&levels=aa)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)

### Testing Tools
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WAVE Browser Extension](https://wave.webaim.org/extension/)
- [Lighthouse Accessibility Audit](https://developers.google.com/web/tools/lighthouse)
- [Color Contrast Checker](https://webaim.org/resources/contrastchecker/)

### Screen Readers
- [NVDA (Free, Windows)](https://www.nvaccess.org/)
- [JAWS (Windows)](https://www.freedomscientific.com/products/software/jaws/)
- [VoiceOver (macOS/iOS)](https://www.apple.com/accessibility/voiceover/)
- [TalkBack (Android)](https://support.google.com/accessibility/android/answer/6283677)

## Maintenance

### Regular Audits
- Run automated tests before each release
- Conduct manual testing quarterly
- Review new features for accessibility
- Update documentation as needed

### Continuous Improvement
- Monitor user feedback
- Stay updated with WCAG guidelines
- Implement new accessibility features
- Train team on accessibility best practices

## Compliance Statement

This application strives to meet WCAG 2.1 Level AA standards. We are committed to ensuring digital accessibility for people with disabilities and continuously improving the user experience for everyone.

For accessibility concerns or feedback, please contact the development team.

Last Updated: January 2025
