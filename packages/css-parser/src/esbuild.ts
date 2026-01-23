/**
 * esbuild Plugin for wolfie CSS
 *
 * Transforms CSS imports into wolfie style objects at build time
 */

import type { Plugin } from 'esbuild'
import fs from 'node:fs'
import * as path from 'node:path'
import glob from 'fast-glob'
import type { EsbuildPluginOptions } from './types'
import { parseCSS } from './parser'
import { compile, detectLanguage } from './preprocessors'
import { generateJavaScript } from './generator'
import { scanCandidates } from './scanner'
import { inlineStyles } from './inliner'

//#region esbuild Plugin

/**
 * esbuild plugin for wolfie CSS transformation
 */
export function wolfieCSS(options: EsbuildPluginOptions = {}): Plugin {
	const {
		mode = 'module',
		filter = /\.(css|scss|sass|less|styl|stylus)$/,
		inline = false,
	} = options

	const globalStylesMap = new Map<string, any>()
	const usedCandidates = new Set<string>()

	return {
		name: 'wolfie-css',

		async setup(build) {
			// If inlining is enabled, pre-scan CSS files to populate the map
			if (inline) {
				const cssFiles = await glob('**/*.{css,scss,sass,less,styl,stylus}', {
					cwd: build.initialOptions.absWorkingDir || process.cwd(),
					ignore: ['**/node_modules/**'],
					absolute: true,
				})

				await Promise.all(
					cssFiles.map(async (file) => {
						try {
							const source = await fs.promises.readFile(file, 'utf-8')
							const lang = detectLanguage(file)
							const result = await compile(source, lang, file)
							const styles = parseCSS(result.css, { filename: file })
							for (const [name, style] of Object.entries(styles)) {
								globalStylesMap.set(name, style)
							}
						} catch (err) {
							console.warn(`[wolfie-css] Failed to pre-scan ${file}:`, err)
						}
					})
				)
			}

			// 1. Scan source files if inlining is enabled
			if (inline) {
				build.onLoad({ filter: /\.[jt]sx?$/ }, async (args) => {
					// Don't process node_modules
					if (args.path.includes('node_modules')) return

					const source = await fs.promises.readFile(args.path, 'utf-8')
					const candidates = scanCandidates(source)
					for (const c of candidates) usedCandidates.add(c)

					// Perform static inlining if we have styles
					if (globalStylesMap.size > 0) {
						const transformed = inlineStyles(source, globalStylesMap)
						if (transformed !== source) {
							return { contents: transformed, loader: 'tsx' }
						}
					}

					return null
				})
			}

			// 2. Handle CSS and preprocessor files
			build.onLoad({ filter }, async (args) => {
				try {
					const source = await fs.promises.readFile(args.path, 'utf-8')

					// Detect mode from filename (.module.css → module mode)
					const isModule = args.path.includes('.module.') || mode === 'module'

					// Detect preprocessor and compile to CSS
					const lang = detectLanguage(args.path)
					const result = await compile(source, lang, args.path)

					// Update global map for inlining
					const allStyles = parseCSS(result.css, {
						filename: args.path,
					})
					if (inline) {
						for (const [name, style] of Object.entries(allStyles)) {
							globalStylesMap.set(name, style)
						}
					}

					// Parse CSS to styles for this module
					const styles = parseCSS(result.css, {
						filename: args.path,
						includeCandidates: inline ? usedCandidates : undefined,
					})

					// Generate JavaScript output (esbuild handles transpilation)
					const output = generateJavaScript(styles, {
						mode: isModule ? 'module' : 'global',
						metadata: result.metadata,
					})

					return {
						contents: output,
						loader: 'js',
						watchFiles: result.watchFiles,
					}
				} catch (err: any) {
					return {
						errors: [
							{
								text: err.message,
								location: {
									file: args.path,
								},
							},
						],
					}
				}
			})
		},
	}
}

//#endregion esbuild Plugin

export { type EsbuildPluginOptions }
export default wolfieCSS
