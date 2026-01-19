import process from 'node:process'
import * as path from 'node:path'
import url from 'node:url'
import { createRequire } from 'node:module'
import { test, expect, describe } from 'vitest'
import { run, nodePtyAvailable } from './helpers/run'

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

// All tests in this file require node-pty
describe.skipIf(!nodePtyAvailable)('PTY exit tests', () => {
	test('exit normally without unmount() or exit()', async () => {
		const output = await run('exit-normally')
		expect(output.includes('exited')).toBe(true)
	})

	test('exit on unmount()', async () => {
		const output = await run('exit-on-unmount')
		expect(output.includes('exited')).toBe(true)
	})

	test('exit when app finishes execution', async () => {
		const ps = run('exit-on-finish')
		await expect(ps).resolves.not.toThrow()
	})

	test('exit on exit()', async () => {
		const output = await run('exit-on-exit')
		expect(output.includes('exited')).toBe(true)
	})

	test('exit on exit() with error', async () => {
		const output = await run('exit-on-exit-with-error')
		expect(output.includes('errored')).toBe(true)
	})

	test('exit on exit() with raw mode', async () => {
		const output = await run('exit-raw-on-exit')
		expect(output.includes('exited')).toBe(true)
	})

	test('exit on exit() with raw mode with error', async () => {
		const output = await run('exit-raw-on-exit-with-error')
		expect(output.includes('errored')).toBe(true)
	})

	test('exit on unmount() with raw mode', async () => {
		const output = await run('exit-raw-on-unmount')
		expect(output.includes('exited')).toBe(true)
	})

	test('exit with thrown error', async () => {
		const output = await run('exit-with-thrown-error')
		expect(output.includes('errored')).toBe(true)
	})

	test("don't exit while raw mode is active", async () => {
		if (!spawn) {
			return
		}

		await new Promise<void>((resolve, _reject) => {
			const env: Record<string, string> = {
				...process.env,

				NODE_NO_WARNINGS: '1',
			}

			const term = spawn!(
				'node',
				[
					'--loader=ts-node/esm',
					path.join(__dirname, './fixtures/exit-double-raw-mode.tsx'),
				],
				{
					name: 'xterm-color',
					cols: 100,
					cwd: __dirname,
					env,
				}
			)

			let output = ''

			term.onData((data) => {
				if (data === 's') {
					setTimeout(() => {
						expect(isExited).toBe(false)
						term.write('q')
					}, 2000)

					setTimeout(() => {
						term.kill()
						expect(true).toBe(false) // fail
						resolve()
					}, 5000)
				} else {
					output += data
				}
			})

			let isExited = false

			term.onExit(({ exitCode }) => {
				isExited = true

				if (exitCode === 0) {
					expect(output.includes('exited')).toBe(true)
					expect(true).toBe(true) // pass
					resolve()
					return
				}

				expect(true).toBe(false) // fail
				resolve()
			})
		})
	})
})
