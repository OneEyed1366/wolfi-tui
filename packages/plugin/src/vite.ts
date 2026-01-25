import type { Plugin, ResolvedConfig } from 'vite'
import {
	readFileSync,
	existsSync,
	readdirSync,
	statSync,
	mkdirSync,
	copyFileSync,
} from 'node:fs'
import { join, dirname, resolve } from 'node:path'
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
import { createVueSfcPlugin, createVueImportPlugin } from './vue-sfc'

const CSS_EXTENSIONS_RE = /\.(css|scss|sass|less|styl|stylus)$/

//#region Native Bindings

/**
 * Generate the banner code for native binding resolution.
 * Detects platform/arch at build time and injects the path setup.
 */
function generateNativeBanner(format: 'es' | 'cjs'): string {
	const platform = process.platform
	const arch = process.arch

	if (format === 'es') {
		return `#!/usr/bin/env node
import { existsSync as __existsSync } from "node:fs";
import { dirname as __dirname_fn, join as __join } from "node:path";
import { fileURLToPath as __fileURLToPath } from "node:url";
const __filename = __fileURLToPath(import.meta.url);
const __dirname = __dirname_fn(__filename);
const __nativeCandidates = ["wolfie-core.${platform}-${arch}.node","wolfie-core.${platform}-${arch}-gnu.node","wolfie-core.${platform}-${arch}-musl.node"];
const __nativePath = __nativeCandidates.find(f => __existsSync(__join(__dirname, "native/" + f)));
if (__nativePath) { process.env.NAPI_RS_NATIVE_LIBRARY_PATH = __join(__dirname, "native/" + __nativePath); }
else { console.error("Native binding not found for ${platform} ${arch}"); process.exit(1); }
`
	}

	// CJS format
	return `#!/usr/bin/env node
const __path = require("path");
const __fs = require("fs");
const __nativeCandidates = ["wolfie-core.${platform}-${arch}.node","wolfie-core.${platform}-${arch}-gnu.node","wolfie-core.${platform}-${arch}-musl.node"];
const __nativePath = __nativeCandidates.find(f => __fs.existsSync(__path.join(__dirname, "native/" + f)));
if (__nativePath) { process.env.NAPI_RS_NATIVE_LIBRARY_PATH = __path.join(__dirname, "native/" + __nativePath); }
else { console.error("Native binding not found for ${platform} ${arch}"); process.exit(1); }
`
}

/**
 * Find the @wolfie/core package and return the path to its .node files
 */
function findCoreNativeDir(root: string): string | null {
	// Try monorepo paths first (relative to project root)
	const monorepoCandidate = resolve(root, 'packages/core')
	if (existsSync(join(monorepoCandidate, 'package.json'))) {
		return monorepoCandidate
	}

	// Try node_modules
	const nodeModulesCandidate = resolve(root, 'node_modules/@wolfie/core')
	if (existsSync(join(nodeModulesCandidate, 'package.json'))) {
		return nodeModulesCandidate
	}

	// Try parent directories (for nested examples)
	let current = root
	for (let i = 0; i < 5; i++) {
		const parent = dirname(current)
		if (parent === current) break
		current = parent

		const candidate = resolve(current, 'packages/core')
		if (existsSync(join(candidate, 'package.json'))) {
			return candidate
		}
	}

	return null
}

/**
 * Create a plugin that handles native binding setup
 */
function createNativeBindingsPlugin(): Plugin {
	let resolvedConfig: ResolvedConfig
	let coreDir: string | null = null

	return {
		name: 'wolfie:native-bindings',
		enforce: 'pre',

		configResolved(config) {
			resolvedConfig = config
			coreDir = findCoreNativeDir(config.root)
		},

		config(config) {
			// Determine output format from config
			const formats = config.build?.lib
				? Array.isArray((config.build.lib as any).formats)
					? (config.build.lib as any).formats
					: ['es']
				: ['es']
			const format = formats[0] === 'cjs' ? 'cjs' : 'es'

			// Add external dependencies for the banner imports
			const externals =
				format === 'es' ? ['node:fs', 'node:path', 'node:url'] : [] // CJS uses require, no externals needed

			return {
				build: {
					rollupOptions: {
						output: {
							banner: generateNativeBanner(format),
						},
						external: [
							...(Array.isArray(config.build?.rollupOptions?.external)
								? config.build.rollupOptions.external
								: []),
							...externals,
						],
					},
				},
			}
		},

		writeBundle(options) {
			if (!coreDir) {
				console.warn(
					'[wolfie] Could not find @wolfie/core package for native bindings'
				)
				return
			}

			// Determine output directory
			const outDir = options.dir || resolvedConfig.build.outDir
			const nativeDir = join(outDir, 'native')

			// Create native directory
			if (!existsSync(nativeDir)) {
				mkdirSync(nativeDir, { recursive: true })
			}

			// Copy .node files
			const files = readdirSync(coreDir)
			let copied = 0
			for (const file of files) {
				if (file.endsWith('.node')) {
					copyFileSync(join(coreDir, file), join(nativeDir, file))
					copied++
				}
			}

			if (copied > 0) {
				console.log(
					`[wolfie] Copied ${copied} native binding(s) to ${nativeDir}`
				)
			}
		},
	}
}

