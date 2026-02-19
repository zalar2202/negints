# Dark Mode

## Overview

The panel uses **`data-theme`** on `<html>` (`light` or `dark`), **CSS custom properties** in `src/styles/panel.css`, and **ThemeContext** for state. Tailwind v4 + pure CSS only (no SASS).

---

## How it works

- **Toggle:** ThemeToggle in header; theme persisted in localStorage.
- **Variables:** Primary and service colors from `tokens.css` (shared with website); semantic/UI colors in `panel.css` as `--color-*`; `[data-theme="dark"]` overrides for dark mode.
- **System preference:** Fallback when no manual preference (e.g. `prefers-color-scheme: dark`).

---

## Key files

| File | Role |
|------|------|
| `src/styles/tokens.css` | Shared brand colors: `--color-primary`, `--design-color`, `--develop-color`, `--deploy-color`, `--maintain-color` (+ hovers) |
| `src/styles/panel.css` | Panel UI variables (`:root`, `[data-theme="dark"]`); imports tokens |
| `src/contexts/ThemeContext.js` | Theme state, persistence, `useTheme()` |
| `src/components/common/ThemeToggle.js` | Toggle button (Sun/Moon) |

---

## Usage in components

Use CSS variables, not hard-coded colors:

```css
background: var(--color-background);
color: var(--color-text-primary);
border-color: var(--color-border);
```

In React:

```javascript
import { useTheme } from "@/contexts/ThemeContext";

const { theme, toggleTheme } = useTheme();
```

---

## Note on SASS

`src/styles/variables.scss` and `mixins.scss` exist for reference but are **not** imported (Tailwind v4 is not compatible with SASS). Brand/primary colors live in `tokens.css`; panel-specific theme variables in `panel.css`.
