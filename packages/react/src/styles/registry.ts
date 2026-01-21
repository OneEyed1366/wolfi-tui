import type { Styles } from '@wolfie/core'

/** Global registry of styles from side-effect CSS imports */
const globalStyles = new Map<string, Partial<Styles>>()

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
		return className
	}

	if (Array.isArray(className)) {
		return className.reduce<Partial<Styles>>((acc, item) => {
			return { ...acc, ...resolveClassName(item) }
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
 * Returns true for patterns like: w-1/2, p-4, bg-blue-500, text-sm, etc.
 */
function isTailwindUtility(name: string): boolean {
	const trimmed = name.trim()

	const tailwindPatterns = [
		/^w-\d+\/\d+$/, // w-1/2
		/^w-(?:full|auto|screen|fit|1\/2|1\/3|2\/3|1\/4|3\/4|1\/5|2\/5|3\/5|4\/5|\d+)$/, // w-full, w-auto, w-80, w-[100px]
		/^h-\d+\/\d+$/, // h-1/2
		/^p-[xyrltb]?-?\d+$/, // p-4, px-2, pl-1
		/^m-[xyrltb]?-?\d+$/, // m-4, mx-2, ml-1
		/^gap-?\d+$/, // gap-2
		/^bg-[a-z]+-?\d*$/, // bg-blue-500, bg-red
		/^text-[a-z-]+-?\d*$/, // text-xl, text-sm, text-cyan-400, text-white
		/^font-(bold|light|medium|normal|thin|semibold|black)$/, // font-bold
		/^border-[a-z]+-?\d*$/, // border-blue-500
		/^rounded-?\d*$/, // rounded, rounded-lg
		/^flex(-[a-z-]+)?$/, // flex, flex-row, flex-col
		/^grid(-[a-z-]+)?$/, // grid, grid-cols-2
		/^items-[a-z-]+$/, // items-center, items-start
		/^justify-[a-z-]+$/, // justify-center, justify-between
		/^(?:min-|max-)?(?:w|h)-\d+$/, // min-w-4, max-h-12
		/^[a-z]+-\[[^\]]+\]$/, // bg-[magenta], p-[10px]
		/^[a-z]+:.*$/, // hover:bg-blue-500, focus:text-red
	]

	return tailwindPatterns.some((pattern) => pattern.test(trimmed))
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

	const parts = trimmed.split(/\s+/).filter(Boolean)

	if (parts.length === 1) {
		return {}
	}

	const hasTailwindUtility = parts.some((part) => isTailwindUtility(part))

	if (!hasTailwindUtility) {
		const compound = tryCompoundLookup(parts)
		if (compound) return compound
	}

	return parts.reduce<Partial<Styles>>((acc, part) => {
		const style = globalStyles.get(part)
		return style ? { ...acc, ...style } : acc
	}, {})
}
