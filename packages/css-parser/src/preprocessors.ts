/**
 * Preprocessor adapters for SCSS, Less, and Stylus
 */

import * as path from 'node:path'
import { readFileSync, existsSync } from 'node:fs'
import * as sass from 'sass'
import less from 'less'
import stylus from 'stylus'
import postcss from 'postcss'
import { createRequire } from 'node:module'
import { parseCSS } from './parser'
import type { ParsedStyles, PreprocessorType, CSSParserOptions } from './types'

//#region Types

export type { PreprocessorType }

export interface PreprocessorResult {
	css: string
	sourceMap?: string
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
				resolve({ css: css ?? '' })
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
): Promise<string> {
	let css: string

	switch (lang) {
		case 'scss':
			css = (await compileScss(source, filePath)).css
			break
		case 'less':
			css = (await compileLess(source, filePath)).css
			break
		case 'stylus':
			css = (await compileStylus(source, filePath)).css
			break
		case 'css':
		default:
			css = source
			break
	}

	// Always run through PostCSS to handle @import, Tailwind, etc.
	if (css.includes('@tailwind') || /@import\s+['"]tailwindcss['"]/.test(css)) {
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
					const configPath = path.join(
						path.dirname(filePath || process.cwd()),
						'tailwind.config.cjs'
					)
					if (existsSync(configPath)) {
						tailwindConfig = configPath
					} else {
						const jsConfigPath = path.join(
							path.dirname(filePath || process.cwd()),
							'tailwind.config.js'
						)
						if (existsSync(jsConfigPath)) {
							tailwindConfig = jsConfigPath
						}
					}
				} catch {}

				let plugin: any
				try {
					if (typeof tailwind === 'function') {
						// Tailwind v3 or v4 (if it still supports function call)
						plugin = tailwind(tailwindConfig)
					} else {
						// Tailwind v4 plugin object
						plugin = tailwind
					}
				} catch (err: any) {
					// If it fails with the "plugin has moved" error, or if it's already a plugin object (v4)
					if (err.message?.includes('PostCSS plugin has moved')) {
						console.warn(
							'[wolfie-css] Tailwind v4 detected but @tailwindcss/postcss not available. Please install it.'
						)
						return css
					}
					// Otherwise assume it's already a plugin
					plugin = tailwind
				}

				const processor = postcss([plugin])
				const result = await processor.process(css, { from: filePath })
				return result.css
			}
		} catch (e) {
			console.warn('[wolfie-css] Tailwind processing failed:', e)
		}
	}

	return css
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
	const css = await compile(source, lang, options.filePath)

	const parserOptions: CSSParserOptions = {
		filename: options.filePath,
		sourceMap: options.sourceMap,
	}

	return parseCSS(css, parserOptions)
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
	const css = await compile(source, type, filePath)
	return { css }
}

//#endregion Unified API
