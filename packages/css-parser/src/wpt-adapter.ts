/**
 * WPT Test Adapter
 *
 * Extracts CSS rules from WPT HTML test files and converts them
 * to wolfie parseCSS test cases.
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
		.map((s) => s.textContent || '')
		.join('\n')

	if (!css.trim()) return null // Skip tests without CSS

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
		type: matchLink ? 'reftest' : testharness ? 'testharness' : 'reftest',
		specUrl: helpLink?.getAttribute('href') || undefined,
	}
}

/**
 * Scan a directory for WPT test files
 */
export function scanWPTDirectory(dirPath: string): WPTTestCase[] {
	const tests: WPTTestCase[] = []

	if (!fs.existsSync(dirPath)) {
		return []
	}

	const files = fs.readdirSync(dirPath, { recursive: true }) as string[]
	for (const file of files) {
		if (!file.endsWith('.html') && !file.endsWith('.htm')) continue
		if (file.includes('-ref.html')) continue // Skip reference files
		if (file.includes('/reference/')) continue
		if (file.includes('/support/')) continue

		const fullPath = path.join(dirPath, file)
		try {
			// Skip directories if readdir returns them (depending on node version/recursive option)
			if (fs.statSync(fullPath).isDirectory()) continue

			const test = parseWPTTest(fullPath)
			if (test) tests.push(test)
		} catch {
			// Ignore read errors
		}
	}

	return tests
}

/**
 * Extract expected CSS property values from WPT test
 * Based on common WPT test patterns where style is defined like:
 * .test { property: value; }
 */
export function extractExpectedValues(
	testCase: WPTTestCase
): Map<string, string> {
	const expected = new Map<string, string>()

	// Simple regex to find properties in the CSS
	// This isn't a full CSS parser, but sufficient for extracting
	// explicitly defined values in simple WPT tests
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
