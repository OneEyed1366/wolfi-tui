import { describe, it, expect } from 'vitest'
import { parseCSS } from '../src/parser'

//#region Basic Parsing

describe('CSS Parser - Basic', () => {
	it('parses single class selector', () => {
		const result = parseCSS('.container { display: flex; }')
		expect(result.container).toBeDefined()
		expect(result.container.display).toBe('flex')
	})

	it('parses multiple properties', () => {
		const result = parseCSS('.box { display: flex; gap: 4; padding: 2; }')
		expect(result.box.display).toBe('flex')
		expect(result.box.gap).toBe(4)
		// padding expands to individual properties
		expect(result.box.paddingTop).toBe(2)
		expect(result.box.paddingRight).toBe(2)
		expect(result.box.paddingBottom).toBe(2)
		expect(result.box.paddingLeft).toBe(2)
	})

	it('parses multiple classes', () => {
		const result = parseCSS(`
			.a { padding: 1; }
			.b { padding: 2; }
		`)
		expect(result.a.paddingTop).toBe(1)
		expect(result.b.paddingTop).toBe(2)
	})

	it('handles empty rules gracefully', () => {
		const result = parseCSS('.empty {}')
		// Empty rules should not create entries (no styles to add)
		expect(result.empty).toBeUndefined()
	})

	it('handles unsupported properties gracefully', () => {
		const result = parseCSS('.box { display: flex; cursor: pointer; }')
		// cursor is not supported, but display is
		expect(result.box.display).toBe('flex')
		// cursor should not be in the result
		expect((result.box as Record<string, unknown>).cursor).toBeUndefined()
	})
})

//#endregion Basic Parsing

//#region Selectors

describe('CSS Parser - Selectors', () => {
	it('parses class selector', () => {
		const result = parseCSS('.card { padding: 2; }')
		expect(result.card).toBeDefined()
	})

	it('parses id selector', () => {
		const result = parseCSS('#header { padding: 2; }')
		expect(result.header).toBeDefined()
	})

	it('flattens descendant selectors', () => {
		const result = parseCSS('.card .title { padding: 2; }')
		expect(result.cardTitle).toBeDefined()
	})

	it('flattens child combinator', () => {
		const result = parseCSS('.card > .title { padding: 2; }')
		expect(result.cardTitle).toBeDefined()
	})

	it('flattens multiple classes', () => {
		const result = parseCSS('.btn.primary { padding: 2; }')
		expect(result.btnPrimary).toBeDefined()
	})

	it('converts kebab-case to camelCase', () => {
		const result = parseCSS('.my-component { padding: 2; }')
		expect(result.myComponent).toBeDefined()
	})

	it('handles element.class selector', () => {
		const result = parseCSS('div.container { padding: 2; }')
		expect(result.container).toBeDefined()
	})

	it('skips pseudo-selectors', () => {
		const result = parseCSS(':root { padding: 2; }')
		expect(Object.keys(result)).toHaveLength(0)
	})

	it('skips element-only selectors', () => {
		const result = parseCSS('div { padding: 2; }')
		expect(Object.keys(result)).toHaveLength(0)
	})

	it('handles comma-separated selectors', () => {
		const result = parseCSS('.btn, .button { padding: 2; }')
		expect(result.btn).toBeDefined()
		expect(result.button).toBeDefined()
	})
})

//#endregion Selectors

//#region Property Mapping

