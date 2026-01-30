# @wolfie/react

React adapter for wolf-tui. Build terminal user interfaces with React.

## About

This package is a fork of [Ink](https://github.com/vadimdemedes/ink) by Vadim Demedes, extended with additional components from the ink-\* ecosystem. It provides React components and hooks for building interactive CLI applications.

## Features

- **React Compiler** — Built with [React Compiler](https://react.dev/learn/react-compiler) for automatic memoization and optimal performance
- **React 19+** — Leverages latest React features
- **Tree-shakeable** — Only imports what you use; tested with esbuild, Vite, and webpack
- **Full component library** — Inputs, alerts, spinners, progress bars, lists
- **Hooks API** — `useInput`, `useFocus`, `useFocusManager`, and more
- **CSS styling** — Tailwind CSS, CSS Modules, SCSS/LESS/Stylus via `@wolfie/plugin`

## Installation

```bash
npm install @wolfie/react @wolfie/plugin chalk
# or
pnpm add @wolfie/react @wolfie/plugin chalk
```

**Peer dependencies:**

- `react` >= 19.0.0
- `react-reconciler` ^0.33.0
- `chalk` ^5.0.0

## Quick Start

```tsx
import { render, Box, Text } from '@wolfie/react'

function App() {
	return (
		<Box flexDirection="column" padding={1}>
			<Text color="green" bold>
				Hello, Terminal!
			</Text>
			<Text>Built with wolf-tui</Text>
		</Box>
	)
}

render(<App />)
```

## Render Function

### `render(element, options?)`

Renders a React element to the terminal.

```tsx
import { render } from '@wolfie/react'

const { rerender, unmount, waitUntilExit, clear } = render(<App />)

// Re-render with new props
rerender(<App count={1} />)

// Unmount and exit
unmount()

// Wait for app to exit
await waitUntilExit()

// Clear terminal output
clear()
```

#### Options

| Option         | Type                 | Default          | Description           |
| -------------- | -------------------- | ---------------- | --------------------- |
| `stdout`       | `NodeJS.WriteStream` | `process.stdout` | Output stream         |
| `stdin`        | `NodeJS.ReadStream`  | `process.stdin`  | Input stream          |
| `stderr`       | `NodeJS.WriteStream` | `process.stderr` | Error stream          |
| `debug`        | `boolean`            | `false`          | Enable debug mode     |
| `exitOnCtrlC`  | `boolean`            | `true`           | Exit on Ctrl+C        |
| `patchConsole` | `boolean`            | `true`           | Patch console methods |

---

## Components

### Layout Components

#### `<Box>`

Flexbox container for layout.

```tsx
<Box flexDirection="column" padding={1} gap={1}>
	<Text>Item 1</Text>
	<Text>Item 2</Text>
</Box>
```

| Prop             | Type                                                                                            | Description          |
| ---------------- | ----------------------------------------------------------------------------------------------- | -------------------- |
| `flexDirection`  | `'row' \| 'column' \| 'row-reverse' \| 'column-reverse'`                                        | Flex direction       |
| `flexWrap`       | `'wrap' \| 'nowrap' \| 'wrap-reverse'`                                                          | Flex wrap            |
| `flexGrow`       | `number`                                                                                        | Flex grow factor     |
| `flexShrink`     | `number`                                                                                        | Flex shrink factor   |
| `flexBasis`      | `number \| string`                                                                              | Flex basis           |
| `alignItems`     | `'flex-start' \| 'center' \| 'flex-end' \| 'stretch'`                                           | Cross-axis alignment |
| `alignSelf`      | `'flex-start' \| 'center' \| 'flex-end' \| 'auto'`                                              | Self alignment       |
| `justifyContent` | `'flex-start' \| 'center' \| 'flex-end' \| 'space-between' \| 'space-around' \| 'space-evenly'` | Main-axis alignment  |
| `gap`            | `number`                                                                                        | Gap between items    |
| `width`          | `number \| string`                                                                              | Width                |
| `height`         | `number \| string`                                                                              | Height               |
| `minWidth`       | `number`                                                                                        | Minimum width        |
| `minHeight`      | `number`                                                                                        | Minimum height       |
| `padding`        | `number`                                                                                        | Padding (all sides)  |
| `paddingX`       | `number`                                                                                        | Horizontal padding   |
| `paddingY`       | `number`                                                                                        | Vertical padding     |
| `margin`         | `number`                                                                                        | Margin (all sides)   |
| `marginX`        | `number`                                                                                        | Horizontal margin    |
| `marginY`        | `number`                                                                                        | Vertical margin      |
| `borderStyle`    | `'single' \| 'double' \| 'round' \| 'classic'`                                                  | Border style         |
| `borderColor`    | `string`                                                                                        | Border color         |
| `overflow`       | `'visible' \| 'hidden'`                                                                         | Overflow behavior    |

#### `<Text>`

Text rendering with styling.

```tsx
<Text color="green" bold underline>
	Styled text
</Text>
```

| Prop              | Type                                                                              | Description                   |
| ----------------- | --------------------------------------------------------------------------------- | ----------------------------- |
| `color`           | `string`                                                                          | Text color (ANSI name or hex) |
| `backgroundColor` | `string`                                                                          | Background color              |
| `bold`            | `boolean`                                                                         | Bold text                     |
| `italic`          | `boolean`                                                                         | Italic text                   |
| `underline`       | `boolean`                                                                         | Underlined text               |
| `strikethrough`   | `boolean`                                                                         | Strikethrough text            |
| `dimColor`        | `boolean`                                                                         | Dim color                     |
| `inverse`         | `boolean`                                                                         | Inverse colors                |
| `wrap`            | `'wrap' \| 'truncate' \| 'truncate-end' \| 'truncate-middle' \| 'truncate-start'` | Text wrap mode                |

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

Renders static content that won't re-render.

```tsx
<Static items={logs}>{(log) => <Text key={log.id}>{log.message}</Text>}</Static>
```

#### `<Transform>`

Transforms child text.

```tsx
<Transform transform={(text) => text.toUpperCase()}>
	<Text>will be uppercase</Text>
</Transform>
```

---

### Display Components

#### `<Alert>`

Alert messages with variants.

```tsx
<Alert variant="success" title="Done!">
	Operation completed successfully.
</Alert>
```

| Prop       | Type                                          | Description   |
| ---------- | --------------------------------------------- | ------------- |
| `variant`  | `'success' \| 'error' \| 'warning' \| 'info'` | Alert variant |
| `title`    | `string`                                      | Alert title   |
| `children` | `ReactNode`                                   | Alert content |

#### `<Badge>`

Small label badges.

```tsx
<Badge color="green">NEW</Badge>
```

| Prop       | Type        | Description |
| ---------- | ----------- | ----------- |
| `color`    | `string`    | Badge color |
| `children` | `ReactNode` | Badge text  |

#### `<Spinner>`

Loading spinner.

```tsx
<Spinner type="dots" />
```

| Prop   | Type     | Description                      |
| ------ | -------- | -------------------------------- |
| `type` | `string` | Spinner type (from cli-spinners) |

#### `<ProgressBar>`

Progress indicator.

```tsx
<ProgressBar value={0.5} />
```

| Prop    | Type     | Description    |
| ------- | -------- | -------------- |
| `value` | `number` | Progress (0-1) |
| `left`  | `number` | Left position  |
| `right` | `number` | Right position |

#### `<StatusMessage>`

Status indicator with variants.

```tsx
<StatusMessage variant="success">Saved!</StatusMessage>
```

| Prop       | Type                                          | Description     |
| ---------- | --------------------------------------------- | --------------- |
| `variant`  | `'success' \| 'error' \| 'warning' \| 'info'` | Status variant  |
| `children` | `ReactNode`                                   | Message content |

#### `<ErrorOverview>`

Error display with stack trace.

```tsx
<ErrorOverview error={error} />
```

---

### List Components

#### `<OrderedList>` / `<OrderedListItem>`

Numbered lists.

```tsx
<OrderedList>
	<OrderedListItem>First item</OrderedListItem>
	<OrderedListItem>Second item</OrderedListItem>
</OrderedList>
```

#### `<UnorderedList>` / `<UnorderedListItem>`

Bullet lists.

```tsx
<UnorderedList>
	<UnorderedListItem>Item one</UnorderedListItem>
	<UnorderedListItem>Item two</UnorderedListItem>
</UnorderedList>
```

---

### Input Components

#### `<TextInput>`

Text input field.

```tsx
const [value, setValue] = useState('')

<TextInput
  value={value}
  onChange={setValue}
  placeholder="Enter text..."
/>
```

| Prop          | Type                      | Description            |
| ------------- | ------------------------- | ---------------------- |
| `value`       | `string`                  | Current value          |
| `onChange`    | `(value: string) => void` | Change handler         |
| `onSubmit`    | `(value: string) => void` | Submit handler (Enter) |
| `placeholder` | `string`                  | Placeholder text       |
| `focus`       | `boolean`                 | Focus state            |
| `mask`        | `string`                  | Mask character         |

#### `<PasswordInput>`

Masked password input.

```tsx
<PasswordInput value={password} onChange={setPassword} mask="*" />
```

#### `<EmailInput>`

Email input with validation.

```tsx
<EmailInput value={email} onChange={setEmail} onSubmit={handleSubmit} />
```

#### `<ConfirmInput>`

Yes/No confirmation.

```tsx
<ConfirmInput
	onConfirm={() => console.log('Yes')}
	onCancel={() => console.log('No')}
/>
```

#### `<Select>` / `<SelectOption>`

Single selection dropdown.

```tsx
<Select onChange={handleChange}>
	<SelectOption value="a" label="Option A" />
	<SelectOption value="b" label="Option B" />
	<SelectOption value="c" label="Option C" />
</Select>
```

#### `<MultiSelect>` / `<MultiSelectOption>`

Multiple selection.

```tsx
<MultiSelect onChange={handleChange}>
	<MultiSelectOption value="a" label="Option A" />
	<MultiSelectOption value="b" label="Option B" />
	<MultiSelectOption value="c" label="Option C" />
</MultiSelect>
```

---

## Hooks

### `useInput(handler, options?)`

Handle keyboard input.

```tsx
import { useInput, Key } from '@wolfie/react'

function App() {
	useInput((input: string, key: Key) => {
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

| Option     | Type      | Default | Description                   |
| ---------- | --------- | ------- | ----------------------------- |
| `isActive` | `boolean` | `true`  | Enable/disable input handling |

### `useApp()`

Access app context.

```tsx
import { useApp } from '@wolfie/react'

function App() {
	const { exit } = useApp()

	return <Text onPress={() => exit()}>Click to exit</Text>
}
```

Returns:

- `exit(error?)` — Exit the app

### `useFocus(options?)`

Make component focusable.

```tsx
import { useFocus } from '@wolfie/react'

function Input() {
	const { isFocused, focus } = useFocus({ autoFocus: true })

	return (
		<Box borderColor={isFocused ? 'green' : 'gray'}>
			<Text>{isFocused ? 'Focused!' : 'Not focused'}</Text>
		</Box>
	)
}
```

#### Options

| Option      | Type      | Default | Description                       |
| ----------- | --------- | ------- | --------------------------------- |
| `isActive`  | `boolean` | `true`  | Enable focus for this component   |
| `autoFocus` | `boolean` | `false` | Auto-focus if no active component |
| `id`        | `string`  | random  | Unique ID for programmatic focus  |

#### Returns

| Property    | Type                   | Description                  |
| ----------- | ---------------------- | ---------------------------- |
| `isFocused` | `boolean`              | Whether component is focused |
| `focus`     | `(id: string) => void` | Focus component by ID        |

### `useFocusManager()`

Manage focus programmatically.

```tsx
import { useFocusManager } from '@wolfie/react'

function App() {
	const { focusNext, focusPrevious, focus } = useFocusManager()

	useInput((input, key) => {
		if (key.tab) {
			key.shift ? focusPrevious() : focusNext()
		}
	})
}
```

Returns:

- `focusNext()` — Focus next component
- `focusPrevious()` — Focus previous component
- `focus(id)` — Focus component by ID

### `useStdin()`

Access stdin stream.

```tsx
import { useStdin } from '@wolfie/react'

function App() {
	const { stdin, isRawModeSupported, setRawMode } = useStdin()
}
```

### `useStdout()`

Access stdout stream.

```tsx
import { useStdout } from '@wolfie/react'

function App() {
	const { stdout, write } = useStdout()

	write('Direct output\n')
}
```

### `useStderr()`

Access stderr stream.

### `useSpinner()`

Spinner animation hook.

```tsx
import { useSpinner } from '@wolfie/react'

function Loading() {
	const { frame } = useSpinner({ type: 'dots' })

	return <Text>{frame} Loading...</Text>
}
```

### `useIsScreenReaderEnabled()`

Check if screen reader is active.

---

## Styling

### With Tailwind CSS

```tsx
import './styles.css' // Import Tailwind
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

### Style Registry

```tsx
import { registerStyles, resolveClassName } from '@wolfie/react'

// Register styles from CSS parser
registerStyles(parsedStyles)

// Resolve class names to style objects
const style = resolveClassName('my-class')
```

---

## Theming

Components export theme objects for customization:

```tsx
import {
	alertTheme,
	badgeTheme,
	spinnerTheme,
	statusMessageTheme,
	progressBarTheme,
	textInputTheme,
	passwordInputTheme,
	emailInputTheme,
	confirmInputTheme,
	selectTheme,
	multiSelectTheme,
	orderedListTheme,
	unorderedListTheme,
} from '@wolfie/react'

// Override theme values
const customAlertTheme = {
	...alertTheme,
	success: { color: 'cyan' },
}
```

---

## Examples

See [`examples/`](examples/) directory for complete examples:

- `react-vite/` — Vite setup
- `react-esbuild/` — esbuild setup
- `react-webpack/` — webpack setup

## License

MIT
