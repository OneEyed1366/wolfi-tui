# @wolfie/core

Framework-agnostic TUI core engine for wolf-tui. Provides DOM abstraction, layout engine, and rendering primitives.

## Overview

This package is the foundation of wolf-tui. It provides:

- **DOM abstraction** — Virtual DOM nodes for TUI elements
- **Taffy layout engine** — Flexbox and CSS Grid via Rust bindings
- **Renderer** — Converts DOM tree to ANSI terminal output
- **Utilities** — Text measurement, keypress parsing, color handling

> **Note:** This is an internal package. Most users should use `@wolfie/react`, `@wolfie/vue`, or `@wolfie/angular` instead.

## Taffy Layout Engine

wolf-tui v2.0 uses [Taffy](https://github.com/DioxusLabs/taffy), a high-performance Rust-based layout engine.

### Why Taffy?

| Feature     | Yoga (old)     | Taffy (current) |
| ----------- | -------------- | --------------- |
| Flexbox     | Yes            | Yes             |
| CSS Grid    | No             | Yes             |
| `calc()`    | No             | Yes             |
| Framework   | React-specific | Agnostic        |
| Performance | Good           | Better          |

### Integration

Taffy is integrated via [napi-rs](https://napi.rs/) native Node.js bindings:

```
internal/core/
├── rust/
│   ├── lib.rs       # napi-rs entry point
│   ├── layout.rs    # LayoutTree wrapper
│   ├── style.rs     # Style conversion
│   └── error.rs     # Error handling
├── Cargo.toml
└── layout.js        # Generated JS bindings
```

### Platform Support

| Platform | Architecture | Binary                               |
| -------- | ------------ | ------------------------------------ |
| Linux    | x86_64       | `wolfie-layout.linux-x64-gnu.node`   |
| Linux    | aarch64      | `wolfie-layout.linux-arm64-gnu.node` |
| macOS    | x86_64       | `wolfie-layout.darwin-x64.node`      |
| macOS    | aarch64      | `wolfie-layout.darwin-arm64.node`    |
| Windows  | x86_64       | `wolfie-layout.win32-x64-msvc.node`  |

### Building Native Bindings

```bash
cd internal/core
pnpm build:rust    # Build native bindings only
pnpm build:full    # Build Rust + TypeScript
```

Requires Rust toolchain installed.

---

## API Reference

### DOM Functions

#### `createNode(name, layoutTree)`

Create a new DOM element.

```typescript
import { createNode, LayoutTree } from '@wolfie/core'
import { LayoutTree as TaffyLayoutTree } from '@wolfie/core/layout'

const layoutTree = new TaffyLayoutTree()
const node = createNode('wolfie-box', layoutTree)
```

#### `appendChildNode(parent, child)`

Append a child node to a parent.

```typescript
appendChildNode(parent, child)
```

#### `insertBeforeNode(parent, child, before)`

Insert a child before another node.

```typescript
insertBeforeNode(parent, newChild, referenceChild)
```

#### `removeChildNode(parent, child)`

Remove a child from parent.

```typescript
removeChildNode(parent, child)
```

#### `setAttribute(node, key, value)`

Set an attribute on a node.

```typescript
setAttribute(node, 'className', 'my-class')
```

#### `setStyle(node, style)`

Set style properties on a node.

```typescript
setStyle(node, {
	flexDirection: 'column',
	padding: 1,
	borderStyle: 'round',
})
```

#### `createTextNode(value, layoutTree)`

Create a text node.

```typescript
const textNode = createTextNode('Hello', layoutTree)
```

#### `setTextNodeValue(node, value)`

Update text node content.

```typescript
setTextNodeValue(textNode, 'Updated text')
```

---

### Renderer

#### `renderer(rootNode, isScreenReaderEnabled, layoutTree)`

Render DOM tree to terminal output.

```typescript
import { renderer } from '@wolfie/core'

const { output } = renderer(rootNode, false, layoutTree)
process.stdout.write(output)
```

Returns:

- `output` — ANSI-styled string for terminal
- `outputHeight` — Number of lines

---

### Layout

#### `getComputedLayout(node, layoutTree)`

Get computed layout for a node.

```typescript
import { getComputedLayout } from '@wolfie/core'

const layout = getComputedLayout(node, layoutTree)
// { left: 0, top: 0, width: 80, height: 24 }
```

Returns `ComputedLayout`:

- `left` — X position
- `top` — Y position
- `width` — Computed width
- `height` — Computed height

#### `isDisplayNone(node, layoutTree)`

Check if node is hidden.

```typescript
if (isDisplayNone(node, layoutTree)) {
	// Node not rendered
}
```

---

### Styles

#### `applyLayoutStyle(layoutTree, nodeId, style)`

Apply style to layout node.

```typescript
import { applyLayoutStyle } from '@wolfie/core'

applyLayoutStyle(layoutTree, node.layoutNodeId, {
	flexDirection: 'column',
	padding: 2,
})
```

#### `resolveViewportUnits(style, terminalWidth, terminalHeight)`

Resolve vw/vh units to absolute values.

```typescript
import { resolveViewportUnits } from '@wolfie/core'

const resolved = resolveViewportUnits(
	{ width: '50vw', height: '100vh' },
	80, // terminal columns
	24 // terminal rows
)
// { width: 40, height: 24 }
```

#### `parseNumericValue(value)`

Parse numeric style value.

```typescript
parseNumericValue('1rem') // 4
parseNumericValue('8px') // 2
parseNumericValue(10) // 10
```

---

### Utilities

#### `measureText(text)`

Measure text dimensions.

```typescript
import { measureText } from '@wolfie/core'

const { width, height } = measureText('Hello\nWorld')
// { width: 5, height: 2 }
```

#### `wrapText(text, maxWidth, wrapMode)`

Wrap text to fit width.

```typescript
import { wrapText } from '@wolfie/core'

const wrapped = wrapText('Long text here', 10, 'wrap')
```

Wrap modes:

- `'wrap'` — Wrap at word boundaries
- `'truncate'` / `'truncate-end'` — Truncate with ellipsis at end
- `'truncate-start'` — Truncate with ellipsis at start
- `'truncate-middle'` — Truncate with ellipsis in middle

#### `parseKeypress(input)`

Parse terminal keypress data.

```typescript
import { parseKeypress } from '@wolfie/core'

const key = parseKeypress('\x1b[A') // Up arrow
// { name: 'up', ctrl: false, shift: false, meta: false, ... }
```

#### `colorize(text, color, backgroundColor)`

Apply ANSI colors to text.

```typescript
import { colorize } from '@wolfie/core'

const colored = colorize('Hello', 'green', 'black')
```

#### `measureElement(node)`

Measure a rendered element.

```typescript
import { measureElement } from '@wolfie/core'

const { width, height } = measureElement(node)
```

---

### Log Update

#### `logUpdate.create(stream)`

Create a log updater for a stream.

```typescript
import { logUpdate } from '@wolfie/core'

const log = logUpdate.create(process.stdout)

log('First output')
log('Updated output') // Replaces previous
log.done() // Finalize
```

Methods:

- `log(text)` — Update output (replaces previous)
- `log.clear()` — Clear output
- `log.done()` — Finalize and move cursor down

---

## Types

### `DOMElement`

Virtual DOM element.

```typescript
interface DOMElement {
	nodeName: ElementNames
	style?: Styles
	attributes: Record<string, DOMNodeAttribute>
	childNodes: DOMNode[]
	parentNode?: DOMElement
	layoutNodeId?: number
	onRender?: () => void
}
```

### `Styles`

Style properties.

```typescript
interface Styles {
	// Layout
	display?: 'flex' | 'none'
	position?: 'relative' | 'absolute'
	flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse'
	flexWrap?: 'wrap' | 'nowrap' | 'wrap-reverse'
	flexGrow?: number
	flexShrink?: number
	flexBasis?: number | string
	alignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch'
	alignSelf?: 'flex-start' | 'center' | 'flex-end' | 'auto'
	justifyContent?:
		| 'flex-start'
		| 'center'
		| 'flex-end'
		| 'space-between'
		| 'space-around'
		| 'space-evenly'
	gap?: number
	rowGap?: number
	columnGap?: number

	// Sizing
	width?: number | string
	height?: number | string
	minWidth?: number
	minHeight?: number
	maxWidth?: number
	maxHeight?: number

	// Spacing
	padding?: number
	paddingX?: number
	paddingY?: number
	paddingTop?: number
	paddingRight?: number
	paddingBottom?: number
	paddingLeft?: number
	margin?: number
	marginX?: number
	marginY?: number
	marginTop?: number
	marginRight?: number
	marginBottom?: number
	marginLeft?: number

	// Border
	borderStyle?: 'single' | 'double' | 'round' | 'classic' | 'bold'
	borderColor?: string
	borderTopColor?: string
	borderRightColor?: string
	borderBottomColor?: string
	borderLeftColor?: string
	borderTop?: boolean
	borderRight?: boolean
	borderBottom?: boolean
	borderLeft?: boolean
	borderDimColor?: boolean

	// Text
	color?: string
	backgroundColor?: string
	fontWeight?: 'bold' | 'normal' | number
	fontStyle?: 'italic' | 'normal'
	textDecoration?: 'underline' | 'line-through' | 'none'
	textWrap?:
		| 'wrap'
		| 'truncate'
		| 'truncate-end'
		| 'truncate-middle'
		| 'truncate-start'
	dimColor?: boolean
	inverse?: boolean

	// Overflow
	overflow?: 'visible' | 'hidden'
	overflowX?: 'visible' | 'hidden'
	overflowY?: 'visible' | 'hidden'
}
```

### `LayoutTree`

Layout tree interface (implemented by Taffy bindings).

```typescript
interface LayoutTree {
	createNode(): number
	removeNode(nodeId: number): void
	setStyle(nodeId: number, style: Record<string, unknown>): void
	setTextDimensions(nodeId: number, width: number, height: number): void
	appendChild(parentId: number, childId: number): void
	insertChild(parentId: number, childId: number, index: number): void
	removeChild(parentId: number, childId: number): void
	computeLayout(rootId: number, availableWidth: number): void
	getLayout(nodeId: number): {
		x: number
		y: number
		width: number
		height: number
	}
}
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                Framework Adapters                            │
│              (React, Vue, Angular)                           │
└────────────────────────┬────────────────────────────────────┘
                         │
              ┌──────────▼──────────┐
              │   @wolfie/core      │
              │                     │
              │ ┌─────────────────┐ │
              │ │ DOM Abstraction │ │
              │ │  (dom.ts)       │ │
              │ └────────┬────────┘ │
              │          │          │
              │ ┌────────▼────────┐ │
              │ │ Style Handler   │ │
              │ │  (styles.ts)    │ │
              │ └────────┬────────┘ │
              │          │          │
              │ ┌────────▼────────┐ │
              │ │ Taffy Layout    │◀┼──── Rust Bindings
              │ │  (layout.rs)    │ │     (napi-rs)
              │ └────────┬────────┘ │
              │          │          │
              │ ┌────────▼────────┐ │
              │ │ Renderer        │ │
              │ │  (renderer.ts)  │ │
              │ └────────┬────────┘ │
              │          │          │
              │ ┌────────▼────────┐ │
              │ │ ANSI Output     │ │
              │ │  (output.ts)    │ │
              │ └─────────────────┘ │
              └─────────────────────┘
                         │
                         ▼
                    Terminal
```

## License

MIT
