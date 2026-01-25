/**
 * Vue SFC Style Plugin for wolfie
 *
 * Handles:
 * - Vue SFC <style> blocks
 * - CSS Module imports (.module.css, etc.)
 * - Vue import rewriting ('vue' → '@wolfie/vue')
 */
import type { Plugin } from 'vite'
import { compile, parseCSS } from '@wolfie/css-parser'

const WOLFIE_STYLE_PREFIX = '\x00wolfie-vue-style:'
const WOLFIE_CSS_MODULE_PREFIX = '\x00wolfie-vue-css-module:'

//#region Helpers

/**
 * Generate a short hash from a string (for scope IDs)
 */
function generateScopeId(input: string): string {
	let hash = 0
	for (let i = 0; i < input.length; i++) {
		const char = input.charCodeAt(i)
		hash = (hash << 5) - hash + char
		hash = hash & hash // Convert to 32bit integer
	}
	return Math.abs(hash).toString(36).slice(0, 8)
}

/**
 * Extract style blocks from Vue SFC content
 */
function extractStyleBlocks(content: string): Array<{
	content: string
	lang?: string
	module?: boolean | string
	scoped?: boolean
}> {
	const styleRegex = /<style([^>]*)>([\s\S]*?)<\/style>/gi
	const blocks: Array<{
		content: string
		lang?: string
		module?: boolean | string
		scoped?: boolean
	}> = []

	let match
	while ((match = styleRegex.exec(content)) !== null) {
		const attrs = match[1] || ''
		const styleContent = match[2] || ''

		const langMatch = attrs.match(/lang=["']?(\w+)["']?/)
		const moduleMatch = attrs.match(/\bmodule(?:=["']?(\w+)["']?)?/)
		const scopedMatch = attrs.match(/\bscoped\b/)

		blocks.push({
			content: styleContent.trim(),
			lang: langMatch?.[1],
			module: moduleMatch ? moduleMatch[1] || true : undefined,
			scoped: !!scopedMatch,
		})
	}

	return blocks
}

//#endregion Helpers

//#region SFC Style Plugin

/**
 * SFC style handler plugin - redirects Vue SFC style modules to JavaScript
 * Uses resolveId + load hooks to completely replace the module before CSS pipeline
 */
export function createVueSfcPlugin(): Plugin {
	const styleCache = new Map<string, string>()

	return {
		name: 'wolfie:vue-sfc',
		enforce: 'pre',

		// Intercept style modules and redirect to virtual JS module
		async resolveId(id, importer) {
			// 1. Handle Vue SFC style blocks
			if (id.includes('?vue&type=style')) {
				// Encode the original ID so other plugins don't recognize it as a Vue style
				// Use base64 to avoid any pattern matching issues
				const encoded = Buffer.from(id).toString('base64')
				return WOLFIE_STYLE_PREFIX + encoded + '.js'
			}

			// 2. Handle CSS Module imports (.module.css, .module.scss, etc.)
			// This intercepts BEFORE wolfieCSS so Vue gets class name exports
			const isCssModule =
				id.includes('.module.') &&
				/\.(css|scss|sass|less|styl|stylus)(\?.*)?$/.test(id)
			if (isCssModule && importer) {
				// Manually resolve the path to avoid other plugins transforming the ID
				const { dirname, resolve, isAbsolute } = await import('node:path')
				const importerDir = dirname(importer.split('?')[0]!)
				const resolvedPath = isAbsolute(id) ? id : resolve(importerDir, id)
				const cleanPath = resolvedPath.split('?')[0]! // Remove query string

				const encoded = Buffer.from(cleanPath).toString('base64')
				return WOLFIE_CSS_MODULE_PREFIX + encoded + '.js'
			}

			return null
		},

		// Provide JavaScript content for the virtual module
		async load(id) {
			const { readFileSync, existsSync } = await import('node:fs')

			// 1. Handle CSS Module imports (.module.css, .module.scss, etc.)
			if (id.startsWith(WOLFIE_CSS_MODULE_PREFIX)) {
				const encoded = id
					.slice(WOLFIE_CSS_MODULE_PREFIX.length)
					.replace(/\.js$/, '')
				const filePath = Buffer.from(encoded, 'base64').toString('utf-8')

				if (!existsSync(filePath)) {
					return { code: 'export default {}', map: null }
				}

				// Detect language from extension
				const extMatch = filePath.match(/\.(scss|sass|less|styl|stylus)$/)
				const ext = extMatch?.[1]
				const cssLang =
					ext === 'sass' || ext === 'scss'
						? 'scss'
						: ext === 'styl' || ext === 'stylus'
							? 'stylus'
							: ext === 'less'
								? 'less'
								: ('css' as const)

				const source = readFileSync(filePath, 'utf-8')
				const compiled = await compile(source, cssLang, filePath)
				const styles = parseCSS(compiled.css, {
					filename: filePath,
					camelCaseClasses: false,
				})

				// For CSS Modules: generate scoped class names and export mapping
				// This prevents collisions with global styles
				const scopeId = generateScopeId(filePath)
				const scopedStyles: Record<string, unknown> = {}
				const classNameMap: Record<string, string> = {}

				for (const [className, style] of Object.entries(styles)) {
					const scopedName = `${className}__${scopeId}`
					scopedStyles[scopedName] = style
					classNameMap[className] = scopedName
				}

				return {
					code: `import { registerStyles } from '@wolfie/vue'
registerStyles(${JSON.stringify(scopedStyles)})
export default ${JSON.stringify(classNameMap)}`,
					map: null,
				}
			}

			// 2. Handle Vue SFC style blocks
			if (!id.startsWith(WOLFIE_STYLE_PREFIX)) return null

			// Decode the original ID
			const encoded = id.slice(WOLFIE_STYLE_PREFIX.length).replace(/\.js$/, '')
			const originalId = Buffer.from(encoded, 'base64').toString('utf-8')

			// Extract file path and style block info from the virtual module ID
			// Format: /path/to/Component.vue?vue&type=style&index=0&lang.scss
			const [filePath] = originalId.split('?')
			const langMatch = originalId.match(/lang\.(\w+)/)
			const lang = (langMatch?.[1] || 'css') as
				| 'css'
				| 'scss'
				| 'less'
				| 'stylus'
			const indexMatch = originalId.match(/index=(\d+)/)
			const styleIndex = indexMatch ? parseInt(indexMatch[1]!, 10) : 0

			// Check for module attribute in the original ID
			const isModule = originalId.includes('&module')

			// Check cache first
			const cacheKey = `${filePath}:${styleIndex}`
			let styleContent = styleCache.get(cacheKey)
			let isModuleStyle = isModule

			if (!styleContent) {
				// Read the .vue file and extract the style block
				const vueContent = readFileSync(filePath!, 'utf-8')

				// Parse style blocks from the Vue SFC
				const styleBlocks = extractStyleBlocks(vueContent)
				const block = styleBlocks[styleIndex]

				if (!block) {
					return {
						code: 'export default {}',
						map: null,
					}
				}

				styleContent = block.content
				isModuleStyle = isModuleStyle || !!block.module
				styleCache.set(cacheKey, styleContent)
			}

			// Process the style content
			// 1. Compile SCSS/Less/Stylus to CSS
			const compiled = await compile(styleContent, lang, filePath!)
			// 2. Parse CSS to styles object, preserving original class names (no camelCase)
			const styles = parseCSS(compiled.css, {
				filename: filePath!,
				camelCaseClasses: false,
			})

			// Handle <style module> - prefix class names and export mapping
			if (isModuleStyle) {
				const scopeId = generateScopeId(filePath!)
				const scopedStyles: Record<string, unknown> = {}
				const classNameMap: Record<string, string> = {}

				for (const [className, style] of Object.entries(styles)) {
					const scopedName = `${className}__${scopeId}`
					scopedStyles[scopedName] = style
					classNameMap[className] = scopedName
				}

				return {
					code: `import { registerStyles } from '@wolfie/vue'
registerStyles(${JSON.stringify(scopedStyles)})
export default ${JSON.stringify(classNameMap)}`,
					map: null,
				}
			}

			// Regular styles - register and export style objects
			const stylesJson = JSON.stringify(styles)

			return {
				code: `import { registerStyles } from '@wolfie/vue'
const styles = ${stylesJson}
registerStyles(styles)
export default styles`,
				map: null,
			}
		},
	}
}

//#endregion SFC Style Plugin

//#region Vue Import Rewrite Plugin

/**
 * Main Vue plugin - runs AFTER @vitejs/plugin-vue compiles SFCs
 * Rewrites Vue imports to use @wolfie/vue
 */
export function createVueImportPlugin(): Plugin {
	return {
		name: 'wolfie:vue-imports',
		enforce: 'post',
		async transform(code, id) {
			// Rewrite Vue imports in compiled .vue files
			if (id.endsWith('.vue')) {
				code = code.replace(/from\s+['"]vue['"]/g, 'from "@wolfie/vue"')
				return { code, map: null }
			}
			return null
		},
	}
}

//#endregion Vue Import Rewrite Plugin
