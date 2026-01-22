import EventEmitter from 'node:events'
import process from 'node:process'
import url from 'node:url'
import * as path from 'node:path'
import { createRequire } from 'node:module'
import FakeTimers from '@sinonjs/fake-timers'
import { stub } from 'sinon'
import { test, expect, describe } from 'vitest'
import React, { type ReactNode, useState } from 'react'
import ansiEscapes from 'ansi-escapes'
import stripAnsi from 'strip-ansi'
import boxen from 'boxen'
import delay from 'delay'
import { render, Box, Text, useInput } from '@wolfie/react'
import { type RenderMetrics } from '@wolfie/react'
import createStdout from './helpers/create-stdout'
import { nodePtyAvailable } from './helpers/run'

const require = createRequire(import.meta.url)

const __dirname = url.fileURLToPath(new URL('.', import.meta.url))

// Try to load node-pty (may not be available on ARM64)
let spawn: typeof import('node-pty').spawn | undefined
try {
	const pty = require('node-pty') as typeof import('node-pty')
	spawn = pty.spawn
} catch {
	// node-pty not available
}

const createStdin = () => {
	const stdin = new EventEmitter() as unknown as NodeJS.WriteStream
	stdin.isTTY = true
	stdin.setRawMode = stub()
	stdin.setEncoding = () => {}
	stdin.read = stub()
	stdin.unref = () => {}
	stdin.ref = () => {}

	return stdin
}

const emitReadable = (stdin: NodeJS.WriteStream, chunk: string) => {
	const read = stdin.read as ReturnType<typeof stub>
	read.onCall(0).returns(chunk)
	read.onCall(1).returns(null)
	stdin.emit('readable')
	read.reset()
}

const term = (fixture: string, args: string[] = []) => {
	if (!spawn) {
		throw new Error('node-pty is not available')
	}

	let resolve: (value?: unknown) => void
	let reject: (error: Error) => void

	const exitPromise = new Promise((resolve2, reject2) => {
		resolve = resolve2
		reject = reject2
	})

	const env = {
		...process.env,

		NODE_NO_WARNINGS: '1',
	}

	const ps = spawn(
		'node',
		[
			'--loader=ts-node/esm',
			path.join(__dirname, `./fixtures/${fixture}.tsx`),
			...args,
		],
		{
			name: 'xterm-color',
			cols: 100,
			cwd: __dirname,
			env,
		}
	)

	const result = {
		write(input: string) {
			ps.write(input)
		},
		output: '',
		waitForExit: async () => exitPromise,
	}

	ps.onData((data) => {
		result.output += data
	})

	ps.onExit(({ exitCode }) => {
		if (exitCode === 0) {
			resolve()
			return
		}

		reject(new Error(`Process exited with non-zero exit code: ${exitCode}`))
	})

	return result
}

