import type { Plugin } from 'esbuild'
import {
	readFileSync,
	existsSync,
	mkdirSync,
	copyFileSync,
	readdirSync,
} from 'node:fs'
import { join, dirname, resolve } from 'node:path'
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

//#region Native Bindings

/**
 * Generate the banner code for native binding resolution.
 * Use this with esbuild's banner option.
 *
 * @example
 * await esbuild.build({
 *   banner: { js: generateNativeBanner('cjs') },
 *   plugins: [wolfie('react')],
 * })
 */
export function generateNativeBanner(format: 'es' | 'cjs' = 'cjs'): string {
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
	const monorepoCandidate = resolve(root, 'internal/core')
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

		const candidate = resolve(current, 'internal/core')
		if (existsSync(join(candidate, 'package.json'))) {
			return candidate
		}
	}

	return null
}

//#endregion Native Bindings

/**
 * Wolfie esbuild plugin for terminal UI styling.
 *
 * Works zero-config for most use cases. Automatically:
 * - Processes CSS/SCSS/LESS/Stylus files
 * - Converts styles to JS objects for terminal rendering
 * - Uses camelCase for React, kebab-case for Vue
 * - Treats `.module.css` files as CSS Modules
 *
 * @example
 * await esbuild.build({
 *   plugins: [wolfie('react')],
 *   banner: { js: generateNativeBanner('cjs') },
 * })
 */
export function wolfie(
	framework: Framework,
	options: WolfieOptions = {}
): Plugin {
	const { include, exclude, nativeBindings = true } = options

	const isVue = framework === 'vue'
	// Hardcoded: React uses camelCase, Vue uses kebab-case
	const camelCase = !isVue
	// Hardcoded: always inline styles (terminal UI has no stylesheets)
	const inline = true
	const filter = include ?? CSS_EXTENSIONS_RE

	const globalStylesMap: ParsedStyles = {}

	async function loadAndProcessStyle(
		absolutePath: string
	): Promise<{ code: string; styles: ParsedStyles } | null> {
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
			const coreDir = nativeBindings ? findCoreNativeDir(rootDir) : null

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

			// Phase 5: Copy native bindings after build
			if (nativeBindings && coreDir) {
				build.onEnd((result) => {
					if (result.errors.length > 0) return

					// Determine output directory from build options
					const outfile = build.initialOptions.outfile
					const outdir = build.initialOptions.outdir
					const outputDir = outdir || (outfile ? dirname(outfile) : null)

					if (!outputDir) {
						console.warn(
							'[wolfie] Could not determine output directory for native bindings'
						)
						return
					}

					const nativeDir = join(outputDir, 'native')

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
				})
			}
		},
	}
}

export default wolfie
export { type Framework, type WolfieOptions }
