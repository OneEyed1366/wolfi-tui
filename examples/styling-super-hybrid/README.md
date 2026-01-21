# Super-Hybrid Styling Example

This example demonstrates combining **4 different styling approaches** in a single TUI application:

## Styling Approaches

### 1. Tailwind CSS v3.4

**File:** `styles/tailwind.css`, `tailwind.config.cjs`

**Use:** Rapid layout, spacing, flexbox utilities

**Example:** `className="p-4 flex-col gap-2"`

---

### 2. SCSS with Nesting

**File:** `styles/components.scss`, `styles/variables.scss`

**Use:** Design tokens, component structure, compound selectors

**Example:**

```scss
.card {
	border-style: $border;
	padding: map-get($spacing, md);

	.title {
		color: map-get($colors, primary);
		font-weight: bold;
	}
}
```

---

### 3. Global CSS

**File:** `styles/global.css`

**Use:** Base styles, resets, global utility classes

**Example:**

```css
.text-base {
	color: white;
}

.text-muted {
	color: gray;
}
```

---

### 4. CSS Modules

**File:** `styles/Button.module.css`, `styles/Card.module.css`

**Use:** Component-scoped styles

**Example:**

```tsx
import buttonStyles from './styles/Button.module.css'
;<Box className={buttonStyles.button}>
	<Text className={buttonStyles.text}>Module Button</Text>
</Box>
```

---

## Compound Selectors

The parser supports **compound selectors** that you can use via space-separated class names:

```tsx
<Box className="btn primary">
	<Text>Primary Button</Text>
</Box>
```

The smart registry lookup finds `.btn.primary` from `className="btn primary"`.

**Supported patterns:**

- `.btn.primary` → use `className="btn primary"`
- `.btn.primary.large` → use `className="btn primary large"`
- `.card.compact` → use `className="card compact"`

---

## Merging Priority

When multiple sources define the same property:

1. **Inline props** (highest)
2. **CSS Modules**
3. **Tailwind utilities**
4. **SCSS/Global CSS** (lowest)

---

## Running the Example

```bash
cd examples/styling-super-hybrid
pnpm install
pnpm dev
```

Or from root:

```bash
pnpm example examples/styling-super-hybrid/index.tsx
```

---

## Key Features Demonstrated

- ✅ Tailwind utilities for layout structure (`p-4 flex-col gap-2`)
- ✅ SCSS variables and nesting for design tokens (`.card .title`)
- ✅ SCSS compound selectors for state variations (`.btn.primary`, `.btn.large`)
- ✅ Global CSS for base styles (`.text-base`)
- ✅ CSS Modules for component-scoped styling (`styles/Button.module.css`)
- ✅ Compound selector resolution (`.card.compact` → `className="card compact"`)
- ✅ Smart merging of all 4 approaches in single UI

---

## Architecture Notes

The example uses:

- **Vite** for development with hot reload
- **@wolfie/css-parser/vite** plugin for CSS transformation
- **Tailwind v3.4** for utility classes
- **Sass** for SCSS preprocessing
- **React** reconciler binding

All 4 styling approaches work together seamlessly in this TUI application.
