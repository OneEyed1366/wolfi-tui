import { describe, it, expect, afterEach } from 'vitest'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createLogger } from './logger'

describe('createLogger', () => {
	let tmpDir: string
	let logFile: string

	afterEach(() => {
		// WHY: clean up temp files so tests don't leave artifacts on disk
		if (tmpDir) rmSync(tmpDir, { recursive: true, force: true })
	})

	it('returns a noop logger when disabled', () => {
		const log = createLogger(false, '/dev/null')
		expect(log.enabled).toBe(false)
		// WHY: noop logger must not throw on log() calls — it will be called from hot paths
		expect(() => log.log({ ts: 0, cat: 'dom', op: 'test' })).not.toThrow()
	})

	it('writes session_start header when enabled', () => {
		tmpDir = mkdtempSync(join(tmpdir(), 'wolfie-log-test-'))
		logFile = join(tmpDir, 'test.log')
		createLogger(true, logFile)
		const content = readFileSync(logFile, 'utf8')
		const header = JSON.parse(content.trim().split('\n')[0]!)
		expect(header.op).toBe('session_start')
		expect(typeof header.pid).toBe('number')
		expect(typeof header.date).toBe('string')
	})

	it('buffers events and drains to file', async () => {
		tmpDir = mkdtempSync(join(tmpdir(), 'wolfie-log-test-'))
		logFile = join(tmpDir, 'test.log')
		const log = createLogger(true, logFile)
		log.log({
			ts: 1.0,
			cat: 'dom',
			op: 'appendChild',
			parentName: 'wolfie-root',
		})
		log.log({
			ts: 2.0,
			cat: 'layout',
			op: 'computeLayout',
			rootId: 0,
			width: 80,
			durationMs: 1.2,
		})
		// WHY: setImmediate drains async — wait a tick
		await new Promise((r) => setImmediate(r))
		const lines = readFileSync(logFile, 'utf8').trim().split('\n')
		// lines[0] = session_start header
		const event1 = JSON.parse(lines[1]!)
		expect(event1.cat).toBe('dom')
		expect(event1.op).toBe('appendChild')
		const event2 = JSON.parse(lines[2]!)
		expect(event2.cat).toBe('layout')
		expect(event2.durationMs).toBeCloseTo(1.2)
	})

	it('flush() drains buffer synchronously', () => {
		tmpDir = mkdtempSync(join(tmpdir(), 'wolfie-log-test-'))
		logFile = join(tmpDir, 'test.log')
		const log = createLogger(true, logFile)
		log.log({ ts: 1.0, cat: 'render', op: 'start' })
		log.flush()
		const lines = readFileSync(logFile, 'utf8').trim().split('\n')
		expect(lines.length).toBeGreaterThanOrEqual(2) // header + event
	})
})