// Tests that require node-pty (PTY-based terminal tests)
describe.skipIf(!nodePtyAvailable)('PTY render tests', () => {
	test('do not erase screen', async () => {
		const ps = term('erase', ['4'])
		await ps.waitForExit()
		expect(ps.output.includes(ansiEscapes.clearTerminal)).toBe(false)

		for (const letter of ['A', 'B', 'C']) {
			expect(ps.output.includes(letter)).toBe(true)
		}
	})

	test('do not erase screen where <Static> is taller than viewport', async () => {
		const ps = term('erase-with-static', ['4'])

		await ps.waitForExit()
		expect(ps.output.includes(ansiEscapes.clearTerminal)).toBe(false)

		for (const letter of ['A', 'B', 'C', 'D', 'E', 'F']) {
			expect(ps.output.includes(letter)).toBe(true)
		}
	})

	test('erase screen', async () => {
		const ps = term('erase', ['3'])
		await ps.waitForExit()
		expect(ps.output.includes(ansiEscapes.clearTerminal)).toBe(true)

		for (const letter of ['A', 'B', 'C']) {
			expect(ps.output.includes(letter)).toBe(true)
		}
	})

	test('erase screen where <Static> exists but interactive part is taller than viewport', async () => {
		const ps = term('erase', ['3'])
		await ps.waitForExit()
		expect(ps.output.includes(ansiEscapes.clearTerminal)).toBe(true)

		for (const letter of ['A', 'B', 'C']) {
			expect(ps.output.includes(letter)).toBe(true)
		}
	})

	test('erase screen where state changes', async () => {
		const ps = term('erase-with-state-change', ['4'])
		await ps.waitForExit()

		// The final frame is between the last eraseLines sequence and cursorShow
		// Split on cursorShow to isolate the final rendered content before the cursor is shown
		const beforeCursorShow = ps.output.split(ansiEscapes.cursorShow)[0]
		if (!beforeCursorShow) {
			expect(true).toBe(false) // fail
			return
		}

		// Find the last occurrence of an eraseLines sequence
		// eraseLines(1) is the minimal erase pattern used by Ink
		const eraseLinesPattern = ansiEscapes.eraseLines(1)
		const lastEraseIndex = beforeCursorShow.lastIndexOf(eraseLinesPattern)

		const lastFrame =
			lastEraseIndex === -1
				? beforeCursorShow
				: beforeCursorShow.slice(lastEraseIndex + eraseLinesPattern.length)

		const lastFrameContent = stripAnsi(lastFrame)

		for (const letter of ['A', 'B', 'C']) {
			expect(lastFrameContent.includes(letter)).toBe(false)
		}
	})

	test('erase screen where state changes in small viewport', async () => {
		const ps = term('erase-with-state-change', ['3'])
		await ps.waitForExit()

		const frames = ps.output.split(ansiEscapes.clearTerminal)
		const lastFrame = frames.at(-1)

		for (const letter of ['A', 'B', 'C']) {
			expect(lastFrame?.includes(letter)).toBe(false)
		}
	})

	test('fullscreen mode should not add extra newline at the bottom', async () => {
		const ps = term('fullscreen-no-extra-newline', ['5'])
		await ps.waitForExit()

		expect(ps.output.includes('Bottom line')).toBe(true)

		const lastFrame = ps.output.split(ansiEscapes.clearTerminal).at(-1) ?? ''

		// Check that the bottom line is at the end without extra newlines
		// In a 5-line terminal:
		// Line 1: Fullscreen: top
		// Lines 2-4: empty (from flexGrow)
		// Line 5: Bottom line (should be usable)
		const lines = lastFrame.split('\n')

		expect(lines.length).toBe(5)

		expect(lines[4]?.includes('Bottom line') ?? false).toBe(true)
	})

	test('clear output', async () => {
		const ps = term('clear')
		await ps.waitForExit()

		const secondFrame = ps.output.split(ansiEscapes.eraseLines(4))[1]

		for (const letter of ['A', 'B', 'C']) {
			expect(secondFrame?.includes(letter)).toBe(false)
		}
	})

	test('intercept console methods and display result above output', async () => {
		const ps = term('console')
		await ps.waitForExit()

		const frames = ps.output.split(ansiEscapes.eraseLines(2)).map((line) => {
			return stripAnsi(line)
		})

		expect(frames).toEqual([
			'Hello World\r\n',
			'First log\r\nHello World\r\nSecond log\r\n',
		])
	})
})

// Tests that don't require node-pty
test('rerender on resize', async () => {
	const stdout = createStdout({ columns: 10 })

	function Test() {
		return (
			<Box style={{ borderStyle: 'round' }}>
				<Text>Test</Text>
			</Box>
		)
	}

	const { unmount } = render(<Test />, { stdout })

	expect(stripAnsi((stdout.write as any).firstCall.args[0] as string)).toBe(
		boxen('Test'.padEnd(8), { borderStyle: 'round' }) + '\n'
	)

	expect(stdout.listeners('resize').length).toBe(1)

	stdout.columns = 8
	stdout.emit('resize')
	await delay(100)

	expect(stripAnsi((stdout.write as any).lastCall.args[0] as string)).toBe(
		boxen('Test'.padEnd(6), { borderStyle: 'round' }) + '\n'
	)

	unmount()
	expect(stdout.listeners('resize').length).toBe(0)
})

