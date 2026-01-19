import process from 'node:process'
import { createRequire } from 'node:module'
import path from 'node:path'
import url from 'node:url'

const require = createRequire(import.meta.url)

const __dirname = url.fileURLToPath(new URL('.', import.meta.url))

// Try to load node-pty, which may not be available on some platforms (e.g., ARM64)
let spawn: typeof import('node-pty').spawn | undefined
export let nodePtyAvailable = false

try {
	const pty = require('node-pty') as typeof import('node-pty')
	spawn = pty.spawn
	nodePtyAvailable = true
} catch {
	// node-pty not available
}

type Run = (
	fixture: string,
	props?: { env?: Record<string, string>; columns?: number }
) => Promise<string>

export const run: Run = async (fixture, props) => {
	if (!spawn) {
		throw new Error('node-pty is not available on this platform')
	}

	const env: Record<string, string> = {
		...(process.env as Record<string, string>),

		CI: 'false',
		...props?.env,

		NODE_NO_WARNINGS: '1',
	}

	return new Promise<string>((resolve, reject) => {
		const term = spawn!(
			'node',
			[
				'--loader=ts-node/esm',
				path.join(__dirname, `/../fixtures/${fixture}.tsx`),
			],
			{
				name: 'xterm-color',
				cols: typeof props?.columns === 'number' ? props.columns : 100,
				cwd: __dirname,
				env,
			}
		)

		let output = ''

		term.onData((data) => {
			output += data
		})

		term.onExit(({ exitCode }) => {
			if (exitCode === 0) {
				resolve(output)
				return
			}

			reject(new Error(`Process exited with a non-zero code: ${exitCode}`))
		})
	})
}
