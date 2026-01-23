/**
 * Preprocessor adapters for SCSS, Less, and Stylus
 */

import * as path from 'node:path'
import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'node:fs'
import { createHash } from 'node:crypto'
import * as sass from 'sass'
import less from 'less'
import stylus from 'stylus'
import postcss from 'postcss'
import { createRequire } from 'node:module'
import { parseCSS } from './parser'
import type { ParsedStyles, PreprocessorType, CSSParserOptions } from './types'
import './shim' // Apply Tailwind v4 patch

//#region Tailwind Cache
// File-based cache for expensive Tailwind compilation
const CACHE_DIR = path.join(process.cwd(), 'node_modules', '.wolfie-cache')

/**
 * Extract @source paths from Tailwind CSS
 * e.g., @source "../index.tsx"; -> ["../index.tsx"]
 */
function extractSourcePaths(css: string): string[] {
	const sources: string[] = []
	const regex = /@source\s+["']([^"']+)["']/g
	let match
	while ((match = regex.exec(css)) !== null) {
		sources.push(match[1]!)
	}
	return sources
}

/**
 * Generate cache key including source file contents
 * This ensures cache invalidates when source files change
 */
function getCacheKey(css: string, filePath: string): string {
	const hash = createHash('sha256')
	hash.update(css)
	hash.update(filePath)

	// Include @source file contents in hash
	const sourcePaths = extractSourcePaths(css)
	const baseDir = path.dirname(filePath)

	for (const sourcePath of sourcePaths) {
		const absolutePath = path.resolve(baseDir, sourcePath)
		try {
			if (existsSync(absolutePath)) {
				const content = readFileSync(absolutePath, 'utf-8')
				hash.update(content)
			}
		} catch {
			// Skip files that can't be read
		}
	}

	return hash.digest('hex').slice(0, 16)
}

function getCachedTailwind(
	key: string
): { css: string; metadata?: PreprocessorResult['metadata'] } | null {
	try {
		const cachePath = path.join(CACHE_DIR, `${key}.json`)
		if (existsSync(cachePath)) {
			const cached = JSON.parse(readFileSync(cachePath, 'utf-8'))
			return cached
		}
	} catch {
		// Cache miss or corrupted
	}
	return null
}

function setCachedTailwind(
	key: string,
	css: string,
	metadata?: PreprocessorResult['metadata']
): void {
	try {
		mkdirSync(CACHE_DIR, { recursive: true })
		const cachePath = path.join(CACHE_DIR, `${key}.json`)
		writeFileSync(cachePath, JSON.stringify({ css, metadata }))
	} catch {
		// Ignore cache write failures
	}
}
//#endregion Tailwind Cache

//#region Types

export type { PreprocessorType }

export interface PreprocessorResult {
	css: string
	sourceMap?: string
	watchFiles?: string[]
	metadata?: {
		prefixes?: string[]
		statics?: string[]
	}
}

export interface PreprocessOptions {
	/** Preprocessor language type */
	lang?: PreprocessorType
	/** File path for @import resolution */
	filePath?: string
	/** Generate source maps */
	sourceMap?: boolean
}

//#endregion Types

//#region SCSS/Sass Compilation

/**
 * Compile SCSS/Sass to CSS
 *
 * Uses the modern sass API (compileString) which is synchronous
 * but we return Promise for consistency with other preprocessors.
 */
export async function compileScss(
	source: string,
	filePath?: string
): Promise<PreprocessorResult> {
	const result = sass.compileString(source, {
		// Use file's directory for @import resolution
		loadPaths: filePath ? [path.dirname(filePath)] : [],
		// Use indented syntax for .sass files
		syntax: filePath?.endsWith('.sass') ? 'indented' : 'scss',
	})

	return {
		css: result.css,
		sourceMap: result.sourceMap ? JSON.stringify(result.sourceMap) : undefined,
		watchFiles: result.loadedUrls.map((url) => url.pathname),
	}
}

/**
 * @deprecated Use compileScss instead
 */
export const compileSass = compileScss

//#endregion SCSS/Sass Compilation

//#region Less Compilation

/**
 * Compile Less to CSS
 */
export async function compileLess(
	source: string,
	filePath?: string
): Promise<PreprocessorResult> {
	const result = await less.render(source, {
		filename: filePath,
		// Enable paths relative to file location
		paths: filePath ? [path.dirname(filePath)] : [],
	})

	return {
		css: result.css,
		sourceMap: result.map,
		watchFiles: result.imports,
	}
}

//#endregion Less Compilation

//#region Stylus Compilation

/**
 * Compile Stylus to CSS
 */
export function compileStylus(
	source: string,
	filePath?: string
): Promise<PreprocessorResult> {
	return new Promise((resolve, reject) => {
		const compiler = stylus(source)

		if (filePath) {
			compiler.set('filename', filePath)
			// Add file's directory for @import resolution
			compiler.set('paths', [path.dirname(filePath)])
		}

		compiler.render((err: Error | null, css: string | undefined) => {
			if (err) {
				reject(err)
			} else {
				resolve({
					css: css ?? '',
					watchFiles: compiler.deps(),
				})
			}
		})
	})
}

//#endregion Stylus Compilation

//#region Unified API

/**
 * Detect preprocessor language from file extension
 */
