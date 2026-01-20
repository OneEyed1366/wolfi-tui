/**
 * Vite Plugin for wolf-tui CSS
 *
 * Transforms CSS imports into wolf-tui style objects at build time
 */

import type { VitePluginOptions } from './types.js';
import { parse } from './parser.js';
import { generate } from './generator.js';
import { preprocess } from './preprocessors.js';

//#region Vite Plugin

export interface WolfCssVitePlugin {
	name: string;
	transform?: (code: string, id: string) => Promise<{ code: string; map?: null } | null>;
}

export function wolfCssVite(options: VitePluginOptions = {}): WolfCssVitePlugin {
	const {
		include = ['**/*.css', '**/*.scss', '**/*.less', '**/*.styl'],
		exclude = ['**/node_modules/**'],
		preprocessor = 'none',
	} = options;

	return {
		name: 'wolf-css',

		async transform(code: string, id: string) {
			// Check if this file should be processed
			const shouldInclude = include.some((pattern) => matchGlob(id, pattern));
			const shouldExclude = exclude.some((pattern) => matchGlob(id, pattern));

			if (!shouldInclude || shouldExclude) {
				return null;
			}

			// Determine preprocessor from file extension if not specified
			const ext = id.split('.').pop() ?? '';
			const preprocessorType = preprocessor !== 'none' ? preprocessor : getPreprocessorFromExt(ext);

			// Preprocess if needed
			const { css } = await preprocess(code, preprocessorType, id);

			// Parse CSS
			const stylesheet = parse(css, id);

			// Generate code
			const { code: generatedCode } = generate(stylesheet, { format: 'esm' });

			return {
				code: generatedCode,
				map: null,
			};
		},
	};
}

function matchGlob(path: string, pattern: string): boolean {
	// TODO: Implement proper glob matching
	if (pattern.startsWith('**/*.')) {
		const ext = pattern.slice(4);
		return path.endsWith(ext);
	}
	return path.includes(pattern);
}

function getPreprocessorFromExt(ext: string): 'sass' | 'less' | 'stylus' | 'none' {
	switch (ext) {
		case 'scss':
		case 'sass':
			return 'sass';
		case 'less':
			return 'less';
		case 'styl':
		case 'stylus':
			return 'stylus';
		default:
			return 'none';
	}
}

//#endregion Vite Plugin

export { type VitePluginOptions };
export default wolfCssVite;
