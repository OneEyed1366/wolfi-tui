/**
 * CSS Property Definitions and Mappings
 *
 * Maps CSS properties to wolf-tui/core style properties
 */

import type { Styles } from '@wolfie/core';
import {
	parseNumeric,
	parseNumericOrPercent,
	parseColor,
	parseBorderStyle,
	expandSpacingShorthand,
	expandFlexShorthand,
	expandGapShorthand,
} from './values.js';

//#region Property Map

/**
 * Mapping from CSS property names to wolf-tui style property names
 */
export const PROPERTY_MAP: Record<string, string> = {
	// Layout
	display: 'display',
	position: 'position',
	flexDirection: 'flexDirection',
	'flex-direction': 'flexDirection',
	flexWrap: 'flexWrap',
	'flex-wrap': 'flexWrap',
	flexGrow: 'flexGrow',
	'flex-grow': 'flexGrow',
	flexShrink: 'flexShrink',
	'flex-shrink': 'flexShrink',
	flexBasis: 'flexBasis',
	'flex-basis': 'flexBasis',
	alignItems: 'alignItems',
	'align-items': 'alignItems',
	alignSelf: 'alignSelf',
	'align-self': 'alignSelf',
	justifyContent: 'justifyContent',
	'justify-content': 'justifyContent',

	// Gap
	gap: 'gap',
	rowGap: 'rowGap',
	'row-gap': 'rowGap',
	columnGap: 'columnGap',
	'column-gap': 'columnGap',

	// Sizing
	width: 'width',
	height: 'height',
	minWidth: 'minWidth',
	'min-width': 'minWidth',
	minHeight: 'minHeight',
	'min-height': 'minHeight',
	maxWidth: 'maxWidth',
	'max-width': 'maxWidth',
	maxHeight: 'maxHeight',
	'max-height': 'maxHeight',

	// Spacing
	margin: 'margin',
	marginTop: 'marginTop',
	'margin-top': 'marginTop',
	marginRight: 'marginRight',
	'margin-right': 'marginRight',
	marginBottom: 'marginBottom',
	'margin-bottom': 'marginBottom',
	marginLeft: 'marginLeft',
	'margin-left': 'marginLeft',
	padding: 'padding',
	paddingTop: 'paddingTop',
	'padding-top': 'paddingTop',
	paddingRight: 'paddingRight',
	'padding-right': 'paddingRight',
	paddingBottom: 'paddingBottom',
	'padding-bottom': 'paddingBottom',
	paddingLeft: 'paddingLeft',
	'padding-left': 'paddingLeft',

	// Overflow
	overflow: 'overflow',
	overflowX: 'overflowX',
	'overflow-x': 'overflowX',
	overflowY: 'overflowY',
	'overflow-y': 'overflowY',

	// Border
	borderStyle: 'borderStyle',
	'border-style': 'borderStyle',
	borderColor: 'borderColor',
	'border-color': 'borderColor',

	// Colors (note: 'color' is a Text component prop, not Styles)
	backgroundColor: 'backgroundColor',
	'background-color': 'backgroundColor',

	// Text wrap
	textWrap: 'textWrap',
	'text-wrap': 'textWrap',
	whiteSpace: 'textWrap',
	'white-space': 'textWrap',
};

//#endregion Property Map

//#region Helpers

export function mapPropertyName(cssProperty: string): string | undefined {
	return PROPERTY_MAP[cssProperty];
}

export function isValidProperty(cssProperty: string): boolean {
	return cssProperty in PROPERTY_MAP;
}

//#endregion Helpers

//#region CSS Property Mapper

/**
 * Map a CSS property and value to wolf-tui Styles
 * Returns null if the property is not supported
 */
