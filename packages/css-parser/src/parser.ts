/**
 * CSS Parser - Parses CSS into wolfie Styles objects
 */

import postcss from 'postcss'
import type {
	ParsedStylesheet,
	ParsedRule,
	ParsedStyles,
	CSSParserOptions,
} from './types'
import { mapCSSProperty } from './properties'
import type { Styles } from '@wolfie/core'

//#region Selector Utilities

/**
 * Convert kebab-case to camelCase
 */
function kebabToCamel(str: string): string {
	return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
}

/**
 * Capitalize the first letter of a string
 */
function capitalize(str: string): string {
	return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Extract class name from a CSS selector and convert to camelCase
 *
 * Examples:
 * - `.card` → 'card'
 * - `#header` → 'header'
 * - `.card .title` → 'cardTitle' (flatten descendant)
 * - `.card > .title` → 'cardTitle' (flatten child)
 * - `.btn.primary` → 'btnPrimary' (concatenate)
 * - `[data-theme]` → 'dataTheme' (attribute)
 * - `.my-class-name` → 'myClassName' (kebab to camel)
 */
export function extractClassName(
	selector: string,
	camelCase = true
): string | null {
	const trimmed = selector.trim()

	// Skip pseudo-elements and pseudo-classes (e.g., :root, ::before)
	if (trimmed.startsWith(':')) {
		return null
	}

	// Allow element selectors for WPT compatibility and standard CSS support
	// In Wolfie, we only support classes, IDs, and attributes, so we skip element selectors
	// to avoid polluting the styles object with generic tags like 'div', 'span', etc.
	// unless they are part of a compound selector.
	if (/^[a-z]+$/i.test(trimmed)) {
		return null
	}

	// Skip universal selector
	if (trimmed === '*') {
		return null
	}

	// Helper to unescape CSS identifiers
	const unescape = (str: string) => str.replace(/\\(.)/g, '$1')

	// Handle compound selectors (e.g., .btn.primary, div.card)
	// We use a more robust split that respects escaped dots
	if (
		trimmed.includes('.') &&
		!trimmed.includes(' ') &&
		!trimmed.includes('>')
	) {
		// Split by dot but NOT escaped dots
		// Regex explanation: Split by . if not preceded by \
		const parts = trimmed.split(/(?<!\\)\./).filter(Boolean)
		if (parts.length > 0) {
			// Check if selector starts with element (div.card) vs class (.card or .btn.primary)
			const startsWithElement = !trimmed.startsWith('.')
			const startIndex = startsWithElement ? 1 : 0

			if (startIndex >= parts.length) {
				// This shouldn't happen for valid selectors, but handle it gracefully
				return null
			}

			// Join all class parts
			if (!camelCase) {
				return parts.slice(startIndex).map(unescape).join('.')
			}

			const className = parts
				.slice(startIndex)
				.map((part, i) => {
					const camelPart = kebabToCamel(unescape(part))
					return i === 0 ? camelPart : capitalize(camelPart)
				})
				.join('')
			return className
		}
	}

	// Handle descendant/child selectors (e.g., .card .title, .card > .title)
	if (trimmed.includes(' ')) {
		const parts = trimmed.split(/\s+(?:>\s*)?/).filter(Boolean)
		const classNames: string[] = []

		for (const part of parts) {
			// Extract class from each part
			const classMatch = part.match(/\.((?:[a-zA-Z0-9_-]|\\.)+)/)
			if (classMatch) {
				classNames.push(unescape(classMatch[1]!))
			} else {
				// Handle ID selectors
				const idMatch = part.match(/#((?:[a-zA-Z0-9_-]|\\.)+)/)
				if (idMatch) {
					classNames.push(unescape(idMatch[1]!))
				}
			}
		}

		if (classNames.length > 0) {
			if (!camelCase) {
				return classNames.join(' ')
			}

			// Join all parts into a single camelCase name
			return classNames
				.map((name, i) => {
					const camelName = kebabToCamel(name)
					return i === 0 ? camelName : capitalize(camelName)
				})
				.join('')
		}
		return null
	}

	// Handle single class selector (e.g., .card)
	const classMatch = trimmed.match(/^\.((?:[a-zA-Z0-9_-]|\\.)+)/)
	if (classMatch) {
		const name = unescape(classMatch[1]!)
		return camelCase ? kebabToCamel(name) : name
	}

	// Handle ID selector (e.g., #header)
	const idMatch = trimmed.match(/^#((?:[a-zA-Z0-9_-]|\\.)+)/)
	if (idMatch) {
		const name = unescape(idMatch[1]!)
		return camelCase ? kebabToCamel(name) : name
	}

	// Handle attribute selector (e.g., [data-theme])
	const attrMatch = trimmed.match(/^\[([a-zA-Z0-9_-]+)(?:=[^\]]+)?\]/)
	if (attrMatch) {
		return kebabToCamel(attrMatch[1]!)
	}

	// Skip unsupported selectors
	return null
}

/**
 * Parse CSS string into ParsedStyles (className → Styles mapping)
 */
export function parseCSS(
	css: string,
	options?: CSSParserOptions
): ParsedStyles {
	const root = postcss.parse(css, { from: options?.filename })
	const styles: ParsedStyles = {}
	const camelCase = options?.camelCaseClasses ?? true

	root.walkRules((rule) => {
		// Handle multiple selectors (e.g., .btn, .button)
		const selectors = rule.selector.split(',').map((s) => s.trim())

		for (const selector of selectors) {
			const className = extractClassName(selector, camelCase)
			if (!className) continue

			const style: Partial<Styles> = {}

			rule.walkDecls((decl) => {
				const mapped = mapCSSProperty(decl.prop, decl.value)
				if (mapped) {
					Object.assign(style, mapped)
				}
			})

			// Only add if we have some styles
			if (Object.keys(style).length > 0) {
				// Merge with existing styles if className already exists
				if (styles[className]) {
					styles[className] = { ...styles[className], ...style }
				} else {
					styles[className] = style
				}
			}
		}
	})

	return styles
}

/**
 * Parse CSS string into AST structure (legacy API)
 */
export function parse(css: string, sourceFile?: string): ParsedStylesheet {
	const root = postcss.parse(css, { from: sourceFile })
	const rules: ParsedRule[] = []

	root.walkRules((rule) => {
		const properties: ParsedRule['properties'] = []

		rule.walkDecls((decl) => {
			properties.push({
				name: decl.prop,
				value: decl.value,
				raw: decl.toString(),
			})
		})

		rules.push({
			selector: rule.selector,
			properties,
		})
	})

	return {
		rules,
		sourceFile,
	}
}

/**
 * Parse a single CSS rule text (legacy API)
 */
export function parseRule(ruleText: string): ParsedRule {
	// Wrap in a dummy selector if not present
	const css = ruleText.includes('{') ? ruleText : `.dummy { ${ruleText} }`

	const root = postcss.parse(css)
	let result: ParsedRule = { selector: '', properties: [] }

	root.walkRules((rule) => {
		const properties: ParsedRule['properties'] = []

		rule.walkDecls((decl) => {
			properties.push({
				name: decl.prop,
				value: decl.value,
				raw: decl.toString(),
			})
		})

		result = {
			selector: rule.selector,
			properties,
		}
	})

	return result
}

//#endregion CSS Parser

//#region Exports

export {
	type ParsedStylesheet,
	type ParsedRule,
	type ParsedStyles,
	type CSSParserOptions,
}

//#endregion Exports
