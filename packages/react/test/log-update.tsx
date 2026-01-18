import { test, expect } from 'vitest'
import ansiEscapes from 'ansi-escapes'
import { logUpdate } from '@wolfie/core'
import createStdout from './helpers/create-stdout.js'

test('standard rendering - renders and updates output', () => {
	const stdout = createStdout()
	const render = logUpdate.create(stdout)

	render('Hello')
	expect((stdout.write as any).callCount).toBe(1)
	expect((stdout.write as any).firstCall.args[0]).toBe('Hello\n')

	render('World')
	expect((stdout.write as any).callCount).toBe(2)
	expect(
		((stdout.write as any).secondCall.args[0] as string).includes('World')
	).toBe(true)
})

test('standard rendering - skips identical output', () => {
	const stdout = createStdout()
	const render = logUpdate.create(stdout)

	render('Hello')
	render('Hello')

	expect((stdout.write as any).callCount).toBe(1)
})

test('incremental rendering - renders and updates output', () => {
	const stdout = createStdout()
	const render = logUpdate.create(stdout, { incremental: true })

	render('Hello')
	expect((stdout.write as any).callCount).toBe(1)
	expect((stdout.write as any).firstCall.args[0]).toBe('Hello\n')

	render('World')
	expect((stdout.write as any).callCount).toBe(2)
	expect(
		((stdout.write as any).secondCall.args[0] as string).includes('World')
	).toBe(true)
})

test('incremental rendering - skips identical output', () => {
	const stdout = createStdout()
	const render = logUpdate.create(stdout, { incremental: true })

	render('Hello')
	render('Hello')

	expect((stdout.write as any).callCount).toBe(1)
})

test('incremental rendering - surgical updates', () => {
	const stdout = createStdout()
	const render = logUpdate.create(stdout, { incremental: true })

	render('Line 1\nLine 2\nLine 3')
	render('Line 1\nUpdated\nLine 3')

	const secondCall = (stdout.write as any).secondCall.args[0] as string
	expect(secondCall.includes(ansiEscapes.cursorNextLine)).toBe(true) // Skips unchanged lines
	expect(secondCall.includes('Updated')).toBe(true) // Only updates changed line
	expect(secondCall.includes('Line 1')).toBe(false) // Doesn't rewrite unchanged
	expect(secondCall.includes('Line 3')).toBe(false) // Doesn't rewrite unchanged
})

test('incremental rendering - clears extra lines when output shrinks', () => {
	const stdout = createStdout()
	const render = logUpdate.create(stdout, { incremental: true })

	render('Line 1\nLine 2\nLine 3')
	render('Line 1')

	const secondCall = (stdout.write as any).secondCall.args[0] as string
	expect(secondCall.includes(ansiEscapes.eraseLines(2))).toBe(true) // Erases 2 extra lines
})

test('incremental rendering - when output grows', () => {
	const stdout = createStdout()
	const render = logUpdate.create(stdout, { incremental: true })

	render('Line 1')
	render('Line 1\nLine 2\nLine 3')

	const secondCall = (stdout.write as any).secondCall.args[0] as string
	expect(secondCall.includes(ansiEscapes.cursorNextLine)).toBe(true) // Skips unchanged first line
	expect(secondCall.includes('Line 2')).toBe(true) // Adds new line
	expect(secondCall.includes('Line 3')).toBe(true) // Adds new line
	expect(secondCall.includes('Line 1')).toBe(false) // Doesn't rewrite unchanged
})

test('incremental rendering - single write call with multiple surgical updates', () => {
	const stdout = createStdout()
	const render = logUpdate.create(stdout, { incremental: true })

	render(
		'Line 1\nLine 2\nLine 3\nLine 4\nLine 5\nLine 6\nLine 7\nLine 8\nLine 9\nLine 10'
	)
	render(
		'Line 1\nUpdated 2\nLine 3\nUpdated 4\nLine 5\nUpdated 6\nLine 7\nUpdated 8\nLine 9\nUpdated 10'
	)

	expect((stdout.write as any).callCount).toBe(2) // Only 2 writes total (initial + update)
})

test('incremental rendering - shrinking output keeps screen tight', () => {
	const stdout = createStdout()
	const render = logUpdate.create(stdout, { incremental: true })

	render('Line 1\nLine 2\nLine 3')
	render('Line 1\nLine 2')
	render('Line 1')

	const thirdCall = stdout.get()

	expect(thirdCall).toBe(
		ansiEscapes.eraseLines(2) + // Erase Line 2 and ending cursorNextLine
			ansiEscapes.cursorUp(1) + // Move to beginning of Line 1
			ansiEscapes.cursorNextLine // Move to next line after Line 1
	)
})

test('incremental rendering - clear() fully resets incremental state', () => {
	const stdout = createStdout()
	const render = logUpdate.create(stdout, { incremental: true })

	render('Line 1\nLine 2\nLine 3')
	render.clear()
	render('Line 1')

	const afterClear = stdout.get()

	expect(afterClear).toBe(ansiEscapes.eraseLines(0) + 'Line 1\n') // Should do a fresh write
})

test('incremental rendering - done() resets before next render', () => {
	const stdout = createStdout()
	const render = logUpdate.create(stdout, { incremental: true })

	render('Line 1\nLine 2\nLine 3')
	render.done()
	render('Line 1')

	const afterDone = stdout.get()

	expect(afterDone).toBe(ansiEscapes.eraseLines(0) + 'Line 1\n') // Should do a fresh write
})

test('incremental rendering - multiple consecutive clear() calls (should be harmless no-ops)', () => {
	const stdout = createStdout()
	const render = logUpdate.create(stdout, { incremental: true })

	render('Line 1\nLine 2\nLine 3')
	render.clear()
	render.clear()
	render.clear()

	expect((stdout.write as any).callCount).toBe(4) // Initial render + 3 clears (each writes eraseLines)

	// Verify state is properly reset after multiple clears
	render('New content')
	const afterClears = stdout.get()
	expect(afterClears).toBe(ansiEscapes.eraseLines(0) + 'New content\n') // Should do a fresh write
})

test('incremental rendering - sync() followed by update (assert incremental path is used)', () => {
	const stdout = createStdout()
	const render = logUpdate.create(stdout, { incremental: true })

	render.sync('Line 1\nLine 2\nLine 3')
	expect((stdout.write as any).callCount).toBe(0) // The sync() call shouldn't write to stdout

	render('Line 1\nUpdated\nLine 3')
	expect((stdout.write as any).callCount).toBe(1)

	const firstCall = (stdout.write as any).firstCall.args[0] as string
	expect(firstCall.includes(ansiEscapes.cursorNextLine)).toBe(true) // Skips unchanged lines
	expect(firstCall.includes('Updated')).toBe(true) // Only updates changed line
	expect(firstCall.includes('Line 1')).toBe(false) // Doesn't rewrite unchanged
	expect(firstCall.includes('Line 3')).toBe(false) // Doesn't rewrite unchanged
})

test('incremental rendering - render to empty string (full clear vs early exit)', () => {
	const stdout = createStdout()
	const render = logUpdate.create(stdout, { incremental: true })

	render('Line 1\nLine 2\nLine 3')
	render('')

	expect((stdout.write as any).callCount).toBe(2)
	const secondCall = (stdout.write as any).secondCall.args[0] as string
	expect(secondCall).toBe(ansiEscapes.eraseLines(4) + '\n') // Erases all 4 lines + writes single newline

	// Rendering empty string again should be skipped (identical output)
	render('')
	expect((stdout.write as any).callCount).toBe(2) // No additional write
})
