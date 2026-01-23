import type { Plugin } from 'vite'
import type { VitePluginOptions } from './types'
import './shim' // Apply Tailwind v4 patch
import { compile, detectLanguage, tailwind } from './preprocessors'
import { parseCSS } from './parser'
import { generateJavaScript, generateTypeScript } from './generator'
import { scanCandidates } from './scanner'
import { inlineStyles } from './inliner'
import { readFileSync, existsSync } from 'node:fs'
import type { ParsedStyles } from './types'

/**
 * Vite Plugin for wolfie CSS
 */
export function wolfieCSS(options: VitePluginOptions = {}): Plugin {
	const {
		mode = 'module',
		javascript = true,
		include = /\.(css|scss|sass|less|styl|stylus)$/,
		exclude = /node_modules/,
		camelCaseClasses = true,
		inline = true,
	} = options

	const globalStylesMap: ParsedStyles = {}
	const virtualPrefix = '\x00wolfie:'
	const tailwindVirtualId = 'virtual:wolfie-tailwind.css'
	const tailwindVirtualResolvedId = '\x00' + tailwindVirtualId

	let server: any

	return {
		name: 'wolfie-css',
		enforce: 'pre',

		configureServer(_server) {
			server = _server
		},

		async transform(code, id) {
			if (id.includes('node_modules') || id.startsWith('\x00')) return null

			// 1. If it's a source file, collect candidates for Tailwind Zero-Scan
			if (id.match(/\.(tsx|jsx|ts|js)$/)) {
				const candidates = scanCandidates(code)
				if (candidates.size > 0) {
					const beforeSize = tailwind.getCandidateSize()
					tailwind.addCandidates(candidates)
					const afterSize = tailwind.getCandidateSize()

					// Trigger HMR if new candidates found
					if (afterSize > beforeSize && server) {
						const mod = server.moduleGraph.getModuleById(
							tailwindVirtualResolvedId
						)
						if (mod) {
							server.moduleGraph.invalidateModule(mod)
							server.ws.send({
								type: 'full-reload',
								path: '*',
							})
						}
					}
				}

				// 2. If inlining is enabled and we have styles, apply them
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
			if (id === tailwindVirtualId) {
				return tailwindVirtualResolvedId
			}

			const cleanId = id.split('?')[0]!
			if (
				id.startsWith(virtualPrefix) ||
				id.startsWith('\x00') ||
				matchesPattern(cleanId, exclude)
			) {
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
			if (id === tailwindVirtualResolvedId) {
				const css = await tailwind.build()
				return css
			}

			if (!id.startsWith(virtualPrefix)) {
				return null
			}

			const absolutePath = id.slice(virtualPrefix.length).replace(/\.js$/, '')
			if (!existsSync(absolutePath)) return null

			const isModule = absolutePath.includes('.module.') || mode === 'module'
			const lang = detectLanguage(absolutePath)

			try {
				const source = readFileSync(absolutePath, 'utf-8')

				const compileResult = await compile(source, lang, absolutePath)

				const styles = parseCSS(compileResult.css, {
					filename: absolutePath,
					camelCaseClasses,
				})

				// Populate global map lazily as files are loaded
				Object.assign(globalStylesMap, styles)

				const generator = javascript ? generateJavaScript : generateTypeScript
				const code = generator(styles, {
					mode: isModule ? 'module' : 'global',
					camelCaseClasses,
					metadata: compileResult.metadata,
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
