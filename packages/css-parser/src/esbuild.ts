/**
 * esbuild Plugin for wolfie CSS
 *
 * Transforms CSS imports into wolfie style objects at build time.
 * Uses Zero-Scan "Push" model for Tailwind v4 integration.
 */

import type { Plugin } from 'esbuild'
import glob from 'fast-glob'
import type { EsbuildPluginOptions, ParsedStyles } from './types'
import { compile, detectLanguage, tailwind } from './preprocessors'
import { parseCSS } from './parser'
import { generateJavaScript } from './generator'
import { scanCandidates } from './scanner'
import { inlineStyles } from './inliner'
import { readFileSync, existsSync } from 'node:fs'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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

/**
 * esbuild plugin for wolfie CSS transformation
 */
export function wolfieCSS(options: EsbuildPluginOptions = {}): Plugin {
	const {
		mode = 'module',
		filter = /\.(css|scss|sass|less|styl|stylus)$/,
		inline = true,
	} = options

	const globalStylesMap: ParsedStyles = {}

	async function loadAndProcessStyle(
		absolutePath: string
	): Promise<{ code: string; styles: ParsedStyles } | null> {
		if (!existsSync(absolutePath)) return null

		const isModule = absolutePath.includes('.module.') || mode === 'module'
		const lang = detectLanguage(absolutePath)

		const source = readFileSync(absolutePath, 'utf-8')
		const compileResult = await compile(source, lang, absolutePath)

		const styles = parseCSS(compileResult.css, {
			filename: absolutePath,
		})

		// Populate global map for inlining
		Object.assign(globalStylesMap, styles)

		const code = generateJavaScript(styles, {
			mode: isModule ? 'module' : 'global',
			metadata: compileResult.metadata,
		})

		return { code, styles }
	}

	return {
		name: 'wolfie-css',

		async setup(build) {
			const rootDir = build.initialOptions.absWorkingDir || process.cwd()

			// Initialize Tailwind compiler
			await tailwind.initialize(rootDir)

			// Phase 1: Pre-scan source files to push candidates to Tailwind
			const sourceFiles = await glob('**/*.{tsx,jsx,ts,js}', {
				cwd: rootDir,
				ignore: ['**/node_modules/**', '**/dist/**', '**/build/**'],
				absolute: true,
			})

			for (const file of sourceFiles) {
				try {
					const source = readFileSync(file, 'utf-8')
					const candidates = scanCandidates(source)
					if (candidates.size > 0) {
						tailwind.addCandidates(candidates)
					}
				} catch (err) {
					console.warn(`[wolfie-css] Failed to pre-scan ${file}:`, err)
				}
			}

			// Phase 2: Pre-scan CSS files to populate globalStylesMap for inlining
			if (inline) {
				// 2a: Load project CSS files
				const cssFiles = await glob('**/*.{css,scss,sass,less,styl,stylus}', {
					cwd: rootDir,
					ignore: ['**/node_modules/**'],
					absolute: true,
				})

				for (const file of cssFiles) {
					try {
						await loadAndProcessStyle(file)
					} catch (err) {
						console.warn(`[wolfie-css] Failed to load ${file}:`, err)
					}
				}

				// 2b: Generate Tailwind CSS and add to globalStylesMap
				try {
					const tailwindCss = await tailwind.build()
					const tailwindStyles = parseCSS(tailwindCss, {
						filename: 'virtual:tailwind.css',
					})
					Object.assign(globalStylesMap, tailwindStyles)
				} catch (err) {
					console.warn('[wolfie-css] Failed to generate Tailwind CSS:', err)
				}
			}

			// Phase 3: Transform JS/TSX files to inline styles
			if (inline) {
				build.onLoad({ filter: /\.[jt]sx?$/ }, async (args) => {
					if (args.path.includes('node_modules')) return

					try {
						const source = readFileSync(args.path, 'utf-8')

						// Collect candidates
						const candidates = scanCandidates(source)
						if (candidates.size > 0) {
							tailwind.addCandidates(candidates)
						}

						// Inline styles
						if (Object.keys(globalStylesMap).length > 0) {
							const transformed = inlineStyles(source, globalStylesMap)
							if (transformed !== source) {
								return { contents: transformed, loader: 'tsx' }
							}
						}

						return null
					} catch (err) {
						console.warn(`[wolfie-css] Failed to process ${args.path}:`, err)
						return null
					}
				})
			}

			// Phase 4: Handle CSS/preprocessor files
			build.onLoad({ filter }, async (args) => {
				try {
					const result = await loadAndProcessStyle(args.path)
					if (!result) {
						return {
							errors: [
								{
									text: `File not found: ${args.path}`,
									location: { file: args.path },
								},
							],
						}
					}

					return {
						contents: result.code,
						loader: 'js',
						watchFiles: [args.path],
					}
				} catch (err: any) {
					return {
						errors: [
							{
								text: err.message,
								location: { file: args.path },
							},
						],
					}
				}
			})

			// Phase 5: Handle virtual Tailwind module (optional)
			build.onResolve({ filter: /^virtual:wolfie-tailwind\.css$/ }, (args) => ({
				path: args.path,
				namespace: 'wolfie-tailwind',
			}))

			build.onLoad({ filter: /.*/, namespace: 'wolfie-tailwind' }, async () => {
				const css = await tailwind.build()
				return {
					contents: css,
					loader: 'css',
					resolveDir: rootDir,
				}
			})
		},
	}
}

//#endregion esbuild Plugin

export { type EsbuildPluginOptions }
export default wolfieCSS
