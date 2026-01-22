import React from 'react'
import { test, expect } from 'vitest'
import { Box, Text } from '@wolfie/react'
import { renderToString } from './helpers/render-to-string'

test('row - align text to center', () => {
	const output = renderToString(
		<Box style={{ alignItems: 'center', height: 3 }}>
			<Text>Test</Text>
		</Box>
	)

	expect(output).toBe('\nTest\n')
})

test('row - align multiple text nodes to center', () => {
	const output = renderToString(
		<Box style={{ alignItems: 'center', height: 3 }}>
			<Text>A</Text>
			<Text>B</Text>
		</Box>
	)

	expect(output).toBe('\nAB\n')
})

test('row - align text to bottom', () => {
	const output = renderToString(
		<Box style={{ alignItems: 'flex-end', height: 3 }}>
			<Text>Test</Text>
		</Box>
	)

	expect(output).toBe('\n\nTest')
})

test('row - align multiple text nodes to bottom', () => {
	const output = renderToString(
		<Box style={{ alignItems: 'flex-end', height: 3 }}>
			<Text>A</Text>
			<Text>B</Text>
		</Box>
	)

	expect(output).toBe('\n\nAB')
})

test('column - align text to center', () => {
	const output = renderToString(
		<Box style={{ flexDirection: 'column', alignItems: 'center', width: 10 }}>
			<Text>Test</Text>
		</Box>
	)

	expect(output).toBe('   Test')
})

test('column - align text to right', () => {
	const output = renderToString(
		<Box style={{ flexDirection: 'column', alignItems: 'flex-end', width: 10 }}>
			<Text>Test</Text>
		</Box>
	)

	expect(output).toBe('      Test')
})
