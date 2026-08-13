# Theming contract

This is the **published contract** for theming `@phuong-tran-redoc/document-engine-angular`.
Everything the library's CSS reads is listed here. Nothing outside this list is load-bearing.

## TL;DR

```scss
// styles.scss — this one import is the whole baseline.
@use '@phuong-tran-redoc/document-engine-angular/styles';
```

That barrel ships a **default value for every token below**, so the editor looks right
with zero theming. To theme it, declare your own values anywhere — `:root`, `.dark`,
`[data-theme="…"]`, an inline style. The library's defaults are emitted on
`:where(:root)`, which contributes **zero specificity**, so your declaration always
wins regardless of source order. You never need `!important` and you never need to
match a selector shape.

> **The library does not require Tailwind CSS.** It used to reach for utilities like
> `bg-card` and `shadow-elevation-2` in its own templates, which silently required the
> *host* app's `tailwind.config.js` to extend its theme with those exact keys. That is
> fixed — panels now carry their own surface. You may still use Tailwind in your app;
> the library simply no longer depends on your config.

## Colour tokens

Values are plain CSS colours — any format works (`hsl()`, `oklch()`, hex, `rgb()`).

| Token | What it paints | Library default |
| --- | --- | --- |
| `--background` | App-level surface behind controls | `hsl(0 0% 100%)` |
| `--foreground` | Default body text | `hsl(222.2 84% 4.9%)` |
| `--card` | Editor content surface | `hsl(0 0% 100%)` |
| `--card-foreground` | Text on `--card` | `hsl(222.2 84% 4.9%)` |
| `--popover` | **Floating-panel surface** (bubble menus, dropdowns) | `hsl(0 0% 100%)` |
| `--popover-foreground` | Text on `--popover` | `hsl(222.2 84% 4.9%)` |
| `--primary` | Accent: checkbox tick fill, link colour, active toggle | `hsl(222.2 47.4% 11.2%)` |
| `--primary-foreground` | Text/icon on `--primary` | `hsl(210 40% 98%)` |
| `--secondary` | Secondary chip / pressed chip surface | `hsl(210 40% 96.1%)` |
| `--secondary-foreground` | Text on `--secondary` | `hsl(222.2 47.4% 11.2%)` |
| `--muted` | Chip and inline-code background, toolbar strip | `hsl(210 40% 96.1%)` |
| `--muted-foreground` | Secondary/help text, placeholders | `hsl(215.4 16.3% 46.9%)` |
| `--accent` | Hover surface for rows, chips, grid cells | `hsl(210 40% 96.1%)` |
| `--accent-foreground` | Text on `--accent` | `hsl(222.2 47.4% 11.2%)` |
| `--destructive` | Validation errors, destructive actions | `hsl(0 84.2% 60.2%)` |
| `--destructive-foreground` | Text on `--destructive` | `hsl(210 40% 98%)` |
| `--warning` | Character count approaching its limit | `#d97706` (inline fallback only) |
| `--border` | Every rule / divider / panel edge | `hsl(214.3 31.8% 91.4%)` |
| `--input` | Form-control and checkbox-box border | `hsl(214.3 31.8% 91.4%)` |
| `--ring` | Focus ring, focused control border | `hsl(222.2 84% 4.9%)` |

If you already run a shadcn/ui-style token set, these are the same names — nothing to do.

### Dark mode

Nothing in the library hardcodes a light colour, so a dark theme is entirely a matter of
redeclaring the tokens on whatever selector your app toggles:

```css
.dark {
  --background: hsl(222.2 84% 4.9%);
  --foreground: hsl(210 40% 98%);
  --card: hsl(222.2 84% 4.9%);
  --card-foreground: hsl(210 40% 98%);
  --popover: hsl(222.2 84% 4.9%);
  --popover-foreground: hsl(210 40% 98%);
  --muted: hsl(217.2 32.6% 17.5%);
  --muted-foreground: hsl(215 20.2% 65.1%);
  --accent: hsl(217.2 32.6% 17.5%);
  --accent-foreground: hsl(210 40% 98%);
  --border: hsl(217.2 32.6% 17.5%);
  --input: hsl(217.2 32.6% 17.5%);
  --ring: hsl(212.7 26.8% 83.9%);
  --primary: hsl(210 40% 98%);
  --primary-foreground: hsl(222.2 47.4% 11.2%);
}
```

## Elevation tokens