//#endregion Native Bindings

/**
 * Wolfie Vite plugin for terminal UI styling.
 *
 * Works zero-config for most use cases. Automatically:
 * - Processes CSS/SCSS/LESS/Stylus files
 * - Converts styles to JS objects for terminal rendering
 * - Uses camelCase for React, kebab-case for Vue
 * - Treats `.module.css` files as CSS Modules
 *
 * @example
 * // Vite + React
 * plugins: [wolfie('react')]
 *
 * @example
 * // Vite + Vue
 * plugins: [vue(), wolfie('vue')]
 */
export function wolfie(
	framework: Framework,
	options: WolfieOptions = {}
): Plugin | Plugin[] {
	const {
		include = CSS_EXTENSIONS_RE,
		exclude,
		nativeBindings = true,
	} = options

	const isVue = framework === 'vue'
	// Hardcoded: React uses camelCase, Vue uses kebab-case
	const camelCase = !isVue
	// Hardcoded: always inline styles (terminal UI has no stylesheets)
	const inline = true

	const globalStylesMap: ParsedStyles = {}
	const virtualPrefix = '\x00wolfie:'

	// Recursively scan directory for source files and collect Tailwind candidates
	function scanDirectoryForCandidates(dir: string) {
		if (!existsSync(dir)) return

		const entries = readdirSync(dir)
		for (const entry of entries) {
			const fullPath = join(dir, entry)
			const stat = statSync(fullPath)

			if (stat.isDirectory()) {
				if (entry === 'node_modules' || entry.startsWith('.')) continue
				scanDirectoryForCandidates(fullPath)
			} else if (stat.isFile()) {
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

		// Convention: .module.css files are CSS Modules, otherwise global
		const isModule = absolutePath.includes('.module.')
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
			camelCaseClasses: camelCase,
			metadata: compileResult.metadata,
			framework,
		})

		return { code, styles }
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

	const mainPlugin: Plugin = {
		name: 'wolfie',
		enforce: 'pre',

		configResolved(resolvedConfig) {
			// Pre-scan source files for Tailwind candidates during build
			const root = resolvedConfig.root || process.cwd()
			scanDirectoryForCandidates(root)
		},

		async transform(code, id) {
			if (id.includes('node_modules') || id.startsWith('\x00')) return null

			// If it's a source file, collect candidates for Tailwind
			if (id.match(/\.(tsx|jsx|ts|js|vue)$/)) {
				const candidates = scanCandidates(code)
				if (candidates.size > 0) {
					tailwind.addCandidates(candidates)
				}

				// Preload CSS imports for inlining
				if (inline) {
					const importMatches = code.matchAll(
						/import\s+(?:[^"']*\s+from\s+)?["']([^"']+\.(css|scss|sass|less|styl|stylus))["']/g
					)
					for (const match of importMatches) {
						const importPath = match[1]!
						const resolved = await this.resolve(importPath, id)
						if (resolved && !resolved.id.includes('node_modules')) {
							const cleanId = resolved.id.split('?')[0]!
							if (matchesPattern(cleanId, include)) {
								try {
									await loadAndProcessStyle(cleanId)
								} catch {
									// Ignore errors
								}
							}
						}
					}
				}

				// Apply style inlining
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
			if (
				id.startsWith(virtualPrefix) ||
				id.startsWith('\x00') ||
				(exclude && matchesPattern(cleanId, exclude))
			) {
				return null
			}

			if (matchesPattern(cleanId, include)) {
				const resolved = await this.resolve(id, importer, { skipSelf: true })
				if (resolved && !resolved.id.includes('node_modules')) {
					// Rewrite to virtual .js module to bypass CSS pipeline
					return virtualPrefix + resolved.id + '.js'
				}
			}
			return null
		},

		async load(id) {
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
				this.error(`[wolfie] Error loading ${absolutePath}: ${error}`)
			}
		},
	}

	// Build the plugin array
	const plugins: Plugin[] = []

	// Native bindings plugin (first, to inject banner)
	if (nativeBindings) {
		plugins.push(createNativeBindingsPlugin())
	}

	// For Vue, add SFC handling plugins (always enabled)
	if (isVue) {
		// SFC style plugin runs BEFORE other CSS plugins
		plugins.push(createVueSfcPlugin())

		// Main CSS transform plugin
		plugins.push(mainPlugin)

		// Vue import rewrite runs AFTER Vue SFC compilation
		plugins.push(createVueImportPlugin())

		return plugins
	}

	// Non-Vue: return single plugin or array if native bindings enabled
	if (nativeBindings) {
		plugins.push(mainPlugin)
		return plugins
	}

	return mainPlugin
}

export default wolfie
export { type Framework, type WolfieOptions }
