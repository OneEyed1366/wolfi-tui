/**
 * esbuild Plugin for wolfie CSS
 *
 * Transforms CSS imports into wolfie style objects at build time
 */

import type { Plugin } from 'esbuild';
import fs from 'node:fs';
import type { EsbuildPluginOptions } from './types';
import { parseCSS } from './parser';
import { compile, detectLanguage } from './preprocessors';
import { generateJavaScript } from './generator';

//#region esbuild Plugin

/**
 * esbuild plugin for wolfie CSS transformation
 *
 * Transforms CSS/SCSS/Less/Stylus files into wolfie style objects.
 *
 * @example
 * // esbuild.config.js
 * import { wolfieCSS } from '@wolfie/css-parser/esbuild'
 *
 * await esbuild.build({
 *   // ...
 *   plugins: [
 *     wolfieCSS({
 *       mode: 'module',  // CSS Modules pattern (default)
 *       // mode: 'global', // Global styles with registerStyles
 *     })
 *   ]
 * })
 */
export function wolfieCSS(options: EsbuildPluginOptions = {}): Plugin {
	const {
		mode = 'module',
		filter = /\.(css|scss|sass|less|styl|stylus)$/,
	} = options;

	return {
		name: 'wolfie-css',

		setup(build) {
			// Handle CSS and preprocessor files
			build.onLoad({ filter }, async (args) => {
				const source = await fs.promises.readFile(args.path, 'utf-8');

				// Detect mode from filename (.module.css → module mode)
				const isModule = args.path.includes('.module.') || mode === 'module';

				// Detect preprocessor and compile to CSS
				const lang = detectLanguage(args.path);
				const css = await compile(source, lang, args.path);

				// Parse CSS to styles
				const styles = parseCSS(css, { filename: args.path });

				// Generate JavaScript output (esbuild handles transpilation)
				const output = generateJavaScript(styles, {
					mode: isModule ? 'module' : 'global',
				});

				return {
					contents: output,
					loader: 'js',
				};
			});
		},
	};
}

//#endregion esbuild Plugin

export { type EsbuildPluginOptions };
export default wolfieCSS;
