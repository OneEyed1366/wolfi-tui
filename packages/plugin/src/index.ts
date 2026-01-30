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

export type Framework = 'react' | 'vue' | 'angular'

/**
 * Wolfie plugin options.
 *
 * The plugin works zero-config for most use cases. These options are
 * escape hatches for power users.
 *
 * @example
 * // Zero-config (recommended)
 * wolfie('react')
 * wolfie('vue')
 *
 * @example
 * // Power user: custom file filtering
 * wolfie('react', { include: /\.css$/, exclude: /vendor/ })
 */
export interface WolfieOptions {
	/** File pattern to include (default: all CSS/SCSS/LESS/Stylus files) */
	include?: RegExp
	/** File pattern to exclude */
	exclude?: RegExp
	/**
	 * Handle native bindings for @wolfie/core (default: true)
	 * - Copies .node files to output/native/
	 * - Injects banner to set NAPI_RS_NATIVE_LIBRARY_PATH
	 */
	nativeBindings?: boolean
}

//#endregion Types

//#region Plugin Factory

const CSS_EXTENSIONS_RE = /\.(css|scss|sass|less|styl|stylus)(\?.*)?$/

export const unpluginFactory: UnpluginFactory<[Framework, WolfieOptions?]> = (
	[framework, options = {}],
	meta
): UnpluginOptions | UnpluginOptions[] => {
	const isVue = framework === 'vue'
	const isAngular = framework === 'angular'
	// Hardcoded: React uses camelCase, Vue/Angular use kebab-case
	const camelCase = !isVue && !isAngular

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
			// Convention: .module.css files are CSS Modules, otherwise global
			const isModule = cleanId.includes('.module.')
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
