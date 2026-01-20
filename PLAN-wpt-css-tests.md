# Plan: Adapt Browser CSS Test Suites for wolf-tui

## Executive Summary

Adapt Web Platform Tests (WPT) CSS conformance tests to verify wolf-tui's CSS parser and Taffy layout engine against browser-standard behavior.

**Primary Source**: [github.com/web-platform-tests/wpt/tree/master/css](https://github.com/web-platform-tests/wpt/tree/master/css)

**Why WPT over Chromium-specific tests**:
- Cross-browser standard (used by Chrome, Firefox, Safari, Edge)
- Well-structured with consistent file formats
- Accessible via raw GitHub URLs (no complex build system)
- Tests edge cases all browser vendors have encountered

---

## Phase 0: Documentation & Source Acquisition

### Objective
Clone WPT CSS test directories and understand test file formats.

### Tasks

#### 0.1 Clone WPT Sparse Checkout
```bash
cd /home/node/projects/wolf-tui
mkdir -p .wpt-tests
cd .wpt-tests

git clone --depth 1 --filter=blob:none --sparse \
  https://github.com/web-platform-tests/wpt.git
cd wpt
git sparse-checkout set \
  css/css-flexbox \
  css/css-align \
  css/css-sizing \
  css/css-box \
  css/css-display \
  css/css-position
```

#### 0.2 Add to .gitignore
```bash
echo ".wpt-tests/" >> /home/node/projects/wolf-tui/.gitignore
```

#### 0.3 Inventory Test Counts
```bash
# Count tests per directory
find .wpt-tests/wpt/css/css-flexbox -name "*.html" | wc -l
find .wpt-tests/wpt/css/css-align -name "*.html" | wc -l
find .wpt-tests/wpt/css/css-sizing -name "*.html" | wc -l
```

### Verification Checklist
- [ ] `.wpt-tests/wpt/css/css-flexbox/` directory exists with 600+ HTML files
- [ ] `.wpt-tests/wpt/css/css-align/` directory exists
- [ ] `.wpt-tests/` is in `.gitignore`

### Anti-Patterns to Avoid
- Do NOT commit WPT tests to wolf-tui repo (too large, use sparse checkout)
- Do NOT try to run WPT tests directly (they require browser runtime)

---

## Phase 1: Test Adapter Infrastructure

### Objective
Create a test adapter that extracts CSS from WPT HTML files and converts them to vitest assertions.

### Documentation References
- wolf-tui test pattern: `packages/css-parser/test/parser.test.ts:7-11`
- vitest config: `packages/css-parser/vitest.config.ts`

### WPT Test File Formats

**Reftest (visual comparison)** - Most common:
```html
<!DOCTYPE html>
<link rel="match" href="reference/green-square.html" />
<style>
.flex { display: flex; align-items: center; }
</style>
<div class="flex">...</div>
```

**testharness.js (programmatic)** - Fewer tests:
```html
<script src="/resources/testharness.js"></script>
<script>
test_computed_value("flex-direction", "row");
</script>
```

### Tasks

#### 1.1 Create WPT Adapter Module

**File**: `packages/css-parser/src/wpt-adapter.ts`

```typescript
/**
 * WPT Test Adapter
 *
 * Extracts CSS rules from WPT HTML test files and converts them
 * to wolf-tui parseCSS test cases.
 */

import { JSDOM } from 'jsdom'
import * as fs from 'node:fs'
import * as path from 'node:path'

export interface WPTTestCase {
  /** Original test file path */
  source: string
  /** Test name derived from filename */
  name: string
  /** Extracted CSS rules */
  css: string
  /** Reference file for reftests (if any) */
  reference?: string
  /** Test type: 'reftest' | 'testharness' */
  type: 'reftest' | 'testharness'
  /** Spec reference URL from test metadata */
  specUrl?: string
}

/**
 * Parse a WPT HTML test file and extract CSS
 */
export function parseWPTTest(htmlPath: string): WPTTestCase | null {
  const html = fs.readFileSync(htmlPath, 'utf-8')
  const dom = new JSDOM(html)
  const doc = dom.window.document

  // Extract CSS from <style> tags
  const styleTags = doc.querySelectorAll('style')
  const css = Array.from(styleTags)
    .map(s => s.textContent || '')
    .join('\n')

  if (!css.trim()) return null  // Skip tests without CSS

  // Determine test type
  const matchLink = doc.querySelector('link[rel="match"]')
  const testharness = doc.querySelector('script[src*="testharness"]')

  // Extract spec reference
  const helpLink = doc.querySelector('link[rel="help"]')

  return {
    source: htmlPath,
    name: path.basename(htmlPath, '.html').replace(/-/g, ' '),
    css,
    reference: matchLink?.getAttribute('href') || undefined,
    type: matchLink ? 'reftest' : (testharness ? 'testharness' : 'reftest'),
    specUrl: helpLink?.getAttribute('href') || undefined,
  }
}

/**
 * Scan a directory for WPT test files
 */
export function scanWPTDirectory(dirPath: string): WPTTestCase[] {
  const tests: WPTTestCase[] = []

  const files = fs.readdirSync(dirPath, { recursive: true }) as string[]
  for (const file of files) {
    if (!file.endsWith('.html') && !file.endsWith('.htm')) continue
    if (file.includes('-ref.html')) continue  // Skip reference files
    if (file.includes('/reference/')) continue
    if (file.includes('/support/')) continue

    const fullPath = path.join(dirPath, file)
    const test = parseWPTTest(fullPath)
    if (test) tests.push(test)
  }

  return tests
}
```

#### 1.2 Add jsdom Dependency
```bash
pnpm add -D jsdom @types/jsdom --filter @wolf-tui/css-parser
```

#### 1.3 Create Adapter Tests

**File**: `packages/css-parser/test/wpt-adapter.test.ts`

```typescript
import { describe, it, expect } from 'vitest'
import { parseWPTTest } from '../src/wpt-adapter.js'
import * as fs from 'node:fs'
import * as path from 'node:path'

describe('WPT Adapter', () => {
  it('extracts CSS from reftest', () => {
    // Create a mock WPT test file
    const mockHtml = `
      <!DOCTYPE html>
      <link rel="match" href="ref.html" />
      <style>
        .flex { display: flex; }
      </style>
      <div class="flex"></div>
    `

    const tmpFile = '/tmp/wpt-test.html'
    fs.writeFileSync(tmpFile, mockHtml)

    const result = parseWPTTest(tmpFile)

    expect(result).not.toBeNull()
    expect(result!.css).toContain('display: flex')
    expect(result!.type).toBe('reftest')
    expect(result!.reference).toBe('ref.html')

    fs.unlinkSync(tmpFile)
  })

  it('returns null for tests without CSS', () => {
    const mockHtml = `<!DOCTYPE html><p>No CSS</p>`
    const tmpFile = '/tmp/wpt-no-css.html'
    fs.writeFileSync(tmpFile, mockHtml)

    const result = parseWPTTest(tmpFile)
    expect(result).toBeNull()

    fs.unlinkSync(tmpFile)
  })
})
```

### Verification Checklist
- [ ] `pnpm tsc --noEmit -p packages/css-parser` passes
- [ ] `pnpm vitest packages/css-parser/test/wpt-adapter.test.ts --run` passes
- [ ] Adapter correctly extracts CSS from sample WPT file

### Anti-Patterns to Avoid
- Do NOT try to execute WPT testharness.js assertions (browser-only)
- Do NOT parse inline styles on elements (focus on `<style>` blocks)

---

## Phase 2: Flexbox Test Suite Adaptation

### Objective
Convert WPT css-flexbox tests to wolf-tui parser tests.

### Documentation References
- WPT flexbox tests: `.wpt-tests/wpt/css/css-flexbox/`
- Existing parser tests: `packages/css-parser/test/parser.test.ts:110-127`

### Priority Test Categories

| Category | WPT Pattern | wolf-tui Focus |
|----------|-------------|----------------|
| flex-direction | `flex-direction-*.html` | flexDirection property |
| flex-wrap | `flex-wrap-*.html` | flexWrap property |
| flex-grow/shrink/basis | `flex-grow-*.html`, `flex-shrink-*.html` | Flex item sizing |
| align-items | `align-items-*.html` | alignItems property |
| justify-content | `justify-content-*.html` | justifyContent property |
| gap | `gap-*.html` | gap property |

### Tasks

#### 2.1 Create Flexbox WPT Test Runner

**File**: `packages/css-parser/test/wpt/flexbox.test.ts`

```typescript
import { describe, it, expect } from 'vitest'
import { parseCSS } from '../../src/parser.js'
import { scanWPTDirectory, type WPTTestCase } from '../../src/wpt-adapter.js'
import * as path from 'node:path'
import * as fs from 'node:fs'

//#region WPT Flexbox Tests

const WPT_FLEXBOX_DIR = path.resolve(__dirname, '../../../../.wpt-tests/wpt/css/css-flexbox')

// Skip if WPT tests not downloaded
const wptAvailable = fs.existsSync(WPT_FLEXBOX_DIR)

describe.skipIf(!wptAvailable)('WPT css-flexbox', () => {
  // Load all flexbox tests
  const tests = wptAvailable ? scanWPTDirectory(WPT_FLEXBOX_DIR) : []

  describe('flex-direction tests', () => {
    const directionTests = tests.filter(t =>
      t.name.includes('flex-direction') || t.source.includes('flex-direction')
    )

    it.each(directionTests)('$name', (test: WPTTestCase) => {
      // Parse CSS from WPT test
      const result = parseCSS(test.css)

      // Verify we can parse the CSS without errors
      expect(result).toBeDefined()

      // Check for expected flexDirection values
      const styles = Object.values(result)
      const hasFlexDirection = styles.some(s =>
        s.flexDirection !== undefined
      )

      // Log for debugging
      if (!hasFlexDirection) {
        console.log(`[WPT] ${test.name}: No flexDirection found in parsed CSS`)
      }
    })
  })

  describe('flex-grow tests', () => {
    const growTests = tests.filter(t =>
      t.name.includes('flex-grow') || t.source.includes('flex-grow')
    )

    it.each(growTests)('$name', (test: WPTTestCase) => {
      const result = parseCSS(test.css)
      expect(result).toBeDefined()

      const styles = Object.values(result)
      const hasFlexGrow = styles.some(s => s.flexGrow !== undefined)

      if (!hasFlexGrow) {
        console.log(`[WPT] ${test.name}: No flexGrow found in parsed CSS`)
      }
    })
  })

  describe('align-items tests', () => {
    const alignTests = tests.filter(t =>
      t.name.includes('align-items') || t.source.includes('align-items')
    )

    it.each(alignTests)('$name', (test: WPTTestCase) => {
      const result = parseCSS(test.css)
      expect(result).toBeDefined()

      const styles = Object.values(result)
      const hasAlignItems = styles.some(s => s.alignItems !== undefined)

      if (!hasAlignItems) {
        console.log(`[WPT] ${test.name}: No alignItems found in parsed CSS`)
      }
    })
  })
})

//#endregion WPT Flexbox Tests
```

#### 2.2 Create Property Extraction Helper

**File**: `packages/css-parser/src/wpt-adapter.ts` (append)

```typescript
/**
 * Extract expected CSS property values from WPT test
 * Based on common WPT test patterns
 */
export function extractExpectedValues(testCase: WPTTestCase): Map<string, string> {
  const expected = new Map<string, string>()

  // Parse CSS to find property declarations
  const propertyRegex = /([a-z-]+)\s*:\s*([^;}\n]+)/gi
  let match

  while ((match = propertyRegex.exec(testCase.css)) !== null) {
    const [, prop, value] = match
    if (prop && value) {
      expected.set(prop.trim(), value.trim())
    }
  }

  return expected
}
```

### Verification Checklist
- [ ] `pnpm vitest packages/css-parser/test/wpt/flexbox.test.ts --run` runs without errors
- [ ] At least 50 WPT flexbox tests are detected and parsed
- [ ] Console output shows which properties are successfully parsed

### Anti-Patterns to Avoid
- Do NOT expect 100% pass rate initially (some CSS features unsupported)
- Do NOT fail tests for unsupported CSS properties (log warnings instead)
- Do NOT try to verify visual layout (only CSS parsing)

---

## Phase 3: Alignment & Sizing Test Suites

### Objective
Adapt css-align and css-sizing WPT tests.

### Tasks

#### 3.1 Create Alignment Test Suite

**File**: `packages/css-parser/test/wpt/align.test.ts`

```typescript
import { describe, it, expect } from 'vitest'
import { parseCSS } from '../../src/parser.js'
import { scanWPTDirectory, type WPTTestCase } from '../../src/wpt-adapter.js'
import * as path from 'node:path'
import * as fs from 'node:fs'

const WPT_ALIGN_DIR = path.resolve(__dirname, '../../../../.wpt-tests/wpt/css/css-align')
const wptAvailable = fs.existsSync(WPT_ALIGN_DIR)

describe.skipIf(!wptAvailable)('WPT css-align', () => {
  const tests = wptAvailable ? scanWPTDirectory(WPT_ALIGN_DIR) : []

  describe('gap tests', () => {
    const gapTests = tests.filter(t =>
      t.source.includes('/gaps/') || t.name.includes('gap')
    )

    it.each(gapTests)('$name', (test: WPTTestCase) => {
      const result = parseCSS(test.css)
      expect(result).toBeDefined()
    })
  })

  describe('justify-content tests', () => {
    const justifyTests = tests.filter(t =>
      t.name.includes('justify-content') || t.source.includes('justify-content')
    )

    it.each(justifyTests)('$name', (test: WPTTestCase) => {
      const result = parseCSS(test.css)
      expect(result).toBeDefined()
    })
  })
})
```

#### 3.2 Create Sizing Test Suite

**File**: `packages/css-parser/test/wpt/sizing.test.ts`

Similar pattern for css-sizing tests focusing on:
- width/height
- min-width/min-height
- max-width/max-height
- fit-content

### Verification Checklist
- [ ] Alignment tests run without errors
- [ ] Sizing tests run without errors
- [ ] Gap property tests show successful parsing

---

## Phase 4: Conformance Reporting

### Objective
Generate a conformance report showing WPT test coverage.

### Tasks

#### 4.1 Create Conformance Reporter

**File**: `packages/css-parser/scripts/wpt-conformance.ts`

```typescript
#!/usr/bin/env npx tsx
/**
 * WPT Conformance Reporter
 *
 * Scans WPT test files and reports which CSS properties
 * wolf-tui successfully parses.
 */

import { scanWPTDirectory, extractExpectedValues } from '../src/wpt-adapter.js'
import { parseCSS } from '../src/parser.js'
import * as path from 'node:path'

const WPT_BASE = path.resolve(__dirname, '../../../.wpt-tests/wpt/css')

const categories = ['css-flexbox', 'css-align', 'css-sizing', 'css-box']

interface ConformanceResult {
  category: string
  total: number
  parsed: number
  properties: Map<string, { found: number; missing: number }>
}

function runConformance(): ConformanceResult[] {
  const results: ConformanceResult[] = []

  for (const category of categories) {
    const dir = path.join(WPT_BASE, category)
    const tests = scanWPTDirectory(dir)

    const propStats = new Map<string, { found: number; missing: number }>()
    let parsed = 0

    for (const test of tests) {
      try {
        const result = parseCSS(test.css)
        if (Object.keys(result).length > 0) parsed++

        // Track property coverage
        const expected = extractExpectedValues(test)
        for (const [prop] of expected) {
          const stat = propStats.get(prop) || { found: 0, missing: 0 }
          // Check if property was parsed (simplified check)
          const styleValues = Object.values(result)
          const camelProp = prop.replace(/-([a-z])/g, (_, c) => c.toUpperCase())
          const found = styleValues.some(s => (s as Record<string, unknown>)[camelProp] !== undefined)

          if (found) stat.found++
          else stat.missing++

          propStats.set(prop, stat)
        }
      } catch (e) {
        // Parse error
      }
    }

    results.push({
      category,
      total: tests.length,
      parsed,
      properties: propStats,
    })
  }

  return results
}

// Run and output report
const results = runConformance()

console.log('\n# WPT Conformance Report\n')

for (const r of results) {
  const pct = ((r.parsed / r.total) * 100).toFixed(1)
  console.log(`## ${r.category}`)
  console.log(`Tests: ${r.parsed}/${r.total} (${pct}% parseable)\n`)

  console.log('| Property | Found | Missing | Coverage |')
  console.log('|----------|-------|---------|----------|')

  for (const [prop, stat] of r.properties) {
    const total = stat.found + stat.missing
    const cov = ((stat.found / total) * 100).toFixed(0)
    console.log(`| ${prop} | ${stat.found} | ${stat.missing} | ${cov}% |`)
  }
  console.log('')
}
```

#### 4.2 Add Script to package.json

```json
{
  "scripts": {
    "wpt:conformance": "npx tsx scripts/wpt-conformance.ts"
  }
}
```

### Verification Checklist
- [ ] `pnpm wpt:conformance` runs and outputs a markdown table
- [ ] Report shows coverage percentages for each CSS category
- [ ] Report identifies missing property support

---

## Phase 5: CI Integration

### Objective
Add WPT tests to CI workflow.

### Tasks

#### 5.1 Create WPT Download Script

**File**: `packages/css-parser/scripts/download-wpt.sh`

```bash
#!/bin/bash
set -e

