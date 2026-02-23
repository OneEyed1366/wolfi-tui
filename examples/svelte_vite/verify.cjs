'use strict'

// WHY: Re-spawn with --conditions=browser so Node 22's require(esm) picks
// svelte's browser export (index-client.js with mount()) instead of the
// default server export (index-server.js which throws on mount()).
if (!process.env.WOLFIE_SVELTE_CONDITIONS) {
	process.env.WOLFIE_SVELTE_CONDITIONS = '1'
	const { spawnSync } = require('child_process')
	const result = spawnSync(
		process.execPath,
		['--conditions=browser', __filename],
		{ stdio: 'inherit', env: process.env }
	)
	process.exit(result.status ?? 0)
}

const log = (msg) => process.stderr.write(msg + '\n')
const { EventEmitter } = require('events')

let frames = []
const fakeStdout = Object.assign(new EventEmitter(), {
	isTTY: false,
	columns: 80,
	rows: 24,
	write: (data) => {
		frames.push(String(data))
		return true
	},
})

const fakeStdin = Object.assign(new EventEmitter(), {
	isTTY: false,
	setRawMode: () => {},
	// WHY: Svelte stdin uses data events (same as Vue/Solid, not React's readable+read)
	read: () => null,
})

//#region Swap process streams before render starts
const origStdout = process.stdout
const origStdin = process.stdin
Object.defineProperty(process, 'stdout', {
	get: () => fakeStdout,
	configurable: true,
})
Object.defineProperty(process, 'stdin', {
	get: () => fakeStdin,
	configurable: true,
})
//#endregion Swap process streams

// WHY: require AFTER stream swap — render(App) inside the bundle reads process.stdout/stdin
require('./dist/index.cjs')

const stripAnsi = (s) => s.replace(/\x1b\[[0-9;]*[A-Za-z]/g, '')
let passed = 0
let failed = 0

function check(label, actual, expected) {
	if (actual === expected) {
		log(`✔ ${label}`)
		passed++
	} else {
		log(
			`✗ ${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`
		)
		failed++
	}
}

setTimeout(() => {
	const plain0 = stripAnsi(frames.join(''))
	const match0 = plain0.match(/Counter:\s*(\d+)/)
	check('Initial render shows Counter: 0', match0?.[1], '0')
	check('Svelte Counter visible', plain0.includes('Svelte Counter'), true)

	frames = []
	fakeStdin.emit('data', Buffer.from('\x1b[A')) // upArrow

	setTimeout(() => {
		const plain1 = stripAnsi(frames.join(''))
		const match1 = plain1.match(/Counter:\s*(\d+)/)
		check('Counter increments to 1 after ↑', match1?.[1], '1')

		frames = []
		fakeStdin.emit('data', Buffer.from('\x1b[B')) // downArrow

		setTimeout(() => {
			const plain2 = stripAnsi(frames.join(''))
			const match2 = plain2.match(/Counter:\s*(\d+)/)
			check('Counter decrements to 0 after ↓', match2?.[1], '0')

			log(`\nverify.cjs: ${passed} passed, ${failed} failed`)
			Object.defineProperty(process, 'stdout', {
				get: () => origStdout,
				configurable: true,
			})
			Object.defineProperty(process, 'stdin', {
				get: () => origStdin,
				configurable: true,
			})
			process.exit(failed > 0 ? 1 : 0)
		}, 200)
	}, 200)
}, 100)