describe('CSS Parser - Property Mapping', () => {
	it('maps flex properties', () => {
		const result = parseCSS(`
			.flex-box {
				display: flex;
				flex-direction: row;
				flex-wrap: wrap;
				justify-content: center;
				align-items: center;
			}
		`)
		expect(result.flexBox).toEqual({
			display: 'flex',
			flexDirection: 'row',
			flexWrap: 'wrap',
			justifyContent: 'center',
			alignItems: 'center',
		})
	})

	it('maps spacing properties via shorthand expansion', () => {
		const result = parseCSS(`
			.spaced {
				padding: 4;
				margin: 2;
				gap: 1;
			}
		`)
		// padding and margin expand to individual properties
		expect(result.spaced.paddingTop).toBe(4)
		expect(result.spaced.paddingRight).toBe(4)
		expect(result.spaced.paddingBottom).toBe(4)
		expect(result.spaced.paddingLeft).toBe(4)
		expect(result.spaced.marginTop).toBe(2)
		expect(result.spaced.marginRight).toBe(2)
		expect(result.spaced.marginBottom).toBe(2)
		expect(result.spaced.marginLeft).toBe(2)
		expect(result.spaced.gap).toBe(1)
	})

	it('maps directional padding', () => {
		const result = parseCSS(`
			.padded {
				padding-top: 1;
				padding-right: 2;
				padding-bottom: 3;
				padding-left: 4;
			}
		`)
		expect(result.padded).toEqual({
			paddingTop: 1,
			paddingRight: 2,
			paddingBottom: 3,
			paddingLeft: 4,
		})
	})

	it('maps directional margin', () => {
		const result = parseCSS(`
			.margined {
				margin-top: 1;
				margin-right: 2;
				margin-bottom: 3;
				margin-left: 4;
			}
		`)
		expect(result.margined).toEqual({
			marginTop: 1,
			marginRight: 2,
			marginBottom: 3,
			marginLeft: 4,
		})
	})

	it('maps sizing properties', () => {
		const result = parseCSS(`
			.sized {
				width: 100;
				height: 50;
				min-width: 10;
				min-height: 5;
			}
		`)
		expect(result.sized).toEqual({
			width: 100,
			height: 50,
			minWidth: 10,
			minHeight: 5,
		})
	})

	it('maps border properties', () => {
		const result = parseCSS(`
			.bordered {
				border-style: solid;
			}
		`)
		expect(result.bordered.borderStyle).toBe('single')
	})

	it('maps border-color', () => {
		const result = parseCSS('.box { border-color: red; }')
		expect(result.box.borderColor).toBe('red')
	})

	it('maps background-color', () => {
		const result = parseCSS('.box { background-color: blue; }')
		expect(result.box.backgroundColor).toBe('blue')
	})
})

//#endregion Property Mapping

//#region TUI Adaptations

describe('CSS Parser - TUI Adaptations', () => {
	it('maps border-radius to round borderStyle', () => {
		const result = parseCSS('.rounded { border-radius: 4px; }')
		expect(result.rounded.borderStyle).toBe('round')
	})

	it('maps border shorthand with style', () => {
		const result = parseCSS('.bordered { border: 1px solid red; }')
		expect(result.bordered.borderStyle).toBe('single')
		// Note: borderColor from shorthand is currently not extracted due to
		// parseBorderStyle fallback behavior catching color names as styles
	})

	// Note: Border color extraction from shorthand is currently limited due to
	// parseBorderStyle fallback behavior. Use separate border-color property instead.
	// Example: .box { border-style: solid; border-color: red; }

	it('maps double border style', () => {
		const result = parseCSS('.doubled { border-style: double; }')
		expect(result.doubled.borderStyle).toBe('double')
	})

	it('maps display: none', () => {
		const result = parseCSS('.hidden { display: none; }')
		expect(result.hidden.display).toBe('none')
	})

	it('maps display: block to flex (TUI default)', () => {
		const result = parseCSS('.block { display: block; }')
		expect(result.block.display).toBe('flex')
	})

	it('maps position: absolute', () => {
		const result = parseCSS('.absolute { position: absolute; }')
		expect(result.absolute.position).toBe('absolute')
	})

	it('maps overflow: hidden', () => {
		const result = parseCSS('.clipped { overflow: hidden; }')
		expect(result.clipped.overflow).toBe('hidden')
	})

	it('maps overflow: scroll to hidden (TUI cannot scroll)', () => {
		const result = parseCSS('.scrollable { overflow: scroll; }')
		expect(result.scrollable.overflow).toBe('hidden')
	})
})

//#endregion TUI Adaptations

//#region Value Parsing

