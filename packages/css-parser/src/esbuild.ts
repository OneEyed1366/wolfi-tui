/**
 * esbuild Plugin for wolf-tui CSS
 *
 * Transforms CSS imports into wolf-tui style objects at build time
 */

import type { EsbuildPluginOptions } from './types.js';
import { parse } from './parser.js';
import { generate } from './generator.js';
import { preprocess } from './preprocessors.js';

//#region esbuild Plugin

export interface WolfCssEsbuildPlugin {
	name: string;
	setup: (build: EsbuildBuild) => void;
}

interface EsbuildBuild {
	onLoad: (
		options: { filter: RegExp; namespace?: string },
		callback: (args: { path: string }) => Promise<{ contents: string; loader: string } | undefined>
	) => void;
}

export function wolfCssEsbuild(options: EsbuildPluginOptions = {}): WolfCssEsbuildPlugin {
	const { filter = /\.(css|scss|less|styl)$/, preprocessor = 'none' } = options;

	return {
		name: 'wolf-css',

		setup(build: EsbuildBuild) {
			build.onLoad({ filter }, async (args) => {
				const fs = await import('node:fs/promises');
				const path = await import('node:path');

				const code = await fs.readFile(args.path, 'utf-8');
				const ext = path.extname(args.path).slice(1);

				// Determine preprocessor from file extension if not specified
				const preprocessorType = preprocessor !== 'none' ? preprocessor : getPreprocessorFromExt(ext);

				// Preprocess if needed
				const { css } = await preprocess(code, preprocessorType, args.path);

				// Parse CSS
				const stylesheet = parse(css, args.path);

				// Generate code
				const { code: generatedCode } = generate(stylesheet, { format: 'esm' });

				return {
					contents: generatedCode,
					loader: 'js',
				};
			});
		},
	};
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

//#endregion esbuild Plugin

export { type EsbuildPluginOptions };
export default wolfCssEsbuild;
