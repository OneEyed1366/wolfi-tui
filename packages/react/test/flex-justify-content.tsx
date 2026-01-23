import React from 'react'
import { test, expect } from 'vitest'
import chalk from 'chalk'
import { Box, Text } from '@wolfie/react'
import { renderToString } from './helpers/render-to-string'

test('row - align text to center', () => {
	const output = renderToString(
		<Box style={{ justifyContent: 'center', width: 10 }}>
			<Text>Test</Text>
		</Box>
	)

	expect(output).toBe('   Test')
})

test('row - align multiple text nodes to center', () => {
	const output = renderToString(
		<Box style={{ justifyContent: 'center', width: 10 }}>
			<Text>A</Text>
			<Text>B</Text>
		</Box>
	)

	expect(output).toBe('    AB')
})

test('row - align text to right', () => {
	const output = renderToString(
		<Box style={{ justifyContent: 'flex-end', width: 10 }}>
			<Text>Test</Text>
		</Box>
	)

	expect(output).toBe('      Test')
})

test('row - align multiple text nodes to right', () => {
	const output = renderToString(
		<Box style={{ justifyContent: 'flex-end', width: 10 }}>
			<Text>A</Text>
			<Text>B</Text>
		</Box>
	)

	expect(output).toBe('        AB')
})

test('row - align two text nodes on the edges', () => {
	const output = renderToString(
		<Box style={{ justifyContent: 'space-between', width: 4 }}>
			<Text>A</Text>
			<Text>B</Text>
		</Box>
	)

	expect(output).toBe('A  B')
})

test('row - space evenly two text nodes', () => {
	// space-evenly distributes space equally: 3 gaps for 2 items in width 10
	// (10 - 2) / 3 = 2.67, Taffy rounds to 3 before A, 2 between, 3 after
	// With right edge at width boundary, trailing space is trimmed.
	const output = renderToString(
		<Box style={{ justifyContent: 'space-evenly', width: 10 }}>
			<Text>A</Text>
			<Text>B</Text>
		</Box>
	)

	expect(output).toBe('   A  B')
})

// Note: Yoga had a bug with space-around but Taffy handles it correctly
test('row - align two text nodes with equal space around them', () => {
	const output = renderToString(
		<Box style={{ justifyContent: 'space-around', width: 5 }}>
			<Text>A</Text>
			<Text>B</Text>
		</Box>
	)

	expect(output).toBe(' A B')
})

test('row - align colored text node when text is squashed', () => {
	const output = renderToString(
		<Box style={{ justifyContent: 'flex-end', width: 5 }}>
			<Text style={{ color: 'green' }}>X</Text>
		</Box>
	)

	expect(output).toBe(`    ${chalk.green('X')}`)
})

test('column - align text to center', () => {
	const output = renderToString(
		<Box
			style={{ flexDirection: 'column', justifyContent: 'center', height: 3 }}
		>
			<Text>Test</Text>
		</Box>
	)

	expect(output).toBe('\nTest\n')
})

test('column - align text to bottom', () => {
	const output = renderToString(
		<Box
			style={{ flexDirection: 'column', justifyContent: 'flex-end', height: 3 }}
		>
			<Text>Test</Text>
		</Box>
	)

	expect(output).toBe('\n\nTest')
})

test('column - align two text nodes on the edges', () => {
	const output = renderToString(
		<Box
			style={{
				flexDirection: 'column',
				justifyContent: 'space-between',
				height: 4,
			}}
		>
			<Text>A</Text>
			<Text>B</Text>
		</Box>
	)

	expect(output).toBe('A\n\n\nB')
})

// Note: Yoga had a bug with space-around but Taffy handles it correctly
test('column - align two text nodes with equal space around them', () => {
	const output = renderToString(
		<Box
			style={{
				flexDirection: 'column',
				justifyContent: 'space-around',
				height: 5,
			}}
		>
			<Text>A</Text>
			<Text>B</Text>
		</Box>
	)

	expect(output).toBe('\nA\n\nB\n')
})
