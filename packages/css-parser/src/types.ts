/**
 * Type definitions for the CSS parser
 */

import type { Styles } from '@wolfie/core';

//#region Core Types

export interface ParsedRule {
	selector: string;
	properties: ParsedProperty[];
}

export interface ParsedProperty {
	name: string;
	value: string;
	raw: string;
}

export interface ParsedStylesheet {
	rules: ParsedRule[];
	sourceFile?: string;
}

/**
 * Mapping of class names to wolf-tui Styles objects
 */
export interface ParsedStyles {
	[className: string]: Partial<Styles>;
}

/**
 * Options for the CSS parser
 */
export interface CSSParserOptions {
	/** Source filename for error messages */
	filename?: string;
	/** Generate source maps */
	sourceMap?: boolean;
	/** Transform selectors to camelCase class names */
	camelCaseClasses?: boolean;
}

/**
 * Supported preprocessor types
 */
export type PreprocessorType = 'css' | 'scss' | 'less' | 'stylus';

//#endregion Core Types

//#region Generator Types

export interface GeneratorOptions {
	outputPath: string;
	format: 'esm' | 'cjs';
	typeDeclarations: boolean;
}

/**
 * Options for the new generateTypeScript/generateJavaScript functions
 */
export interface CodeGeneratorOptions {
	/** 'module' for CSS Modules (default export), 'global' for side-effect import (registerStyles) */
	mode: 'module' | 'global';
	/** Generate TypeScript (.ts) or JavaScript (.js) output */
	typescript?: boolean;
	/** Compact output without extra whitespace */
	minify?: boolean;
}

export interface GeneratedOutput {
	code: string;
	declarations?: string;
	sourceMap?: string;
}

//#endregion Generator Types

//#region Plugin Types

export interface VitePluginOptions {
	include?: string[];
	exclude?: string[];
	preprocessor?: 'sass' | 'less' | 'stylus' | 'none';
}

export interface EsbuildPluginOptions {
	filter?: RegExp;
	preprocessor?: 'sass' | 'less' | 'stylus' | 'none';
}

//#endregion Plugin Types
