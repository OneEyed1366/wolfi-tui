#!/usr/bin/env node
// scripts/analyze-log.js — WOLFIE_LOG JSONL analysis tool
// Usage:
//   node scripts/analyze-log.js wolfie.log --summary
//   node scripts/analyze-log.js wolfie.log --cat layout
//   node scripts/analyze-log.js wolfie.log --op setStyle
//   node scripts/analyze-log.js wolfie.log --last 50
//   node scripts/analyze-log.js react.log angular.log --diff

const { readFileSync } = require('fs')
const args = process.argv.slice(2)

function parseLog(path) {
	return readFileSync(path, 'utf8')
		.split('\n')
		.filter(Boolean)
		.map((line) => {
			try {
				return JSON.parse(line)
			} catch {
				return null
			}
		})
		.filter(Boolean)
}

function summary(events) {
	const counts = {}
	for (const e of events) {
		const k = `${e.cat}:${e.op}`
		counts[k] = (counts[k] ?? 0) + 1
	}
	const sorted = Object.entries(counts).sort(([, a], [, b]) => b - a)
	console.log('\ncat:op                          count')
	console.log('─'.repeat(40))
	for (const [k, n] of sorted) {
		console.log(k.padEnd(32), n)
	}
	console.log('─'.repeat(40))
	console.log('Total events:', events.length)
}

function diff(eventsA, eventsB, labelA, labelB) {
	const countFor = (events) => {
		const c = {}
		for (const e of events) {
			const k = `${e.cat}:${e.op}`
			c[k] = (c[k] ?? 0) + 1
		}
		return c
	}
	const cA = countFor(eventsA)
	const cB = countFor(eventsB)
	const keys = [...new Set([...Object.keys(cA), ...Object.keys(cB)])].sort()

	const pad = (s, n) => String(s).padStart(n)
	console.log(
		`\n${'cat:op'.padEnd(32)} ${labelA.padStart(8)} ${labelB.padStart(8)} ${'diff'.padStart(8)}`
	)
	console.log('─'.repeat(60))
	for (const k of keys) {
		const a = cA[k] ?? 0
		const b = cB[k] ?? 0
		const d = b - a
		const flag = d !== 0 ? (d > 0 ? ' ▲' : ' ▼') : ''
		console.log(`${k.padEnd(32)} ${pad(a, 8)} ${pad(b, 8)} ${pad(d, 8)}${flag}`)
	}
}

// Parse CLI
const logFiles = args.filter((a) => !a.startsWith('-'))
const modeFlag = args.find((a) => a.startsWith('--'))
const mode = modeFlag?.replace('--', '') ?? 'summary'
const modeFlagIdx = modeFlag ? args.indexOf(modeFlag) : -1
const modeArg = modeFlagIdx >= 0 ? args[modeFlagIdx + 1] : undefined

if (logFiles.length === 0) {
	console.error(
		'Usage: node scripts/analyze-log.js <file> [file2] --<mode> [arg]'
	)
	console.error(
		'Modes: --summary  --cat <name>  --op <name>  --last <N>  --diff'
	)
	process.exit(1)
}

const eventsA = parseLog(logFiles[0])

if (mode === 'diff') {
	if (logFiles.length < 2) {
		console.error('--diff requires two log files')
		process.exit(1)
	}
	const eventsB = parseLog(logFiles[1])
	diff(eventsA, eventsB, logFiles[0], logFiles[1])
} else if (mode === 'summary') {
	summary(eventsA)
} else if (mode === 'cat') {
	const filtered = eventsA.filter((e) => e.cat === modeArg)
	filtered.forEach((e) => console.log(JSON.stringify(e)))
	console.error(`\n(${filtered.length} events with cat=${modeArg})`)
} else if (mode === 'op') {
	const filtered = eventsA.filter((e) => e.op === modeArg)
	filtered.forEach((e) => console.log(JSON.stringify(e)))
	console.error(`\n(${filtered.length} events with op=${modeArg})`)
} else if (mode === 'last') {
	const n = parseInt(modeArg) || 20
	eventsA.slice(-n).forEach((e) => console.log(JSON.stringify(e)))
} else {
	console.error(`Unknown mode: ${mode}`)
	process.exit(1)
}
