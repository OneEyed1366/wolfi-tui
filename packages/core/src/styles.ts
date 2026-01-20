/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
import { type Boxes, type BoxStyle } from 'cli-boxes'
import { type LiteralUnion } from 'type-fest'
import { type ForegroundColorName } from 'ansi-styles' // Note: We import directly from `ansi-styles` to avoid a bug in TypeScript.
import type { LayoutStyle, LayoutTree, Dimension, Edges } from './layout-types'

export type Styles = {
	readonly textWrap?:
		| 'wrap'
		| 'end'
		| 'middle'
		| 'truncate-end'
		| 'truncate'
		| 'truncate-middle'
		| 'truncate-start'

	readonly position?: 'absolute' | 'relative'

	/**
	Size of the gap between an element's columns.
	*/
	readonly columnGap?: number

	/**
	Size of the gap between an element's rows.
	*/
	readonly rowGap?: number

	/**
	Size of the gap between an element's columns and rows. A shorthand for `columnGap` and `rowGap`.
	*/
	readonly gap?: number

	/**
	Margin on all sides. Equivalent to setting `marginTop`, `marginBottom`, `marginLeft`, and `marginRight`.
	*/
	readonly margin?: number

	/**
	Horizontal margin. Equivalent to setting `marginLeft` and `marginRight`.
	*/
	readonly marginX?: number

	/**
	Vertical margin. Equivalent to setting `marginTop` and `marginBottom`.
	*/
	readonly marginY?: number

	/**
	Top margin.
	*/
	readonly marginTop?: number

	/**
	Bottom margin.
	*/
	readonly marginBottom?: number

	/**
	Left margin.
	*/
	readonly marginLeft?: number

	/**
	Right margin.
	*/
	readonly marginRight?: number

	/**
	Padding on all sides. Equivalent to setting `paddingTop`, `paddingBottom`, `paddingLeft`, and `paddingRight`.
	*/
	readonly padding?: number

	/**
	Horizontal padding. Equivalent to setting `paddingLeft` and `paddingRight`.
	*/
	readonly paddingX?: number

	/**
	Vertical padding. Equivalent to setting `paddingTop` and `paddingBottom`.
	*/
	readonly paddingY?: number

	/**
	Top padding.
	*/
	readonly paddingTop?: number

	/**
	Bottom padding.
	*/
	readonly paddingBottom?: number

	/**
	Left padding.
	*/
	readonly paddingLeft?: number

	/**
	Right padding.
	*/
	readonly paddingRight?: number

	/**
	This property defines the ability for a flex item to grow if necessary.
	See [flex-grow](https://css-tricks.com/almanac/properties/f/flex-grow/).
	*/
	readonly flexGrow?: number

	/**
	It specifies the “flex shrink factor”, which determines how much the flex item will shrink relative to the rest of the flex items in the flex container when there isn’t enough space on the row.
	See [flex-shrink](https://css-tricks.com/almanac/properties/f/flex-shrink/).
	*/
	readonly flexShrink?: number

	/**
	It establishes the main-axis, thus defining the direction flex items are placed in the flex container.
	See [flex-direction](https://css-tricks.com/almanac/properties/f/flex-direction/).
	*/
	readonly flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse'

	/**
	It specifies the initial size of the flex item, before any available space is distributed according to the flex factors.
	See [flex-basis](https://css-tricks.com/almanac/properties/f/flex-basis/).
	*/
	readonly flexBasis?: number | string

	/**
	It defines whether the flex items are forced in a single line or can be flowed into multiple lines. If set to multiple lines, it also defines the cross-axis which determines the direction new lines are stacked in.
	See [flex-wrap](https://css-tricks.com/almanac/properties/f/flex-wrap/).
	*/
	readonly flexWrap?: 'nowrap' | 'wrap' | 'wrap-reverse'

	/**
	The align-items property defines the default behavior for how items are laid out along the cross axis (perpendicular to the main axis).
	See [align-items](https://css-tricks.com/almanac/properties/a/align-items/).
	*/
	readonly alignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch'

	/**
	It makes possible to override the align-items value for specific flex items.
	See [align-self](https://css-tricks.com/almanac/properties/a/align-self/).
	*/
	readonly alignSelf?: 'flex-start' | 'center' | 'flex-end' | 'auto'

	/**
	It defines the alignment along the main axis.
	See [justify-content](https://css-tricks.com/almanac/properties/j/justify-content/).
	*/
	readonly justifyContent?:
		| 'flex-start'
		| 'flex-end'
		| 'space-between'
		| 'space-around'
		| 'space-evenly'
		| 'center'

	/**
	Width of the element in spaces. You can also set it as a percentage, which will calculate the width based on the width of the parent element.
	*/
	readonly width?: number | string

	/**
	Height of the element in lines (rows). You can also set it as a percentage, which will calculate the height based on the height of the parent element.
	*/
	readonly height?: number | string

	/**
	Sets a minimum width of the element.
	*/
	readonly minWidth?: number | string

	/**
	Sets a minimum height of the element.
	*/
	readonly minHeight?: number | string

	/**
	Set this property to `none` to hide the element.
	*/
	readonly display?: 'flex' | 'none'

	/**
	Add a border with a specified style. If `borderStyle` is `undefined` (the default), no border will be added.
	*/
	readonly borderStyle?: keyof Boxes | BoxStyle

	/**
	Determines whether the top border is visible.
	
	@default true
	*/
	readonly borderTop?: boolean

	/**
	Determines whether the bottom border is visible.
	
	@default true
	*/
	readonly borderBottom?: boolean

	/**
	Determines whether the left border is visible.
	
	@default true
	*/
	readonly borderLeft?: boolean

	/**
	Determines whether the right border is visible.
	
	@default true
	*/
	readonly borderRight?: boolean

	/**
	Change border color. A shorthand for setting `borderTopColor`, `borderRightColor`, `borderBottomColor`, and `borderLeftColor`.
	*/
	readonly borderColor?: LiteralUnion<ForegroundColorName, string>

	/**
	Change the top border color. Accepts the same values as `color` in `Text` component.
	*/
	readonly borderTopColor?: LiteralUnion<ForegroundColorName, string>

	/**
	Change the bottom border color. Accepts the same values as `color` in `Text` component.
	*/
	readonly borderBottomColor?: LiteralUnion<ForegroundColorName, string>

	/**
	Change the left border color. Accepts the same values as `color` in `Text` component.
	*/
	readonly borderLeftColor?: LiteralUnion<ForegroundColorName, string>

	/**
	Change the right border color. Accepts the same values as `color` in `Text` component.
	*/
	readonly borderRightColor?: LiteralUnion<ForegroundColorName, string>

	/**
	Dim the border color. A shorthand for setting `borderTopDimColor`, `borderBottomDimColor`, `borderLeftDimColor`, and `borderRightDimColor`.

	@default false
	*/
	readonly borderDimColor?: boolean

	/**
	Dim the top border color.
	
	@default false
	*/
	readonly borderTopDimColor?: boolean

	/**
	Dim the bottom border color.
	
	@default false
	*/
	readonly borderBottomDimColor?: boolean

	/**
	Dim the left border color.
	
	@default false
	*/
	readonly borderLeftDimColor?: boolean

	/**
	Dim the right border color.
	
	@default false
	*/
	readonly borderRightDimColor?: boolean

	/**
	Behavior for an element's overflow in both directions.
	
	@default 'visible'
	*/
	readonly overflow?: 'visible' | 'hidden'

	/**
	Behavior for an element's overflow in the horizontal direction.

	@default 'visible'
	*/
	readonly overflowX?: 'visible' | 'hidden'

	/**
	Behavior for an element's overflow in the vertical direction.

	@default 'visible'
	*/
	readonly overflowY?: 'visible' | 'hidden'

	/**
	Background color for the element.
	
	Accepts the same values as `color` in the `<Text>` component.
	*/
	readonly backgroundColor?: LiteralUnion<ForegroundColorName, string>
}

