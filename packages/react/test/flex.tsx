import React from 'react'
import { test, expect } from 'vitest'
import { Box, Text } from '@wolfie/react'
import { renderToString } from './helpers/render-to-string'

test('grow equally', () => {
	const output = renderToString(
		<Box style={{ width: 6 }}>
			<Box style={{ flexGrow: 1 }}>
				<Text>A</Text>
			</Box>
			<Box style={{ flexGrow: 1 }}>
				<Text>B</Text>
			</Box>
		</Box>
	)

	expect(output).toBe('A  B')
})

test('grow one element', () => {
	const output = renderToString(
		<Box style={{ width: 6 }}>
			<Box style={{ flexGrow: 1 }}>
				<Text>A</Text>
			</Box>
			<Text>B</Text>
		</Box>
	)

	expect(output).toBe('A    B')
})

test('dont shrink', () => {
	const output = renderToString(
		<Box style={{ width: 16 }}>
			<Box style={{ flexShrink: 0, width: 6 }}>
				<Text>A</Text>
			</Box>
			<Box style={{ flexShrink: 0, width: 6 }}>
				<Text>B</Text>
			</Box>
			<Box style={{ width: 6 }}>
				<Text>C</Text>
			</Box>
		</Box>
	)

	expect(output).toBe('A     B     C')
})

test('shrink equally', () => {
	const output = renderToString(
		<Box style={{ width: 10 }}>
			<Box style={{ flexShrink: 1, width: 6 }}>
				<Text>A</Text>
			</Box>
			<Box style={{ flexShrink: 1, width: 6 }}>
				<Text>B</Text>
			</Box>
			<Text>C</Text>
		</Box>
	)

	expect(output).toBe('A    B   C')
})

test('set flex basis with flexDirection="row" container', () => {
	const output = renderToString(
		<Box style={{ width: 6 }}>
			<Box style={{ flexBasis: 3 }}>
				<Text>A</Text>
			</Box>
			<Text>B</Text>
		</Box>
	)

	expect(output).toBe('A  B')
})

test('set flex basis in percent with flexDirection="row" container', () => {
	const output = renderToString(
		<Box style={{ width: 6 }}>
			<Box style={{ flexBasis: '50%' }}>
				<Text>A</Text>
			</Box>
			<Text>B</Text>
		</Box>
	)

	expect(output).toBe('A  B')
})

test('set flex basis with flexDirection="column" container', () => {
	const output = renderToString(
		<Box style={{ height: 6, flexDirection: 'column' }}>
			<Box style={{ flexBasis: 3 }}>
				<Text>A</Text>
			</Box>
			<Text>B</Text>
		</Box>
	)

	expect(output).toBe('A\n\n\nB\n\n')
})

test('set flex basis in percent with flexDirection="column" container', () => {
	const output = renderToString(
		<Box style={{ height: 6, flexDirection: 'column' }}>
			<Box style={{ flexBasis: '50%' }}>
				<Text>A</Text>
			</Box>
			<Text>B</Text>
		</Box>
	)

	expect(output).toBe('A\n\n\nB\n\n')
})
