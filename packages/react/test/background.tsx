import React from 'react'
import { test, expect, beforeAll, afterAll } from 'vitest'
import chalk from 'chalk'
import { render, Box, Text } from '@wolfie/react'
import { renderToString } from './helpers/render-to-string'
import createStdout from './helpers/create-stdout'
import { enableTestColors, disableTestColors } from './helpers/force-colors'

// ANSI escape sequences for background colors
// Note: We test against raw ANSI codes rather than chalk predicates because:
// 1. Different color reset patterns:
//    - Chalk: '\u001b[43mHello \u001b[49m\u001b[43mWorld\u001b[49m' (individual resets)
//    - Wolfie:   '\u001b[43mHello World\u001b[49m' (continuous blocks)
// 2. Background space fills that chalk doesn't generate:
//    - Wolfie: '\u001b[41mHello     \u001b[49m\n\u001b[41m          \u001b[49m' (fills entire Box area)
// 3. Context-aware color transitions:
//    - Chalk: '\u001b[43mOuter: \u001b[49m\u001b[44mInner: \u001b[49m\u001b[41mExplicit\u001b[49m'
//    - Wolfie:   '\u001b[43mOuter: \u001b[44mInner: \u001b[41mExplicit\u001b[49m' (no intermediate resets)
const ansi = {
	// Standard colors
	bgRed: '\u001B[41m',
	bgGreen: '\u001B[42m',
	bgYellow: '\u001B[43m',
	bgBlue: '\u001B[44m',
	bgMagenta: '\u001B[45m',
	bgCyan: '\u001B[46m',

	// Hex/RGB colors (24-bit)
	bgHexRed: '\u001B[48;2;255;0;0m', // #FF0000 or rgb(255,0,0)

	// ANSI256 colors
	bgAnsi256Nine: '\u001B[48;5;9m', // Ansi256(9)

	// Reset
	bgReset: '\u001B[49m',
} as const

// Enable colors for all tests
beforeAll(() => {
	enableTestColors()
})

afterAll(() => {
	disableTestColors()
})

// Text inheritance tests (these work in non-TTY)
test('Text inherits parent Box background color', () => {
	const output = renderToString(
		<Box style={{ backgroundColor: 'green', alignSelf: 'flex-start' }}>
			<Text>Hello World</Text>
		</Box>
	)

	expect(output).toBe(chalk.bgGreen('Hello World'))
})

test('Text explicit background color overrides inherited', () => {
	const output = renderToString(
		<Box style={{ backgroundColor: 'red', alignSelf: 'flex-start' }}>
			<Text style={{ backgroundColor: 'blue' }}>Hello World</Text>
		</Box>
	)

	expect(output).toBe(chalk.bgBlue('Hello World'))
})

test('Nested Box background inheritance', () => {
	const output = renderToString(
		<Box style={{ backgroundColor: 'red', alignSelf: 'flex-start' }}>
			<Box style={{ backgroundColor: 'blue' }}>
				<Text>Hello World</Text>
			</Box>
		</Box>
	)

	expect(output).toBe(chalk.bgBlue('Hello World'))
})

test('Text without parent Box background has no inheritance', () => {
	const output = renderToString(
		<Box style={{ alignSelf: 'flex-start' }}>
			<Text>Hello World</Text>
		</Box>
	)

	expect(output).toBe('Hello World')
})

test('Multiple Text elements inherit same background', () => {
	const output = renderToString(
		<Box style={{ backgroundColor: 'yellow', alignSelf: 'flex-start' }}>
			<Text>Hello </Text>
			<Text>World</Text>
		</Box>
	)

	// Text nodes are rendered as a single block with shared background
	expect(output).toBe(chalk.bgYellow('Hello World'))
})

test('Mixed text with and without background inheritance', () => {
	const output = renderToString(
		<Box style={{ backgroundColor: 'green', alignSelf: 'flex-start' }}>
			<Text>Inherited </Text>
			<Text style={{ backgroundColor: 'undefined' }}>No BG </Text>
			<Text style={{ backgroundColor: 'red' }}>Red BG</Text>
		</Box>
	)

	expect(output).toBe(
		chalk.bgGreen('Inherited ') + 'No BG ' + chalk.bgRed('Red BG')
	)
})

