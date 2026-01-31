/**
 * CSS Module Resolver
 *
 * Parses CSS files and extracts class names for type generation.
 */

import type ts from 'typescript/lib/tsserverlibrary'
import type { PluginOptions } from './types'

//#region Types

interface ParsedCSSModule {
	classNames: string[]
	classPositions: Map<string, number>
	lastModified: number
}

//#endregion Types

//#region CSS Class Extraction

/**
 * Simple CSS class name extraction using regex.
 * For production use, consider using @wolfie/css-parser directly.
 */
function extractClassNames(css: string): {
	classNames: string[]
	classPositions: Map<string, number>
} {
	const classNames: string[] = []
	const classPositions = new Map<string, number>()
	const seen = new Set<string>()

	// Match class selectors: .class-name
	// Handles: .foo, .foo-bar, .foo_bar, .foo123
	const classRegex = /\.([a-zA-Z_][\w-]*)/g
	let match

	while ((match = classRegex.exec(css)) !== null) {
		const className = match[1]!
		if (!seen.has(className)) {
			seen.add(className)
			classNames.push(className)
			// Store position of the class name (after the dot)
			classPositions.set(className, match.index + 1)
		}
	}

	return { classNames, classPositions }
}

/**
 * Transform class name based on options.
 */
function transformClassName(
	name: string,
	transform: PluginOptions['classnameTransform']
): string {
	switch (transform) {
		case 'camelCase':
			return name.replace(/-([a-z])/g, (_, char) => char.toUpperCase())
		case 'dashes':
			return name.replace(/[A-Z]/g, (char) => '-' + char.toLowerCase())
		default:
			return name
	}
}

//#endregion CSS Class Extraction

//#region CSSModuleResolver Class

export class CSSModuleResolver {
	private cache = new Map<string, ParsedCSSModule>()
	private project: ts.server.Project

	constructor(
		project: ts.server.Project,
		private options: PluginOptions
	) {
		this.project = project
	}

	/**
	 * Get class names from a CSS module file.
	 */
	getClassNames(cssPath: string): string[] | undefined {
		const parsed = this.getParsedModule(cssPath)
		return parsed?.classNames
	}

	/**
	 * Get the position of a class definition in the CSS file.
	 */
	getClassPosition(cssPath: string, className: string): number | undefined {
		const parsed = this.getParsedModule(cssPath)
		return parsed?.classPositions.get(className)
	}

	/**
	 * Get or parse a CSS module, using cache when possible.
	 */
	private getParsedModule(cssPath: string): ParsedCSSModule | undefined {
		// Check cache
		const cached = this.cache.get(cssPath)

		// Try to read file content
		const fileContent = this.readFile(cssPath)
		if (!fileContent) return undefined

		// Use a simple hash of content length as modification check
		// (In production, use file modification time)
		const contentHash = fileContent.length

		if (cached && cached.lastModified === contentHash) {
			return cached
		}

		// Parse the CSS
		const { classNames: rawClassNames, classPositions } =
			extractClassNames(fileContent)

		// Transform class names if needed
		const classNames = rawClassNames.map((name) =>
			transformClassName(name, this.options.classnameTransform)
		)

		const parsed: ParsedCSSModule = {
			classNames,
			classPositions,
			lastModified: contentHash,
		}

		this.cache.set(cssPath, parsed)
		return parsed
	}

	/**
	 * Read file content using TypeScript's file system.
	 */
	private readFile(filePath: string): string | undefined {
		try {
			// Try using project's script snapshot
			const scriptInfo = this.project.projectService.getScriptInfo(filePath)
			if (scriptInfo) {
				const snapshot = scriptInfo.getSnapshot()
				return snapshot.getText(0, snapshot.getLength())
			}

			// Fallback to reading from disk via project host
			const host = this.project.projectService.host
			if (host.readFile) {
				return host.readFile(filePath)
			}
		} catch {
			// File not found or not readable
		}
		return undefined
	}

	/**
	 * Clear cache for a specific file (on file change).
	 */
	invalidate(cssPath: string): void {
		this.cache.delete(cssPath)
	}

	/**
	 * Clear all cached data.
	 */
	clearCache(): void {
		this.cache.clear()
	}
}

//#endregion CSSModuleResolver Class
