// examples/react_invaders/verify.cjs
// WHY: env vars must be set BEFORE any require/import — React reads them at module eval
process.env.WOLFIE_VERIFY = '1'

const { EventEmitter } = require('events')

//#region Fake Streams
function createFakeStream(cols, rows) {
	const ee = new EventEmitter()
	ee.columns = cols
	ee.rows = rows
	const frames = []
	ee.write = (data) => {
		frames.push(data)
		return true
	}
	ee.get = () => frames[frames.length - 1] ?? ''
	ee.frameCount = () => frames.length
	ee.getFrame = (i) => frames[i] ?? ''
	return ee
}

function createFakeStdin() {
	const ee = new EventEmitter()
	ee.isTTY = true
	ee.setRawMode = () => {}
	ee.setEncoding = () => {}
	ee.unref = () => {}
	ee.ref = () => {}
	// WHY: React uses readable+read() pattern, not data events.
	// buffer must dequeue one chunk per read() call.
	const buf = []
	ee.read = () => buf.shift() ?? null
	ee._send = (key) => {
		buf.push(Buffer.from(key))
		ee.emit('readable')
	}
	return ee
}
//#endregion Fake Streams

async function verify() {
	// WHY: dynamic import because react-invaders dist is ES module (lib mode Vite build)
	const { App } = await import('./dist/index.js')
	const React = await import('react')
	const { render } = await import('@wolfie/react')

	const stdout = createFakeStream(80, 24)
	const stdin = createFakeStdin()
	const stderr = createFakeStream(80, 24)

	const delay = (ms) => new Promise((r) => setTimeout(r, ms))

	// WHY: React works fine with debug: true (synchronous rendering, no frame throttle)
	const instance = render(React.createElement(App), {
		stdout,
		stdin,
		stderr,
		debug: true,
		exitOnCtrlC: false,
	})

	await delay(100)

	const { default: stripAnsiMod } = await import('strip-ansi')
	const stripAnsi =
		typeof stripAnsiMod === 'function' ? stripAnsiMod : stripAnsiMod.default

	const send = (key) => stdin._send(key)
	const DOWN = '\x1b[B'
	const UP = '\x1b[A'
	const ENTER = '\r'
	const ESC = '\x1b'

	console.log('=== MENU SCREEN (80x24) ===')
	console.log(stripAnsi(stdout.get()))

	// Help: Down×3, Enter
	;[DOWN, DOWN, DOWN, ENTER].forEach(send)
	await delay(100)
	console.log('\n=== HELP SCREEN ===')
	console.log(stripAnsi(stdout.get()))

	send(ESC)
	await delay(100)

	// Settings: Down×2, Enter
	;[DOWN, DOWN, ENTER].forEach(send)
	await delay(100)
	console.log('\n=== SETTINGS SCREEN ===')
	console.log(stripAnsi(stdout.get()))

	send(ESC)
	await delay(100)

	// High Scores: Down×1, Enter
	;[DOWN, ENTER].forEach(send)
	await delay(100)
	console.log('\n=== HIGH SCORES SCREEN ===')
	console.log(stripAnsi(stdout.get()))

	send(ESC)
	await delay(100)

	// Start Game: wrap back to top, Enter
	;[UP, UP, UP, UP, ENTER].forEach(send)
	await delay(200)
	console.log('\n=== GAME SCREEN ===')
	const gameFrame = stripAnsi(stdout.get())
	console.log(gameFrame)

	console.log('\n--- Verification ---')
	console.log('Has player (^):', gameFrame.includes('^'))
	console.log('Has HUD (SCORE):', gameFrame.includes('SCORE'))
	console.log('Total frames:', stdout.frameCount())

	instance.unmount()
	process.exit(0)
}

verify().catch((e) => {
	console.error('Verify failed:', e)
	process.exit(1)
})
