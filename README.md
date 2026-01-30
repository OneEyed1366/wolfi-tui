# wolf-tui

<!-- TODO: Add logo -->

**Build beautiful TUI apps with React, Vue, or Angular**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D20-green)](https://nodejs.org/)

<!-- TODO: Add terminal screenshot demo -->

## What is wolf-tui?

wolf-tui is a framework-agnostic Terminal User Interface (TUI) library that lets you build interactive command-line applications using familiar web component syntax. Write your CLI apps with React, Vue, or Angular using JSX/template syntax, Flexbox/Grid layouts, and CSS-like styling.

## Credits

This project started as a fork of [Ink](https://github.com/vadimdemedes/ink) by Vadim Demedes. The React package (`@wolfie/react`) builds upon Ink's foundation and includes components from the ink-\* ecosystem. wolf-tui extends this to support Vue and Angular, and introduces the Taffy layout engine.

## Features

- **Multi-framework** — React 19+, Vue 3.5+, Angular 17+
- **Modern layout** — Flexbox & CSS Grid via Taffy engine
- **Rich styling** — Tailwind CSS (v3 & v4), SCSS, LESS, Stylus, CSS Modules
- **Tree-shakeable** — Only bundle what you use; tested with esbuild, Vite, webpack
- **Build tools** — Vite, esbuild, webpack, Rollup (via unplugin)
- **Component library** — Inputs, alerts, spinners, progress bars, lists
- **Keyboard handling** — Focus management, Tab navigation
- **Accessibility** — Screen reader support

### Framework-Specific Features

| Framework   | Key Features                                                      |
| ----------- | ----------------------------------------------------------------- |
| **React**   | React Compiler for automatic memoization, React 19+ features      |
| **Vue**     | SFC (`.vue`) and JSX/TSX support, Composition API                 |
| **Angular** | Signals (`signal`, `computed`, `effect`), OnPush change detection |

## Quick Start

### React

```bash
npm install @wolfie/react @wolfie/plugin chalk
```

```tsx
import { render, Box, Text } from '@wolfie/react'

function App() {
	return (
		<Box flexDirection="column" padding={1}>
			<Text color="green">Hello from wolf-tui!</Text>
		</Box>
	)
}

render(<App />)
```

### Vue

```bash
npm install @wolfie/vue @wolfie/plugin chalk
```

```vue
<script setup>
import { Box, Text } from '@wolfie/vue'
</script>

<template>
	<Box flexDirection="column" :padding="1">
		<Text color="green">Hello from wolf-tui!</Text>
	</Box>
</template>
```

### Angular

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
		<w-box flexDirection="column" [padding]="1">
			<w-text color="green">Hello from wolf-tui!</w-text>
		</w-box>
	`,
})
export class AppComponent {}
```

## Packages

| Package                                             | Description                                | Version |
| --------------------------------------------------- | ------------------------------------------ | ------- |
| [@wolfie/core](internal/core/README.md)             | Framework-agnostic TUI core engine         | 2.0.0   |
| [@wolfie/react](packages/react/README.md)           | React adapter (fork of Ink)                | 0.10.0  |
| [@wolfie/vue](packages/vue/README.md)               | Vue 3 adapter                              | 0.1.0   |
| [@wolfie/angular](packages/angular/README.md)       | Angular adapter                            | 0.1.0   |
| [@wolfie/plugin](packages/plugin/README.md)         | Build plugin (Vite/esbuild/webpack/Rollup) | 0.1.0   |
| [@wolfie/css-parser](internal/css-parser/README.md) | CSS/SCSS/LESS/Stylus parser                | 0.1.0   |

## Layout Engine (Taffy)

wolf-tui v2.0 uses [Taffy](https://github.com/DioxusLabs/taffy), a high-performance Rust-based layout engine.

**Why Taffy?**

- **Flexbox + CSS Grid** — Yoga only supports Flexbox
- **Framework-agnostic** — Works with any rendering system
- **Better performance** — Optimized Rust implementation
- **Active development** — Maintained by DioxusLabs community

**Integration:**

- Native Node.js bindings via napi-rs (not WASM)
- Supports `calc()` values
- Cross-platform: Linux (x64/arm64), macOS (Intel/Apple Silicon), Windows

## Styling

### Relative Units

| Unit  | Description     | Terminal Conversion                     |
| ----- | --------------- | --------------------------------------- |
| `px`  | Pixels          | value / 4 cells                         |
| `rem` | Root em         | value × 4 cells (1rem = 16px = 4 cells) |
| `%`   | Percentage      | Dynamic (parent-based)                  |
| `vw`  | Viewport width  | Terminal columns                        |
| `vh`  | Viewport height | Terminal rows                           |
| `ch`  | Character width | 1 cell per ch                           |

### Tailwind CSS

Full Tailwind v3.4 and v4.1 support with JIT compilation:

```tsx
<Box className="flex-col p-4 gap-2">
	<Text className="text-green-500 font-bold">Styled with Tailwind</Text>
</Box>
```

Features:

- Arbitrary values: `w-[80]`, `text-[cyan]`
- **Custom OKLCH shim** — Native OKLCH color support in Tailwind
- Modern color functions: `oklch()`, `hsl()`, `lab()`, `lch()`

### Colors

- 140+ named CSS colors mapped to ANSI
- Hex: `#fff`, `#ffffff`
- RGB/RGBA: `rgb(255 0 0)`, `rgba(255, 0, 0, 0.5)`
- OKLCH, HSL, LAB, LCH via colorjs.io

### Preprocessors

- **SCSS/Sass** — Full nesting and imports
- **LESS** — Variables and nesting
- **Stylus** — Indentation-based syntax
- **PostCSS** — Plugin pipeline

## Components

### Layout

`Box`, `Text`, `Spacer`, `Newline`, `Static`, `Transform`

### Display

`Alert`, `Badge`, `Spinner`, `ProgressBar`, `StatusMessage`, `ErrorOverview`

### Lists

`OrderedList`, `UnorderedList`

### Inputs

`TextInput`, `PasswordInput`, `EmailInput`, `ConfirmInput`, `Select`, `MultiSelect`

See package READMEs for full API documentation.

## Development

```bash
git clone https://github.com/user/wolf-tui.git
cd wolf-tui
pnpm install
pnpm dev
```

### Commands

| Command          | Description                 |
| ---------------- | --------------------------- |
| `pnpm dev`       | Watch mode for all packages |
| `pnpm build`     | Build all packages          |
| `pnpm test`      | Run all tests               |
| `pnpm lint`      | Check code style            |
| `pnpm typecheck` | TypeScript type checking    |

## Status

| Package         | Status          |
| --------------- | --------------- |
| @wolfie/react   | Stable (0.10.0) |
| @wolfie/vue     | Early (0.1.0)   |
| @wolfie/angular | Early (0.1.0)   |
| Taffy migration | Complete        |

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup and guidelines.

## License

MIT
