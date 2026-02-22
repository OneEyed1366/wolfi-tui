# @wolfie/vue

Vue 3 adapter for wolf-tui. Build terminal user interfaces with Vue.

## About

This package provides Vue 3 components ported from the React ecosystem — originally [Ink](https://github.com/vadimdemedes/ink) by Vadim Demedes and the ink-\* component libraries. All components have been reimplemented using Vue's Composition API and `defineComponent`.

## Features

- **SFC & JSX support** — Write components using Single File Components (`.vue`) or JSX/TSX
- **Vue 3.5+** — Built for modern Vue with Composition API
- **Tree-shakeable** — Only imports what you use; tested with esbuild, Vite, and webpack
- **Full component library** — Inputs, alerts, spinners, progress bars, lists
- **Composables API** — `useInput`, `useFocus`, `useFocusManager`, and more
- **CSS styling** — Tailwind CSS, CSS Modules, SCSS/LESS/Stylus via `@wolfie/plugin`

## Installation

```bash
npm install @wolfie/vue @wolfie/plugin chalk
# or
pnpm add @wolfie/vue @wolfie/plugin chalk
```

**Peer dependencies:**

- `vue` ^3.5.0
- `chalk` ^5.0.0

## TypeScript Setup

For full IntelliSense in Vue templates (Volar/vue-tsc), add the global component types to your project:

```ts
// env.d.ts or shims-vue.d.ts
/// <reference types="@wolfie/vue/global" />

declare module '*.vue' {
	import type { DefineComponent } from 'vue'
	const component: DefineComponent<object, object, any>
	export default component
}

// CSS Modules return Styles objects (terminal styles, not class strings)
declare module '*.module.css' {
	const styles: Record<string, import('@wolfie/vue').BoxProps['style']>
	export default styles
}
```

This enables autocomplete for `<Box>`, `<Text>`, `<Alert>`, and all other components in your `.vue` templates.

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

This provides:

- Class name autocomplete when typing `styles.`
- Type-safe access to CSS module exports
- Go-to-definition from class usage to CSS file

### CSS IntelliSense in VS Code

For Wolfie-specific CSS property suggestions (e.g., `border-style: single`), add the CSS Custom Data file to your VS Code settings:

```json
// .vscode/settings.json
{
	"css.customData": ["./node_modules/@wolfie/plugin/wolfie.css-data.json"]
}
```

This provides autocomplete and validation for terminal-specific CSS values.

## Quick Start

### With SFC (Single File Components)

```vue
<script setup>
import { Box, Text } from '@wolfie/vue'
</script>

<template>
	<Box flexDirection="column" :padding="1">
		<Text color="green" bold>Hello, Terminal!</Text>
		<Text>Built with wolf-tui</Text>
	</Box>
</template>
```

```ts
import { render } from '@wolfie/vue'
import App from './App.vue'

render(App)
```

### With JSX/TSX

```tsx
import { defineComponent, ref } from '@wolfie/vue'
import { Box, Text, render } from '@wolfie/vue'

const App = defineComponent({
	setup() {
		const count = ref(0)
		return () => (
			<Box flexDirection="column" padding={1}>
				<Text color="green" bold>
					Hello, Terminal!
				</Text>
				<Text>Count: {count.value}</Text>
			</Box>
		)
	},
})

render(App)
```

## Render Function

### `render(component, options?)`

Renders a Vue component to the terminal.

```ts
import { render } from '@wolfie/vue'
import App from './App.vue'

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

---

## Components

### Layout Components

#### `<Box>`

Flexbox container for layout.

```vue
<Box flexDirection="column" :padding="1" :gap="1">
  <Text>Item 1</Text>
  <Text>Item 2</Text>
</Box>
```

| Prop             | Type                                                                          | Description          |
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

Text rendering with styling.

```vue
<Text color="green" bold underline>Styled text</Text>
```

| Prop              | Type                                     | Description                   |
| ----------------- | ---------------------------------------- | ----------------------------- |
| `color`           | `string`                                 | Text color (ANSI name or hex) |
| `backgroundColor` | `string`                                 | Background color              |
| `bold`            | `boolean`                                | Bold text                     |
| `italic`          | `boolean`                                | Italic text                   |
| `underline`       | `boolean`                                | Underlined text               |
| `strikethrough`   | `boolean`                                | Strikethrough text            |
| `dimColor`        | `boolean`                                | Dim color                     |
| `inverse`         | `boolean`                                | Inverse colors                |
| `wrap`            | `'wrap' \| 'truncate' \| 'truncate-end'` | Text wrap mode                |

#### `<Newline>`

Adds empty lines.

```vue
<Newline :count="2" />
```

#### `<Spacer>`

Flexible space that fills available area.

```vue
<Box>
  <Text>Left</Text>
  <Spacer />
  <Text>Right</Text>
</Box>
```

#### `<Static>`

Renders static content that won't re-render.

```vue
<Static :items="logs">
  <template #default="{ item }">
    <Text>{{ item.message }}</Text>
  </template>
</Static>
```

#### `<Transform>`

Transforms child text.

```vue
<Transform :transform="(text) => text.toUpperCase()">
  <Text>will be uppercase</Text>
</Transform>
```

---

### Display Components

#### `<Alert>`

```vue
<Alert variant="success" title="Done!">
  Operation completed successfully.
</Alert>
```

| Prop      | Type                                          | Description   |
| --------- | --------------------------------------------- | ------------- |
| `variant` | `'success' \| 'error' \| 'warning' \| 'info'` | Alert variant |
| `title`   | `string`                                      | Alert title   |

#### `<Badge>`

```vue
<Badge color="green">NEW</Badge>
```

#### `<Spinner>`

```vue
<Spinner type="dots" />
```

#### `<ProgressBar>`

```vue
<ProgressBar :value="50" />
```

| Prop    | Type     | Description      |
| ------- | -------- | ---------------- |
| `value` | `number` | Progress (0-100) |

#### `<StatusMessage>`

```vue
<StatusMessage variant="success">Saved!</StatusMessage>
```

---

### List Components

#### `<OrderedList>` / `<OrderedListItem>`

Numbered lists.

```vue
<OrderedList>
  <OrderedListItem>First item</OrderedListItem>
  <OrderedListItem>Second item</OrderedListItem>
</OrderedList>
```

#### `<UnorderedList>` / `<UnorderedListItem>`

Bullet lists.

```vue
<UnorderedList>
  <UnorderedListItem>Item one</UnorderedListItem>
  <UnorderedListItem>Item two</UnorderedListItem>
</UnorderedList>
```

---

### Input Components

#### `<TextInput>`

```vue
<script setup>
import { ref } from 'vue'
const value = ref('')
</script>

<template>
	<TextInput v-model="value" placeholder="Enter text..." />
</template>
```

| Prop          | Type      | Description             |
| ------------- | --------- | ----------------------- |
| `modelValue`  | `string`  | Current value (v-model) |
| `placeholder` | `string`  | Placeholder text        |
| `focus`       | `boolean` | Focus state             |
| `mask`        | `string`  | Mask character          |

| Event               | Description   |
| ------------------- | ------------- |
| `update:modelValue` | Value changed |
| `submit`            | Enter pressed |

#### `<PasswordInput>`

```vue
<PasswordInput v-model="password" mask="*" />
```

#### `<EmailInput>`

```vue
<EmailInput v-model="email" @submit="handleSubmit" />
```

#### `<ConfirmInput>`

```vue
<ConfirmInput @confirm="handleYes" @cancel="handleNo" />
```

#### `<Select>`

Single selection from a list of options.

```vue
<script setup>
const options = [
	{ label: 'Option A', value: 'a' },
	{ label: 'Option B', value: 'b' },
]
</script>

<template>
	<Select :options="options" :onChange="handleChange" />
</template>
```

| Prop                 | Type                      | Default | Description                  |
| -------------------- | ------------------------- | ------- | ---------------------------- |
| `options`            | `Option[]`                |         | Array of `{ label, value }`  |
| `onChange`           | `(value: string) => void` |         | Selection change handler     |
| `value`              | `string`                  |         | Controlled value             |
| `defaultValue`       | `string`                  |         | Default value (uncontrolled) |
| `visibleOptionCount` | `number`                  | `5`     | Number of visible options    |
| `highlightText`      | `string`                  |         | Highlight text in labels     |
| `isDisabled`         | `boolean`                 | `false` | Disable user input           |

#### `<MultiSelect>`

Multiple selection from a list of options.

```vue
<script setup>
const options = [
	{ label: 'Option A', value: 'a' },
	{ label: 'Option B', value: 'b' },
]
</script>

<template>
	<MultiSelect
		:options="options"
		:onChange="handleChange"
		:onSubmit="handleSubmit"
	/>
</template>
```

| Prop                 | Type                        | Default | Description                  |
| -------------------- | --------------------------- | ------- | ---------------------------- |
| `options`            | `Option[]`                  |         | Array of `{ label, value }`  |
| `onChange`           | `(value: string[]) => void` |         | Selection change handler     |
| `onSubmit`           | `(value: string[]) => void` |         | Submit handler (Enter)       |
| `value`              | `string[]`                  |         | Controlled value             |
| `defaultValue`       | `string[]`                  |         | Default value (uncontrolled) |
| `visibleOptionCount` | `number`                    | `5`     | Number of visible options    |
| `highlightText`      | `string`                    |         | Highlight text in labels     |
| `isDisabled`         | `boolean`                   | `false` | Disable user input           |

#### `<ErrorOverview>`

```vue
<ErrorOverview :error="error" />
```

---

## Composables

### `useInput(handler, options?)`

Handle keyboard input.

```vue
<script setup>
import { useInput } from '@wolfie/vue'

useInput((input, key) => {
	if (input === 'q') {
		// Exit
	}
	if (key.upArrow) {
		// Move up
	}
})
</script>
```

#### Options

| Option     | Type      | Default | Description                   |
| ---------- | --------- | ------- | ----------------------------- |
| `isActive` | `boolean` | `true`  | Enable/disable input handling |

### `useApp()`

Access app context.

```vue
<script setup>
import { useApp } from '@wolfie/vue'

const { exit } = useApp()
</script>
```

Returns:

- `exit(error?)` — Exit the app

### `useFocus(options?)`

Make component focusable.

```vue
<script setup>
import { useFocus } from '@wolfie/vue'

const { isFocused, focus } = useFocus({ autoFocus: true })
</script>

<template>
	<Box :borderColor="isFocused ? 'green' : 'gray'">
		<Text>{{ isFocused ? 'Focused!' : 'Not focused' }}</Text>
	</Box>
</template>
```

#### Options

| Option      | Type      | Default | Description                       |
| ----------- | --------- | ------- | --------------------------------- |
| `isActive`  | `boolean` | `true`  | Enable focus for this component   |
| `autoFocus` | `boolean` | `false` | Auto-focus if no active component |
| `id`        | `string`  | random  | Unique ID for programmatic focus  |

### `useFocusManager()`

Manage focus programmatically.

```vue
<script setup>
import { useFocusManager, useInput } from '@wolfie/vue'

const { focusNext, focusPrevious } = useFocusManager()

useInput((input, key) => {
	if (key.tab) {
		key.shift ? focusPrevious() : focusNext()
	}
})
</script>
```

Returns:

- `focusNext()` — Focus next component
- `focusPrevious()` — Focus previous component
- `focus(id)` — Focus component by ID
- `enableFocus()` — Enable focus system
- `disableFocus()` — Disable focus system

### `useStdin()`

Access stdin stream.

```vue
<script setup>
import { useStdin } from '@wolfie/vue'

const { stdin, isRawModeSupported, setRawMode } = useStdin()
</script>
```

### `useStdout()`

Access stdout stream.

```vue
<script setup>
import { useStdout } from '@wolfie/vue'

const { stdout, write } = useStdout()

write('Direct output\n')
</script>
```

### `useStderr()`

Access stderr stream.

---

## Vue API Re-exports

For convenience, commonly used Vue APIs are re-exported:

```ts
import {
	ref,
	reactive,
	computed,
	watch,
	watchEffect,
	onMounted,
	onUnmounted,
	provide,
	inject,
	defineComponent,
	h,
	// ... and more
} from '@wolfie/vue'
```

---

## Styling

### With Tailwind CSS

```vue
<template>
	<Box class="flex-col p-4 gap-2">
		<Text class="text-green-500 font-bold">Tailwind styled</Text>
	</Box>
</template>

<style>
@import 'tailwindcss';
</style>
```

### With CSS Modules

```vue
<template>
	<Box :class="$style.container">
		<Text :class="$style.title">CSS Modules</Text>
	</Box>
</template>

<style module>
.container {
	flex-direction: column;
	padding: 1rem;
}
.title {
	color: green;
	font-weight: bold;
}
</style>
```

### Style Registry

```ts
import { registerStyles, resolveClassName } from '@wolfie/vue'

// Register styles from CSS parser
registerStyles(parsedStyles)
```

---

## Theming

Components export theme objects for customization:

```ts
import {
	alertTheme,
	badgeTheme,
	spinnerTheme,
	statusMessageTheme,
	progressBarTheme,
	orderedListTheme,
	unorderedListTheme,
} from '@wolfie/vue'
```

---

## Examples

See [`examples/vue/`](../../examples/vue/) directory:

- [`vite/`](../../examples/vue/vite/) — Vite setup with Vue SFC
- [`esbuild/`](../../examples/vue/esbuild/) — esbuild setup
- [`webpack/`](../../examples/vue/webpack/) — webpack setup

## License

MIT
