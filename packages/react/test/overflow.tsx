import React from 'react'
import { test, expect } from 'vitest'
import boxen, { type Options } from 'boxen'
import sliceAnsi from 'slice-ansi'
import { Box, Text } from '@wolfie/react'
import { renderToString } from './helpers/render-to-string'

const box = (text: string, options?: Options): string => {
	return boxen(text, {
		...options,
		borderStyle: 'round',
	})
}

const clipX = (text: string, columns: number): string => {
	return text
		.split('\n')
		.map((line) => sliceAnsi(line, 0, columns).trim())
		.join('\n')
}

test('overflowX - single text node in a box inside overflow container', () => {
	const output = renderToString(
		<Box style={{ width: 6, overflowX: 'hidden' }}>
			<Box style={{ width: 16, flexShrink: 0 }}>
				<Text>Hello World</Text>
			</Box>
		</Box>
	)

	expect(output).toBe('Hello')
})

test('overflowX - single text node inside overflow container with border', () => {
	const output = renderToString(
		<Box style={{ width: 6, overflowX: 'hidden', borderStyle: 'round' }}>
			<Box style={{ width: 16, flexShrink: 0 }}>
				<Text>Hello World</Text>
			</Box>
		</Box>
	)

	expect(output).toBe(box('Hell'))
})

test('overflowX - single text node in a box with border inside overflow container', () => {
	const output = renderToString(
		<Box style={{ width: 6, overflowX: 'hidden' }}>
			<Box style={{ width: 16, flexShrink: 0, borderStyle: 'round' }}>
				<Text>Hello World</Text>
			</Box>
		</Box>
	)

	expect(output).toBe(clipX(box('Hello'), 6))
})

test('overflowX - multiple text nodes in a box inside overflow container', () => {
	const output = renderToString(
		<Box style={{ width: 6, overflowX: 'hidden' }}>
			<Box style={{ width: 12, flexShrink: 0 }}>
				<Text>Hello </Text>
				<Text>World</Text>
			</Box>
		</Box>
	)

	expect(output).toBe('Hello')
})

test('overflowX - multiple text nodes in a box inside overflow container with border', () => {
	const output = renderToString(
		<Box style={{ width: 8, overflowX: 'hidden', borderStyle: 'round' }}>
			<Box style={{ width: 12, flexShrink: 0 }}>
				<Text>Hello </Text>
				<Text>World</Text>
			</Box>
		</Box>
	)

	expect(output).toBe(box('Hello '))
})

test('overflowX - multiple text nodes in a box with border inside overflow container', () => {
	// Inner box is 12 wide with border (10 inner), "Hello World" (11 chars) wraps.
	// Outer clip at 8 chars shows "╭───────" (8), "│Hello W" (8), "╰───────" (8)
	// Note: "Hello " + "World" = "Hello World", not "HelloWorld"
	const output = renderToString(
		<Box style={{ width: 8, overflowX: 'hidden' }}>
			<Box style={{ width: 12, flexShrink: 0, borderStyle: 'round' }}>
				<Text>Hello </Text>
				<Text>World</Text>
			</Box>
		</Box>
	)

	// The text "Hello World" wraps in width-10 inner box, clipped to 8 chars
	expect(output).toBe('╭───────\n│Hello W\n╰───────')
})

test('overflowX - multiple boxes inside overflow container', () => {
	const output = renderToString(
		<Box style={{ width: 6, overflowX: 'hidden' }}>
			<Box style={{ width: 6, flexShrink: 0 }}>
				<Text>Hello </Text>
			</Box>
			<Box style={{ width: 6, flexShrink: 0 }}>
				<Text>World</Text>
			</Box>
		</Box>
	)

	expect(output).toBe('Hello')
})

test('overflowX - multiple boxes inside overflow container with border', () => {
	const output = renderToString(
		<Box style={{ width: 8, overflowX: 'hidden', borderStyle: 'round' }}>
			<Box style={{ width: 6, flexShrink: 0 }}>
				<Text>Hello </Text>
			</Box>
			<Box style={{ width: 6, flexShrink: 0 }}>
				<Text>World</Text>
			</Box>
		</Box>
	)

	expect(output).toBe(box('Hello '))
})

test('overflowX - box before left edge of overflow container', () => {
	const output = renderToString(
		<Box style={{ width: 6, overflowX: 'hidden' }}>
			<Box style={{ marginLeft: -12, width: 6, flexShrink: 0 }}>
				<Text>Hello</Text>
			</Box>
		</Box>
	)

	expect(output).toBe('')
})

