# @wolfie/vue

Vue 3 adapter for wolf-tui. Build terminal user interfaces with Vue.

## Installation

```bash
npm install @wolfie/vue @wolfie/plugin chalk
# or
pnpm add @wolfie/vue @wolfie/plugin chalk
```

**Peer dependencies:**

- `vue` ^3.5.0
- `chalk` ^5.0.0

## Quick Start

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
<ProgressBar :value="0.5" />
```

#### `<StatusMessage>`

```vue
<StatusMessage variant="success">Saved!</StatusMessage>
```

---

### List Components

#### `<OrderedList>`

```vue
<OrderedList>
  <li>First item</li>
  <li>Second item</li>
</OrderedList>
```

#### `<UnorderedList>`

```vue
<UnorderedList>
  <li>Item one</li>
  <li>Item two</li>
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

#### `<Select>` / `<SelectOption>`

```vue
<Select @change="handleChange">
  <SelectOption value="a" label="Option A" />
  <SelectOption value="b" label="Option B" />
</Select>
```

#### `<MultiSelect>` / `<MultiSelectOption>`

```vue
<MultiSelect @change="handleChange">
  <MultiSelectOption value="a" label="Option A" />
  <MultiSelectOption value="b" label="Option B" />
</MultiSelect>
```

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

## Examples

See [`examples/`](examples/) directory:

- `vue-vite/` — Vite setup with Vue SFC

## License

MIT
