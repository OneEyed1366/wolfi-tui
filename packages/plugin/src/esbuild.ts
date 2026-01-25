import type { Plugin } from 'esbuild'
import { readFileSync, existsSync } from 'node:fs'
import glob from 'fast-glob'
import {
	compile,
	detectLanguage,
	parseCSS,
	generateJavaScript,
	scanCandidates,
	inlineStyles,
	tailwind,
	type ParsedStyles,
} from '@wolfie/css-parser'
import type { Framework, WolfieOptions } from './index'

const CSS_EXTENSIONS_RE = /\.(css|scss|sass|less|styl|stylus)$/

/**
 * Wolfie esbuild plugin
 *
 * Custom esbuild implementation bc unplugin's transform doesn't set loader: 'js'
 */
export function wolfie(
	framework: Framework,
	options: WolfieOptions = {}
): Plugin {
	const {
		mode = 'module',
		inline = true,
		include,
		exclude,
		camelCaseClasses,
	} = options

	const isVue = framework === 'vue'
	const camelCase = camelCaseClasses ?? !isVue
	const filter = include ?? CSS_EXTENSIONS_RE

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
			camelCaseClasses: camelCase,
		})

		// Populate global map for inlining
		Object.assign(globalStylesMap, styles)

		const code = generateJavaScript(styles, {
			mode: isModule ? 'module' : 'global',
			metadata: compileResult.metadata,
			framework,
			camelCaseClasses: camelCase,
		})

		return { code, styles }
	}

	return {
		name: 'wolfie',

		async setup(build) {
			const rootDir = build.initialOptions.absWorkingDir || process.cwd()

			// Initialize Tailwind compiler
			await tailwind.initialize(rootDir)

			// Phase 1: Pre-scan source files to push candidates to Tailwind
			const sourceFiles = await glob('**/*.{tsx,jsx,ts,js,vue}', {
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
				} catch {
					// Ignore files that can't be read
				}
			}

			// Phase 2: Pre-scan CSS files to populate globalStylesMap for inlining
			if (inline) {
				const cssFiles = await glob('**/*.{css,scss,sass,less,styl,stylus}', {
					cwd: rootDir,
					ignore: ['**/node_modules/**'],
					absolute: true,
				})

				for (const file of cssFiles) {
					try {
						await loadAndProcessStyle(file)
					} catch {
						// Ignore files that can't be processed
					}
				}

				// Generate Tailwind CSS and add to globalStylesMap
				try {
					const tailwindCss = await tailwind.build()
					const tailwindStyles = parseCSS(tailwindCss, {
						filename: 'virtual:tailwind.css',
						camelCaseClasses: camelCase,
					})
					Object.assign(globalStylesMap, tailwindStyles)
				} catch {
					// Tailwind build failed, continue without it
				}
			}

			// Phase 3: Transform JS/TSX files to inline styles
			if (inline) {
				build.onLoad({ filter: /\.[jt]sx?$/ }, async (args) => {
					if (args.path.includes('node_modules')) return null

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
					} catch {
						return null
					}
				})
			}

			// Phase 4: Handle CSS/preprocessor files
			build.onLoad({ filter }, async (args) => {
				// Check exclude pattern
				if (exclude?.test(args.path)) return null

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
				} catch (err: unknown) {
					const message = err instanceof Error ? err.message : String(err)
					return {
						errors: [{ text: message, location: { file: args.path } }],
					}
				}
			})
		},
	}
}

export default wolfie
export { type Framework, type WolfieOptions }