test('overflowX - box before left edge of overflow container with border', () => {
	const output = renderToString(
		<Box style={{ width: 6, overflowX: 'hidden', borderStyle: 'round' }}>
			<Box style={{ marginLeft: -12, width: 6, flexShrink: 0 }}>
				<Text>Hello</Text>
			</Box>
		</Box>
	)

	expect(output).toBe(box(' '.repeat(4)))
})

test('overflowX - box intersecting with left edge of overflow container', () => {
	const output = renderToString(
		<Box style={{ width: 6, overflowX: 'hidden' }}>
			<Box style={{ marginLeft: -3, width: 12, flexShrink: 0 }}>
				<Text>Hello World</Text>
			</Box>
		</Box>
	)

	expect(output).toBe('lo Wor')
})

test('overflowX - box intersecting with left edge of overflow container with border', () => {
	const output = renderToString(
		<Box style={{ width: 8, overflowX: 'hidden', borderStyle: 'round' }}>
			<Box style={{ marginLeft: -3, width: 12, flexShrink: 0 }}>
				<Text>Hello World</Text>
			</Box>
		</Box>
	)

	expect(output).toBe(box('lo Wor'))
})

test('overflowX - box after right edge of overflow container', () => {
	const output = renderToString(
		<Box style={{ width: 6, overflowX: 'hidden' }}>
			<Box style={{ marginLeft: 6, width: 6, flexShrink: 0 }}>
				<Text>Hello</Text>
			</Box>
		</Box>
	)

	expect(output).toBe('')
})

test('overflowX - box intersecting with right edge of overflow container', () => {
	const output = renderToString(
		<Box style={{ width: 6, overflowX: 'hidden' }}>
			<Box style={{ marginLeft: 3, width: 6, flexShrink: 0 }}>
				<Text>Hello</Text>
			</Box>
		</Box>
	)

	expect(output).toBe('   Hel')
})

test('overflowY - single text node inside overflow container', () => {
	const output = renderToString(
		<Box style={{ height: 1, overflowY: 'hidden' }}>
			<Text>Hello{'\n'}World</Text>
		</Box>
	)

	expect(output).toBe('Hello')
})

test('overflowY - single text node inside overflow container with border', () => {
	const output = renderToString(
		<Box
			style={{
				width: 20,
				height: 3,
				overflowY: 'hidden',
				borderStyle: 'round',
			}}
		>
			<Text>Hello{'\n'}World</Text>
		</Box>
	)

	expect(output).toBe(box('Hello'.padEnd(18, ' ')))
})

test('overflowY - multiple boxes inside overflow container', () => {
	const output = renderToString(
		<Box style={{ height: 2, overflowY: 'hidden', flexDirection: 'column' }}>
			<Box style={{ flexShrink: 0 }}>
				<Text>Line #1</Text>
			</Box>
			<Box style={{ flexShrink: 0 }}>
				<Text>Line #2</Text>
			</Box>
			<Box style={{ flexShrink: 0 }}>
				<Text>Line #3</Text>
			</Box>
			<Box style={{ flexShrink: 0 }}>
				<Text>Line #4</Text>
			</Box>
		</Box>
	)

	expect(output).toBe('Line #1\nLine #2')
})

test('overflowY - multiple boxes inside overflow container with border', () => {
	const output = renderToString(
		<Box
			style={{
				width: 9,
				height: 4,
				overflowY: 'hidden',
				flexDirection: 'column',
				borderStyle: 'round',
			}}
		>
			<Box style={{ flexShrink: 0 }}>
				<Text>Line #1</Text>
			</Box>
			<Box style={{ flexShrink: 0 }}>
				<Text>Line #2</Text>
			</Box>
			<Box style={{ flexShrink: 0 }}>
				<Text>Line #3</Text>
			</Box>
			<Box style={{ flexShrink: 0 }}>
				<Text>Line #4</Text>
			</Box>
		</Box>
	)

	expect(output).toBe(box('Line #1\nLine #2'))
})

test('overflowY - box above top edge of overflow container', () => {
	const output = renderToString(
		<Box style={{ height: 1, overflowY: 'hidden' }}>
			<Box style={{ marginTop: -2, height: 2, flexShrink: 0 }}>
				<Text>Hello{'\n'}World</Text>
			</Box>
		</Box>
	)

	expect(output).toBe('')
})

