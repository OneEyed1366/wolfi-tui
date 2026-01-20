import type { Plugin } from 'vite'
import type { VitePluginOptions } from './types'
import { compile, detectLanguage } from './preprocessors'
import { parseCSS } from './parser'
import { generateJavaScript, generateTypeScript } from './generator'
import { readFileSync, existsSync } from 'node:fs'

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

/**
 * Vite Plugin for wolfie CSS
 */
export function wolfieCSS(options: VitePluginOptions = {}): Plugin {
	const {
		mode = 'module',
		javascript = true, // Default to true for better compatibility with vite-node/SSR
		include = /\.(css|scss|sass|less|styl|stylus)$/,
		exclude = /node_modules/,
	} = options

	const virtualPrefix = '\0wolfie:'

	return {
		name: 'wolfie-css',
		enforce: 'pre',

		async resolveId(id, importer) {
			const cleanId = id.split('?')[0]!

			// Skip if already virtual or excluded
			if (id.startsWith(virtualPrefix) || matchesPattern(cleanId, exclude)) {
				return null
			}

			if (matchesPattern(cleanId, include)) {
				const resolved = await this.resolve(id, importer, { skipSelf: true })
				if (resolved) {
					// Redirect to a virtual path with .js suffix to force execution
					// We use .js even for TS projects to bypass complex TS config issues in virtual modules
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
				const source = readFileSync(absolutePath, 'utf-8')
				const compiled = await compile(source, lang, absolutePath)
				const styles = parseCSS(compiled, { filename: absolutePath })

				// Use requested generator (defaulting to JS for runtime compatibility)
				const generator = javascript ? generateJavaScript : generateTypeScript
				const code = generator(styles, {
					mode: isModule ? 'module' : 'global',
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

export { type VitePluginOptions }
export default wolfieCSS