WPT_DIR=".wpt-tests"

if [ -d "$WPT_DIR/wpt" ]; then
  echo "WPT tests already downloaded"
  exit 0
fi

mkdir -p "$WPT_DIR"
cd "$WPT_DIR"

git clone --depth 1 --filter=blob:none --sparse \
  https://github.com/web-platform-tests/wpt.git

cd wpt
git sparse-checkout set \
  css/css-flexbox \
  css/css-align \
  css/css-sizing \
  css/css-box \
  css/css-display \
  css/css-position

echo "WPT tests downloaded successfully"
```

#### 5.2 Add CI Workflow

**File**: `.github/workflows/wpt-tests.yml`

```yaml
name: WPT Conformance

on:
  push:
    paths:
      - 'packages/css-parser/**'
  pull_request:
    paths:
      - 'packages/css-parser/**'

jobs:
  wpt-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - run: pnpm install

      - name: Download WPT tests
        run: bash packages/css-parser/scripts/download-wpt.sh

      - name: Run WPT conformance tests
        run: pnpm vitest packages/css-parser/test/wpt/ --run

      - name: Generate conformance report
        run: pnpm --filter @wolf-tui/css-parser wpt:conformance
```

### Verification Checklist
- [ ] `bash packages/css-parser/scripts/download-wpt.sh` completes successfully
- [ ] CI workflow runs WPT tests
- [ ] Conformance report is generated in CI logs

---

## Allowed APIs Reference

### wolf-tui APIs (from discovery)

```typescript
// CSS Parsing
import { parseCSS } from '@wolf-tui/css-parser'
function parseCSS(css: string, options?: CSSParserOptions): ParsedStyles