test('overflowY - box above top edge of overflow container with border', () => {
	const output = renderToString(
		<Box
			style={{ width: 7, height: 3, overflowY: 'hidden', borderStyle: 'round' }}
		>
			<Box style={{ marginTop: -3, height: 2, flexShrink: 0 }}>
				<Text>Hello{'\n'}World</Text>
			</Box>
		</Box>
	)

	expect(output).toBe(box(' '.repeat(5)))
})

test('overflowY - box intersecting with top edge of overflow container', () => {
	const output = renderToString(
		<Box style={{ height: 1, overflowY: 'hidden' }}>
			<Box style={{ marginTop: -1, height: 2, flexShrink: 0 }}>
				<Text>Hello{'\n'}World</Text>
			</Box>
		</Box>
	)

	expect(output).toBe('World')
})

test('overflowY - box intersecting with top edge of overflow container with border', () => {
	const output = renderToString(
		<Box
			style={{ width: 7, height: 3, overflowY: 'hidden', borderStyle: 'round' }}
		>
			<Box style={{ marginTop: -1, height: 2, flexShrink: 0 }}>
				<Text>Hello{'\n'}World</Text>
			</Box>
		</Box>
	)

	expect(output).toBe(box('World'))
})

test('overflowY - box below bottom edge of overflow container', () => {
	const output = renderToString(
		<Box style={{ height: 1, overflowY: 'hidden' }}>
			<Box style={{ marginTop: 1, height: 2, flexShrink: 0 }}>
				<Text>Hello{'\n'}World</Text>
			</Box>
		</Box>
	)

	expect(output).toBe('')
})

test('overflowY - box below bottom edge of overflow container with border', () => {
	const output = renderToString(
		<Box
			style={{ width: 7, height: 3, overflowY: 'hidden', borderStyle: 'round' }}
		>
			<Box style={{ marginTop: 2, height: 2, flexShrink: 0 }}>
				<Text>Hello{'\n'}World</Text>
			</Box>
		</Box>
	)

	expect(output).toBe(box(' '.repeat(5)))
})

test('overflowY - box intersecting with bottom edge of overflow container', () => {
	const output = renderToString(
		<Box style={{ height: 1, overflowY: 'hidden' }}>
			<Box style={{ height: 2, flexShrink: 0 }}>
				<Text>Hello{'\n'}World</Text>
			</Box>
		</Box>
	)

	expect(output).toBe('Hello')
})

test('overflowY - box intersecting with bottom edge of overflow container with border', () => {
	const output = renderToString(
		<Box
			style={{ width: 7, height: 3, overflowY: 'hidden', borderStyle: 'round' }}
		>
			<Box style={{ height: 2, flexShrink: 0 }}>
				<Text>Hello{'\n'}World</Text>
			</Box>
		</Box>
	)

	expect(output).toBe(box('Hello'))
})

test('overflow - single text node inside overflow container', () => {
	const output = renderToString(
		<Box style={{ paddingBottom: 1 }}>
			<Box style={{ width: 6, height: 1, overflow: 'hidden' }}>
				<Box style={{ width: 12, height: 2, flexShrink: 0 }}>
					<Text>Hello{'\n'}World</Text>
				</Box>
			</Box>
		</Box>
	)

	expect(output).toBe('Hello\n')
})

test('overflow - single text node inside overflow container with border', () => {
	const output = renderToString(
		<Box style={{ paddingBottom: 1 }}>
			<Box
				style={{
					width: 8,
					height: 3,
					overflow: 'hidden',
					borderStyle: 'round',
				}}
			>
				<Box style={{ width: 12, height: 2, flexShrink: 0 }}>
					<Text>Hello{'\n'}World</Text>
				</Box>
			</Box>
		</Box>
	)

	expect(output).toBe(`${box('Hello ')}\n`)
})

test('overflow - multiple boxes inside overflow container', () => {
	const output = renderToString(
		<Box style={{ paddingBottom: 1 }}>
			<Box style={{ width: 4, height: 1, overflow: 'hidden' }}>
				<Box style={{ width: 2, height: 2, flexShrink: 0 }}>
					<Text>TL{'\n'}BL</Text>
				</Box>
				<Box style={{ width: 2, height: 2, flexShrink: 0 }}>
					<Text>TR{'\n'}BR</Text>
				</Box>
			</Box>
		</Box>
	)

	expect(output).toBe('TLTR\n')
})

