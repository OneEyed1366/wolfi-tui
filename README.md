# wolf-tui

### Write CLI apps with your web framework — React, Vue, Angular, Solid, or Svelte

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D20-green)](https://nodejs.org/)

[Quick Start](#quick-start) · [Packages](#packages) · [Components](#components) · [Styling](#styling) · [Architecture](#architecture) · [Development](#development)

---

> [!IMPORTANT]
> **What this installs:**
>
> - Native `.node` bindings for the [Taffy](https://github.com/DioxusLabs/taffy) layout engine (Rust → Node via napi-rs, not WASM)
> - Prebuilt for Linux (x64/arm64), macOS (Intel/Apple Silicon), Windows
> - No network calls, no telemetry, no files written outside your project
>
> **Uninstall:** `npm remove @wolfie/react @wolfie/plugin` (substitute your adapter)

## The Problem

Building terminal UIs means choosing between raw ANSI escape codes or framework-specific tools locked to one ecosystem. If you know React, you can use [Ink](https://github.com/vadimdemedes/ink) — but there's nothing for Vue, Angular, Solid, or Svelte. And Ink's layout engine (Yoga) only supports Flexbox.

wolf-tui started as a fork of Ink, then expanded: five framework adapters sharing one layout engine ([Taffy](https://github.com/DioxusLabs/taffy) — Flexbox + CSS Grid), one component library, and one styling pipeline (Tailwind, SCSS, CSS Modules). Write a component once, render it in any adapter.

---

## Quick Start

Pick your framework:

### React

```bash
npm install @wolfie/react @wolfie/plugin chalk
```

```tsx
import { render, Box, Text } from '@wolfie/react'

function App() {
	return (
		<Box style={{ flexDirection: 'column', padding: 1 }}>
			<Text style={{ color: 'green' }}>Hello from wolf-tui!</Text>
		</Box>
	)
}

render(<App />)
```

<details>
<summary><b>Vue</b></summary>

```bash
npm install @wolfie/vue @wolfie/plugin chalk
```

```vue
<script setup>
import { Box, Text } from '@wolfie/vue'
</script>

<template>
	<Box :style="{ flexDirection: 'column', padding: 1 }">
		<Text :style="{ color: 'green' }">Hello from wolf-tui!</Text>
	</Box>
</template>
```

```ts
import { render } from '@wolfie/vue'
import App from './App.vue'

render(App)
```

</details>

<details>
<summary><b>Angular</b></summary>

```bash
npm install @wolfie/angular @wolfie/plugin chalk
```

```typescript
import { Component } from '@angular/core'
import { BoxComponent, TextComponent } from '@wolfie/angular'

@Component({
	standalone: true,
	imports: [BoxComponent, TextComponent],
	template: `
		<w-box [style]="{ flexDirection: 'column', padding: 1 }">
			<w-text [style]="{ color: 'green' }">Hello from wolf-tui!</w-text>
		</w-box>
	`,
})
export class AppComponent {}
```

```ts
import { renderWolfie } from '@wolfie/angular'
import { AppComponent } from './app.component'

renderWolfie(AppComponent)
```

</details>

<details>
<summary><b>SolidJS</b></summary>

```bash
npm install @wolfie/solid @wolfie/plugin chalk solid-js
```

```tsx
import { render, Box, Text } from '@wolfie/solid'

function App() {
	return (
		<Box style={{ flexDirection: 'column' }}>
			<Text style={{ color: 'green' }}>Hello from wolf-tui!</Text>
		</Box>
	)
}

render(App, { stdout: process.stdout, stdin: process.stdin })
```

</details>

<details>
<summary><b>Svelte</b></summary>

```bash
npm install @wolfie/svelte @wolfie/plugin chalk svelte
```

```svelte
<!-- App.svelte -->
<script>
import { Box, Text } from '@wolfie/svelte'
</script>

<Box style={{ flexDirection: 'column', padding: 1 }}>
	<Text style={{ color: 'green', fontWeight: 'bold' }}>Hello from wolf-tui!</Text>
</Box>
```

```ts
import { render } from '@wolfie/svelte'
import App from './App.svelte'

render(App)
```

Svelte requires `--conditions=browser` at runtime and a build step. See the [Svelte adapter README](packages/svelte/README.md) for full setup.

</details>

Each adapter has a detailed README with full API docs, Vite/esbuild/webpack configuration, and component reference.

---

## Packages

| Package                                                           | Description                                | Docs                                           |
| ----------------------------------------------------------------- | ------------------------------------------ | ---------------------------------------------- |
| [@wolfie/core](internal/core/README.md)                           | Layout engine, DOM, renderer               | Core                                           |
| [@wolfie/react](packages/react/README.md)                         | React 19+ adapter                          | [README](packages/react/README.md)             |
| [@wolfie/vue](packages/vue/README.md)                             | Vue 3.5+ adapter                           | [README](packages/vue/README.md)               |
| [@wolfie/angular](packages/angular/README.md)                     | Angular 17+ adapter                        | [README](packages/angular/README.md)           |
| [@wolfie/solid](packages/solid/README.md)                         | SolidJS 1.9+ adapter                       | [README](packages/solid/README.md)             |
| [@wolfie/svelte](packages/svelte/README.md)                       | Svelte 5+ adapter                          | [README](packages/svelte/README.md)            |
| [@wolfie/plugin](packages/plugin/README.md)                       | Build plugin (Vite/esbuild/webpack/Rollup) | [README](packages/plugin/README.md)            |
| [@wolfie/typescript-plugin](packages/typescript-plugin/README.md) | TypeScript plugin for CSS module types     | [README](packages/typescript-plugin/README.md) |
| [@wolfie/css-parser](internal/css-parser/README.md)               | CSS/SCSS/LESS/Stylus parser                | Internal                                       |

---

## Components

All adapters share the same component set:

| Category    | Components                                                                          |
| ----------- | ----------------------------------------------------------------------------------- |
| **Layout**  | `Box`, `Text`, `Spacer`, `Newline`, `Static`, `Transform`                           |
| **Display** | `Alert`, `Badge`, `Spinner`, `ProgressBar`, `StatusMessage`, `ErrorOverview`        |
| **Input**   | `TextInput`, `PasswordInput`, `EmailInput`, `ConfirmInput`, `Select`, `MultiSelect` |
| **Lists**   | `OrderedList`, `UnorderedList`                                                      |

Plus composables/hooks: `useInput`, `useFocus`, `useFocusManager`, stream access, screen reader detection.

See individual adapter READMEs for API details and prop reference.

---

## Styling

```tsx
// Inline styles
<Box style={{ flexDirection: 'column', padding: 1, gap: 1 }}>
	<Text style={{ color: 'green', fontWeight: 'bold' }}>Styled text</Text>
</Box>

// Tailwind CSS (v3.4 / v4.1)
<Box className="flex-col p-4 gap-2">
	<Text className="text-green-500 font-bold">Styled with Tailwind</Text>
</Box>
```

| Method           | Setup                           |
| ---------------- | ------------------------------- |
| Inline styles    | Works out of the box            |
| Tailwind CSS     | PostCSS + `@wolfie/plugin`      |
| CSS Modules      | `*.module.css` imports          |
| SCSS/LESS/Stylus | Preprocessor + `@wolfie/plugin` |

All CSS approaches resolve to terminal styles at build time — no runtime CSS engine.

<details>
<summary><b>Units and colors</b></summary>

**Relative units:**

| Unit        | Terminal conversion                     |
| ----------- | --------------------------------------- |
| `px`        | value / 4 cells                         |
| `rem`       | value × 4 cells (1rem = 16px = 4 cells) |
| `%`         | Dynamic (parent-based)                  |
| `vw` / `vh` | Terminal columns / rows                 |
| `ch`        | 1 cell per ch                           |

**Color support:**

- 140+ named CSS colors mapped to ANSI
- Hex: `#fff`, `#ffffff`
- RGB/RGBA: `rgb(255 0 0)`, `rgba(255, 0, 0, 0.5)`
- OKLCH, HSL, LAB, LCH via colorjs.io
- Tailwind arbitrary values: `text-[cyan]`, `bg-[#ff0]`

</details>

---

## Architecture

```
┌──────────────────┐
│  @wolfie/core    │  Taffy layout, virtual DOM, ANSI renderer
│  (napi-rs)       │  native .node bindings
└────────┬─────────┘
         │
┌────────┴─────────┐
│  @wolfie/shared  │  render scheduler, shared render functions,
│                  │  input parsing, theme system
└────────┬─────────┘
         │
   ┌─────┼─────┬─────────┬──────────┐
   │     │     │         │          │
 React  Vue  Angular  SolidJS   Svelte
```

Each adapter maps its framework's component model to the shared virtual DOM. Taffy computes layout, the core renderer produces ANSI output. A visual bug either affects all adapters (render function issue) or one adapter (integration issue) — two-step debug path.

<details>
<summary><b>Layout engine: Taffy</b></summary>

wolf-tui uses [Taffy](https://github.com/DioxusLabs/taffy) for layout computation. Taffy supports both Flexbox and CSS Grid — Yoga (used by Ink and React Native) only supports Flexbox.

Integration details:

- Native Node.js bindings via napi-rs (not WASM — no startup penalty)
- Supports `calc()` values
- Prebuilt for Linux (x64/arm64), macOS (Intel/Apple Silicon), Windows

</details>

<details>
<summary><b>Performance</b></summary>

**Incremental rendering:** All adapters render only changed terminal lines per frame, not the full screen. Disable for headless testing:

```ts
render(<App />, { incrementalRendering: false })
```

**React Compiler:** `@wolfie/react` ships pre-compiled with the [React Compiler](https://react.dev/learn/react-compiler) — all library components skip re-renders when props haven't changed. To apply to your own components:

```bash
npm install -D babel-plugin-react-compiler
```

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { wolfie } from '@wolfie/plugin/vite'

export default defineConfig({
	plugins: [
		react({
			babel: {
				plugins: [['babel-plugin-react-compiler', {}]],
			},
		}),
		wolfie('react'),
	],
})
```

Requires React 19+.

</details>

---

## Development

```bash
git clone <repo-url>
cd wolf-tui
pnpm install
pnpm dev
```

| Command          | Description                           |
| ---------------- | ------------------------------------- |
| `pnpm dev`       | Watch mode for all packages           |
| `pnpm build`     | Build all packages                    |
| `pnpm test`      | Run all unit tests                    |
| `pnpm test:e2e`  | E2E screenshot tests (20 tests, ~38s) |
| `pnpm lint`      | ESLint check                          |
| `pnpm typecheck` | TypeScript type checking              |

See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines.

---

## Acknowledgments

This project started as a fork of [Ink](https://github.com/vadimdemedes/ink) by Vadim Demedes. The React package (`@wolfie/react`) builds upon Ink's foundation and includes components from the ink-\* ecosystem.

## License

MIT
