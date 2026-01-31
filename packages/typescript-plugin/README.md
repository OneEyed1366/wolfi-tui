# @wolfie/typescript-plugin

TypeScript language service plugin that provides type information for CSS module imports in Wolfie projects.

## Features

- **Class name autocomplete** — Type `styles.` and get suggestions for all CSS classes
- **Type-safe access** — Each class returns `Styles` type from `@wolfie/core`
- **Go-to-definition** — Jump from class usage to CSS file definition
- **Hover information** — See type information on hover
- **Preprocessor support** — Works with `.module.css`, `.module.scss`, `.module.less`, `.module.styl`

## Installation

```bash
npm install @wolfie/typescript-plugin -D
# or
pnpm add @wolfie/typescript-plugin -D
```

## Setup

Add the plugin to your `tsconfig.json`:

```json
{
	"compilerOptions": {
		"plugins": [
			{
				"name": "@wolfie/typescript-plugin"
			}
		]
	}
}
```

## Configuration Options

```json
{
	"compilerOptions": {
		"plugins": [
			{
				"name": "@wolfie/typescript-plugin",
				"customMatcher": "\\.module\\.(css|scss)$",
				"classnameTransform": "camelCase"
			}
		]
	}
}
```

| Option               | Type                                | Default                                  | Description                              |
| -------------------- | ----------------------------------- | ---------------------------------------- | ---------------------------------------- |
| `customMatcher`      | `string`                            | `"\\.module\\.(css\|scss\|less\|styl)$"` | Regex pattern to match CSS module files  |
| `classnameTransform` | `'asIs' \| 'camelCase' \| 'dashes'` | `'asIs'`                                 | Transform class names to specific format |

## How It Works

1. **Import detection** — Plugin detects CSS module imports in your TypeScript/Vue files
2. **CSS parsing** — Extracts class names from the CSS file
3. **Type synthesis** — Returns virtual type declarations to TypeScript
4. **IDE integration** — TypeScript language service provides completions and hover info

```ts
// Your code
import styles from './Button.module.css'

// Plugin synthesizes this type:
// const styles: {
//   readonly container: Styles;
//   readonly primary: Styles;
//   readonly disabled: Styles;
// }

// Now you get autocomplete!
styles.container // ✅ Autocomplete works
styles.typo // ❌ TypeScript error (class doesn't exist)
```

## VS Code Setup

For the plugin to work in VS Code, you **must** use the workspace TypeScript version:

1. Open command palette (Ctrl/Cmd + Shift + P)
2. Select "TypeScript: Select TypeScript Version"
3. Choose "Use Workspace Version"

> **Note**: This is required because VS Code uses its own bundled TypeScript by default, which doesn't load workspace plugins.

## Type Declarations for `tsc`

TypeScript plugins **only work in editors** (VS Code, WebStorm, etc.), not during `tsc` compilation. For build-time type checking, add CSS module declarations to your project:

```ts
// env.d.ts or global.d.ts
declare module '*.module.css' {
	import type { Styles } from '@wolfie/core'
	const styles: Record<string, Styles>
	export default styles
}

declare module '*.module.scss' {
	import type { Styles } from '@wolfie/core'
	const styles: Record<string, Styles>
	export default styles
}

declare module '*.module.less' {
	import type { Styles } from '@wolfie/core'
	const styles: Record<string, Styles>
	export default styles
}
```

This provides basic type coverage for `tsc`, while the plugin enhances the editor experience with specific class name completions.

## Vue / Volar Setup

For Vue projects using Volar, the plugin should work automatically once VS Code uses the workspace TypeScript version. Make sure your `tsconfig.json` includes the plugin configuration.

## Limitations

- **IDE only** — Plugin works in editors but not during `tsc` compilation (use module declarations for build)
- **Simple CSS parsing** — Uses regex-based extraction; complex selectors may not be detected
- **No CSS validation** — Plugin doesn't validate CSS syntax, only extracts class names
- **Vue SFC `$style`** — Plugin works with explicit CSS module imports, not Vue's built-in `<style module>` (use Volar for that)

## Related Packages

- [`@wolfie/plugin`](../plugin) — Build plugin for Vite, esbuild, webpack
- [`@wolfie/vue`](../vue) — Vue 3 adapter
- [`@wolfie/react`](../react) — React adapter
- [`@wolfie/core`](../../internal/core) — Core types and utilities

## License

MIT