function ThrottleTestComponent({ text }: { readonly text: string }) {
	return <Text>{text}</Text>
}

test('throttle renders to maxFps', () => {
	const clock = FakeTimers.install() // Controls timers + Date.now()
	try {
		const stdout = createStdout()

		const { unmount, rerender } = render(
			<ThrottleTestComponent text="Hello" />,
			{
				stdout,
				maxFps: 1, // 1 Hz => ~1000 ms window
			}
		)

		// Initial render (leading call)
		expect((stdout.write as any).callCount).toBe(1)
		expect(stripAnsi((stdout.write as any).lastCall.args[0] as string)).toBe(
			'Hello\n'
		)

		// Trigger another render inside the throttle window
		rerender(<ThrottleTestComponent text="World" />)
		expect((stdout.write as any).callCount).toBe(1)

		// Advance 999 ms: still within window, no trailing call yet
		clock.tick(999)
		expect((stdout.write as any).callCount).toBe(1)

		// Cross the boundary: trailing render fires once
		clock.tick(1)
		expect((stdout.write as any).callCount).toBe(2)
		expect(stripAnsi((stdout.write as any).lastCall.args[0] as string)).toBe(
			'World\n'
		)

		unmount()
	} finally {
		clock.uninstall()
	}
})

test('outputs renderTime when onRender is passed', async () => {
	const renderTimes: number[] = []
	const funcObj = {
		onRender(metrics: RenderMetrics) {
			const { renderTime } = metrics
			renderTimes.push(renderTime)
		},
	}

	const onRenderStub = stub(funcObj, 'onRender').callThrough()

	function Test({ children }: { readonly children?: ReactNode }) {
		const [text, setText] = useState('Test')

		useInput((input) => {
			setText(input)
		})

		return (
			<Box style={{ borderStyle: 'round' }}>
				<Text>{text}</Text>
				{children}
			</Box>
		)
	}

	const stdin = createStdin()
	const { unmount, rerender } = render(<Test />, {
		onRender: onRenderStub,
		stdin,
	})

	// Initial render
	expect(onRenderStub.callCount).toBe(1)
	expect(renderTimes[0] >= 0).toBe(true)

	// Manual rerender
	onRenderStub.resetHistory()
	rerender(
		<Test>
			<Text>Updated</Text>
		</Test>
	)
	await delay(100)
	expect(onRenderStub.callCount).toBe(1)
	expect(renderTimes[1] >= 0).toBe(true)

	// Internal state update via useInput
	onRenderStub.resetHistory()
	emitReadable(stdin, 'a')
	await delay(100)
	expect(onRenderStub.callCount).toBe(1)
	expect(renderTimes[2] >= 0).toBe(true)

	// Verify all renders were tracked
	expect(renderTimes.length).toBe(3)

	unmount()
})

test('no throttled renders after unmount', () => {
	const clock = FakeTimers.install()
	try {
		const stdout = createStdout()

		const { unmount, rerender } = render(<ThrottleTestComponent text="Foo" />, {
			stdout,
		})

		expect((stdout.write as any).callCount).toBe(1)

		rerender(<ThrottleTestComponent text="Bar" />)
		rerender(<ThrottleTestComponent text="Baz" />)
		unmount()

		const callCountAfterUnmount = (stdout.write as any).callCount

		// Regression test for https://github.com/vadimdemedes/ink/issues/692
		clock.tick(1000)
		expect((stdout.write as any).callCount).toBe(callCountAfterUnmount)
	} finally {
		clock.uninstall()
	}
})