test('Complex nested structure with background inheritance', () => {
	const output = renderToString(
		<Box style={{ backgroundColor: 'yellow', alignSelf: 'flex-start' }}>
			<Box>
				<Text>Outer: </Text>
				<Box style={{ backgroundColor: 'blue' }}>
					<Text>Inner: </Text>
					<Text style={{ backgroundColor: 'red' }}>Explicit</Text>
				</Box>
			</Box>
		</Box>
	)

	// Colors transition without reset codes between them - actual behavior from debug output
	expect(output).toBe(
		`${ansi.bgYellow}Outer: ${ansi.bgBlue}Inner: ${ansi.bgRed}Explicit${ansi.bgReset}`
	)
})

// Background color tests for different formats
test('Box background with standard color', () => {
	const output = renderToString(
		<Box style={{ backgroundColor: 'red', alignSelf: 'flex-start' }}>
			<Text>Hello</Text>
		</Box>
	)

	expect(output).toBe(chalk.bgRed('Hello'))
})

test('Box background with hex color', () => {
	const output = renderToString(
		<Box style={{ backgroundColor: '#FF0000', alignSelf: 'flex-start' }}>
			<Text>Hello</Text>
		</Box>
	)

	expect(output).toBe(chalk.bgHex('#FF0000')('Hello'))
})

test('Box background with rgb color', () => {
	const output = renderToString(
		<Box style={{ backgroundColor: 'rgb(255, 0, 0)', alignSelf: 'flex-start' }}>
			<Text>Hello</Text>
		</Box>
	)

	expect(output).toBe(chalk.bgRgb(255, 0, 0)('Hello'))
})

test('Box background with ansi256 color', () => {
	const output = renderToString(
		<Box style={{ backgroundColor: 'ansi256(9)', alignSelf: 'flex-start' }}>
			<Text>Hello</Text>
		</Box>
	)

	expect(output).toBe(chalk.bgAnsi256(9)('Hello'))
})

test('Box background with wide characters', () => {
	const output = renderToString(
		<Box style={{ backgroundColor: 'yellow', alignSelf: 'flex-start' }}>
			<Text>こんにちは</Text>
		</Box>
	)

	expect(output).toBe(chalk.bgYellow('こんにちは'))
})

test('Box background with emojis', () => {
	const output = renderToString(
		<Box style={{ backgroundColor: 'red', alignSelf: 'flex-start' }}>
			<Text>🎉🎊</Text>
		</Box>
	)

	expect(output).toBe(chalk.bgRed('🎉🎊'))
})

// Box background space fill tests - these should work with forced colors
test('Box background fills entire area with standard color', () => {
	const output = renderToString(
		<Box
			style={{
				backgroundColor: 'red',
				width: 10,
				height: 3,
				alignSelf: 'flex-start',
			}}
		>
			<Text>Hello</Text>
		</Box>
	)

	// Should contain background color codes and fill spaces for entire Box area
	expect(output.includes(ansi.bgRed)).toBe(true)
	expect(output.includes(ansi.bgReset)).toBe(true)
	expect(output.includes('Hello')).toBe(true)
	expect(output.includes(`${ansi.bgRed}          ${ansi.bgReset}`)).toBe(true)
})

test('Box background fills with hex color', () => {
	const output = renderToString(
		<Box
			style={{
				backgroundColor: '#FF0000',
				width: 10,
				height: 3,
				alignSelf: 'flex-start',
			}}
		>
			<Text>Hello</Text>
		</Box>
	)

	// Should contain hex color background codes and fill spaces
	expect(output.includes('Hello')).toBe(true)
	expect(output.includes(ansi.bgHexRed)).toBe(true)
	expect(output.includes(ansi.bgReset)).toBe(true)
})