export function mapCSSProperty(prop: string, value: string): Partial<Styles> | null {
	const normalizedProp = prop.toLowerCase();
	const trimmedValue = value.trim();

	//#region Display & Position

	if (normalizedProp === 'display') {
		if (trimmedValue === 'flex' || trimmedValue === 'none') {
			return { display: trimmedValue };
		}
		// Map 'block', 'inline', etc. to 'flex' (TUI default)
		return { display: 'flex' };
	}

	if (normalizedProp === 'position') {
		if (trimmedValue === 'absolute' || trimmedValue === 'relative') {
			return { position: trimmedValue };
		}
		// Map 'fixed', 'static', etc. to 'relative'
		return { position: 'relative' };
	}

	//#endregion Display & Position

	//#region Flexbox

	if (normalizedProp === 'flex-direction') {
		const validValues = ['row', 'column', 'row-reverse', 'column-reverse'] as const;
		if (validValues.includes(trimmedValue as typeof validValues[number])) {
			return { flexDirection: trimmedValue as Styles['flexDirection'] };
		}
		return null;
	}

	if (normalizedProp === 'flex-wrap') {
		const validValues = ['nowrap', 'wrap', 'wrap-reverse'] as const;
		if (validValues.includes(trimmedValue as typeof validValues[number])) {
			return { flexWrap: trimmedValue as Styles['flexWrap'] };
		}
		return null;
	}

	if (normalizedProp === 'flex-grow') {
		return { flexGrow: parseNumeric(trimmedValue) };
	}

	if (normalizedProp === 'flex-shrink') {
		return { flexShrink: parseNumeric(trimmedValue) };
	}

	if (normalizedProp === 'flex-basis') {
		return { flexBasis: parseNumericOrPercent(trimmedValue) };
	}

	if (normalizedProp === 'flex') {
		const expanded = expandFlexShorthand(trimmedValue);
		const result: Record<string, number | string> = {};
		if ('flexGrow' in expanded) result['flexGrow'] = expanded.flexGrow as number;
		if ('flexShrink' in expanded) result['flexShrink'] = expanded.flexShrink as number;
		if ('flexBasis' in expanded) result['flexBasis'] = expanded.flexBasis as number | string;
		return Object.keys(result).length > 0 ? result as Partial<Styles> : null;
	}

	if (normalizedProp === 'align-items') {
		const validValues = ['flex-start', 'center', 'flex-end', 'stretch'] as const;
		// Map start/end to flex-start/flex-end
		let mapped = trimmedValue;
		if (mapped === 'start') mapped = 'flex-start';
		if (mapped === 'end') mapped = 'flex-end';
		if (validValues.includes(mapped as typeof validValues[number])) {
			return { alignItems: mapped as Styles['alignItems'] };
		}
		return null;
	}

	if (normalizedProp === 'align-self') {
		const validValues = ['flex-start', 'center', 'flex-end', 'auto'] as const;
		let mapped = trimmedValue;
		if (mapped === 'start') mapped = 'flex-start';
		if (mapped === 'end') mapped = 'flex-end';
		if (validValues.includes(mapped as typeof validValues[number])) {
			return { alignSelf: mapped as Styles['alignSelf'] };
		}
		return null;
	}

	if (normalizedProp === 'justify-content') {
		const validValues = ['flex-start', 'flex-end', 'center', 'space-between', 'space-around', 'space-evenly'] as const;
		let mapped = trimmedValue;
		if (mapped === 'start') mapped = 'flex-start';
		if (mapped === 'end') mapped = 'flex-end';
		if (validValues.includes(mapped as typeof validValues[number])) {
			return { justifyContent: mapped as Styles['justifyContent'] };
		}
		return null;
	}

	//#endregion Flexbox

	//#region Gap

	if (normalizedProp === 'gap') {
		const expanded = expandGapShorthand(trimmedValue);
		if (expanded.rowGap === expanded.columnGap) {
			return { gap: expanded.rowGap };
		}
		return { rowGap: expanded.rowGap, columnGap: expanded.columnGap };
	}

	if (normalizedProp === 'row-gap') {
		return { rowGap: parseNumeric(trimmedValue) };
	}

	if (normalizedProp === 'column-gap') {
		return { columnGap: parseNumeric(trimmedValue) };
	}

	//#endregion Gap

	//#region Sizing

	if (normalizedProp === 'width') {
		return { width: parseNumericOrPercent(trimmedValue) };
	}

	if (normalizedProp === 'height') {
		return { height: parseNumericOrPercent(trimmedValue) };
	}

	if (normalizedProp === 'min-width') {
		return { minWidth: parseNumericOrPercent(trimmedValue) };
	}

	if (normalizedProp === 'min-height') {
		return { minHeight: parseNumericOrPercent(trimmedValue) };
	}

	if (normalizedProp === 'max-width') {
		// wolf-tui doesn't have maxWidth, but parse it anyway for potential future support
		return null;
	}

	if (normalizedProp === 'max-height') {
		// wolf-tui doesn't have maxHeight, but parse it anyway for potential future support
		return null;
	}

	//#endregion Sizing

	//#region Margin

	if (normalizedProp === 'margin') {
		const expanded = expandSpacingShorthand(trimmedValue, 'margin');
		return {
			marginTop: expanded.marginTop as number,
			marginRight: expanded.marginRight as number,
			marginBottom: expanded.marginBottom as number,
			marginLeft: expanded.marginLeft as number,
		};
	}

	if (normalizedProp === 'margin-top') {
		return { marginTop: parseNumeric(trimmedValue) };
	}

	if (normalizedProp === 'margin-right') {
		return { marginRight: parseNumeric(trimmedValue) };
	}

	if (normalizedProp === 'margin-bottom') {
		return { marginBottom: parseNumeric(trimmedValue) };
	}

	if (normalizedProp === 'margin-left') {
		return { marginLeft: parseNumeric(trimmedValue) };
	}

	// Handle margin-x / margin-y (common in Tailwind)
	if (normalizedProp === 'margin-x' || normalizedProp === 'margin-inline') {
		const val = parseNumeric(trimmedValue);
		return { marginLeft: val, marginRight: val };
	}

	if (normalizedProp === 'margin-y' || normalizedProp === 'margin-block') {
		const val = parseNumeric(trimmedValue);
		return { marginTop: val, marginBottom: val };
	}

	//#endregion Margin

	//#region Padding

	if (normalizedProp === 'padding') {
		const expanded = expandSpacingShorthand(trimmedValue, 'padding');
		return {
			paddingTop: expanded.paddingTop as number,
			paddingRight: expanded.paddingRight as number,
			paddingBottom: expanded.paddingBottom as number,
			paddingLeft: expanded.paddingLeft as number,
		};
	}

	if (normalizedProp === 'padding-top') {
		return { paddingTop: parseNumeric(trimmedValue) };
	}

	if (normalizedProp === 'padding-right') {
		return { paddingRight: parseNumeric(trimmedValue) };
	}

	if (normalizedProp === 'padding-bottom') {
		return { paddingBottom: parseNumeric(trimmedValue) };
	}

	if (normalizedProp === 'padding-left') {
		return { paddingLeft: parseNumeric(trimmedValue) };
	}

	// Handle padding-x / padding-y (common in Tailwind)
	if (normalizedProp === 'padding-x' || normalizedProp === 'padding-inline') {
		const val = parseNumeric(trimmedValue);
		return { paddingLeft: val, paddingRight: val };
	}

	if (normalizedProp === 'padding-y' || normalizedProp === 'padding-block') {
		const val = parseNumeric(trimmedValue);
		return { paddingTop: val, paddingBottom: val };
	}

	//#endregion Padding

	//#region Overflow

	if (normalizedProp === 'overflow') {
		if (trimmedValue === 'hidden' || trimmedValue === 'visible') {
			return { overflow: trimmedValue };
		}
		// Map 'scroll', 'auto' to 'hidden' (TUI can't scroll)
		if (trimmedValue === 'scroll' || trimmedValue === 'auto') {
			return { overflow: 'hidden' };
		}
		return null;
	}

	if (normalizedProp === 'overflow-x') {
		if (trimmedValue === 'hidden' || trimmedValue === 'visible') {
			return { overflowX: trimmedValue };
		}
		if (trimmedValue === 'scroll' || trimmedValue === 'auto') {
			return { overflowX: 'hidden' };
		}
		return null;
	}

	if (normalizedProp === 'overflow-y') {
		if (trimmedValue === 'hidden' || trimmedValue === 'visible') {
			return { overflowY: trimmedValue };
		}
		if (trimmedValue === 'scroll' || trimmedValue === 'auto') {
			return { overflowY: 'hidden' };
		}
		return null;
	}

	//#endregion Overflow

	//#region Border

	if (normalizedProp === 'border-style') {
		const style = parseBorderStyle(trimmedValue);
		if (style) {
			return { borderStyle: style as Styles['borderStyle'] };
		}
		return null;
	}

	if (normalizedProp === 'border-color') {
		return { borderColor: parseColor(trimmedValue) };
	}

	// Handle border shorthand: "1px solid red"
	if (normalizedProp === 'border') {
		const parts = trimmedValue.split(/\s+/);
		const result: Record<string, string> = {};

		for (const part of parts) {
			// Check if it's a style
			const style = parseBorderStyle(part);
			if (style && !part.match(/^\d/)) {
				result['borderStyle'] = style;
				continue;
			}
			// Check if it's a color
			if (part.startsWith('#') || part.startsWith('rgb') || CSS_NAMED_COLORS.has(part.toLowerCase())) {
				result['borderColor'] = parseColor(part);
			}
		}

		// If we found a style, return it
		if (result['borderStyle']) {
			return result as Partial<Styles>;
		}
		return null;
	}

	// Border radius adaptation: radius > 0 → borderStyle: 'round'
	if (normalizedProp === 'border-radius') {
		const radius = parseNumeric(trimmedValue);
		if (radius > 0) {
			return { borderStyle: 'round' };
		}
		return null;
	}

	//#endregion Border

	//#region Colors

	// Note: 'color' is a Text component prop, not a Styles property
	// It cannot be mapped to Styles, so we return null
	if (normalizedProp === 'color') {
		// Text color is handled at the component level, not in Styles
		return null;
	}

	if (normalizedProp === 'background-color' || normalizedProp === 'background') {
		// For 'background', only handle solid colors
		if (normalizedProp === 'background' && (trimmedValue.includes('gradient') || trimmedValue.includes('url'))) {
			return null;
		}
		return { backgroundColor: parseColor(trimmedValue) };
	}

	//#endregion Colors

	//#region Text / Typography TUI Adaptations

	// opacity < 1 → dimColor: true (via color transform)
	if (normalizedProp === 'opacity') {
		const opacity = parseFloat(trimmedValue);
		if (!isNaN(opacity) && opacity < 1) {
			// Note: wolf-tui doesn't have dimColor on Styles directly
			// This would need to be handled at the text level
			return null;
		}
		return null;
	}

	// font-weight: bold or >= 700 → bold: true
	if (normalizedProp === 'font-weight') {
		const weight = trimmedValue.toLowerCase();
		if (weight === 'bold' || weight === 'bolder') {
			// Note: bold is a Text component prop, not Styles
			return null;
		}
		const numWeight = parseInt(weight, 10);
		if (!isNaN(numWeight) && numWeight >= 700) {
			return null;
		}
		return null;
	}

	// font-style: italic → italic: true
	if (normalizedProp === 'font-style') {
		if (trimmedValue === 'italic' || trimmedValue === 'oblique') {
			// Note: italic is a Text component prop, not Styles
			return null;
		}
		return null;
	}

	// text-decoration: underline | line-through
	if (normalizedProp === 'text-decoration' || normalizedProp === 'text-decoration-line') {
		// Note: underline/strikethrough are Text component props, not Styles
		return null;
	}

	// text-wrap / white-space → textWrap
	if (normalizedProp === 'text-wrap' || normalizedProp === 'white-space') {
		// Map CSS values to wolf-tui textWrap values
		const wrapMap: Record<string, Styles['textWrap']> = {
			'wrap': 'wrap',
			'nowrap': 'truncate',
			'balance': 'wrap',
			'stable': 'wrap',
			'pretty': 'wrap',
			// white-space values
			'normal': 'wrap',
			'pre': 'truncate',
			'pre-wrap': 'wrap',
			'pre-line': 'wrap',
			'break-spaces': 'wrap',
		};
		const mapped = wrapMap[trimmedValue.toLowerCase()];
		if (mapped) {
			return { textWrap: mapped };
		}
		return null;
	}

	//#endregion Text / Typography TUI Adaptations

	// Property not supported
	return null;
}

