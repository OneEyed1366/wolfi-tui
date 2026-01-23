import type { Plugin } from 'vite'
import type { VitePluginOptions } from './types'
import './shim' // Apply Tailwind v4 patch EARLY
import {
	compile,
	detectLanguage,
	type PreprocessorResult,
} from './preprocessors'
import { parseCSS } from './parser'
import { generateJavaScript, generateTypeScript } from './generator'
import { scanCandidates } from './scanner'
import { inlineStyles } from './inliner'
import { readFileSync, existsSync } from 'node:fs'
import { dirname } from 'node:path'
import glob from 'fast-glob'
import type { ParsedStyles } from './types'

/**
 * Vite Plugin for wolfie CSS
 */
export function wolfieCSS(options: VitePluginOptions = {}): Plugin {
	const {
		mode = 'module',
		javascript = true, // Default to true for better compatibility with vite-node/SSR
		include = /\.(css|scss|sass|less|styl|stylus)$/,
		exclude = /node_modules/,
		camelCaseClasses = true,
		inline = true, // New option: inline styles in JSX
	} = options

	const usedCandidates = new Set<string>()
	const globalStylesMap: ParsedStyles = {}
	const virtualPrefix = '\0wolfie:'

	/**
	 * Helper to process a CSS file and populate the global map
	 */
	async function processCSSFile(
		filePath: string,
		options: { camelCaseClasses?: boolean }
	) {
		if (!existsSync(filePath)) return

		const lang = detectLanguage(filePath)
		const source = readFileSync(filePath, 'utf-8')
		try {
			const result = await compile(source, lang, filePath)
			const styles = parseCSS(result.css, {
				filename: filePath,
				camelCaseClasses: options.camelCaseClasses ?? true,
			})
			Object.assign(globalStylesMap, styles)
		} catch (e) {
			console.warn(`[wolfie-css] Failed to pre-scan ${filePath}:`, e)
		}
	}

	return {
		name: 'wolfie-css',
		enforce: 'pre',

		async configResolved(config) {
			// Pre-scan project for CSS files to populate globalStylesMap early
			// Use config file directory as scan root to avoid scanning entire monorepo
			// when running from a parent directory (e.g., `pnpm example` from root)
			const scanRoot = config.configFile
				? dirname(config.configFile)
				: config.root

			const cssFiles = await glob(['**/*.{css,scss,sass,less,styl,stylus}'], {
				ignore: ['**/node_modules/**', '**/.git/**', '**/.*/**'],
				cwd: scanRoot,
				absolute: true,
				followSymbolicLinks: false,
				dot: false,
			})

			for (const file of cssFiles) {
				await processCSSFile(file, { camelCaseClasses })
			}
		},

		async transform(code, id) {
			if (id.includes('node_modules')) return null

			if (id.match(/\.(tsx|jsx|ts|js)$/)) {
				// 1. Scan for candidates
				const candidates = scanCandidates(code)
				for (const candidate of candidates) {
					usedCandidates.add(candidate)
				}

				// 2. If inlining is enabled, replace className with style
				if (inline && Object.keys(globalStylesMap).length > 0) {
					const newCode = inlineStyles(code, globalStylesMap)
					if (newCode !== code) {
						return { code: newCode, map: null }
					}
				}
			}

			return null
		},

		async resolveId(id, importer) {
			const cleanId = id.split('?')[0]!

			// Skip if already virtual or excluded
			if (id.startsWith(virtualPrefix) || matchesPattern(cleanId, exclude)) {
				return null
			}

			if (matchesPattern(cleanId, include)) {
				const resolved = await this.resolve(id, importer, { skipSelf: true })
				if (resolved) {
					return virtualPrefix + resolved.id + '.js'
				}
			}
			return null
		},

		async load(id) {
			if (!id.startsWith(virtualPrefix)) {
				return null
			}

			// Extract the real absolute path
			const absolutePath = id.slice(virtualPrefix.length).replace(/\.js$/, '')

			if (!existsSync(absolutePath)) {
				return null
			}

			const isModule = absolutePath.includes('.module.') || mode === 'module'
			const lang = detectLanguage(absolutePath)

			try {
				let compiled: string
				let metadata: PreprocessorResult['metadata'] = undefined

				if (lang === 'css' && !absolutePath.includes('.module.')) {
					try {
						const result = await this.load({ id: absolutePath })
						if (
							result &&
							result.code &&
							!result.code.includes('export default')
						) {
							compiled = result.code
						} else {
							const source = readFileSync(absolutePath, 'utf-8')
							const compileResult = await compile(source, lang, absolutePath)
							compiled = compileResult.css
							metadata = compileResult.metadata
						}
					} catch {
						const source = readFileSync(absolutePath, 'utf-8')
						const compileResult = await compile(source, lang, absolutePath)
						compiled = compileResult.css
						metadata = compileResult.metadata
					}
				} else {
					const source = readFileSync(absolutePath, 'utf-8')
					const compileResult = await compile(source, lang, absolutePath)
					compiled = compileResult.css
					metadata = compileResult.metadata
				}
				const styles = parseCSS(compiled, {
					filename: absolutePath,
					camelCaseClasses,
					// Only filter global CSS by candidates - CSS modules use dynamic references
					// like `styles.container` which can't be statically scanned
					includeCandidates: isModule
						? undefined
						: usedCandidates.size > 0
							? usedCandidates
							: undefined,
				})

				// Store in global map for inlining
				Object.assign(globalStylesMap, styles)

				// Use requested generator (defaulting to JS for runtime compatibility)
				const generator = javascript ? generateJavaScript : generateTypeScript
				const code = generator(styles, {
					mode: isModule ? 'module' : 'global',
					camelCaseClasses,
					metadata,
				})

				return {
					code,
					moduleType: 'js',
					map: { mappings: '' },
				}
			} catch (error) {
				this.error(`[wolfie-css] Error loading ${absolutePath}: ${error}`)
				return null
			}
		},
	}
}

/**
 * Check if a file path matches a pattern or array of patterns
 */
function matchesPattern(
	id: string,
	pattern: string | RegExp | (string | RegExp)[]
): boolean {
	const patterns = Array.isArray(pattern) ? pattern : [pattern]
	return patterns.some((p) => {
		if (typeof p === 'string') return id.includes(p)
		return p.test(id)
	})
}

export { type VitePluginOptions }
export default wolfieCSS