test('Box background fills with rgb color', () => {
	const output = renderToString(
		<Box
			style={{
				backgroundColor: 'rgb(255, 0, 0)',
				width: 10,
				height: 3,
				alignSelf: 'flex-start',
			}}
		>
			<Text>Hello</Text>
		</Box>
	)

	// Should contain RGB color background codes and fill spaces
	expect(output.includes('Hello')).toBe(true)
	expect(output.includes(ansi.bgHexRed)).toBe(true)
	expect(output.includes(ansi.bgReset)).toBe(true)
})

test('Box background fills with ansi256 color', () => {
	const output = renderToString(
		<Box
			style={{
				backgroundColor: 'ansi256(9)',
				width: 10,
				height: 3,
				alignSelf: 'flex-start',
			}}
		>
			<Text>Hello</Text>
		</Box>
	)

	// Should contain ANSI256 color background codes and fill spaces
	expect(output.includes('Hello')).toBe(true)
	expect(output.includes(ansi.bgAnsi256Nine)).toBe(true)
	expect(output.includes(ansi.bgReset)).toBe(true)
})

test('Box background with border fills content area', () => {
	const output = renderToString(
		<Box
			style={{
				backgroundColor: 'cyan',
				borderStyle: 'round',
				width: 10,
				height: 5,
				alignSelf: 'flex-start',
			}}
		>
			<Text>Hi</Text>
		</Box>
	)

	// Should have background fill inside the border and border characters
	expect(output.includes('Hi')).toBe(true)
	expect(output.includes(ansi.bgCyan)).toBe(true)
	expect(output.includes(ansi.bgReset)).toBe(true)
	expect(output.includes('╭')).toBe(true)
	expect(output.includes('╮')).toBe(true)
})

test('Box background with padding fills entire padded area', () => {
	const output = renderToString(
		<Box
			style={{
				backgroundColor: 'magenta',
				padding: 1,
				width: 10,
				height: 5,
				alignSelf: 'flex-start',
			}}
		>
			<Text>Hi</Text>
		</Box>
	)

	// Background should fill the entire Box area including padding
	expect(output.includes('Hi')).toBe(true)
	expect(output.includes(ansi.bgMagenta)).toBe(true)
	expect(output.includes(ansi.bgReset)).toBe(true)
})

test('Box background with center alignment fills entire area', () => {
	const output = renderToString(
		<Box
			style={{
				backgroundColor: 'blue',
				width: 10,
				height: 3,
				justifyContent: 'center',
				alignSelf: 'flex-start',
			}}
		>
			<Text>Hi</Text>
		</Box>
	)

	expect(output.includes('Hi')).toBe(true)
	expect(output.includes(ansi.bgBlue)).toBe(true)
	expect(output.includes(ansi.bgReset)).toBe(true)
})

test('Box background with column layout fills entire area', () => {
	const output = renderToString(
		<Box
			style={{
				backgroundColor: 'green',
				flexDirection: 'column',
				width: 10,
				height: 5,
				alignSelf: 'flex-start',
			}}
		>
			<Text>Line 1</Text>
			<Text>Line 2</Text>
		</Box>
	)

	expect(output.includes('Line 1')).toBe(true)
	expect(output.includes('Line 2')).toBe(true)
	expect(output.includes(ansi.bgGreen)).toBe(true)
	expect(output.includes(ansi.bgReset)).toBe(true)
})

// Update tests using render() for comprehensive coverage
test('Box background updates on rerender', () => {
	const stdout = createStdout()

	function Test({ bgColor }: { bgColor?: string }) {
		return (
			<Box style={{ backgroundColor: bgColor, alignSelf: 'flex-start' }}>
				<Text>Hello</Text>
			</Box>
		)
	}

	const { rerender } = render(<Test />, {
		stdout,
		debug: true,
	})

	expect((stdout.write as any).lastCall.args[0]).toBe('Hello')

	rerender(<Test bgColor="green" />)
	expect((stdout.write as any).lastCall.args[0]).toBe(chalk.bgGreen('Hello'))

	rerender(<Test />)
	expect((stdout.write as any).lastCall.args[0]).toBe('Hello')
})