// Types
interface ParsedStyles {
  [className: string]: Partial<Styles>
}

// Test pattern
import { describe, it, expect } from 'vitest'
expect(result.className.propertyName).toBe(value)
expect(result.className).toEqual({ prop1: val1, prop2: val2 })
```

### WPT HTML Test Format

```html
<!-- Reftest (visual comparison) -->
<!DOCTYPE html>
<link rel="match" href="reference.html" />
<link rel="help" href="https://www.w3.org/TR/css-flexbox-1/#..." />
<style>
  .selector { property: value; }
</style>
<div class="selector">...</div>

<!-- testharness.js (programmatic) -->
<!DOCTYPE html>
<script src="/resources/testharness.js"></script>
<script>
test_computed_value("property", "value");
</script>
```

---

## Known Limitations & Gaps

1. **Visual tests cannot be automated** - WPT reftests rely on visual rendering comparison. We can only verify CSS parsing, not layout results.

2. **Some CSS features unsupported** - wolf-tui doesn't support:
   - `@media` queries
   - Pseudo-classes (`:hover`, `:focus`)
   - CSS variables at runtime
   - Viewport units (`vw`, `vh`)
   - Animations/transitions

3. **Test coverage estimation** - Based on WPT structure:
   - css-flexbox: ~600 tests
   - css-align: ~150 tests
   - css-sizing: ~300 tests
   - Expect 40-60% initial parseable rate (many tests use unsupported features)

---

## Execution Order

| Phase | Depends On | Estimated Tests |
|-------|------------|-----------------|
| Phase 0 | None | N/A (setup) |
| Phase 1 | Phase 0 | 2 adapter tests |
| Phase 2 | Phase 1 | 100+ flexbox tests |
| Phase 3 | Phase 1 | 50+ align/sizing tests |
| Phase 4 | Phase 2, 3 | N/A (reporting) |
| Phase 5 | Phase 4 | N/A (CI) |
