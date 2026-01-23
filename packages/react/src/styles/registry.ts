import type { Styles } from '@wolfie/core'
import { STATIC_UTILITIES, UTILITY_PREFIXES } from './tailwind-data.generated'

/** Global registry of styles from side-effect CSS imports */
const globalStyles = new Map<string, Partial<Styles>>()

/** Custom tailwind metadata registered at runtime (e.g. from user config) */
const customPrefixes = new Set<string>()
const customStatics = new Set<string>()

/**
 * Register tailwind utility metadata at runtime
 */
export function registerTailwindMetadata(data: {
	prefixes?: string[]
	statics?: string[]
}): void {
	if (data.prefixes) {
		for (const p of data.prefixes) customPrefixes.add(p)
	}
	if (data.statics) {
		for (const s of data.statics) customStatics.add(s)
	}
}

/**
 * Register styles globally (called by generated code from side-effect imports)
 * Last import wins for collision handling (CSS cascade behavior)
 */
export function registerStyles(styles: Record<string, Partial<Styles>>): void {
	for (const [name, style] of Object.entries(styles)) {
		globalStyles.set(name, style)
	}
}

/**
 * Clear all registered styles (useful for testing)
 */
export function clearGlobalStyles(): void {
	globalStyles.clear()
	customPrefixes.clear()
	customStatics.clear()
}

/**
 * Get a style by class name from the global registry
 */
export function getGlobalStyle(className: string): Partial<Styles> | undefined {
	return globalStyles.get(className)
}

/** Type for className prop - can be string, object, or array */
export type ClassNameValue =
	| string
	| Partial<Styles>
	| (string | Partial<Styles>)[]
	| undefined
	| null

/**
 * Resolve a className value to a merged Styles object
 *
 * @example
 * resolveClassName('container')           // lookup global
 * resolveClassName({ padding: 2 })        // pass through object
 * resolveClassName(['base', { gap: 4 }])  // merge array
 * resolveClassName('flex gap-2')          // split and lookup each
 * resolveClassName('btn primary')         // try compound lookup first
 */
export function resolveClassName(className: ClassNameValue): Partial<Styles> {
	if (!className) return {}

	if (typeof className === 'object' && !Array.isArray(className)) {
		return className as Partial<Styles>
	}

	if (Array.isArray(className)) {
		return className.reduce<Partial<Styles>>((acc, item) => {
			return { ...acc, ...resolveClassName(item as ClassNameValue) }
		}, {})
	}

	const trimmed = className.trim()
	if (!trimmed) return {}

	const exactMatch = globalStyles.get(trimmed)
	if (exactMatch) return exactMatch

	const parts = trimmed.split(/\s+/).filter(Boolean)

	if (parts.length >= 2 && parts.length <= 4) {
		const hasTailwindUtility = parts.some((part) => isTailwindUtility(part))

		if (!hasTailwindUtility) {
			const compound = tryCompoundLookup(parts)
			if (compound) return compound
		}
	}

	return parts.reduce<Partial<Styles>>((acc, cls) => {
		const style = resolveOne(cls)
		return { ...acc, ...style }
	}, {})
}

/**
 * Check if a class name looks like a Tailwind utility
 * Uses generated metadata from node_modules/tailwindcss for high fidelity
 */
function isTailwindUtility(name: string): boolean {
	const trimmed = name.trim()
	if (!trimmed) return false

	// Handle variants (e.g., hover:bg-blue-500, focus:text-red)
	// We look for the last colon to get the actual utility name
	const lastColonIndex = trimmed.lastIndexOf(':')
	const baseName =
		lastColonIndex !== -1 ? trimmed.slice(lastColonIndex + 1) : trimmed

	// 1. Check arbitrary properties like [mask-type:luminance]
	if (baseName.startsWith('[') && baseName.endsWith(']')) return true

	// 2. Check static utilities (e.g., 'flex', 'hidden', '-m-px')
	if (STATIC_UTILITIES.has(baseName) || customStatics.has(baseName)) return true

	// 3. Check functional utilities (e.g., 'w-1/2', 'bg-red-500', 'p-[10px]')
	const dashIndex = baseName.indexOf('-')
	if (dashIndex !== -1) {
		const prefix = baseName.slice(0, dashIndex)

		// Handle negative utilities (e.g., -mt-4)
		if (prefix === '' && baseName.length > 1) {
			return isTailwindUtility(baseName.slice(1))
		}

		if (UTILITY_PREFIXES.has(prefix) || customPrefixes.has(prefix)) return true
	}

	return false
}

/**
 * Generate all permutations of compound selectors from parts
 * Returns array of compound strings like ["btn.primary", "primary.btn", "btn.primary.large", ...]
 */
function generateCompoundPermutations(parts: string[]): string[] {
	if (parts.length < 2) return []

	const compounds: string[] = []

	for (let i = 2; i <= parts.length; i++) {
		compounds.push(...generateKPermutations(parts, i))
	}

	return compounds
}

/**
 * Generate k-element permutations from array
 */
function generateKPermutations(arr: string[], k: number): string[] {
	if (k === 0) return ['']
	if (arr.length === 0) return []

	const result: string[] = []

	function helper(current: string[], remaining: string[], depth: number): void {
		if (depth === k) {
			result.push(current.join('.'))
			return
		}

		for (let i = 0; i < remaining.length; i++) {
			helper(
				[...current, remaining[i]],
				remaining.slice(0, i).concat(remaining.slice(i + 1)),
				depth + 1
			)
		}
	}

	helper([], arr, 0)
	return result
}

/**
 * Try to find compound selectors in the registry
 */
function tryCompoundLookup(parts: string[]): Partial<Styles> | null {
	if (parts.length < 2) return null

	const compounds = generateCompoundPermutations(parts)

	for (const compound of compounds) {
		const style = globalStyles.get(compound)
		if (style) return style
	}

	return null
}

/**
 * Resolve a single class name
 */
function resolveOne(name: string): Partial<Styles> {
	const trimmed = name.trim()

	if (!trimmed) return {}

	const registered = globalStyles.get(trimmed)
	if (registered) return registered

	// Handle variants by stripping them and looking up the base utility
	const lastColonIndex = trimmed.lastIndexOf(':')
	if (lastColonIndex !== -1) {
		const baseName = trimmed.slice(lastColonIndex + 1)
		const baseStyle = globalStyles.get(baseName)
		if (baseStyle) return baseStyle
	}

	return {}
}