export function detectLanguage(filename: string): PreprocessorType {
	const ext = path.extname(filename).toLowerCase()

	switch (ext) {
		case '.scss':
		case '.sass':
			return 'scss'
		case '.less':
			return 'less'
		case '.styl':
		case '.stylus':
			return 'stylus'
		default:
			return 'css'
	}
}

/**
 * Compile source code using the specified preprocessor
 */
export async function compile(
	source: string,
	lang: PreprocessorType,
	filePath?: string
): Promise<PreprocessorResult> {
	let result: PreprocessorResult

	switch (lang) {
		case 'scss':
			result = await compileScss(source, filePath)
			break
		case 'less':
			result = await compileLess(source, filePath)
			break
		case 'stylus':
			result = await compileStylus(source, filePath)
			break
		case 'css':
		default:
			result = { css: source }
			break
	}

	let css = result.css || ''

	// Always run through PostCSS to handle @import, Tailwind, etc.
	if (
		css &&
		(css.includes('@tailwind') || /@import\s+['"]tailwindcss['"]/.test(css))
	) {
		// Check cache first - Tailwind compilation is expensive (~25s)
		const cacheKey = getCacheKey(css, filePath || '')
		const cached = getCachedTailwind(cacheKey)
		if (cached) {
			return { css: cached.css, metadata: cached.metadata }
		}

		try {
			const require = createRequire(filePath || process.cwd())

			let tailwind: any

			try {
				// Tailwind v4 PostCSS plugin
				const tailwindPostcssPath = require.resolve('@tailwindcss/postcss')
				tailwind =
					(await import(tailwindPostcssPath)).default ||
					(await import(tailwindPostcssPath))
			} catch {
				try {
					// Tailwind v3 PostCSS plugin
					const tailwindPath = require.resolve('tailwindcss')
					tailwind =
						(await import(tailwindPath)).default || (await import(tailwindPath))
				} catch {
					console.warn(
						'[wolfie-css] Tailwind detected but tailwindcss or @tailwindcss/postcss not found in ' +
							(filePath || process.cwd())
					)
				}
			}

			if (tailwind) {
				// Try to find tailwind config (v3 only)
				let tailwindConfig: any = undefined
				try {
					let searchDir = path.dirname(filePath || process.cwd())
					let configPath: string | null = null

					for (let i = 0; i < 3; i++) {
						const cjsConfigPath = path.join(searchDir, 'tailwind.config.cjs')
						if (existsSync(cjsConfigPath)) {
							configPath = cjsConfigPath
							break
						}

						const jsConfigPath = path.join(searchDir, 'tailwind.config.js')
						if (existsSync(jsConfigPath)) {
							configPath = jsConfigPath
							break
						}

						const parent = path.dirname(searchDir)
						if (parent === searchDir) break
						searchDir = parent
					}

					if (configPath) {
						const require = createRequire(filePath || process.cwd())
						const configDir = path.dirname(configPath)
						const loadedConfig = require(configPath)

						if (loadedConfig.content && Array.isArray(loadedConfig.content)) {
							loadedConfig.content = loadedConfig.content.map((p: string) =>
								path.isAbsolute(p) ? p : path.resolve(configDir, p)
							)
						}

						tailwindConfig = loadedConfig
					}
				} catch {}

				let plugin: any
				try {
					if (typeof tailwind === 'function') {
						plugin = tailwind(tailwindConfig)
					} else {
						plugin = tailwind
					}
				} catch (err: any) {
					if (err.message?.includes('PostCSS plugin has moved')) {
						console.warn(
							'[wolfie-css] Tailwind v4 detected but @tailwindcss/postcss not available. Please install it.'
						)
						return result
					}
					plugin = tailwind
				}

				const processor = postcss([plugin])
				const postcssResult = await processor.process(css, { from: filePath })

				let metadata: PreprocessorResult['metadata'] = undefined

				try {
					if (tailwind) {
						const { __unstable__loadDesignSystem } = await import('tailwindcss')
						const ds = await __unstable__loadDesignSystem(postcssResult.css)
						metadata = {
							prefixes: ds.utilities.keys('functional'),
							statics: ds.utilities.keys('static'),
						}
					}
				} catch {
					// Ignore metadata errors
				}

				// Cache the compiled result for subsequent runs
				setCachedTailwind(cacheKey, postcssResult.css, metadata)

				return {
					css: postcssResult.css,
					metadata,
				}
			}
		} catch (e) {
			console.warn('[wolfie-css] Tailwind processing failed:', e)
		}
	}

	return { ...result, css: result.css || '' }
}

/**
 * Preprocess source and parse into styles
 *
 * Combined compile + parseCSS for convenience.
 */
export async function preprocess(
	source: string,
	options: PreprocessOptions = {}
): Promise<ParsedStyles> {
	const lang =
		options.lang ??
		(options.filePath ? detectLanguage(options.filePath) : 'css')
	const result = await compile(source, lang, options.filePath)

	const parserOptions: CSSParserOptions = {
		filename: options.filePath,
		sourceMap: options.sourceMap,
	}

	return parseCSS(result.css, parserOptions)
}

/**
 * Legacy preprocess API (type-based)
 *
 * @deprecated Use the new preprocess(source, options) API instead
 */
export async function preprocessLegacy(
	source: string,
	type: PreprocessorType,
	filePath?: string
): Promise<PreprocessorResult> {
	return compile(source, type, filePath)
}

//#endregion Unified API
