# @wolfie/css-parser

CSS/SCSS/LESS/Stylus parser and code generator for wolf-tui.

## Overview

This package transforms CSS files into JavaScript objects compatible with wolf-tui's styling system. It handles:

- **Parsing** — CSS to style objects
- **Preprocessing** — SCSS, LESS, Stylus compilation
- **Tailwind CSS** — JIT compilation with OKLCH shim
- **Code generation** — JavaScript/TypeScript output

> **Note:** This is an internal package. Most users should use `@wolfie/plugin` which wraps this functionality.

## CLI Usage

```bash
# Parse a CSS file
wolf-css input.css -o output.js

# Parse SCSS
wolf-css styles.scss -o output.js

# With options
wolf-css input.css -o output.js --mode module --camelCase
```

### CLI Options

| Option         | Description                            |
| -------------- | -------------------------------------- |
| `-o, --output` | Output file path                       |
| `--mode`       | `'module'` (CSS Modules) or `'global'` |
| `--camelCase`  | Convert class names to camelCase       |
| `--minify`     | Minify output                          |

---

## Programmatic API

### Parsing

#### `parseCSS(css, options?)`

Parse CSS string to style objects.

```typescript
import { parseCSS } from '@wolfie/css-parser'

const styles = parseCSS(`
  .container {
    flex-direction: column;
    padding: 1rem;
  }
  .title {
    color: green;
    font-weight: bold;
  }
`)

// Result:
// {
//   container: { flexDirection: 'column', padding: 4 },
//   title: { color: 'green', fontWeight: 'bold' }
// }
```

#### Options

```typescript
interface CSSParserOptions {
	/** Source filename (for error messages) */
	filename?: string
	/** Convert class names to camelCase */
	camelCaseClasses?: boolean
}
```

#### `parse(css)`

Low-level CSS parser. Returns AST.

```typescript
import { parse } from '@wolfie/css-parser'

const ast = parse('.box { color: red; }')
```

#### `parseRule(rule)`

Parse a single CSS rule.

```typescript
import { parseRule } from '@wolfie/css-parser'

const style = parseRule('flex-direction: column; padding: 1rem;')
// { flexDirection: 'column', padding: 4 }
```

---

### Preprocessing

#### `compile(css, lang, filename?)`

Compile CSS/SCSS/LESS/Stylus to plain CSS.

```typescript
import { compile } from '@wolfie/css-parser'

const result = await compile(scssCode, 'scss', 'styles.scss')
console.log(result.css)
```

#### `detectLanguage(filename)`

Detect preprocessor from file extension.

```typescript
import { detectLanguage } from '@wolfie/css-parser'

detectLanguage('styles.scss') // 'scss'
detectLanguage('styles.less') // 'less'
detectLanguage('styles.styl') // 'stylus'
detectLanguage('styles.css') // 'css'
```

#### `compileScss(code, options?)`

Compile SCSS specifically.

```typescript
import { compileScss } from '@wolfie/css-parser'

const result = await compileScss(`
  $primary: green;
  .title { color: $primary; }
`)
```

#### `compileLess(code, options?)`

Compile LESS specifically.

#### `compileStylus(code, options?)`

Compile Stylus specifically.

---

### Tailwind CSS

#### `tailwind.compile(candidates, options?)`

Compile Tailwind utilities.

```typescript
import { tailwind } from '@wolfie/css-parser'

const css = await tailwind.compile(['flex-col', 'p-4', 'text-green-500'])
```

The Tailwind integration includes a **custom OKLCH shim** that enables native OKLCH color support. This polyfill intercepts Tailwind's color output and converts OKLCH colors to sRGB hex values compatible with terminal rendering.

---

### Code Generation

#### `generateJavaScript(styles, options?)`

Generate JavaScript code from parsed styles.

```typescript
import { parseCSS, generateJavaScript } from '@wolfie/css-parser'

const styles = parseCSS('.box { padding: 1rem; }')
const js = generateJavaScript(styles, {
	mode: 'module',
	camelCaseClasses: true,
})

// Output:
// export default {
//   box: { padding: 4 }
// }
```

#### Options

```typescript
interface CodeGeneratorOptions {
	/** 'module' for CSS Modules, 'global' for registerStyles() */
	mode?: 'module' | 'global'
	/** Convert class names to camelCase */
	camelCaseClasses?: boolean
	/** Tailwind metadata for JIT */
	metadata?: TailwindMetadata
	/** Target framework */
	framework?: 'react' | 'vue' | 'angular'
}
```

#### `generateTypeScript(styles, options?)`

