import React from 'react'
import { test, expect } from 'vitest'
import { Box, Text } from '@wolfie/react'
import { renderToString } from './helpers/render-to-string.js'

test('set width', () => {
	const output = renderToString(
		<Box>
			<Box width={5}>
				<Text>A</Text>
			</Box>
			<Text>B</Text>
		</Box>
	)

	expect(output).toBe('A    B')
})

test('set width in percent', () => {
	const output = renderToString(
		<Box width={10}>
			<Box width="50%">
				<Text>A</Text>
			</Box>
			<Text>B</Text>
		</Box>
	)

	expect(output).toBe('A    B')
})

test('set min width', () => {
	const smallerOutput = renderToString(
		<Box>
			<Box minWidth={5}>
				<Text>A</Text>
			</Box>
			<Text>B</Text>
		</Box>
	)

	expect(smallerOutput).toBe('A    B')

	const largerOutput = renderToString(
		<Box>
			<Box minWidth={2}>
				<Text>AAAAA</Text>
			</Box>
			<Text>B</Text>
		</Box>
	)

	expect(largerOutput).toBe('AAAAAB')
})

test.fails('set min width in percent', () => {
	const output = renderToString(
		<Box width={10}>
			<Box minWidth="50%">
				<Text>A</Text>
			</Box>
			<Text>B</Text>
		</Box>
	)

	expect(output).toBe('A    B')
})

test('set height', () => {
	const output = renderToString(
		<Box height={4}>
			<Text>A</Text>
			<Text>B</Text>
		</Box>
	)

	expect(output).toBe('AB\n\n\n')
})

test('set height in percent', () => {
	const output = renderToString(
		<Box height={6} flexDirection="column">
			<Box height="50%">
				<Text>A</Text>
			</Box>
			<Text>B</Text>
		</Box>
	)

	expect(output).toBe('A\n\n\nB\n\n')
})

test('cut text over the set height', () => {
	const output = renderToString(
		<Box height={2}>
			<Text>AAAABBBBCCCC</Text>
		</Box>,
		{ columns: 4 }
	)

	expect(output).toBe('AAAA\nBBBB')
})

test('set min height', () => {
	const smallerOutput = renderToString(
		<Box minHeight={4}>
			<Text>A</Text>
		</Box>
	)

	expect(smallerOutput).toBe('A\n\n\n')

	const largerOutput = renderToString(
		<Box minHeight={2}>
			<Box height={4}>
				<Text>A</Text>
			</Box>
		</Box>
	)

	expect(largerOutput).toBe('A\n\n\n')
})
