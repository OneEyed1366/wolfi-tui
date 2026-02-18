import { describe, it, expect } from 'vitest'
import { computeTextTransform } from './text'

//#region Helpers
const ESC = String.fromCharCode(27)
const stripAnsi = (str: string) =>
	// eslint-disable-next-line no-control-regex
	str.replace(/\x1b\[[0-9;]*m/g, '')
const hasAnsi = (str: string) => str.includes(ESC + '[')
const hasBold = (str: string) => str.includes(ESC + '[1m')
const hasItalic = (str: string) => str.includes(ESC + '[3m')
const hasUnderline = (str: string) => str.includes(ESC + '[4m')
const hasStrikethrough = (str: string) => str.includes(ESC + '[9m')
//#endregion Helpers

describe('computeTextTransform', () => {
	it('returns plain text when no styles', () => {
		const transform = computeTextTransform({})
		expect(transform('hello')).toBe('hello')
	})

	it('preserves text content through transforms', () => {
		const transform = computeTextTransform({ style: { fontWeight: 'bold' } })
		expect(stripAnsi(transform('hello'))).toBe('hello')
	})

	it('applies bold', () => {
		const transform = computeTextTransform({ style: { fontWeight: 'bold' } })
		expect(hasBold(transform('hi'))).toBe(true)
	})

	it('applies italic', () => {
		const transform = computeTextTransform({ style: { fontStyle: 'italic' } })
		expect(hasItalic(transform('hi'))).toBe(true)
	})

	it('applies underline', () => {
		const transform = computeTextTransform({
			style: { textDecoration: 'underline' },
		})
		expect(hasUnderline(transform('hi'))).toBe(true)
	})

	it('applies strikethrough', () => {
		const transform = computeTextTransform({
			style: { textDecoration: 'line-through' },
		})
		expect(hasStrikethrough(transform('hi'))).toBe(true)
	})

	it('applies foreground color as ANSI escape', () => {
		const transform = computeTextTransform({ style: { color: '#ff0000' } })
		const result = transform('hi')
		expect(hasAnsi(result)).toBe(true)
		expect(stripAnsi(result)).toBe('hi')
	})

	it('applies background color from parentBg when own not set', () => {
		const transform = computeTextTransform({}, '#333333')
		const result = transform('hi')
		expect(hasAnsi(result)).toBe(true) // background ANSI code present
		expect(stripAnsi(result)).toBe('hi')
	})

	it('own backgroundColor overrides parentBg', () => {
		const transform1 = computeTextTransform(
			{ style: { backgroundColor: '#f00' } },
			'#0f0'
		)
		const transform2 = computeTextTransform(
			{ style: { backgroundColor: '#0f0' } },
			'#0f0'
		)
		expect(transform1('hi')).not.toBe(transform2('hi'))
	})

	it('no ANSI codes when no color/decoration', () => {
		const transform = computeTextTransform({})
		expect(transform('hello')).toBe('hello')
		expect(transform('hello')).not.toContain('\x1b[')
	})
})