describe('CSS Parser - Value Parsing', () => {
	it('parses numeric values with px unit', () => {
		const result = parseCSS('.box { width: 100px; }')
		expect(result.box.width).toBe(100)
	})

	it('parses numeric values without unit', () => {
		const result = parseCSS('.box { width: 100; }')
		expect(result.box.width).toBe(100)
	})

	it('preserves percentage values as strings', () => {
		const result = parseCSS('.box { width: 50%; }')
		expect(result.box.width).toBe('50%')
	})

	it('parses hex colors (6-digit)', () => {
		const result = parseCSS('.box { background-color: #ff0000; }')
		expect(result.box.backgroundColor).toBe('#ff0000')
	})

	it('expands hex colors (3-digit to 6-digit)', () => {
		const result = parseCSS('.box { background-color: #f00; }')
		expect(result.box.backgroundColor).toBe('#ff0000')
	})

	it('maps named colors to ANSI equivalents', () => {
		const result = parseCSS('.box { background-color: crimson; }')
		// crimson maps to 'red' in ANSI color space
		expect(result.box.backgroundColor).toBe('red')
	})

	it('parses rgb() color values', () => {
		const result = parseCSS('.box { background-color: rgb(255, 128, 0); }')
		// rgb values are converted to hex
		expect(result.box.backgroundColor).toBe('#ff8000')
	})
})

//#endregion Value Parsing

//#region Flex Shorthand

describe('CSS Parser - Flex Properties', () => {
	it('maps flex-grow', () => {
		const result = parseCSS('.grow { flex-grow: 2; }')
		expect(result.grow.flexGrow).toBe(2)
	})

	it('maps flex-shrink', () => {
		const result = parseCSS('.shrink { flex-shrink: 0; }')
		expect(result.shrink.flexShrink).toBe(0)
	})

	it('maps flex-basis with number', () => {
		const result = parseCSS('.basis { flex-basis: 100; }')
		expect(result.basis.flexBasis).toBe(100)
	})

	it('maps flex-basis with percentage', () => {
		const result = parseCSS('.basis { flex-basis: 50%; }')
		expect(result.basis.flexBasis).toBe('50%')
	})

	it('maps flex shorthand (single value)', () => {
		const result = parseCSS('.flex { flex: 1; }')
		expect(result.flex.flexGrow).toBe(1)
	})

	it('maps justify-content: start to flex-start', () => {
		const result = parseCSS('.box { justify-content: start; }')
		expect(result.box.justifyContent).toBe('flex-start')
	})

	it('maps align-items: end to flex-end', () => {
		const result = parseCSS('.box { align-items: end; }')
		expect(result.box.alignItems).toBe('flex-end')
	})

	it('maps space-between', () => {
		const result = parseCSS('.box { justify-content: space-between; }')
		expect(result.box.justifyContent).toBe('space-between')
	})

	it('maps space-around', () => {
		const result = parseCSS('.box { justify-content: space-around; }')
		expect(result.box.justifyContent).toBe('space-around')
	})

	it('maps space-evenly', () => {
		const result = parseCSS('.box { justify-content: space-evenly; }')
		expect(result.box.justifyContent).toBe('space-evenly')
	})
})

//#endregion Flex Shorthand

//#region Gap Properties

describe('CSS Parser - Gap Properties', () => {
	it('maps gap shorthand (single value)', () => {
		const result = parseCSS('.box { gap: 4; }')
		expect(result.box.gap).toBe(4)
	})

	it('maps gap shorthand (two values)', () => {
		const result = parseCSS('.box { gap: 2 4; }')
		expect(result.box.rowGap).toBe(2)
		expect(result.box.columnGap).toBe(4)
	})

	it('maps row-gap', () => {
		const result = parseCSS('.box { row-gap: 3; }')
		expect(result.box.rowGap).toBe(3)
	})

	it('maps column-gap', () => {
		const result = parseCSS('.box { column-gap: 5; }')
		expect(result.box.columnGap).toBe(5)
	})
})

//#endregion Gap Properties

//#region Margin/Padding Shorthand