//#endregion CSS Property Mapper

//#region Helper Sets

/**
 * Set of CSS named colors for quick lookup
 */
const CSS_NAMED_COLORS = new Set([
	'black', 'silver', 'gray', 'white', 'maroon', 'red', 'purple', 'fuchsia',
	'green', 'lime', 'olive', 'yellow', 'navy', 'blue', 'teal', 'aqua',
	'aliceblue', 'antiquewhite', 'aquamarine', 'azure', 'beige', 'bisque',
	'blanchedalmond', 'blueviolet', 'brown', 'burlywood', 'cadetblue',
	'chartreuse', 'chocolate', 'coral', 'cornflowerblue', 'cornsilk',
	'crimson', 'cyan', 'darkblue', 'darkcyan', 'darkgoldenrod', 'darkgray',
	'darkgreen', 'darkgrey', 'darkkhaki', 'darkmagenta', 'darkolivegreen',
	'darkorange', 'darkorchid', 'darkred', 'darksalmon', 'darkseagreen',
	'darkslateblue', 'darkslategray', 'darkslategrey', 'darkturquoise',
	'darkviolet', 'deeppink', 'deepskyblue', 'dimgray', 'dimgrey',
	'dodgerblue', 'firebrick', 'floralwhite', 'forestgreen', 'gainsboro',
	'ghostwhite', 'gold', 'goldenrod', 'greenyellow', 'grey', 'honeydew',
	'hotpink', 'indianred', 'indigo', 'ivory', 'khaki', 'lavender',
	'lavenderblush', 'lawngreen', 'lemonchiffon', 'lightblue', 'lightcoral',
	'lightcyan', 'lightgoldenrodyellow', 'lightgray', 'lightgreen',
	'lightgrey', 'lightpink', 'lightsalmon', 'lightseagreen', 'lightskyblue',
	'lightslategray', 'lightslategrey', 'lightsteelblue', 'lightyellow',
	'limegreen', 'linen', 'magenta', 'mediumaquamarine', 'mediumblue',
	'mediumorchid', 'mediumpurple', 'mediumseagreen', 'mediumslateblue',
	'mediumspringgreen', 'mediumturquoise', 'mediumvioletred', 'midnightblue',
	'mintcream', 'mistyrose', 'moccasin', 'navajowhite', 'oldlace',
	'olivedrab', 'orange', 'orangered', 'orchid', 'palegoldenrod',
	'palegreen', 'paleturquoise', 'palevioletred', 'papayawhip', 'peachpuff',
	'peru', 'pink', 'plum', 'powderblue', 'rosybrown', 'royalblue',
	'saddlebrown', 'salmon', 'sandybrown', 'seagreen', 'seashell', 'sienna',
	'skyblue', 'slateblue', 'slategray', 'slategrey', 'snow', 'springgreen',
	'steelblue', 'tan', 'thistle', 'tomato', 'turquoise', 'violet', 'wheat',
	'whitesmoke', 'yellowgreen', 'rebeccapurple', 'transparent',
]);

//#endregion Helper Sets
