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
 */
export function resolveClassName(className: ClassNameValue): Partial<Styles> {
	if (!className) return {}

	if (typeof className === 'object' && !Array.isArray(className)) {
		// Direct style object (from CSS Modules)
		return className
	}

	if (Array.isArray(className)) {
		// Merge array of class names/objects
		return className.reduce<Partial<Styles>>((acc, item) => {
			return { ...acc, ...resolveClassName(item) }
		}, {})
	}

	// String: split by space, resolve each, merge
	const classes = className.trim().split(/\s+/).filter(Boolean)
	return classes.reduce<Partial<Styles>>((acc, cls) => {
		const style = resolveOne(cls)
		return { ...acc, ...style }
	}, {})
}

/**
 * Resolve a single class name
 */
function resolveOne(name: string): Partial<Styles> {
	// 1. Check global registry
	const registered = globalStyles.get(name)
	if (registered) return registered

	// 2. Fallback: return empty (Tailwind parsing would go here)
	// For now, unknown class names are ignored
	return {}
}
