/**
 * @wolf-tui/css-parser
 *
 * CSS/SCSS/Less/Stylus parser and code generator for wolf-tui
 */

//#region Parser Exports

export {
	parse,
	parseRule,
	parseCSS,
	extractClassName,
} from './parser.js';

//#endregion Parser Exports

//#region Preprocessor Exports

export {
	preprocess,
	compile,
	compileScss,
	compileSass,
	compileLess,
	compileStylus,
	detectLanguage,
	type PreprocessorType,
	type PreprocessorResult,
	type PreprocessOptions,
} from './preprocessors.js';

//#endregion Preprocessor Exports

//#region Property Exports

export {
	PROPERTY_MAP,
	mapPropertyName,
	isValidProperty,
	mapCSSProperty,
} from './properties.js';

//#endregion Property Exports

//#region Value Exports

export {
	// New parsers
	parseNumeric,
	parseNumericOrPercent,
	parseColor,
	parseBorderStyle,
	expandGapShorthand,
	// Legacy (deprecated but kept for backward compatibility)
	transformDimension,
	transformColor,
	expandFlexShorthand,
	expandSpacingShorthand,
} from './values.js';

//#endregion Value Exports

//#region Generator Exports

export {
	generate,
	generateTypeScript,
	generateJavaScript,
	sanitizeIdentifier,
} from './generator.js';

//#endregion Generator Exports

//#region Type Exports

export type {
	ParsedRule,
	ParsedProperty,
	ParsedStylesheet,
	ParsedStyles,
	CSSParserOptions,
	GeneratorOptions,
	GeneratedOutput,
	CodeGeneratorOptions,
	VitePluginOptions,
	EsbuildPluginOptions,
} from './types.js';

//#endregion Type Exports
