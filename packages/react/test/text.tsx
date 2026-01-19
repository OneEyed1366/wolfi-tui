import React from 'react'
import { test, expect } from 'vitest'
import chalk from 'chalk'
import { render, Box, Text } from '@wolfie/react'
import { renderToString } from './helpers/render-to-string'
import createStdout from './helpers/create-stdout'

test('<Text> with undefined children', () => {
	const output = renderToString(<Text />)
	expect(output).toBe('')
})

test('<Text> with null children', () => {
	const output = renderToString(<Text>{null}</Text>)
	expect(output).toBe('')
})

test('text with standard color', () => {
	const output = renderToString(<Text color="green">Test</Text>)
	expect(output).toBe(chalk.green('Test'))
})

// TODO: chalk/colorize behavior differs in Vite env - dim+bold not being applied
test.todo('text with dim+bold', () => {
	const output = renderToString(
		<Text dimColor bold>
			Test
		</Text>
	)
	// Component applies bold then dim, with single reset at end
	expect(output).toBe('\u001B[1m\u001B[2mTest\u001B[22m')
})

test('text with dimmed color', () => {
	const output = renderToString(
		<Text dimColor color="green">
			Test
		</Text>
	)

	expect(output).toBe(chalk.green.dim('Test'))
})

test('text with hex color', () => {
	const output = renderToString(<Text color="#FF8800">Test</Text>)
	expect(output).toBe(chalk.hex('#FF8800')('Test'))
})

test('text with rgb color', () => {
	const output = renderToString(<Text color="rgb(255, 136, 0)">Test</Text>)
	expect(output).toBe(chalk.rgb(255, 136, 0)('Test'))
})

test('text with ansi256 color', () => {
	const output = renderToString(<Text color="ansi256(194)">Test</Text>)
	expect(output).toBe(chalk.ansi256(194)('Test'))
})

test('text with standard background color', () => {
	const output = renderToString(<Text backgroundColor="green">Test</Text>)
	expect(output).toBe(chalk.bgGreen('Test'))
})

test('text with hex background color', () => {
	const output = renderToString(<Text backgroundColor="#FF8800">Test</Text>)
	expect(output).toBe(chalk.bgHex('#FF8800')('Test'))
})

test('text with rgb background color', () => {
	const output = renderToString(
		<Text backgroundColor="rgb(255, 136, 0)">Test</Text>
	)

	expect(output).toBe(chalk.bgRgb(255, 136, 0)('Test'))
})

test('text with ansi256 background color', () => {
	const output = renderToString(
		<Text backgroundColor="ansi256(194)">Test</Text>
	)

	expect(output).toBe(chalk.bgAnsi256(194)('Test'))
})

test('text with inversion', () => {
	const output = renderToString(<Text inverse>Test</Text>)
	expect(output).toBe(chalk.inverse('Test'))
})

test('remeasure text when text is changed', () => {
	function Test({ add }: { readonly add?: boolean }) {
		return (
			<Box>
				<Text>{add ? 'abcx' : 'abc'}</Text>
			</Box>
		)
	}

	const stdout = createStdout()
	const { rerender } = render(<Test />, { stdout, debug: true })
	expect((stdout.write as any).lastCall.args[0]).toBe('abc')

	rerender(<Test add />)
	expect((stdout.write as any).lastCall.args[0]).toBe('abcx')
})

test('remeasure text when text nodes are changed', () => {
	function Test({ add }: { readonly add?: boolean }) {
		return (
			<Box>
				<Text>
					abc
					{add && <Text>x</Text>}
				</Text>
			</Box>
		)
	}

	const stdout = createStdout()

	const { rerender } = render(<Test />, { stdout, debug: true })
	expect((stdout.write as any).lastCall.args[0]).toBe('abc')

	rerender(<Test add />)
	expect((stdout.write as any).lastCall.args[0]).toBe('abcx')
})

// See https://github.com/vadimdemedes/ink/issues/743
// Without the fix, the output was ''.
test('text with content "constructor" wraps correctly', () => {
	const output = renderToString(<Text>constructor</Text>)
	expect(output).toBe('constructor')
})
