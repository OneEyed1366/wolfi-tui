import React from 'react'
import { test, expect } from 'vitest'
import { Box, Text } from '@wolfie/react'
import { renderToString } from './helpers/render-to-string'

test('row - no wrap', () => {
	// With flexDirection=row (default) and no wrap, items that overflow
	// extend past the container bounds. With width=2, "A" is at x=0,
	// "BC" starts at x=1 and extends to x=3 (overflows).
	// Standard CSS flexbox renders all content; clipping requires overflow:hidden.
	const output = renderToString(
		<Box style={{ width: 2 }}>
			<Text>A</Text>
			<Text>BC</Text>
		</Box>
	)

	expect(output).toBe('ABC')
})

test('column - no wrap', () => {
	// With flexDirection=column and height=2, items that don't fit
	// extend past the container bounds. "A" is at y=0, "B" at y=1,
	// "C" at y=2 (overflows). Standard CSS renders visible items.
	const output = renderToString(
		<Box style={{ flexDirection: 'column', height: 2 }}>
			<Text>A</Text>
			<Text>B</Text>
			<Text>C</Text>
		</Box>
	)

	expect(output).toBe('A\nB')
})

test('row - wrap content', () => {
	const output = renderToString(
		<Box style={{ width: 2, flexWrap: 'wrap' }}>
			<Text>A</Text>
			<Text>BC</Text>
		</Box>
	)

	expect(output).toBe('A\nBC')
})

test('column - wrap content', () => {
	// With column wrap, items flow vertically then wrap to next column.
	// Use alignSelf="flex-start" so box shrinks to content width.
	const output = renderToString(
		<Box
			style={{
				flexDirection: 'column',
				height: 2,
				flexWrap: 'wrap',
				alignSelf: 'flex-start',
			}}
		>
			<Text>A</Text>
			<Text>B</Text>
			<Text>C</Text>
		</Box>
	)

	expect(output).toBe('AC\nB')
})

test('column - wrap content reverse', () => {
	// With wrap-reverse, columns stack right-to-left.
	// First column (A,B) is on the right, wrapped column (C) is on the left.
	// Taffy aligns C at x=0 with its content width.
	const output = renderToString(
		<Box
			style={{
				flexDirection: 'column',
				height: 2,
				width: 3,
				flexWrap: 'wrap-reverse',
			}}
		>
			<Text>A</Text>
			<Text>B</Text>
			<Text>C</Text>
		</Box>
	)

	expect(output).toBe('C A\n  B')
})

test('row - wrap content reverse', () => {
	// With wrap-reverse, rows stack bottom-to-top.
	// First row (A,B) is at the bottom, wrapped row (C) is above.
	// Taffy places C at y=0.
	const output = renderToString(
		<Box style={{ height: 3, width: 2, flexWrap: 'wrap-reverse' }}>
			<Text>A</Text>
			<Text>B</Text>
			<Text>C</Text>
		</Box>
	)

	expect(output).toBe('C\n\nAB')
})
