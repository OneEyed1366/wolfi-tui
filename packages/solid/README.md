# @wolfie/solid

SolidJS adapter for wolf-tui. Build terminal user interfaces with Solid.

## About

This package provides SolidJS components ported from the React ecosystem — originally [Ink](https://github.com/vadimdemedes/ink) by Vadim Demedes and the ink-\* component libraries. All components have been reimplemented using Solid's fine-grained reactivity system and the `solid-js/universal` renderer (no Virtual DOM).

## Features

- **Fine-grained reactivity** — No Virtual DOM; leverages Solid's signal-based system for precise updates
- **SolidJS 1.9+** — Built for modern Solid with `createSignal`, `createEffect`, `createMemo`
- **JSX/TSX** — Write components using Solid's JSX transform
- **Tree-shakeable** — Only imports what you use; tested with Vite
- **Full component library** — 20 components: inputs, alerts, spinners, progress bars, lists, selects
- **Composables API** — `useInput`, `useFocus`, `useFocusManager`, and more
- **CSS styling** — Tailwind CSS, CSS Modules, SCSS/LESS/Stylus via `@wolfie/plugin`

## Installation

```bash
npm install @wolfie/solid @wolfie/plugin chalk
# or
pnpm add @wolfie/solid @wolfie/plugin chalk
```

**Peer dependencies:**

- `solid-js` ^1.9.0
- `chalk` ^5.0.0

## TypeScript Setup

Add JSX settings to your `tsconfig.json`:

```json
{
	"compilerOptions": {
		"jsx": "preserve",
		"jsxImportSource": "@wolfie/solid"
	}
}
```

### CSS Module Types with TypeScript Plugin

For enhanced CSS module autocomplete with actual class names (instead of generic `Record<string, Styles>`), install the TypeScript plugin:

```bash
npm install @wolfie/typescript-plugin -D
```

Add to your `tsconfig.json`:

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

### CSS IntelliSense in VS Code

For Wolfie-specific CSS property suggestions (e.g., `border-style: single`), add the CSS Custom Data file to your VS Code settings:

```json
// .vscode/settings.json
{
	"css.customData": ["./node_modules/@wolfie/plugin/wolfie.css-data.json"]
}
```

## Quick Start

```tsx
import { Box, Text, render } from '@wolfie/solid'

function App() {
	return (
		<Box style={{ flexDirection: 'column', padding: 1 }}>
			<Text style={{ color: 'green', fontWeight: 'bold' }}>
				Hello, Terminal!
			</Text>
			<Text>Built with wolf-tui</Text>
		</Box>
	)
}

render(App)
```

### Vite Configuration

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import solidPlugin from 'vite-plugin-solid'
import { wolfie } from '@wolfie/plugin/vite'

export default defineConfig({
	plugins: [solidPlugin(), wolfie('solid')],
})
```

### esbuild Configuration

```ts
// build.mjs
import * as esbuild from 'esbuild'
import { wolfie, generateNativeBanner } from '@wolfie/plugin/esbuild'

await esbuild.build({
	entryPoints: ['src/index.tsx'],
	bundle: true,
	platform: 'node',
	format: 'cjs',
	banner: {
		js: generateNativeBanner('cjs'), // Required for native binding resolution
	},
	plugins: [wolfie('solid')],
})
```

### webpack Configuration

```js
// webpack.config.cjs
const { wolfie } = require('@wolfie/plugin/webpack')

module.exports = {
	plugins: [wolfie('solid')],
}
```

## Render Function

### `render(component, options?)`

Renders a Solid component to the terminal. The first argument is a **component function**, not a JSX element.

```tsx
import { render } from '@wolfie/solid'

function App() {
	return <Text>Hello</Text>
}

// Pass the function reference — not <App />
const instance = render(App, {
	stdout: process.stdout,
	stdin: process.stdin,
	maxFps: 30,
	debug: false,
})

// Unmount when done
instance.unmount()
```

#### Options

| Option                  | Type                 | Default          | Description        |
| ----------------------- | -------------------- | ---------------- | ------------------ |
| `stdout`                | `NodeJS.WriteStream` | `process.stdout` | Output stream      |
| `stdin`                 | `NodeJS.ReadStream`  | `process.stdin`  | Input stream       |
| `stderr`                | `NodeJS.WriteStream` | `process.stderr` | Error stream       |
| `maxFps`                | `number`             | `30`             | Maximum render FPS |
| `debug`                 | `boolean`            | `false`          | Disable throttling |
| `isScreenReaderEnabled` | `boolean`            | env-based        | Screen reader mode |
| `theme`                 | `ITheme`             | `{}`             | Component theming  |

---

## Components

### Layout Components

#### `<Box>`

Flexbox container for layout. Accepts `style` prop with layout properties and `className` for CSS classes.

```tsx
<Box style={{ flexDirection: 'column', padding: 1, gap: 1 }}>
	<Text>Item 1</Text>
	<Text>Item 2</Text>
</Box>
```

| Prop          | Type             | Description                                         |
| ------------- | ---------------- | --------------------------------------------------- |
| `style`       | `Styles`         | Layout and visual styles (flexbox, padding, border) |
| `className`   | `ClassNameValue` | CSS class name(s) for style resolution              |
| `aria-label`  | `string`         | Accessible label                                    |
| `aria-hidden` | `boolean`        | Hide from screen readers                            |
| `aria-role`   | `AriaRole`       | ARIA role                                           |
| `aria-state`  | `AriaState`      | ARIA state attributes                               |
| `children`    | `JSX.Element`    | Child elements                                      |

**Style properties** (passed via `style`):

| Property         | Type                                                                          | Description          |
| ---------------- | ----------------------------------------------------------------------------- | -------------------- |
| `flexDirection`  | `'row' \| 'column' \| 'row-reverse' \| 'column-reverse'`                      | Flex direction       |
| `flexWrap`       | `'wrap' \| 'nowrap' \| 'wrap-reverse'`                                        | Flex wrap            |
| `flexGrow`       | `number`                                                                      | Flex grow factor     |
| `flexShrink`     | `number`                                                                      | Flex shrink factor   |
| `alignItems`     | `'flex-start' \| 'center' \| 'flex-end' \| 'stretch'`                         | Cross-axis alignment |
| `justifyContent` | `'flex-start' \| 'center' \| 'flex-end' \| 'space-between' \| 'space-around'` | Main-axis alignment  |
| `gap`            | `number`                                                                      | Gap between items    |
| `width`          | `number \| string`                                                            | Width                |
| `height`         | `number \| string`                                                            | Height               |
| `padding`        | `number`                                                                      | Padding (all sides)  |
| `margin`         | `number`                                                                      | Margin (all sides)   |
| `borderStyle`    | `'single' \| 'double' \| 'round' \| 'classic'`                                | Border style         |
| `borderColor`    | `string`                                                                      | Border color         |
| `overflow`       | `'visible' \| 'hidden'`                                                       | Overflow behavior    |

#### `<Text>`

Text rendering with styling. Accepts `style` prop for text appearance.

```tsx
<Text
	style={{ color: 'green', fontWeight: 'bold', textDecoration: 'underline' }}
>
	Styled text
</Text>
```

| Prop          | Type             | Description                             |
| ------------- | ---------------- | --------------------------------------- |
| `style`       | `Styles`         | Text styles (color, weight, decoration) |
| `className`   | `ClassNameValue` | CSS class name(s) for style resolution  |
| `aria-label`  | `string`         | Accessible label                        |
| `aria-hidden` | `boolean`        | Hide from screen readers                |
| `children`    | `JSX.Element`    | Text content                            |

**Style properties** (passed via `style`):

| Property          | Type                                     | Description                   |
| ----------------- | ---------------------------------------- | ----------------------------- |
| `color`           | `string`                                 | Text color (ANSI name or hex) |
| `backgroundColor` | `string`                                 | Background color              |
| `fontWeight`      | `'bold'`                                 | Bold text                     |
| `fontStyle`       | `'italic'`                               | Italic text                   |
| `textDecoration`  | `'underline' \| 'line-through'`          | Underline or strikethrough    |
| `inverse`         | `boolean`                                | Inverse colors                |
| `textWrap`        | `'wrap' \| 'truncate' \| 'truncate-end'` | Text wrap mode                |

#### `<Newline>`

Adds empty lines.

```tsx
<Newline count={2} />
```

#### `<Spacer>`

Flexible space that fills available area.

```tsx
<Box>
	<Text>Left</Text>
	<Spacer />
	<Text>Right</Text>
</Box>
```

#### `<Static>`

Renders static content that won't re-render. Uses a render function as children.

```tsx
<Static items={logs}>{(item, index) => <Text>{item.message}</Text>}</Static>
```

| Prop       | Type                                  | Description      |
| ---------- | ------------------------------------- | ---------------- |
| `items`    | `T[]`                                 | Items to render  |
| `style`    | `Styles`                              | Container styles |
| `children` | `(item: T, index: number) => Element` | Render function  |

#### `<Transform>`

Transforms child text via a string transform function.

```tsx
<Transform transform={(text) => text.toUpperCase()}>
	<Text>will be uppercase</Text>
</Transform>
```

---

### Display Components

#### `<Alert>`

Alert messages with variant styling and rounded border.

```tsx
<Alert variant="success" title="Done!">
	Operation completed successfully.
</Alert>
```

| Prop       | Type                                          | Description   |
| ---------- | --------------------------------------------- | ------------- |
| `variant`  | `'success' \| 'error' \| 'warning' \| 'info'` | Alert variant |
| `title`    | `string`                                      | Alert title   |
| `children` | `JSX.Element`                                 | Alert content |

#### `<Badge>`

Small label badges with background color.

```tsx
<Badge color="green">NEW</Badge>
```

| Prop       | Type          | Description                         |
| ---------- | ------------- | ----------------------------------- |
| `color`    | `string`      | Background color (default: magenta) |
| `style`    | `Styles`      | Additional styles                   |
| `children` | `JSX.Element` | Badge text                          |

#### `<Spinner>`

Animated loading spinner with optional label.

```tsx
<Spinner label="Loading..." />
```

| Prop    | Type     | Description        |
| ------- | -------- | ------------------ |
| `label` | `string` | Text after spinner |

#### `<ProgressBar>`

Progress indicator. Value range is **0-100** (not 0-1).

```tsx
<ProgressBar value={75} />
```

| Prop    | Type     | Description            |
| ------- | -------- | ---------------------- |
| `value` | `number` | Progress value (0-100) |

#### `<StatusMessage>`

Status indicator with variant icon.

```tsx
<StatusMessage variant="success">Saved!</StatusMessage>
```

| Prop       | Type                                          | Description     |
| ---------- | --------------------------------------------- | --------------- |
| `variant`  | `'success' \| 'error' \| 'warning' \| 'info'` | Status variant  |
| `children` | `JSX.Element`                                 | Message content |

#### `<ErrorOverview>`

Error display with stack trace formatting.

```tsx
<ErrorOverview error={error} />
```

| Prop    | Type    | Description      |
| ------- | ------- | ---------------- |
| `error` | `Error` | Error to display |

---

### List Components

#### `<OrderedList>` / `<OrderedListItem>`

Numbered lists with automatic indexing.

```tsx
<OrderedList>
	<OrderedListItem>First item</OrderedListItem>
	<OrderedListItem>Second item</OrderedListItem>
</OrderedList>
```

#### `<UnorderedList>` / `<UnorderedListItem>`

Bullet lists with depth-aware markers. Supports nesting with automatic marker cycling.

```tsx
<UnorderedList>
	<UnorderedListItem>Item one</UnorderedListItem>
	<UnorderedListItem>Item two</UnorderedListItem>
</UnorderedList>
```

---

### Input Components

#### `<TextInput>`

Text input field with optional suggestions and placeholder.

```tsx
<TextInput
	placeholder="Enter text..."
	defaultValue=""
	onChange={(value) => console.log(value)}
	onSubmit={(value) => console.log('Submitted:', value)}
/>
```

| Prop           | Type                      | Description              |
| -------------- | ------------------------- | ------------------------ |
| `isDisabled`   | `boolean`                 | Disable input            |
| `placeholder`  | `string`                  | Placeholder text         |
| `defaultValue` | `string`                  | Initial value            |
| `suggestions`  | `string[]`                | Autocomplete suggestions |
| `onChange`     | `(value: string) => void` | Value change callback    |
| `onSubmit`     | `(value: string) => void` | Enter key callback       |

#### `<PasswordInput>`

Masked password input. Same API as `<TextInput>`.

```tsx
<PasswordInput
	placeholder="Password"
	onChange={(value) => setPassword(value)}
/>
```

#### `<EmailInput>`

Email input with validation. Same API as `<TextInput>`.

```tsx
<EmailInput
	placeholder="you@example.com"
	onChange={(value) => setEmail(value)}
	onSubmit={handleSubmit}
/>
```

#### `<ConfirmInput>`

Yes/No confirmation prompt.

```tsx
<ConfirmInput
	onConfirm={() => console.log('Yes')}
	onCancel={() => console.log('No')}
/>
```

| Prop            | Type                    | Description                                |
| --------------- | ----------------------- | ------------------------------------------ |
| `isDisabled`    | `boolean`               | Disable input                              |
| `defaultChoice` | `'confirm' \| 'cancel'` | Default choice on Enter (default: confirm) |
| `submitOnEnter` | `boolean`               | Allow Enter to submit (default: true)      |
| `onConfirm`     | `() => void`            | Y key callback                             |
| `onCancel`      | `() => void`            | N key callback                             |

#### `<Select>`

Single selection from an `options` array. Unlike React/Vue, options are passed as a prop (not as child components).

```tsx
<Select
	options={[
		{ label: 'Option A', value: 'a' },
		{ label: 'Option B', value: 'b' },
		{ label: 'Option C', value: 'c' },
	]}
	onChange={(value) => console.log('Selected:', value)}
/>
```

| Prop                 | Type                      | Description                  |
| -------------------- | ------------------------- | ---------------------------- |
| `options`            | `Option[]`                | Array of `{ label, value }`  |
| `isDisabled`         | `boolean`                 | Disable interaction          |
| `visibleOptionCount` | `number`                  | Visible options (default: 5) |
| `highlightText`      | `string`                  | Highlight matching text      |
| `value`              | `string`                  | Controlled value             |
| `defaultValue`       | `string`                  | Default value (uncontrolled) |
| `onChange`           | `(value: string) => void` | Selection change callback    |

#### `<MultiSelect>`

Multiple selection from an `options` array. Same prop-based API as `<Select>`.

```tsx
<MultiSelect
	options={[
		{ label: 'Option A', value: 'a' },
		{ label: 'Option B', value: 'b' },
		{ label: 'Option C', value: 'c' },
	]}
	onChange={(values) => console.log('Selected:', values)}
	onSubmit={(values) => console.log('Submitted:', values)}
/>
```

| Prop                 | Type                        | Description                  |
| -------------------- | --------------------------- | ---------------------------- |
| `options`            | `Option[]`                  | Array of `{ label, value }`  |
| `isDisabled`         | `boolean`                   | Disable interaction          |
| `visibleOptionCount` | `number`                    | Visible options (default: 5) |
| `value`              | `string[]`                  | Controlled value             |
| `defaultValue`       | `string[]`                  | Default value (uncontrolled) |
| `onChange`           | `(value: string[]) => void` | Selection change callback    |
| `onSubmit`           | `(value: string[]) => void` | Enter key callback           |

---

## Composables

### `useInput(handler, options?)`

Handle keyboard input. Registers immediately (no `onMount` needed).

```tsx
import { useInput } from '@wolfie/solid'

function App() {
	useInput((input, key) => {
		if (input === 'q') {
			// Exit
		}
		if (key.upArrow) {
			// Move up
		}
	})

	return <Text>Press q to quit</Text>
}
```

#### Key Object

| Property     | Type      | Description         |
| ------------ | --------- | ------------------- |
| `upArrow`    | `boolean` | Up arrow pressed    |
| `downArrow`  | `boolean` | Down arrow pressed  |
| `leftArrow`  | `boolean` | Left arrow pressed  |
| `rightArrow` | `boolean` | Right arrow pressed |
| `return`     | `boolean` | Enter pressed       |
| `escape`     | `boolean` | Escape pressed      |
| `ctrl`       | `boolean` | Ctrl held           |
| `shift`      | `boolean` | Shift held          |
| `meta`       | `boolean` | Meta key held       |
| `tab`        | `boolean` | Tab pressed         |
| `backspace`  | `boolean` | Backspace pressed   |
| `delete`     | `boolean` | Delete pressed      |
| `pageUp`     | `boolean` | Page Up pressed     |
| `pageDown`   | `boolean` | Page Down pressed   |
| `home`       | `boolean` | Home pressed        |
| `end`        | `boolean` | End pressed         |

#### Options

| Option     | Type            | Default | Description                      |
| ---------- | --------------- | ------- | -------------------------------- |
| `isActive` | `() => boolean` | `true`  | Accessor to enable/disable input |

### `useApp()`

Access app context.

```tsx
import { useApp } from '@wolfie/solid'

function App() {
	const { exit } = useApp()

	return <Text>Running...</Text>
}
```

Returns:

- `exit(error?)` — Exit the app

### `useFocus(options?)`

Make component focusable. Registers immediately (no `onMount` needed).

```tsx
import { useFocus } from '@wolfie/solid'
import { Box, Text } from '@wolfie/solid'

function FocusableItem() {
	const { isFocused } = useFocus({ autoFocus: true })

	return (
		<Box
			style={{
				borderStyle: 'round',
				borderColor: isFocused() ? 'green' : 'gray',
			}}
		>
			<Text>{isFocused() ? 'Focused!' : 'Not focused'}</Text>
		</Box>
	)
}
```

#### Options

| Option      | Type            | Default | Description                       |
| ----------- | --------------- | ------- | --------------------------------- |
| `isActive`  | `() => boolean` | `true`  | Accessor to enable focus          |
| `autoFocus` | `boolean`       | `false` | Auto-focus if no active component |
| `id`        | `string`        | random  | Unique ID for programmatic focus  |

#### Returns

| Property    | Type                   | Description                       |
| ----------- | ---------------------- | --------------------------------- |
| `isFocused` | `() => boolean`        | Signal accessor — whether focused |
| `focus`     | `(id: string) => void` | Focus component by ID             |
| `id`        | `string`               | The component's focus ID          |

### `useFocusManager()`

Manage focus programmatically.

```tsx
import { useFocusManager, useInput } from '@wolfie/solid'

function App() {
	const { focusNext, focusPrevious } = useFocusManager()

	useInput((input, key) => {
		if (key.tab) {
			key.shift ? focusPrevious() : focusNext()
		}
	})

	return <Text>Tab to cycle focus</Text>
}
```

Returns:

- `focusNext()` — Focus next component
- `focusPrevious()` — Focus previous component
- `focus(id)` — Focus component by ID
- `enableFocus()` — Enable focus system
- `disableFocus()` — Disable focus system

### `useStdin()`

Access stdin stream.

```tsx
import { useStdin } from '@wolfie/solid'

function App() {
	const { stdin, isRawModeSupported, setRawMode } = useStdin()
}
```

### `useStdout()`

Access stdout stream.

```tsx
import { useStdout } from '@wolfie/solid'

function App() {
	const { stdout, write } = useStdout()

	write('Direct output\n')
}
```

### `useStderr()`

Access stderr stream.

### `useSpinner(options?)`

Spinner animation composable. Returns a signal accessor for the current frame.

```tsx
import { useSpinner } from '@wolfie/solid'

function Loading() {
	const { frame } = useSpinner({ type: 'dots' })

	return <Text>{frame()} Loading...</Text>
}
```

| Option | Type          | Default  | Description                      |
| ------ | ------------- | -------- | -------------------------------- |
| `type` | `SpinnerName` | `'dots'` | Spinner type (from cli-spinners) |

### `useIsScreenReaderEnabled()`

Check if screen reader mode is active.

### `useTextInputState(props)`

Low-level composable for building custom text input components.

### `useSelectState(props)`

Low-level composable for building custom select components.

### `useMultiSelectState(props)`

Low-level composable for building custom multi-select components.

---

## Solid API Re-exports

For convenience, commonly used Solid APIs are re-exported from `@wolfie/solid`:

```ts
import {
	createSignal,
	createEffect,
	createMemo,
	createComputed,
	createResource,
	onMount,
	onCleanup,
	batch,
	untrack,
	on,
	createContext,
	useContext,
	Show,
	For,
	Switch,
	Match,
	Index,
	ErrorBoundary,
	Suspense,
	children,
	mergeProps,
	splitProps,
} from '@wolfie/solid'
```

---

## Styling

### With Tailwind CSS

```tsx
import './styles.css'
;<Box className="flex-col p-4 gap-2 border-round">
	<Text className="text-green-500 font-bold">Tailwind styled</Text>
</Box>
```

### With CSS Modules

```tsx
import styles from './App.module.css'
;<Box className={styles.container}>
	<Text className={styles.title}>CSS Modules</Text>
</Box>
```

### Inline Styles

```tsx
<Box style={{ flexDirection: 'column', padding: 1, borderStyle: 'round' }}>
	<Text style={{ color: 'green', fontWeight: 'bold' }}>Inline styled</Text>
</Box>
```

### Style Registry

```ts
import { registerStyles, resolveClassName } from '@wolfie/solid'

// Register styles from CSS parser
registerStyles(parsedStyles)

// Resolve class names to style objects
const style = resolveClassName('my-class')
```

---

## Theming

Customize component appearance via the `theme` option in `render()`:

```tsx
import { render, extendTheme } from '@wolfie/solid'

const theme = extendTheme({
	components: {
		Select: {
			styles: {
				container: () => ({ style: { borderStyle: 'round' } }),
			},
		},
	},
})

render(App, { theme })
```

Individual component themes are exported for reference:

```ts
import {
	textInputTheme,
	passwordInputTheme,
	emailInputTheme,
	confirmInputTheme,
	selectTheme,
	multiSelectTheme,
	progressBarTheme,
} from '@wolfie/solid'
```

---

## Key Differences from React/Vue

| Aspect            | React/Vue                         | Solid                                   |
| ----------------- | --------------------------------- | --------------------------------------- |
| Render call       | `render(<App />)`                 | `render(App)`                           |
| State             | `useState` / `ref`                | `createSignal` (returns `[get, set]`)   |
| Computed          | `useMemo` / `computed`            | `createMemo`                            |
| Effects           | `useEffect` / `watchEffect`       | `createEffect`                          |
| Props destructure | Allowed                           | Use `splitProps` (preserves reactivity) |
| Select options    | Child `<SelectOption>` components | `options` array prop                    |
| ProgressBar value | 0-1 (React)                       | 0-100                                   |
| Focus state       | `isFocused` boolean               | `isFocused()` signal accessor           |

---

## Examples

See [`examples/solid/`](../../examples/solid/) directory:

- [`esbuild/`](../../examples/solid/esbuild/) — esbuild setup
- [`webpack/`](../../examples/solid/webpack/) — webpack setup

See also [`../../apps/solid-invaders/`](../../apps/solid-invaders/) for a complete game built with `@wolfie/solid`.

## License

MIT
