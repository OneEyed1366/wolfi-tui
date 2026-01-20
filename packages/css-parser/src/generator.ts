/**
 * Code Generator
 *
 * Generates TypeScript/JavaScript code from parsed CSS
 */

import type { ParsedStylesheet, GeneratorOptions, GeneratedOutput } from './types.js';

//#region Generator

export function generate(
	stylesheet: ParsedStylesheet,
	options: Partial<GeneratorOptions> = {}
): GeneratedOutput {
	const opts: GeneratorOptions = {
		outputPath: options.outputPath ?? 'styles.ts',
		format: options.format ?? 'esm',
		typeDeclarations: options.typeDeclarations ?? true,
	};

	// TODO: Implement code generation
	const code = generateCode(stylesheet, opts);
	const declarations = opts.typeDeclarations ? generateDeclarations(stylesheet) : undefined;

	return {
		code,
		declarations,
	};
}

function generateCode(_stylesheet: ParsedStylesheet, options: GeneratorOptions): string {
	// TODO: Implement actual code generation
	const lines: string[] = [];

	if (options.format === 'esm') {
		lines.push("import type { Styles } from '@wolfie/core';");
		lines.push('');
	}

	lines.push('export const styles = {');
	lines.push('  // Generated styles will be placed here');
	lines.push('};');

	return lines.join('\n');
}

function generateDeclarations(_stylesheet: ParsedStylesheet): string {
	// TODO: Implement type declaration generation
	const lines: string[] = [];

	lines.push("import type { Styles } from '@wolfie/core';");
	lines.push('');
	lines.push('export declare const styles: Record<string, Styles>;');

	return lines.join('\n');
}

//#endregion Generator

export { type GeneratorOptions, type GeneratedOutput };
