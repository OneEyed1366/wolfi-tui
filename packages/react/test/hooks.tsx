import process from 'node:process'
import url from 'node:url'
import path from 'node:path'
import { createRequire } from 'node:module'
import { test, expect, describe } from 'vitest'
import stripAnsi from 'strip-ansi'
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

const term = (fixture: string, args: string[] = []) => {
	if (!spawn) {
		throw new Error('node-pty is not available')
	}

	let resolve: (value?: any) => void
	let reject: (error?: Error) => void

	const exitPromise = new Promise((resolve2, reject2) => {
		resolve = resolve2
		reject = reject2
	})

	const env: Record<string, string> = {
		...process.env,

		NODE_NO_WARNINGS: '1',

		CI: 'false',
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
			// Give TS and Ink time to start up and render UI
			// TODO: Send a signal from the Ink process when it's ready to accept input instead
			setTimeout(() => {
				ps.write(input)
			}, 3000)
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

// All tests in this file require node-pty
describe.skipIf(!nodePtyAvailable)('PTY hook tests', () => {
	test('useInput - handle lowercase character', async () => {
		const ps = term('use-input', ['lowercase'])
		ps.write('q')
		await ps.waitForExit()
		expect(ps.output.includes('exited')).toBe(true)
	})

	test('useInput - handle uppercase character', async () => {
		const ps = term('use-input', ['uppercase'])
		ps.write('Q')
		await ps.waitForExit()
		expect(ps.output.includes('exited')).toBe(true)
	})

	test('useInput - \\r should not count as an uppercase character', async () => {
		const ps = term('use-input', ['uppercase'])
		ps.write('\r')
		await ps.waitForExit()
		expect(ps.output.includes('exited')).toBe(true)
	})

	test('useInput - pasted carriage return', async () => {
		const ps = term('use-input', ['pastedCarriageReturn'])
		ps.write('\rtest')
		await ps.waitForExit()
		expect(ps.output.includes('exited')).toBe(true)
	})

	test('useInput - pasted tab', async () => {
		const ps = term('use-input', ['pastedTab'])
		ps.write('\ttest')
		await ps.waitForExit()
		expect(ps.output.includes('exited')).toBe(true)
	})

	test('useInput - handle escape', async () => {
		const ps = term('use-input', ['escape'])
		ps.write('\u001B')
		await ps.waitForExit()
		expect(ps.output.includes('exited')).toBe(true)
	})

	test('useInput - handle ctrl', async () => {
		const ps = term('use-input', ['ctrl'])
		ps.write('\u0006')
		await ps.waitForExit()
		expect(ps.output.includes('exited')).toBe(true)
	})

	test('useInput - handle meta', async () => {
		const ps = term('use-input', ['meta'])
		ps.write('\u001Bm')
		await ps.waitForExit()
		expect(ps.output.includes('exited')).toBe(true)
	})

	test('useInput - handle up arrow', async () => {
		const ps = term('use-input', ['upArrow'])
		ps.write('\u001B[A')
		await ps.waitForExit()
		expect(ps.output.includes('exited')).toBe(true)
	})

	test('useInput - handle down arrow', async () => {
		const ps = term('use-input', ['downArrow'])
		ps.write('\u001B[B')
		await ps.waitForExit()
		expect(ps.output.includes('exited')).toBe(true)
	})

	test('useInput - handle left arrow', async () => {
		const ps = term('use-input', ['leftArrow'])
		ps.write('\u001B[D')
		await ps.waitForExit()
		expect(ps.output.includes('exited')).toBe(true)
	})

	test('useInput - handle right arrow', async () => {
		const ps = term('use-input', ['rightArrow'])
		ps.write('\u001B[C')
		await ps.waitForExit()
		expect(ps.output.includes('exited')).toBe(true)
	})

	test('useInput - handle meta + up arrow', async () => {
		const ps = term('use-input', ['upArrowMeta'])
		ps.write('\u001B\u001B[A')
		await ps.waitForExit()
		expect(ps.output.includes('exited')).toBe(true)
	})

	test('useInput - handle meta + down arrow', async () => {
		const ps = term('use-input', ['downArrowMeta'])
		ps.write('\u001B\u001B[B')
		await ps.waitForExit()
		expect(ps.output.includes('exited')).toBe(true)
	})

	test('useInput - handle meta + left arrow', async () => {
		const ps = term('use-input', ['leftArrowMeta'])
		ps.write('\u001B\u001B[D')
		await ps.waitForExit()
		expect(ps.output.includes('exited')).toBe(true)
	})

	test('useInput - handle meta + right arrow', async () => {
		const ps = term('use-input', ['rightArrowMeta'])
		ps.write('\u001B\u001B[C')
		await ps.waitForExit()
		expect(ps.output.includes('exited')).toBe(true)
	})

	test('useInput - handle ctrl + up arrow', async () => {
		const ps = term('use-input', ['upArrowCtrl'])
		ps.write('\u001B[1;5A')
		await ps.waitForExit()
		expect(ps.output.includes('exited')).toBe(true)
	})

	test('useInput - handle ctrl + down arrow', async () => {
		const ps = term('use-input', ['downArrowCtrl'])
		ps.write('\u001B[1;5B')
		await ps.waitForExit()
		expect(ps.output.includes('exited')).toBe(true)
	})

	test('useInput - handle ctrl + left arrow', async () => {
		const ps = term('use-input', ['leftArrowCtrl'])
		ps.write('\u001B[1;5D')
		await ps.waitForExit()
		expect(ps.output.includes('exited')).toBe(true)
	})

	test('useInput - handle ctrl + right arrow', async () => {
		const ps = term('use-input', ['rightArrowCtrl'])
		ps.write('\u001B[1;5C')
		await ps.waitForExit()
		expect(ps.output.includes('exited')).toBe(true)
	})

	test('useInput - handle page down', async () => {
		const ps = term('use-input', ['pageDown'])
		ps.write('\u001B[6~')
		await ps.waitForExit()
		expect(ps.output.includes('exited')).toBe(true)
	})

	test('useInput - handle page up', async () => {
		const ps = term('use-input', ['pageUp'])
		ps.write('\u001B[5~')
		await ps.waitForExit()
		expect(ps.output.includes('exited')).toBe(true)
	})

	test('useInput - handle home', async () => {
		const ps = term('use-input', ['home'])
		ps.write('\u001B[H')
		await ps.waitForExit()
		expect(ps.output.includes('exited')).toBe(true)
	})

	test('useInput - handle end', async () => {
		const ps = term('use-input', ['end'])
		ps.write('\u001B[F')
		await ps.waitForExit()
		expect(ps.output.includes('exited')).toBe(true)
	})

	test('useInput - handle tab', async () => {
		const ps = term('use-input', ['tab'])
		ps.write('\t')
		await ps.waitForExit()
		expect(ps.output.includes('exited')).toBe(true)
	})

	test('useInput - handle shift + tab', async () => {
		const ps = term('use-input', ['shiftTab'])
		ps.write('\u001B[Z')
		await ps.waitForExit()
		expect(ps.output.includes('exited')).toBe(true)
	})

	test('useInput - handle backspace', async () => {
		const ps = term('use-input', ['backspace'])
		ps.write('\u0008')
		await ps.waitForExit()
		expect(ps.output.includes('exited')).toBe(true)
	})

	test('useInput - handle delete', async () => {
		const ps = term('use-input', ['delete'])
		ps.write('\u007F')
		await ps.waitForExit()
		expect(ps.output.includes('exited')).toBe(true)
	})

	test('useInput - handle remove (delete)', async () => {
		const ps = term('use-input', ['remove'])
		ps.write('\u001B[3~')
		await ps.waitForExit()
		expect(ps.output.includes('exited')).toBe(true)
	})

	test('useInput - ignore input if not active', async () => {
		const ps = term('use-input-multiple')
		ps.write('x')
		await ps.waitForExit()
		expect(ps.output.includes('xx')).toBe(false)
		expect(ps.output.includes('x')).toBe(true)
		expect(ps.output.includes('exited')).toBe(true)
	})

	// For some reason this test is flaky, so we have to resort to retrying
	test('useInput - handle Ctrl+C when `exitOnCtrlC` is `false`', async () => {
		const run = async () => {
			const ps = term('use-input-ctrl-c')
			ps.write('\u0003')
			await ps.waitForExit()
			return ps.output.includes('exited')
		}

		let passed = await run()

		if (!passed) {
			passed = await run()
		}

		if (!passed) {
			passed = await run()
		}

		expect(passed).toBe(true)
	})

	test('useStdout - write to stdout', async () => {
		const ps = term('use-stdout')
		await ps.waitForExit()

		const lines = stripAnsi(ps.output).split('\r\n')

		expect(lines.slice(1, -1)).toEqual([
			'Hello from Ink to stdout',
			'Hello World',
			'exited',
		])
	})

	// `node-pty` doesn't support streaming stderr output, so I need to figure out
	// how to test useStderr() hook. child_process.spawn() can't be used, because
	// Ink fails with "raw mode unsupported" error.
	test.todo('useStderr - write to stderr')
})
