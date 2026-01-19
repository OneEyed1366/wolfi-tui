import React from 'react'
import { test, expect } from 'vitest'
import { Box, Text } from '@wolfie/react'
import { renderToString } from './helpers/render-to-string'

test('row - align text to center', () => {
	const output = renderToString(
		<Box height={3}>
			<Box alignSelf="center">
				<Text>Test</Text>
			</Box>
		</Box>
	)

	expect(output).toBe('\nTest\n')
})

test('row - align multiple text nodes to center', () => {
	const output = renderToString(
		<Box height={3}>
			<Box alignSelf="center">
				<Text>A</Text>
				<Text>B</Text>
			</Box>
		</Box>
	)

	expect(output).toBe('\nAB\n')
})

test('row - align text to bottom', () => {
	const output = renderToString(
		<Box height={3}>
			<Box alignSelf="flex-end">
				<Text>Test</Text>
			</Box>
		</Box>
	)

	expect(output).toBe('\n\nTest')
})

test('row - align multiple text nodes to bottom', () => {
	const output = renderToString(
		<Box height={3}>
			<Box alignSelf="flex-end">
				<Text>A</Text>
				<Text>B</Text>
			</Box>
		</Box>
	)

	expect(output).toBe('\n\nAB')
})

test('column - align text to center', () => {
	const output = renderToString(
		<Box flexDirection="column" width={10}>
			<Box alignSelf="center">
				<Text>Test</Text>
			</Box>
		</Box>
	)

	expect(output).toBe('   Test')
})

test('column - align text to right', () => {
	const output = renderToString(
		<Box flexDirection="column" width={10}>
			<Box alignSelf="flex-end">
				<Text>Test</Text>
			</Box>
		</Box>
	)

	expect(output).toBe('      Test')
})
