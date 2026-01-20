/**
 * Vite Plugin for wolf-tui CSS
 *
 * Transforms CSS imports into wolf-tui style objects at build time
 */

import type { Plugin } from 'vite';
import type { VitePluginOptions } from './types.js';
import { parseCSS } from './parser.js';
import { compile, detectLanguage } from './preprocessors.js';
import { generateTypeScript, generateJavaScript } from './generator.js';

//#region Helpers

/**
 * Check if a file path matches a pattern or array of patterns
 */
function matchesPattern(
	id: string,
	pattern: string | RegExp | (string | RegExp)[]
): boolean {
	const patterns = Array.isArray(pattern) ? pattern : [pattern];
	return patterns.some((p) => {
		if (typeof p === 'string') return id.includes(p);
		return p.test(id);
	});
}

//#endregion Helpers

//#region Vite Plugin

/**
 * Vite plugin for wolf-tui CSS transformation
 *
 * Transforms CSS/SCSS/Less/Stylus files into wolf-tui style objects.
 *
 * @example
 * // vite.config.ts
 * import { wolfTuiCSS } from '@wolf-tui/css-parser/vite'
 *
 * export default {
 *   plugins: [
 *     wolfTuiCSS({
 *       mode: 'module',  // CSS Modules pattern (default)
 *       // mode: 'global', // Global styles with registerStyles
 *     })
 *   ]
 * }
 */
export function wolfTuiCSS(options: VitePluginOptions = {}): Plugin {
	const {
		mode = 'module',
		javascript = false,
		include = /\.(css|scss|sass|less|styl|stylus)$/,
		exclude = /node_modules/,
	} = options;

	return {
		name: 'wolf-tui-css',
		enforce: 'pre', // Run before other CSS plugins

		async transform(code: string, id: string) {
			// Check if file should be processed
			if (!matchesPattern(id, include) || matchesPattern(id, exclude)) {
				return null;
			}

			// Detect mode from filename (.module.css → module mode)
			const isModule = id.includes('.module.') || mode === 'module';

			// Detect preprocessor and compile to CSS
			const lang = detectLanguage(id);
			const css = await compile(code, lang, id);

			// Parse CSS to styles
			const styles = parseCSS(css, { filename: id });

			// Generate output code
			const generator = javascript ? generateJavaScript : generateTypeScript;
			const output = generator(styles, {
				mode: isModule ? 'module' : 'global',
			});

			return {
				code: output,
				map: null, // No source map for now
			};
		},
	};
}

//#endregion Vite Plugin

export { type VitePluginOptions };
export default wolfTuiCSS;