Generate TypeScript with type declarations.

---

### Property Mapping

#### `mapPropertyName(cssProperty)`

Map CSS property to wolf-tui property.

```typescript
import { mapPropertyName } from '@wolfie/css-parser'

mapPropertyName('flex-direction') // 'flexDirection'
mapPropertyName('padding-left') // 'paddingLeft'
```

#### `isValidProperty(property)`

Check if property is supported.

```typescript
import { isValidProperty } from '@wolfie/css-parser'

isValidProperty('flex-direction') // true
isValidProperty('box-shadow') // false
```

---

### Value Parsing

#### `parseNumeric(value)`

Parse numeric CSS value to terminal cells.

```typescript
import { parseNumeric } from '@wolfie/css-parser'

parseNumeric('1rem') // 4
parseNumeric('8px') // 2
parseNumeric('2ch') // 2
parseNumeric('50%') // '50%' (preserved)
parseNumeric('50vw') // '50vw' (preserved)
```

#### Unit Conversions

| Unit   | Conversion                        |
| ------ | --------------------------------- |
| `px`   | value / 4                         |
| `rem`  | value × 4 (1rem = 16px = 4 cells) |
| `em`   | Same as rem                       |
| `ch`   | 1:1 (character width)             |
| `pt`   | (value × 1.333) / 4               |
| `pc`   | value × 4                         |
| `in`   | value × 24                        |
| `cm`   | (value × 37.8) / 4                |
| `mm`   | (value × 3.78) / 4                |
| `%`    | Preserved as string               |
| `vw`   | Preserved as string               |
| `vh`   | Preserved as string               |
| `vmin` | Preserved as string               |
| `vmax` | Preserved as string               |

#### `parseColor(value)`

Parse CSS color to terminal-compatible format.

```typescript
import { parseColor } from '@wolfie/css-parser'

parseColor('red') // 'red'
parseColor('#ff0000') // '#ff0000'
parseColor('rgb(255, 0, 0)') // '#ff0000'
parseColor('oklch(0.7 0.15 30)') // '#...' (converted to hex)
```

Supported formats:

- Named colors (140+ CSS colors → ANSI mapping)
- Hex: `#fff`, `#ffffff`
- RGB: `rgb(255, 0, 0)`, `rgb(255 0 0 / 0.5)`
- RGBA: `rgba(255, 0, 0, 0.5)`
- HSL: `hsl(0, 100%, 50%)`
- OKLCH: `oklch(0.7 0.15 30)` (via colorjs.io)
- LAB, LCH: Converted to sRGB hex

#### `parseBorderStyle(value)`

Parse border-style to cli-boxes style.

```typescript
import { parseBorderStyle } from '@wolfie/css-parser'

parseBorderStyle('solid') // 'single'
parseBorderStyle('double') // 'double'
parseBorderStyle('dashed') // 'classic'
parseBorderStyle('dotted') // 'classic'
```

---

### Utilities

#### `scanCandidates(code)`

Scan code for Tailwind class candidates.

```typescript
import { scanCandidates } from '@wolfie/css-parser'

const candidates = scanCandidates(`
  <div class="flex-col p-4 text-green-500">
`)
// ['flex-col', 'p-4', 'text-green-500']
```

#### `inlineStyles(styles, className)`

Inline styles directly into JSX props.

```typescript
import { inlineStyles } from '@wolfie/css-parser'

const inlined = inlineStyles(parsedStyles, 'container')
// { flexDirection: 'column', padding: 4 }
```

---

## Types

### `ParsedStyles`

Map of class names to style objects.

```typescript
type ParsedStyles = Record<string, Record<string, unknown>>
```

### `PreprocessorType`

```typescript
type PreprocessorType = 'css' | 'scss' | 'sass' | 'less' | 'stylus'
```

### `PreprocessorResult`

```typescript
interface PreprocessorResult {
	css: string
	metadata?: TailwindMetadata
	watchFiles?: string[]
}
```

---

## Integration with @wolfie/plugin

The plugin uses this package internally:

```typescript
// @wolfie/plugin internals
import {
	compile,
	detectLanguage,
	parseCSS,
	generateJavaScript,
} from '@wolfie/css-parser'

async function transform(code, id) {
	const lang = detectLanguage(id)
	const compiled = await compile(code, lang, id)
	const styles = parseCSS(compiled.css)
	return generateJavaScript(styles, { mode: 'module' })
}
```

---

## Supported Properties

See [@wolfie/plugin README](../../packages/plugin/README.md#css-property-support) for the full list of supported CSS properties.

## License

MIT
