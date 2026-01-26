import { describe, it, expect, beforeEach } from 'vitest'
import {
	registerStyles,
	clearGlobalStyles,
	getGlobalStyle,
	resolveClassName,
} from '../../src/styles/registry'

describe('Style Registry', () => {
	beforeEach(() => {
		clearGlobalStyles()
	})

	describe('registerStyles', () => {
		it('registers a single style', () => {
			registerStyles({ container: { display: 'flex' } })
			expect(getGlobalStyle('container')).toEqual({ display: 'flex' })
		})

		it('registers multiple styles', () => {
			registerStyles({
				container: { display: 'flex' },
				header: { padding: 2 },
			})
			expect(getGlobalStyle('container')).toEqual({ display: 'flex' })
			expect(getGlobalStyle('header')).toEqual({ padding: 2 })
		})

		it('last import wins for collisions', () => {
			registerStyles({ container: { padding: 1 } })
			registerStyles({ container: { padding: 2 } })
			expect(getGlobalStyle('container')).toEqual({ padding: 2 })
		})
	})

	describe('clearGlobalStyles', () => {
		it('clears all registered styles', () => {
			registerStyles({ container: { display: 'flex' } })
			clearGlobalStyles()
			expect(getGlobalStyle('container')).toBeUndefined()
		})
	})

	describe('resolveClassName', () => {
		beforeEach(() => {
			registerStyles({
				base: { padding: 1, margin: 1 },
				override: { padding: 2 },
				flex: { display: 'flex' },
			})
		})

		it('resolves null/undefined to empty object', () => {
			expect(resolveClassName(null)).toEqual({})
			expect(resolveClassName(undefined)).toEqual({})
		})

		it('passes through style objects (CSS Modules)', () => {
			const style = { display: 'flex' as const, gap: 4 }
			expect(resolveClassName(style)).toEqual(style)
		})

		it('resolves single class name from registry', () => {
			expect(resolveClassName('base')).toEqual({ padding: 1, margin: 1 })
		})

		it('resolves space-separated class names', () => {
			const result = resolveClassName('base flex')
			expect(result).toEqual({ padding: 1, margin: 1, display: 'flex' })
		})

		it('merges class names left to right (later wins)', () => {
			const result = resolveClassName('base override')
			expect(result).toEqual({ padding: 2, margin: 1 })
		})

		it('resolves array of class names', () => {
			const result = resolveClassName(['base', 'flex'])
			expect(result).toEqual({ padding: 1, margin: 1, display: 'flex' })
		})

		it('resolves mixed array (strings and objects)', () => {
			const result = resolveClassName(['base', { gap: 4 }])
			expect(result).toEqual({ padding: 1, margin: 1, gap: 4 })
		})

		it('returns empty for unknown class names', () => {
			expect(resolveClassName('unknown')).toEqual({})
		})

		it('handles extra whitespace in class string', () => {
			const result = resolveClassName('  base   flex  ')
			expect(result).toEqual({ padding: 1, margin: 1, display: 'flex' })
		})

		it('handles empty string', () => {
			expect(resolveClassName('')).toEqual({})
		})

		it('handles whitespace-only string', () => {
			expect(resolveClassName('   ')).toEqual({})
		})
	})
})
