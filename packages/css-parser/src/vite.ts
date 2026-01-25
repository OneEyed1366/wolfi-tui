import type { Plugin } from 'vite'
import type { VitePluginOptions } from './types'
import './shim' // Apply Tailwind v4 patch
import { compile, detectLanguage, tailwind } from './preprocessors'
import { parseCSS } from './parser'
import { generateJavaScript, generateTypeScript } from './generator'
import { scanCandidates } from './scanner'
import { inlineStyles } from './inliner'
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
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
		framework = 'react',
	} = options

	const globalStylesMap: ParsedStyles = {}
	const virtualPrefix = '\x00wolfie:'
	const tailwindVirtualId = 'virtual:wolfie-tailwind.css'
	const tailwindVirtualResolvedId = '\x00' + tailwindVirtualId

	let server: any

	// Recursively scan directory for source files and collect Tailwind candidates
	function scanDirectoryForCandidates(dir: string) {
		if (!existsSync(dir)) return

		const entries = readdirSync(dir)
		for (const entry of entries) {
			const fullPath = join(dir, entry)
			const stat = statSync(fullPath)

			if (stat.isDirectory()) {
				// Skip node_modules and hidden directories
				if (entry === 'node_modules' || entry.startsWith('.')) continue
				scanDirectoryForCandidates(fullPath)
			} else if (stat.isFile()) {
				// Check if it's a source file we should scan
				if (/\.(tsx|jsx|ts|js|vue)$/.test(entry)) {
					try {
						const content = readFileSync(fullPath, 'utf-8')
						const candidates = scanCandidates(content)
						if (candidates.size > 0) {
							tailwind.addCandidates(candidates)
						}
					} catch {
						// Ignore read errors
					}
				}
			}
		}
	}

	async function loadAndProcessStyle(absolutePath: string) {
		if (!existsSync(absolutePath)) return null

		const isModule = absolutePath.includes('.module.') || mode === 'module'
		const lang = detectLanguage(absolutePath)

		const source = readFileSync(absolutePath, 'utf-8')
		const compileResult = await compile(source, lang, absolutePath)

		// Debug: Log Tailwind CSS output for inspection
		if (absolutePath.includes('tailwind.css') && process.env.DEBUG_CSS) {
			console.log('[wolfie-css] Tailwind CSS output (first 2000 chars):')
			console.log(compileResult.css.substring(0, 2000))
		}

		const styles = parseCSS(compileResult.css, {
			filename: absolutePath,
			camelCaseClasses,
		})

		// Populate global map
		Object.assign(globalStylesMap, styles)

		const generator = javascript ? generateJavaScript : generateTypeScript
		const code = generator(styles, {
			mode: isModule ? 'module' : 'global',
			camelCaseClasses,
			metadata: compileResult.metadata,
			framework,
		})

		return { code, styles }
	}

	return {
		name: 'wolfie-css',
		enforce: 'pre',

		configResolved(resolvedConfig) {
			// Pre-scan source files for Tailwind candidates during build
			// This ensures candidates are collected BEFORE any CSS is processed
			const root = resolvedConfig.root || process.cwd()
			scanDirectoryForCandidates(root)
		},

		configureServer(_server) {
			server = _server
		},

		async transform(code, id) {
			if (id.includes('node_modules') || id.startsWith('\x00')) return null

			// 1. If it's a source file, collect candidates for Tailwind Zero-Scan
			if (id.match(/\.(tsx|jsx|ts|js|vue)$/)) {
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

				// 2. Scan and preload CSS imports to ensure they are available for inlining
				if (inline) {
					const importMatches = code.matchAll(
						/import\s+(?:[^"']*\s+from\s+)?["']([^"']+\.(css|scss|sass|less|styl|stylus))["']/g
					)
					for (const match of importMatches) {
						const importPath = match[1]!
						const resolved = await this.resolve(importPath, id)
						if (resolved && !resolved.id.includes('node_modules')) {
							// Check if it's one of our supported files
							const cleanId = resolved.id.split('?')[0]!
							if (matchesPattern(cleanId, include)) {
								try {
									// Pre-load the style file
									await loadAndProcessStyle(cleanId)
								} catch {
									// Ignore errors here, let the actual import handle it
								}
							}
						}
					}
				}

				// 3. If inlining is enabled and we have styles, apply them
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

			try {
				const result = await loadAndProcessStyle(absolutePath)
				if (!result) return null

				return {
					code: result.code,
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
