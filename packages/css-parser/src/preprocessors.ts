/**
 * Preprocessor adapters for SCSS, Less, and Stylus
 */

import * as path from 'node:path';
import * as sass from 'sass';
import less from 'less';
import stylus from 'stylus';
import { parseCSS } from './parser.js';
import type { ParsedStyles, PreprocessorType, CSSParserOptions } from './types.js';

//#region Types

export type { PreprocessorType };

export interface PreprocessorResult {
	css: string;
	sourceMap?: string;
}

export interface PreprocessOptions {
	/** Preprocessor language type */
	lang?: PreprocessorType;
	/** File path for @import resolution */
	filePath?: string;
	/** Generate source maps */
	sourceMap?: boolean;
}

//#endregion Types

//#region SCSS/Sass Compilation

/**
 * Compile SCSS/Sass to CSS
 *
 * Uses the modern sass API (compileString) which is synchronous
 * but we return Promise for consistency with other preprocessors.
 */
export async function compileScss(source: string, filePath?: string): Promise<PreprocessorResult> {
	const result = sass.compileString(source, {
		// Use file's directory for @import resolution
		loadPaths: filePath ? [path.dirname(filePath)] : [],
		// Use indented syntax for .sass files
		syntax: filePath?.endsWith('.sass') ? 'indented' : 'scss',
	});

	return {
		css: result.css,
		sourceMap: result.sourceMap ? JSON.stringify(result.sourceMap) : undefined,
	};
}

/**
 * @deprecated Use compileScss instead
 */
export const compileSass = compileScss;

//#endregion SCSS/Sass Compilation

//#region Less Compilation

/**
 * Compile Less to CSS
 */
export async function compileLess(source: string, filePath?: string): Promise<PreprocessorResult> {
	const result = await less.render(source, {
		filename: filePath,
		// Enable paths relative to file location
		paths: filePath ? [path.dirname(filePath)] : [],
	});

	return {
		css: result.css,
		sourceMap: result.map,
	};
}

//#endregion Less Compilation

//#region Stylus Compilation

/**
 * Compile Stylus to CSS
 */
export function compileStylus(source: string, filePath?: string): Promise<PreprocessorResult> {
	return new Promise((resolve, reject) => {
		const compiler = stylus(source);

		if (filePath) {
			compiler.set('filename', filePath);
			// Add file's directory for @import resolution
			compiler.set('paths', [path.dirname(filePath)]);
		}

		compiler.render((err: Error | null, css: string | undefined) => {
			if (err) {
				reject(err);
			} else {
				resolve({ css: css ?? '' });
			}
		});
	});
}

//#endregion Stylus Compilation

//#region Unified API

/**
 * Detect preprocessor language from file extension
 */
export function detectLanguage(filename: string): PreprocessorType {
	const ext = path.extname(filename).toLowerCase();

	switch (ext) {
		case '.scss':
		case '.sass':
			return 'scss';
		case '.less':
			return 'less';
		case '.styl':
		case '.stylus':
			return 'stylus';
		default:
			return 'css';
	}
}

/**
 * Compile source code using the specified preprocessor
 */
export async function compile(
	source: string,
	lang: PreprocessorType,
	filePath?: string
): Promise<string> {
	switch (lang) {
		case 'scss':
			return (await compileScss(source, filePath)).css;
		case 'less':
			return (await compileLess(source, filePath)).css;
		case 'stylus':
			return (await compileStylus(source, filePath)).css;
		case 'css':
		default:
			return source;
	}
}

/**
 * Preprocess source and parse into styles
 *
 * Combined compile + parseCSS for convenience.
 */
export async function preprocess(
	source: string,
	options: PreprocessOptions = {}
): Promise<ParsedStyles> {
	const lang = options.lang ?? (options.filePath ? detectLanguage(options.filePath) : 'css');
	const css = await compile(source, lang, options.filePath);

	const parserOptions: CSSParserOptions = {
		filename: options.filePath,
		sourceMap: options.sourceMap,
	};

	return parseCSS(css, parserOptions);
}

/**
 * Legacy preprocess API (type-based)
 *
 * @deprecated Use the new preprocess(source, options) API instead
 */
export async function preprocessLegacy(
	source: string,
	type: PreprocessorType,
	filePath?: string
): Promise<PreprocessorResult> {
	const css = await compile(source, type, filePath);
	return { css };
}

//#endregion Unified API
