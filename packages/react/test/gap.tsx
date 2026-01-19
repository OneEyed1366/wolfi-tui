import React from 'react'
import { test, expect } from 'vitest'
import { Box, Text } from '@wolfie/react'
import { renderToString } from './helpers/render-to-string'

test('gap', () => {
	const output = renderToString(
		<Box gap={1} width={3} flexWrap="wrap">
			<Text>A</Text>
			<Text>B</Text>
			<Text>C</Text>
		</Box>
	)

	expect(output).toBe('A B\n\nC')
})

test('column gap', () => {
	const output = renderToString(
		<Box gap={1}>
			<Text>A</Text>
			<Text>B</Text>
		</Box>
	)

	expect(output).toBe('A B')
})

test('row gap', () => {
	const output = renderToString(
		<Box flexDirection="column" gap={1}>
			<Text>A</Text>
			<Text>B</Text>
		</Box>
	)

	expect(output).toBe('A\n\nB')
})
