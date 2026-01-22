import React from 'react'
import { test, expect } from 'vitest'
import { Box, Text } from '@wolfie/react'
import { renderToString } from './helpers/render-to-string'

test('padding', () => {
	const output = renderToString(
		<Box style={{ padding: 2 }}>
			<Text>X</Text>
		</Box>
	)

	expect(output).toBe('\n\n  X\n\n')
})

test('padding X', () => {
	const output = renderToString(
		<Box>
			<Box style={{ paddingX: 2 }}>
				<Text>X</Text>
			</Box>
			<Text>Y</Text>
		</Box>
	)

	expect(output).toBe('  X  Y')
})

test('padding Y', () => {
	const output = renderToString(
		<Box style={{ paddingY: 2 }}>
			<Text>X</Text>
		</Box>
	)

	expect(output).toBe('\n\nX\n\n')
})

test('padding top', () => {
	const output = renderToString(
		<Box style={{ paddingTop: 2 }}>
			<Text>X</Text>
		</Box>
	)

	expect(output).toBe('\n\nX')
})

test('padding bottom', () => {
	const output = renderToString(
		<Box style={{ paddingBottom: 2 }}>
			<Text>X</Text>
		</Box>
	)

	expect(output).toBe('X\n\n')
})

test('padding left', () => {
	const output = renderToString(
		<Box style={{ paddingLeft: 2 }}>
			<Text>X</Text>
		</Box>
	)

	expect(output).toBe('  X')
})

test('padding right', () => {
	const output = renderToString(
		<Box>
			<Box style={{ paddingRight: 2 }}>
				<Text>X</Text>
			</Box>
			<Text>Y</Text>
		</Box>
	)

	expect(output).toBe('X  Y')
})

test('nested padding', () => {
	const output = renderToString(
		<Box style={{ padding: 2 }}>
			<Box style={{ padding: 2 }}>
				<Text>X</Text>
			</Box>
		</Box>
	)

	expect(output).toBe('\n\n\n\n    X\n\n\n\n')
})

test('padding with multiline string', () => {
	const output = renderToString(
		<Box style={{ padding: 2 }}>
			<Text>{'A\nB'}</Text>
		</Box>
	)

	expect(output).toBe('\n\n  A\n  B\n\n')
})

test('apply padding to text with newlines', () => {
	const output = renderToString(
		<Box style={{ padding: 1 }}>
			<Text>Hello{'\n'}World</Text>
		</Box>
	)
	expect(output).toBe('\n Hello\n World\n')
})

test('apply padding to wrapped text', () => {
	const output = renderToString(
		<Box style={{ padding: 1, width: 5 }}>
			<Text>Hello World</Text>
		</Box>
	)

	expect(output).toBe('\n Hel\n lo\n Wor\n ld\n')
})