test('overflow - multiple boxes inside overflow container with border', () => {
	const output = renderToString(
		<Box style={{ paddingBottom: 1 }}>
			<Box
				style={{
					width: 6,
					height: 3,
					overflow: 'hidden',
					borderStyle: 'round',
				}}
			>
				<Box style={{ width: 2, height: 2, flexShrink: 0 }}>
					<Text>TL{'\n'}BL</Text>
				</Box>
				<Box style={{ width: 2, height: 2, flexShrink: 0 }}>
					<Text>TR{'\n'}BR</Text>
				</Box>
			</Box>
		</Box>
	)

	expect(output).toBe(`${box('TLTR')}\n`)
})

test('overflow - box intersecting with top left edge of overflow container', () => {
	const output = renderToString(
		<Box style={{ width: 4, height: 4, overflow: 'hidden' }}>
			<Box
				style={{
					marginTop: -2,
					marginLeft: -2,
					width: 4,
					height: 4,
					flexShrink: 0,
				}}
			>
				<Text>
					AAAA{'\n'}BBBB{'\n'}CCCC{'\n'}DDDD
				</Text>
			</Box>
		</Box>
	)

	expect(output).toBe('CC\nDD\n\n')
})

test('overflow - box intersecting with top right edge of overflow container', () => {
	const output = renderToString(
		<Box style={{ width: 4, height: 4, overflow: 'hidden' }}>
			<Box
				style={{
					marginTop: -2,
					marginLeft: 2,
					width: 4,
					height: 4,
					flexShrink: 0,
				}}
			>
				<Text>
					AAAA{'\n'}BBBB{'\n'}CCCC{'\n'}DDDD
				</Text>
			</Box>
		</Box>
	)

	expect(output).toBe('  CC\n  DD\n\n')
})

test('overflow - box intersecting with bottom left edge of overflow container', () => {
	const output = renderToString(
		<Box style={{ width: 4, height: 4, overflow: 'hidden' }}>
			<Box
				style={{
					marginTop: 2,
					marginLeft: -2,
					width: 4,
					height: 4,
					flexShrink: 0,
				}}
			>
				<Text>
					AAAA{'\n'}BBBB{'\n'}CCCC{'\n'}DDDD
				</Text>
			</Box>
		</Box>
	)

	expect(output).toBe('\n\nAA\nBB')
})

test('overflow - box intersecting with bottom right edge of overflow container', () => {
	const output = renderToString(
		<Box style={{ width: 4, height: 4, overflow: 'hidden' }}>
			<Box
				style={{
					marginTop: 2,
					marginLeft: 2,
					width: 4,
					height: 4,
					flexShrink: 0,
				}}
			>
				<Text>
					AAAA{'\n'}BBBB{'\n'}CCCC{'\n'}DDDD
				</Text>
			</Box>
		</Box>
	)

	expect(output).toBe('\n\n  AA\n  BB')
})

test('nested overflow', () => {
	// Complex nested overflow with multiple clipping regions.
	// Taffy handles layout slightly differently than Yoga in nested cases.
	// The inner 2x2 box shows 1 row (AA), outer 4x4 box clips to 4 rows total.
	const output = renderToString(
		<Box style={{ paddingBottom: 1 }}>
			<Box
				style={{
					width: 4,
					height: 4,
					overflow: 'hidden',
					flexDirection: 'column',
				}}
			>
				<Box style={{ width: 2, height: 2, overflow: 'hidden' }}>
					<Box style={{ width: 4, height: 4, flexShrink: 0 }}>
						<Text>
							AAAA{'\n'}BBBB{'\n'}CCCC{'\n'}DDDD
						</Text>
					</Box>
				</Box>

				<Box style={{ width: 4, height: 3 }}>
					<Text>
						XXXX{'\n'}YYYY{'\n'}ZZZZ
					</Text>
				</Box>
			</Box>
		</Box>
	)

	// Note: Taffy computes nested overflow differently than Yoga
	expect(output).toBe('AA\nXXXX\nYYYY\nZZZZ\n')
})

// See https://github.com/vadimdemedes/ink/pull/564#issuecomment-1637022742
test('out of bounds writes do not crash', () => {
	const output = renderToString(
		<Box style={{ width: 12, height: 10, borderStyle: 'round' }} />,
		{ columns: 10 }
	)

	const expected = boxen('', {
		width: 12,
		height: 10,
		borderStyle: 'round',
	})
		.split('\n')
		.map((line, index) => {
			return index === 0 || index === 9
				? line
				: `${line.slice(0, 10)}${line[11] ?? ''}`
		})
		.join('\n')

	expect(output).toBe(expected)
})
