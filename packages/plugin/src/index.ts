import { createUnplugin } from 'unplugin'
import type {
	UnpluginFactory,
	UnpluginInstance,
	UnpluginOptions,
} from 'unplugin'
import {
	compile,
	detectLanguage,
	parseCSS,
	generateJavaScript,
} from '@wolfie/css-parser'

//#region Types

export type Framework = 'react' | 'vue'

export interface WolfieOptions {
	/** CSS processing mode */
	mode?: 'module' | 'global'
	/** Convert CSS class names to camelCase (default: true for React, false for Vue) */
	camelCaseClasses?: boolean
	/** Inline styles in JSX/TSX */
	inline?: boolean
	/** File pattern to include */
	include?: RegExp
	/** File pattern to exclude */
	exclude?: RegExp
	/** Rewrite 'vue' imports to '@wolfie/vue' (Vue only, default: true) */
	rewriteVueImports?: boolean
	/** Process Vue SFC <style> blocks (Vue only, default: true) */
	handleSfcStyles?: boolean
	/**
	 * Handle native bindings for @wolfie/core (default: true)
	 * - Copies .node files to output/native/
	 * - Injects banner to set NAPI_RS_NATIVE_LIBRARY_PATH
	 */
	nativeBindings?: boolean
}

//#endregion Types

//#region Plugin Factory

const CSS_EXTENSIONS_RE = /\.(css|scss|sass|less|styl|stylus)$/

export const unpluginFactory: UnpluginFactory<[Framework, WolfieOptions?]> = (
	[framework, options = {}],
	meta
): UnpluginOptions | UnpluginOptions[] => {
	const isVue = framework === 'vue'
	const camelCase = options.camelCaseClasses ?? !isVue
	const mode = options.mode ?? 'module'

	// Main CSS transform plugin
	const mainPlugin: UnpluginOptions = {
		name: 'wolfie',

		transformInclude(id) {
			// Skip virtual modules and node_modules
			if (id.startsWith('\x00') || id.includes('node_modules')) return false
			if (options.exclude?.test(id)) return false
			if (options.include) return options.include.test(id)
			return CSS_EXTENSIONS_RE.test(id)
		},

		async transform(code, id) {
			const cleanId = id.split('?')[0]!
			const lang = detectLanguage(cleanId)

			// Compile CSS/SCSS/etc
			const compileResult = await compile(code, lang, cleanId)

			// Parse to styles object
			const isModule = cleanId.includes('.module.') || mode === 'module'
			const styles = parseCSS(compileResult.css, {
				filename: cleanId,
				camelCaseClasses: camelCase,
			})

			// Generate JavaScript
			const jsCode = generateJavaScript(styles, {
				mode: isModule ? 'module' : 'global',
				camelCaseClasses: camelCase,
				metadata: compileResult.metadata,
				framework,
			})

			return {
				code: jsCode,
				map: null,
			}
		},
	}

	// For Vue + Vite, we need additional plugins for SFC handling
	// These are Vite-specific and use the vite Plugin type
	if (isVue && meta.framework === 'vite') {
		// Return array of plugins - main + Vue SFC handling
		// Note: Vue SFC plugins are added via the vite entry point
		// because they need Vite-specific Plugin type
		return mainPlugin
	}

	return mainPlugin
}

//#endregion Plugin Factory

//#region Exports

export const unplugin: UnpluginInstance<[Framework, WolfieOptions?], false> =
	createUnplugin(unpluginFactory)

export default unplugin

//#endregion Exports