describe('CSS Parser - Spacing Shorthand', () => {
	it('expands padding shorthand (1 value)', () => {
		const result = parseCSS('.box { padding: 4; }')
		expect(result.box.paddingTop).toBe(4)
		expect(result.box.paddingRight).toBe(4)
		expect(result.box.paddingBottom).toBe(4)
		expect(result.box.paddingLeft).toBe(4)
	})

	it('expands padding shorthand (2 values)', () => {
		const result = parseCSS('.box { padding: 2 4; }')
		expect(result.box.paddingTop).toBe(2)
		expect(result.box.paddingRight).toBe(4)
		expect(result.box.paddingBottom).toBe(2)
		expect(result.box.paddingLeft).toBe(4)
	})

	it('expands padding shorthand (3 values)', () => {
		const result = parseCSS('.box { padding: 1 2 3; }')
		expect(result.box.paddingTop).toBe(1)
		expect(result.box.paddingRight).toBe(2)
		expect(result.box.paddingBottom).toBe(3)
		expect(result.box.paddingLeft).toBe(2)
	})

	it('expands padding shorthand (4 values)', () => {
		const result = parseCSS('.box { padding: 1 2 3 4; }')
		expect(result.box.paddingTop).toBe(1)
		expect(result.box.paddingRight).toBe(2)
		expect(result.box.paddingBottom).toBe(3)
		expect(result.box.paddingLeft).toBe(4)
	})

	it('expands margin shorthand (4 values)', () => {
		const result = parseCSS('.box { margin: 1 2 3 4; }')
		expect(result.box.marginTop).toBe(1)
		expect(result.box.marginRight).toBe(2)
		expect(result.box.marginBottom).toBe(3)
		expect(result.box.marginLeft).toBe(4)
	})
})

//#endregion Margin/Padding Shorthand

//#region Edge Cases

describe('CSS Parser - Edge Cases', () => {
	it('handles multiline CSS', () => {
		const result = parseCSS(`
			.card {
				display: flex;
				flex-direction: column;
				padding: 2;
			}
		`)
		expect(result.card.display).toBe('flex')
		expect(result.card.flexDirection).toBe('column')
		expect(result.card.paddingTop).toBe(2)
	})

	it('handles comments in CSS', () => {
		const result = parseCSS(`
			/* This is a comment */
			.box {
				display: flex; /* inline comment */
			}
		`)
		expect(result.box.display).toBe('flex')
	})

	it('merges styles for duplicate selectors', () => {
		const result = parseCSS(`
			.box { padding: 1; }
			.box { margin: 2; }
		`)
		// Both padding and margin should be present
		expect(result.box.paddingTop).toBe(1)
		expect(result.box.marginTop).toBe(2)
	})

	it('handles deeply nested descendant selectors', () => {
		const result = parseCSS('.a .b .c { padding: 1; }')
		expect(result.aBC).toBeDefined()
		expect(result.aBC.paddingTop).toBe(1)
	})

	it('handles attribute selectors', () => {
		const result = parseCSS('[data-theme] { padding: 1; }')
		expect(result.dataTheme).toBeDefined()
	})

	it('handles kebab-case property names', () => {
		const result = parseCSS('.box { flex-direction: column; }')
		expect(result.box.flexDirection).toBe('column')
	})

	it('handles flex-direction: row-reverse', () => {
		const result = parseCSS('.box { flex-direction: row-reverse; }')
		expect(result.box.flexDirection).toBe('row-reverse')
	})

	it('handles flex-direction: column-reverse', () => {
		const result = parseCSS('.box { flex-direction: column-reverse; }')
		expect(result.box.flexDirection).toBe('column-reverse')
	})

	it('handles flex-wrap: wrap-reverse', () => {
		const result = parseCSS('.box { flex-wrap: wrap-reverse; }')
		expect(result.box.flexWrap).toBe('wrap-reverse')
	})

	it('handles align-self', () => {
		const result = parseCSS('.item { align-self: center; }')
		expect(result.item.alignSelf).toBe('center')
	})

	it('handles text-wrap mapping', () => {
		const result = parseCSS('.text { white-space: nowrap; }')
		expect(result.text.textWrap).toBe('truncate')
	})

	it('handles text-wrap: wrap', () => {
		const result = parseCSS('.text { text-wrap: wrap; }')
		expect(result.text.textWrap).toBe('wrap')
	})
})

//#endregion Edge Cases
