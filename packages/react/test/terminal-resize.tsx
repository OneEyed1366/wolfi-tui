import { test, expect } from 'vitest'
import delay from 'delay'
import stripAnsi from 'strip-ansi'
import React from 'react'
import { render, Box, Text } from '@wolfie/react'
import createStdout from './helpers/create-stdout'

test('clear screen when terminal width decreases', async () => {
	const stdout = createStdout({ columns: 100 })

	function Test() {
		return (
			<Box borderStyle="round">
				<Text>Hello World</Text>
			</Box>
		)
	}

	render(<Test />, { stdout })

	const initialOutput = stripAnsi(
		(stdout.write as any).firstCall.args[0] as string
	)
	expect(initialOutput.includes('Hello World')).toBe(true)
	expect(initialOutput.includes('╭')).toBe(true) // Box border

	// Decrease width - should trigger clear and rerender
	stdout.columns = 50
	stdout.emit('resize')
	await delay(100)

	// Verify the output was updated for smaller width
	const lastOutput = stripAnsi((stdout.write as any).lastCall.args[0] as string)
	expect(lastOutput.includes('Hello World')).toBe(true)
	expect(lastOutput.includes('╭')).toBe(true) // Box border
	expect(initialOutput).not.toBe(lastOutput) // Output should change due to width
})

test('no screen clear when terminal width increases', async () => {
	const stdout = createStdout({ columns: 50 })

	function Test() {
		return (
			<Box borderStyle="round">
				<Text>Test</Text>
			</Box>
		)
	}

	render(<Test />, { stdout })

	const initialOutput = (stdout.write as any).firstCall.args[0] as string

	// Increase width - should rerender but not clear
	stdout.columns = 100
	stdout.emit('resize')
	await delay(100)

	const lastOutput = (stdout.write as any).lastCall.args[0] as string

	// When increasing width, we don't clear, so we should see eraseLines used for incremental update
	// But when decreasing, the clear() is called which also uses eraseLines
	// The key difference: decreasing width triggers an explicit clear before render
	expect(stripAnsi(initialOutput)).not.toBe(stripAnsi(lastOutput))
	expect(stripAnsi(lastOutput).includes('Test')).toBe(true)
})

test('consecutive width decreases trigger screen clear each time', async () => {
	const stdout = createStdout({ columns: 100 })

	function Test() {
		return (
			<Box borderStyle="round">
				<Text>Content</Text>
			</Box>
		)
	}

	render(<Test />, { stdout })

	const initialOutput = stripAnsi(
		(stdout.write as any).firstCall.args[0] as string
	)

	// First decrease
	stdout.columns = 80
	stdout.emit('resize')
	await delay(100)

	const afterFirstDecrease = stripAnsi(
		(stdout.write as any).lastCall.args[0] as string
	)
	expect(initialOutput).not.toBe(afterFirstDecrease)
	expect(afterFirstDecrease.includes('Content')).toBe(true)

	// Second decrease
	stdout.columns = 60
	stdout.emit('resize')
	await delay(100)

	const afterSecondDecrease = stripAnsi(
		(stdout.write as any).lastCall.args[0] as string
	)
	expect(afterFirstDecrease).not.toBe(afterSecondDecrease)
	expect(afterSecondDecrease.includes('Content')).toBe(true)
})

test('width decrease clears lastOutput to force rerender', async () => {
	const stdout = createStdout({ columns: 100 })

	function Test() {
		return (
			<Box borderStyle="round">
				<Text>Test Content</Text>
			</Box>
		)
	}

	const { rerender } = render(<Test />, { stdout })

	const initialOutput = stripAnsi(
		(stdout.write as any).firstCall.args[0] as string
	)

	// Decrease width - with a border, this will definitely change the output
	stdout.columns = 50
	stdout.emit('resize')
	await delay(100)

	const afterResizeOutput = stripAnsi(
		(stdout.write as any).lastCall.args[0] as string
	)

	// Outputs should be different because the border width changed
	expect(initialOutput).not.toBe(afterResizeOutput)
	expect(afterResizeOutput.includes('Test Content')).toBe(true)

	// Now try to rerender with a different component
	rerender(
		<Box borderStyle="round">
			<Text>Updated Content</Text>
		</Box>
	)
	await delay(100)

	// Verify content was updated
	expect(
		stripAnsi((stdout.write as any).lastCall.args[0] as string).includes(
			'Updated Content'
		)
	).toBe(true)
})