//#region Taffy Layout Style Conversion

/**
 * Helper to convert dimension values to Taffy Dimension format
 */
const toDimension = (value: number | string | undefined): Dimension | undefined => {
	if (value === undefined) return undefined
	if (typeof value === 'number') return { value, unit: 'px' }
	if (typeof value === 'string' && value.endsWith('%')) {
		return { value: parseFloat(value), unit: '%' }
	}
	return { value: 0, unit: 'auto' }
}

/**
 * Convert wolf-tui Styles to Taffy LayoutStyle
 * Pure conversion function - no side effects
 */
export const toLayoutStyle = (style: Styles): LayoutStyle => {
	const result: LayoutStyle = {}

	// Position
	if (style.position) result.position = style.position

	// Display
	if (style.display) result.display = style.display

	// Overflow
	if (style.overflow) result.overflow = style.overflow

	// Dimensions
	result.width = toDimension(style.width)
	result.height = toDimension(style.height)
	result.minWidth = toDimension(style.minWidth)
	result.minHeight = toDimension(style.minHeight)

	// Flex
	if (style.flexDirection) result.flexDirection = style.flexDirection
	if (style.flexWrap) result.flexWrap = style.flexWrap
	if (typeof style.flexGrow === 'number') result.flexGrow = style.flexGrow
	if (typeof style.flexShrink === 'number') result.flexShrink = style.flexShrink
	result.flexBasis = toDimension(style.flexBasis)

	// Alignment
	if (style.alignItems) result.alignItems = style.alignItems
	if (style.alignSelf) result.alignSelf = style.alignSelf
	if (style.justifyContent) result.justifyContent = style.justifyContent

	// Margin (expand shorthands)
	const hasMargin = style.margin !== undefined || style.marginX !== undefined ||
		style.marginY !== undefined || style.marginTop !== undefined ||
		style.marginRight !== undefined || style.marginBottom !== undefined ||
		style.marginLeft !== undefined
	if (hasMargin) {
		result.margin = {
			top: style.marginTop ?? style.marginY ?? style.margin ?? 0,
			right: style.marginRight ?? style.marginX ?? style.margin ?? 0,
			bottom: style.marginBottom ?? style.marginY ?? style.margin ?? 0,
			left: style.marginLeft ?? style.marginX ?? style.margin ?? 0,
		}
	}

	// Padding (expand shorthands)
	const hasPadding = style.padding !== undefined || style.paddingX !== undefined ||
		style.paddingY !== undefined || style.paddingTop !== undefined ||
		style.paddingRight !== undefined || style.paddingBottom !== undefined ||
		style.paddingLeft !== undefined
	if (hasPadding) {
		result.padding = {
			top: style.paddingTop ?? style.paddingY ?? style.padding ?? 0,
			right: style.paddingRight ?? style.paddingX ?? style.padding ?? 0,
			bottom: style.paddingBottom ?? style.paddingY ?? style.padding ?? 0,
			left: style.paddingLeft ?? style.paddingX ?? style.padding ?? 0,
		}
	}

	// Border (from borderStyle presence)
	if (style.borderStyle) {
		result.border = {
			top: style.borderTop !== false ? 1 : 0,
			right: style.borderRight !== false ? 1 : 0,
			bottom: style.borderBottom !== false ? 1 : 0,
			left: style.borderLeft !== false ? 1 : 0,
		}
	}

	// Gap
	if (typeof style.gap === 'number') result.gap = style.gap
	if (typeof style.columnGap === 'number') result.columnGap = style.columnGap
	if (typeof style.rowGap === 'number') result.rowGap = style.rowGap

	return result
}

/**
 * Apply styles to Taffy layout tree
 * Equivalent to applyStyles (default export) but for Taffy
 */
export const applyLayoutStyle = (
	layoutTree: LayoutTree,
	nodeId: number,
	style: Styles = {}
): void => {
	layoutTree.setStyle(nodeId, toLayoutStyle(style))
}

//#endregion

export type { LayoutStyle, Dimension, Edges }
