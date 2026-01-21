import { describe, it, expect } from 'vitest'
import { parseNumeric, parseNumericOrPercent } from '../src/values'

describe('parseNumeric', () => {
	it('parses unitless numbers', () => {
		expect(parseNumeric('10')).toBe(10)
		expect(parseNumeric('0')).toBe(0)
		expect(parseNumeric('10.5')).toBe(11) // Rounded
	})

	it('parses px (1px = 0.25 cells)', () => {
		expect(parseNumeric('4px')).toBe(1)
		expect(parseNumeric('16px')).toBe(4)
		expect(parseNumeric('10px')).toBe(3) // 2.5 -> 3
		expect(parseNumeric('1px')).toBe(0) // 0.25 -> 0
		expect(parseNumeric('2px')).toBe(1) // 0.5 -> 1
	})

	it('parses rem/em (1rem = 4 cells)', () => {
		expect(parseNumeric('1rem')).toBe(4)
		expect(parseNumeric('0.25rem')).toBe(1)
		expect(parseNumeric('2rem')).toBe(8)
		expect(parseNumeric('1em')).toBe(4)
		expect(parseNumeric('0.5em')).toBe(2)
	})

	it('parses ch (1ch = 1 cell)', () => {
		expect(parseNumeric('1ch')).toBe(1)
		expect(parseNumeric('10ch')).toBe(10)
		expect(parseNumeric('0.5ch')).toBe(1) // Rounded
	})

	it('parses points (1pt = 1.333px)', () => {
		// 12pt = 16px = 4 cells
		expect(parseNumeric('12pt')).toBe(4)
		// 3pt = 4px = 1 cell
		expect(parseNumeric('3pt')).toBe(1)
	})

	it('parses picas (1pc = 12pt = 1rem = 4 cells)', () => {
		expect(parseNumeric('1pc')).toBe(4)
		expect(parseNumeric('2pc')).toBe(8)
	})

	it('parses inches (1in = 96px = 24 cells)', () => {
		expect(parseNumeric('1in')).toBe(24)
		expect(parseNumeric('0.5in')).toBe(12)
	})

	it('parses cm/mm', () => {
		// 1cm = 37.8px / 4 = 9.45 cells -> 9 or 10
		expect(parseNumeric('1cm')).toBe(9)
		// 10mm = 1cm
		expect(parseNumeric('10mm')).toBe(9)
	})

	it('handles keywords', () => {
		expect(parseNumeric('auto')).toBe(0)
		expect(parseNumeric('inherit')).toBe(0)
		expect(parseNumeric('initial')).toBe(0)
	})
})

describe('parseNumericOrPercent', () => {
	it('parses numbers', () => {
		expect(parseNumericOrPercent('10')).toBe(10)
		expect(parseNumericOrPercent('4px')).toBe(1)
	})

	it('preserves percentages', () => {
		expect(parseNumericOrPercent('50%')).toBe('50%')
		expect(parseNumericOrPercent('100%')).toBe('100%')
		expect(parseNumericOrPercent('0%')).toBe('0%')
	})

	it('preserves viewport units as-is', () => {
		expect(parseNumericOrPercent('50vw')).toBe('50vw')
		expect(parseNumericOrPercent('100vh')).toBe('100vh')
		expect(parseNumericOrPercent('33.3vmin')).toBe('33.3vmin')
		expect(parseNumericOrPercent('25vmax')).toBe('25vmax')
	})

	it('handles invalid inputs gracefully', () => {
		expect(parseNumericOrPercent('foo')).toBe(0)
	})
})
