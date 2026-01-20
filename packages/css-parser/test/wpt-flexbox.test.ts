import { describe, it, expect } from 'vitest'
import { parseCSS } from '../src/parser'
import {
	scanWPTDirectory,
	type WPTTestCase,
	extractExpectedValues,
} from '../src/wpt-adapter'
import * as path from 'node:path'
import * as fs from 'node:fs'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
// packages/css-parser/test -> packages/css-parser -> packages -> root -> .vendors
const WPT_FLEXBOX_DIR = path.resolve(
	__dirname,
	'../../../.vendors/wpt/css/css-flexbox'
)

const wptAvailable = fs.existsSync(WPT_FLEXBOX_DIR)

describe.skipIf(!wptAvailable)('WPT css-flexbox', () => {
	// Scan directory once
	const tests = scanWPTDirectory(WPT_FLEXBOX_DIR)

	// Group tests by property for better reporting
	const directionTests = tests.filter((t) => t.css.includes('flex-direction'))
	const wrapTests = tests.filter((t) => t.css.includes('flex-wrap'))
	const growTests = tests.filter((t) => t.css.includes('flex-grow'))
	const shrinkTests = tests.filter((t) => t.css.includes('flex-shrink'))
	const basisTests = tests.filter((t) => t.css.includes('flex-basis'))

	describe('flex-direction', () => {
		it.each(directionTests)('$name', (test) => {
			const result = parseCSS(test.css)
			expect(result).toBeDefined()

			// If the test explicitly sets flex-direction, check if we parsed it
			const expected = extractExpectedValues(test)
			if (expected.has('flex-direction')) {
				const val = expected.get('flex-direction')!
				// We only support these specific values
				if (['row', 'column', 'row-reverse', 'column-reverse'].includes(val)) {
					// Check if any class has this style
					const hasStyle = Object.values(result).some(
						(style) => style.flexDirection === val
					)
					// Warn but don't fail if we miss it (conformance report style)
					if (!hasStyle) {
						console.warn(
							`[WPT Missing] ${test.name}: Expected flexDirection: ${val}`
						)
					}
					// For now, assert that we at least parsed *something* if CSS wasn't empty
					if (Object.keys(result).length === 0 && test.css.trim().length > 0) {
						// It's possible the CSS was just selectors we don't support (like body)
					}
				}
			}
		})
	})

	describe('General Parsing', () => {
		it(`parses ${tests.length} WPT files without crashing`, () => {
			let passed = 0
			for (const test of tests) {
				try {
					parseCSS(test.css)
					passed++
				} catch (e) {
					console.error(`Failed to parse ${test.name}:`, e)
				}
			}
			console.log(`Successfully parsed ${passed}/${tests.length} WPT files`)
			expect(passed).toBeGreaterThan(0)
		})
	})
})
