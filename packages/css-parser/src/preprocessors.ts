/**
 * Preprocessor adapters for SCSS, Less, and Stylus
 */

//#region Types

export type PreprocessorType = 'sass' | 'less' | 'stylus' | 'none';

export interface PreprocessorResult {
	css: string;
	sourceMap?: string;
}

//#endregion Types

//#region Preprocessor Functions

export async function compileSass(source: string, _filePath?: string): Promise<PreprocessorResult> {
	// TODO: Implement SASS compilation
	return { css: source };
}

export async function compileLess(source: string, _filePath?: string): Promise<PreprocessorResult> {
	// TODO: Implement Less compilation
	return { css: source };
}

export async function compileStylus(source: string, _filePath?: string): Promise<PreprocessorResult> {
	// TODO: Implement Stylus compilation
	return { css: source };
}

export async function preprocess(
	source: string,
	type: PreprocessorType,
	filePath?: string
): Promise<PreprocessorResult> {
	switch (type) {
		case 'sass':
			return compileSass(source, filePath);
		case 'less':
			return compileLess(source, filePath);
		case 'stylus':
			return compileStylus(source, filePath);
		case 'none':
		default:
			return { css: source };
	}
}

//#endregion Preprocessor Functions
