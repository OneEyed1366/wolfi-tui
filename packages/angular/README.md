# @wolfie/angular

Angular adapter for wolf-tui. Build terminal user interfaces with Angular.

## About

This package provides Angular components ported from the React ecosystem — originally [Ink](https://github.com/vadimdemedes/ink) by Vadim Demedes and the ink-\* component libraries. All components have been reimplemented as standalone Angular components with signals support.

## Features

- **Angular 17+** — Built for modern Angular with standalone components
- **Signals support** — First-class support for Angular signals (`signal`, `computed`, `effect`)
- **OnPush ready** — All components work with `ChangeDetectionStrategy.OnPush`
- **Tree-shakeable** — Only imports what you use; `sideEffects: false` for optimal bundling
- **Full component library** — Inputs, alerts, spinners, progress bars, lists
- **Dependency injection** — Services and injection functions for keyboard input, focus, stdio
- **CSS styling** — Tailwind CSS, CSS Modules, SCSS/LESS/Stylus via `@wolfie/plugin`

## Installation

```bash
npm install @wolfie/angular @wolfie/plugin chalk
# or
pnpm add @wolfie/angular @wolfie/plugin chalk
```

**Peer dependencies:**

- `@angular/core` >= 17.0.0
- `@angular/common` >= 17.0.0
- `chalk` ^5.0.0

## Quick Start

```typescript
import { Component, signal } from '@angular/core'
import { BoxComponent, TextComponent, injectInput, Key } from '@wolfie/angular'

@Component({
	selector: 'app-root',
	standalone: true,
	imports: [BoxComponent, TextComponent],
	template: `
		<w-box flexDirection="column" [padding]="1">
			<w-text color="green" [bold]="true">Hello, Terminal!</w-text>
			<w-text>Count: {{ count() }}</w-text>
		</w-box>
	`,
})
export class AppComponent {
	count = signal(0)

	constructor() {
		injectInput((input: string, key: Key) => {
			if (key.upArrow) this.count.update((c) => c + 1)
			if (key.downArrow) this.count.update((c) => c - 1)
		})
	}
}
```

```typescript
import { render } from '@wolfie/angular'
import { AppComponent } from './app.component'

render(AppComponent)
```

## Bootstrap

### `render(component, options?)`

Renders an Angular component to the terminal.

```typescript
import { render } from '@wolfie/angular'
import { AppComponent } from './app.component'

const instance = render(AppComponent, {
	stdout: process.stdout,
	stdin: process.stdin,
	maxFps: 30,
})

// Unmount when done
instance.unmount()
```

#### Options

| Option                  | Type                 | Default          | Description               |
| ----------------------- | -------------------- | ---------------- | ------------------------- |
| `stdout`                | `NodeJS.WriteStream` | `process.stdout` | Output stream             |
| `stdin`                 | `NodeJS.ReadStream`  | `process.stdin`  | Input stream              |
| `stderr`                | `NodeJS.WriteStream` | `process.stderr` | Error stream              |
| `maxFps`                | `number`             | `30`             | Maximum render FPS        |
| `debug`                 | `boolean`            | `false`          | Disable throttling        |
| `exitOnCtrlC`           | `boolean`            | `true`           | Exit app on Ctrl+C        |
| `isScreenReaderEnabled` | `boolean`            | `false`          | Enable screen reader mode |
| `providers`             | `Provider[]`         | `[]`             | Additional DI providers   |

---

## Components

All components use custom element selectors prefixed with `w-`.

### Layout Components

#### `<w-box>` (BoxComponent)

Flexbox container for layout.

```html
<w-box flexDirection="column" [padding]="1" [gap]="1">
	<w-text>Item 1</w-text>
	<w-text>Item 2</w-text>
</w-box>
```

| Input            | Type                                                        | Description          |
| ---------------- | ----------------------------------------------------------- | -------------------- |
| `flexDirection`  | `'row' \| 'column' \| 'row-reverse' \| 'column-reverse'`    | Flex direction       |
| `flexWrap`       | `'wrap' \| 'nowrap' \| 'wrap-reverse'`                      | Flex wrap            |
| `flexGrow`       | `number`                                                    | Flex grow factor     |
| `flexShrink`     | `number`                                                    | Flex shrink factor   |
| `alignItems`     | `'flex-start' \| 'center' \| 'flex-end' \| 'stretch'`       | Cross-axis alignment |
| `justifyContent` | `'flex-start' \| 'center' \| 'flex-end' \| 'space-between'` | Main-axis alignment  |
| `gap`            | `number`                                                    | Gap between items    |
| `width`          | `number \| string`                                          | Width                |
| `height`         | `number \| string`                                          | Height               |
| `padding`        | `number`                                                    | Padding (all sides)  |
| `margin`         | `number`                                                    | Margin (all sides)   |
| `borderStyle`    | `'single' \| 'double' \| 'round' \| 'classic'`              | Border style         |
| `borderColor`    | `string`                                                    | Border color         |

#### `<w-text>` (TextComponent)

Text rendering with styling.

```html
<w-text color="green" [bold]="true" [underline]="true">Styled text</w-text>
```

| Input             | Type                   | Description                   |
| ----------------- | ---------------------- | ----------------------------- |
| `color`           | `string`               | Text color (ANSI name or hex) |
| `backgroundColor` | `string`               | Background color              |
| `bold`            | `boolean`              | Bold text                     |
| `italic`          | `boolean`              | Italic text                   |
| `underline`       | `boolean`              | Underlined text               |
| `strikethrough`   | `boolean`              | Strikethrough text            |
| `dimColor`        | `boolean`              | Dim color                     |
| `inverse`         | `boolean`              | Inverse colors                |
| `wrap`            | `'wrap' \| 'truncate'` | Text wrap mode                |

#### `<w-newline>` (NewlineComponent)

```html
<w-newline [count]="2"></w-newline>
```

#### `<w-spacer>` (SpacerComponent)

```html
<w-box>
	<w-text>Left</w-text>
	<w-spacer></w-spacer>
	<w-text>Right</w-text>
</w-box>
```

#### `<w-static>` (StaticComponent)

Renders static content that won't re-render.

#### `<w-transform>` (TransformComponent)

Transforms child text.

---

### Display Components

#### `<w-alert>` (AlertComponent)

```html
<w-alert variant="success" title="Done!">
	Operation completed successfully.
</w-alert>
```

| Input     | Type                                          | Description   |
| --------- | --------------------------------------------- | ------------- |
| `variant` | `'success' \| 'error' \| 'warning' \| 'info'` | Alert variant |
| `title`   | `string`                                      | Alert title   |

#### `<w-badge>` (BadgeComponent)

```html
<w-badge color="green">NEW</w-badge>
```

#### `<w-spinner>` (SpinnerComponent)

```html
<w-spinner type="dots"></w-spinner>
```

#### `<w-progress-bar>` (ProgressBarComponent)

```html
<w-progress-bar [value]="0.5"></w-progress-bar>
```

#### `<w-status-message>` (StatusMessageComponent)

```html
<w-status-message variant="success">Saved!</w-status-message>
```

---

### List Components

#### `<w-ordered-list>` / `<w-ordered-list-item>`

```html
<w-ordered-list>
	<w-ordered-list-item>First item</w-ordered-list-item>
	<w-ordered-list-item>Second item</w-ordered-list-item>
</w-ordered-list>
```

#### `<w-unordered-list>` / `<w-unordered-list-item>`

```html
<w-unordered-list>
	<w-unordered-list-item>Item one</w-unordered-list-item>
	<w-unordered-list-item>Item two</w-unordered-list-item>
</w-unordered-list>
```

---

### Input Components

#### `<w-text-input>` (TextInputComponent)

```typescript
@Component({
	template: `
		<w-text-input
			[value]="value()"
			(valueChange)="value.set($event)"
			placeholder="Enter text..."
		></w-text-input>
	`,
})
export class MyComponent {
	value = signal('')
}
```

| Input         | Type      | Description      |
| ------------- | --------- | ---------------- |
| `value`       | `string`  | Current value    |
| `placeholder` | `string`  | Placeholder text |
| `focus`       | `boolean` | Focus state      |
| `mask`        | `string`  | Mask character   |
| `isDisabled`  | `boolean` | Disabled state   |

| Output        | Type     | Description   |
| ------------- | -------- | ------------- |
| `valueChange` | `string` | Value changed |
| `submit`      | `string` | Enter pressed |

#### `<w-password-input>` (PasswordInputComponent)

```html
<w-password-input
	[value]="password()"
	(valueChange)="password.set($event)"
	mask="*"
></w-password-input>
```

#### `<w-email-input>` (EmailInputComponent)

```html
<w-email-input
	[value]="email()"
	(valueChange)="email.set($event)"
	(submit)="handleSubmit($event)"
></w-email-input>
```

#### `<w-confirm-input>` (ConfirmInputComponent)

```html
<w-confirm-input
	(confirm)="handleYes()"
	(cancel)="handleNo()"
></w-confirm-input>
```

#### `<w-select>` / `<w-select-option>`

```html
<w-select (selectChange)="handleChange($event)">
	<w-select-option value="a" label="Option A"></w-select-option>
	<w-select-option value="b" label="Option B"></w-select-option>
</w-select>
```

#### `<w-multi-select>` / `<w-multi-select-option>`

```html
<w-multi-select (selectionChange)="handleChange($event)">
	<w-multi-select-option value="a" label="Option A"></w-multi-select-option>
	<w-multi-select-option value="b" label="Option B"></w-multi-select-option>
</w-multi-select>
```

#### `<w-error-overview>` (ErrorOverviewComponent)

```html
<w-error-overview [error]="error"></w-error-overview>
```

---

## Services

### `injectInput(handler, options?)`

Inject keyboard input handler. Must be called in injection context (constructor or field initializer).

```typescript
import { Component } from '@angular/core'
import { injectInput, Key } from '@wolfie/angular'

@Component({
	/* ... */
})
export class MyComponent {
	constructor() {
		injectInput((input: string, key: Key) => {
			if (input === 'q') {
				// Exit
			}
			if (key.upArrow) {
				// Move up
			}
		})
	}
}
```

#### Key Object

| Property     | Type      | Description         |
| ------------ | --------- | ------------------- |
| `upArrow`    | `boolean` | Up arrow pressed    |
| `downArrow`  | `boolean` | Down arrow pressed  |
| `leftArrow`  | `boolean` | Left arrow pressed  |
| `rightArrow` | `boolean` | Right arrow pressed |
| `pageUp`     | `boolean` | Page Up pressed     |
| `pageDown`   | `boolean` | Page Down pressed   |
| `home`       | `boolean` | Home pressed        |
| `end`        | `boolean` | End pressed         |
| `return`     | `boolean` | Enter pressed       |
| `escape`     | `boolean` | Escape pressed      |
| `ctrl`       | `boolean` | Ctrl held           |
| `shift`      | `boolean` | Shift held          |
| `meta`       | `boolean` | Meta key held       |
| `tab`        | `boolean` | Tab pressed         |
| `backspace`  | `boolean` | Backspace pressed   |
| `delete`     | `boolean` | Delete pressed      |

#### Options

| Option     | Type            | Default      | Description                   |
| ---------- | --------------- | ------------ | ----------------------------- |
| `isActive` | `() => boolean` | `() => true` | Enable/disable input handling |

### `AppService`

App lifecycle management.

```typescript
import { Component, inject } from '@angular/core'
import { AppService } from '@wolfie/angular'

@Component({
	/* ... */
})
export class MyComponent {
	private app = inject(AppService)

	quit() {
		this.app.exit()
	}
}
```

Methods:

- `exit(error?)` — Exit the app

### `FocusService`

Focus management.

```typescript
import { Component, inject, signal } from '@angular/core'
import { FocusService } from '@wolfie/angular'

@Component({
	/* ... */
})
export class MyComponent {
	private focusService = inject(FocusService)

	id = signal(`input-${Math.random().toString(36).slice(2)}`)

	constructor() {
		// Register as focusable
		this.focusService.add(this.id(), { autoFocus: true })
	}

	get isFocused() {
		return this.focusService.activeFocusId() === this.id()
	}

	ngOnDestroy() {
		this.focusService.remove(this.id())
	}
}
```

Methods:

- `add(id, options)` — Register focusable component
- `remove(id)` — Unregister component
- `activate(id)` — Enable focus for component
- `deactivate(id)` — Disable focus for component
- `focusNext()` — Focus next component
- `focusPrevious()` — Focus previous component
- `focus(id)` — Focus specific component
- `enableFocus()` — Enable focus system
- `disableFocus()` — Disable focus system

Properties:

- `activeFocusId` — Signal with current focused ID

### `StdinService`

Access stdin stream.

```typescript
import { Component, inject } from '@angular/core'
import { StdinService } from '@wolfie/angular'

@Component({
	/* ... */
})
export class MyComponent {
	private stdin = inject(StdinService)
}
```

Properties:

- `stdin` — Raw stdin stream
- `isRawModeSupported` — TTY support check

Methods:

- `setRawMode(value)` — Enable/disable raw mode

### `StdoutService`

Access stdout stream.

```typescript
import { Component, inject } from '@angular/core'
import { StdoutService } from '@wolfie/angular'

@Component({
	/* ... */
})
export class MyComponent {
	private stdout = inject(StdoutService)

	log(message: string) {
		this.stdout.write(message + '\n')
	}
}
```

Methods:

- `write(data)` — Write to stdout

### `StderrService`

Access stderr stream.

---

## Dependency Injection Tokens

For advanced use cases, raw context tokens are available:

```typescript
import { inject } from '@angular/core'
import {
	STDIN_CONTEXT,
	STDOUT_CONTEXT,
	STDERR_CONTEXT,
	APP_CONTEXT,
	FOCUS_CONTEXT,
	ACCESSIBILITY_CONTEXT,
} from '@wolfie/angular'

const stdin = inject(STDIN_CONTEXT)
const stdout = inject(STDOUT_CONTEXT)
const app = inject(APP_CONTEXT)
```

---

## Angular Patterns

### Signals

Works seamlessly with Angular signals:

```typescript
@Component({
	template: `
		<w-box>
			<w-text>Count: {{ count() }}</w-text>
		</w-box>
	`,
})
export class CounterComponent {
	count = signal(0)

	constructor() {
		injectInput((_, key) => {
			if (key.upArrow) this.count.update((c) => c + 1)
		})
	}
}
```

### OnPush Change Detection

Components work with OnPush strategy. The renderer triggers `detectChanges()` after input handlers.

```typescript
@Component({
	changeDetection: ChangeDetectionStrategy.OnPush,
	// ...
})
export class MyComponent {}
```

### Effects

Angular `effect()` works with wolf-tui:

```typescript
@Component({
	/* ... */
})
export class MyComponent {
	count = signal(0)

	constructor() {
		effect(() => {
			console.log('Count changed:', this.count())
		})
	}
}
```

---

## Styling

### With Tailwind CSS

```typescript
@Component({
	template: `
		<w-box class="flex-col p-4 gap-2">
			<w-text class="text-green-500 font-bold">Tailwind styled</w-text>
		</w-box>
	`,
	styles: [
		`
			@import 'tailwindcss';
		`,
	],
})
export class StyledComponent {}
```

### Style Registry

```typescript
import { registerStyles, resolveClassName } from '@wolfie/angular'

// Register styles from CSS parser
registerStyles(parsedStyles)
```

---

## Examples

See [`examples/angular/`](../../examples/angular/) directory:

- [`vite/`](../../examples/angular/vite/) — Vite setup with Angular
- [`esbuild/`](../../examples/angular/esbuild/) — esbuild setup
- [`webpack/`](../../examples/angular/webpack/) — webpack setup

## License

MIT