Full `box-shadow` values, not just colours.

| Token | Used by | Library default |
| --- | --- | --- |
| `--shadow-elevation-1` | Inputs, colour-picker swatch popover | `0 1px 2px 0 rgba(0,0,0,.05)` |
| `--shadow-elevation-2` | Floating panels, dropdowns | `0 1px 3px 0 rgba(0,0,0,.1), 0 1px 2px -1px rgba(0,0,0,.1)` |
| `--shadow-elevation-3` | Reserved for higher layers | `0 4px 6px -1px rgba(0,0,0,.1), 0 2px 4px -2px rgba(0,0,0,.1)` |

## Sizing

<a id="sizing"></a>

| Token | Effect | Default |
| --- | --- | --- |
| `--de-editor-min-height` | Minimum height of the editing surface (`.tiptap`) | `12rem` |

The editing surface has **two** ways to be sized, and you can use either:

**1. A floor via the token.** Useful when the editor sits in a page that grows with its
content:

```css
.my-editor { --de-editor-min-height: 20rem; }
/* or opt out of any floor: */
.my-editor { --de-editor-min-height: 0; }
```

**2. Let a parent drive it.** The whole chain
(`document-engine-editor` → `.document-engine-document-editor` →
`__content` → `.tiptap-editor` → `.tiptap`) is a stretchable flex column, so giving the
host element a real height makes the contenteditable fill it:

```css
document-engine-editor { height: 480px; }  /* or 100% of a fixed-height parent */
```

This matters because the contenteditable is the only clickable part of the editor. Before
this contract existed, an empty editor collapsed to a single ~28px line inside a ~480px
box, and clicking the rest of that obvious-looking text field did nothing.

## Content and interaction themes (opt-in)

The main `/styles` barrel is **chrome only** — toolbar, buttons, inputs, panels. It never
styles the document's rendered content, so importing it can never impose a look on your
documents. Two extra sheets are opt-in:

```scss
// Prose inside the document: heading scale, lists, blockquote, code, hr, img, rhythm
@use '@phuong-tran-redoc/document-engine-angular/styles/editor-content';

// Editing affordances: node-view handles, table editing, dynamic fields, placeholders
@use '@phuong-tran-redoc/document-engine-angular/styles/editor-interaction';
```

Both are token-driven with fallbacks and scoped to `.tiptap-editor`. `editor-content`
adds its own scale tokens, all optional:

| Token | Default |
| --- | --- |
| `--de-prose-h1` | `2rem` |
| `--de-prose-h2` | `1.5rem` |
| `--de-prose-h3` | `1.25rem` |
| `--de-prose-h4` | `1.125rem` |
| `--de-prose-h5` | `1rem` |
| `--de-prose-h6` | `0.875rem` |
| `--de-dynamic-field` | `hsl(142.1 76.2% 36.3%)` |
| `--de-selected-cell` | `rgba(59, 130, 246, 0.12)` |

## Page-break tokens (legacy prefix)

The page-break node predates the token naming above and uses a `--document-engine-*`
prefix. Kept as-is because renaming would break anyone already theming it. All three
carry inline fallbacks, so defining them is optional.

| Token | What it paints | Fallback |
| --- | --- | --- |
| `--document-engine-border` | The page-break rule | `oklch(0.922 0 0)` |
| `--document-engine-background` | The page-break label's background | `oklch(1 0 0)` |
| `--document-engine-text-muted` | The page-break label's text | `oklch(0.556 0 0)` |

## Overriding rules instead of tokens

Prefer tokens. The library's view stylesheets ship as **Angular component styles**, which
are injected into `<head>` at runtime and carry an `[_ngcontent-…]` attribute — so they
sit at class-level specificity and your plain-class override would tie and then lose on
source order. Remapping a custom property has no such problem: it is inherited, not
matched, so it always applies.

## Guarantees

These are enforced by `pnpm gate:css` in CI, so they cannot regress silently:

1. **No library template depends on a host Tailwind theme key** — no `bg-card`,
   `border-border`, `shadow-elevation-*`, `text-*-foreground`, `z-<n>` or `hidden`
   utilities in the library's own templates.
2. **No hardcoded theme colour in view stylesheets** — every colour resolves from a token
   (the alpha-checkerboard pattern behind transparent swatches is the one documented
   exception).
3. **Every token the library reads is listed on this page.** A new `var(--…)` in library
   CSS that is not documented here fails the gate.
