import { describe, it, expect } from 'vitest'
import {
	computeBoxStyle,
	computeBoxBackground,
	DEFAULT_BOX_STYLES,
} from './box'

describe('computeBoxStyle', () => {
	it('applies overflow:visible by default', () => {
		const style = computeBoxStyle({})
		expect(style.overflowX).toBe('visible')
		expect(style.overflowY).toBe('visible')
	})

	it('overflow shorthand expands to overflowX and overflowY', () => {
		const style = computeBoxStyle({ style: { overflow: 'hidden' } as any })
		expect(style.overflowX).toBe('hidden')
		expect(style.overflowY).toBe('hidden')
	})

	it('overflowX/Y override overflow shorthand', () => {
		const style = computeBoxStyle({
			style: { overflow: 'hidden', overflowX: 'visible' } as any,
		})
		expect(style.overflowX).toBe('visible')
		expect(style.overflowY).toBe('hidden')
	})

	it('style props override className', () => {
		const style = computeBoxStyle({
			style: { padding: 4 },
		})
		expect(style.padding).toBe(4)
	})

	it('applies default flex box styles', () => {
		const style = computeBoxStyle({})
		expect(style.flexDirection).toBe('row')
		expect(style.flexWrap).toBe('nowrap')
		expect(style.flexGrow).toBe(0)
		expect(style.flexShrink).toBe(1)
	})

	it('uses own backgroundColor over parentBg', () => {
		const style = computeBoxStyle(
			{ style: { backgroundColor: '#f00' } },
			'#0f0'
		)
		expect(style.backgroundColor).toBe('#f00')
	})

	it('falls back to parentBg when no own backgroundColor', () => {
		const style = computeBoxStyle({}, '#0f0')
		expect(style.backgroundColor).toBe('#0f0')
	})
})

describe('computeBoxBackground', () => {
	it('returns own backgroundColor', () => {
		const bg = computeBoxBackground({ style: { backgroundColor: '#f00' } })
		expect(bg).toBe('#f00')
	})

	it('returns parentBg when own not set', () => {
		const bg = computeBoxBackground({}, '#0f0')
		expect(bg).toBe('#0f0')
	})

	it('returns undefined when neither set', () => {
		const bg = computeBoxBackground({})
		expect(bg).toBeUndefined()
	})

	it('own bg overrides parentBg', () => {
		const bg = computeBoxBackground(
			{ style: { backgroundColor: '#f00' } },
			'#0f0'
		)
		expect(bg).toBe('#f00')
	})
})

describe('DEFAULT_BOX_STYLES', () => {
	it('contains expected flex defaults', () => {
		expect(DEFAULT_BOX_STYLES.flexDirection).toBe('row')
		expect(DEFAULT_BOX_STYLES.flexWrap).toBe('nowrap')
		expect(DEFAULT_BOX_STYLES.flexGrow).toBe(0)
		expect(DEFAULT_BOX_STYLES.flexShrink).toBe(1)
	})
})
