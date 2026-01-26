import { describe, it, expect, beforeEach } from 'vitest'
import {
	registerStyles,
	clearGlobalStyles,
	resolveClassName,
} from '../../src/styles/registry'

describe('Compound Selectors', () => {
	beforeEach(() => {
		clearGlobalStyles()
	})

	describe('Basic compound resolution', () => {
		it('resolves .btn.primary from className="btn primary"', () => {
			registerStyles({
				'btn.primary': { borderStyle: 'single', borderColor: 'magenta' },
			})
			const result = resolveClassName('btn primary')
			expect(result).toEqual({ borderStyle: 'single', borderColor: 'magenta' })
		})

		it('resolves .btn.primary from className="primary btn" (order-independent)', () => {
			registerStyles({
				'btn.primary': { borderStyle: 'single', borderColor: 'magenta' },
			})
			const result = resolveClassName('primary btn')
			expect(result).toEqual({ borderStyle: 'single', borderColor: 'magenta' })
		})

		it('merges individual classes when compound not found', () => {
			registerStyles({
				btn: { padding: 1 },
				primary: { borderColor: 'magenta' },
			})
			const result = resolveClassName('btn primary')
			expect(result).toEqual({ padding: 1, borderColor: 'magenta' })
		})
	})

	describe('Multi-word compound selectors', () => {
		it('resolves .btn.primary.large from 3-word className', () => {
			registerStyles({
				'btn.primary.large': { padding: 4, fontWeight: 'bold' },
			})
			const result = resolveClassName('btn primary large')
			expect(result).toEqual({ padding: 4, fontWeight: 'bold' })
		})

		it('resolves .card.title.subtitle from 3-word className', () => {
			registerStyles({
				'card.title.subtitle': { color: 'cyan', fontStyle: 'italic' },
			})
			const result = resolveClassName('card title subtitle')
			expect(result).toEqual({ color: 'cyan', fontStyle: 'italic' })
		})

		it('handles different permutations of 3-word compounds', () => {
			registerStyles({
				'a.b.c': { padding: 1 },
			})
			expect(resolveClassName('a b c')).toEqual({ padding: 1 })
			expect(resolveClassName('a c b')).toEqual({ padding: 1 })
			expect(resolveClassName('b a c')).toEqual({ padding: 1 })
			expect(resolveClassName('b c a')).toEqual({ padding: 1 })
			expect(resolveClassName('c a b')).toEqual({ padding: 1 })
			expect(resolveClassName('c b a')).toEqual({ padding: 1 })
		})
	})

	describe('Priority and precedence', () => {
		it('prioritizes exact match over compound', () => {
			registerStyles({
				'btn primary': { padding: 4 },
				'btn.primary': { padding: 2 },
			})
			const result = resolveClassName('btn primary')
			expect(result).toEqual({ padding: 4 })
		})

		it('prioritizes compound over individual classes', () => {
			registerStyles({
				btn: { padding: 1 },
				primary: { padding: 1 },
				'btn.primary': { padding: 2 },
			})
			const result = resolveClassName('btn primary')
			expect(result).toEqual({ padding: 2 })
		})

		it('uses compound when available, ignoring individual classes', () => {
			registerStyles({
				base: { borderStyle: 'single' },
				'base.compact': { borderStyle: 'double', padding: 1 },
			})
			const result = resolveClassName('base compact')
			expect(result).toEqual({ borderStyle: 'double', padding: 1 })
		})
	})

	describe('Tailwind utility handling', () => {
		it('skips compound lookup for Tailwind spacing utilities', () => {
			registerStyles({
				'p-4': { padding: 4 },
				'gap-2': { gap: 2 },
			})
			const result = resolveClassName('p-4 gap-2')
			expect(result).toEqual({ padding: 4, gap: 2 })
		})

		it('skips compound lookup for Tailwind color utilities', () => {
			registerStyles({
				'bg-blue-500': { backgroundColor: 'blue' },
				'text-red-400': { color: 'red' },
			})
			const result = resolveClassName('bg-blue-500 text-red-400')
			expect(result).toEqual({ backgroundColor: 'blue', color: 'red' })
		})

		it('skips compound lookup for Tailwind flex utilities', () => {
			registerStyles({
				flex: { display: 'flex' },
				'flex-row': { flexDirection: 'row' },
			})
			const result = resolveClassName('flex flex-row')
			expect(result).toEqual({ display: 'flex', flexDirection: 'row' })
		})

		it('allows compound lookup when mixed with non-Tailwind classes', () => {
			registerStyles({
				'btn.primary': { padding: 2 },
				'p-4': { padding: 4 },
			})
			const result = resolveClassName('btn primary p-4')
			expect(result).toEqual({ padding: 4 })
		})

		it('recognizes w-1/2 as Tailwind utility', () => {
			registerStyles({
				'w-1/2': { width: '50%' },
			})
			const result = resolveClassName('w-1/2')
			expect(result).toEqual({ width: '50%' })
		})

		it('recognizes text-xl as Tailwind utility', () => {
			registerStyles({
				'text-xl': { fontWeight: 'bold' },
			})
			const result = resolveClassName('text-xl')
			expect(result).toEqual({ fontWeight: 'bold' })
		})

		it('recognizes font-bold as Tailwind utility', () => {
			registerStyles({
				'font-bold': { fontWeight: 'bold' },
			})
			const result = resolveClassName('font-bold')
			expect(result).toEqual({ fontWeight: 'bold' })
		})
	})

	describe('Edge cases', () => {
		it('handles empty strings gracefully', () => {
			registerStyles({ container: { padding: 1 } })
			expect(resolveClassName('')).toEqual({})
		})

		it('handles whitespace-only strings', () => {
			registerStyles({ container: { padding: 1 } })
			expect(resolveClassName('   ')).toEqual({})
		})

		it('handles extra whitespace in className', () => {
			registerStyles({
				'btn.primary': { padding: 2 },
			})
			const result = resolveClassName('  btn   primary  ')
			expect(result).toEqual({ padding: 2 })
		})

		it('returns empty for unknown compound selectors', () => {
			registerStyles({ container: { padding: 1 } })
			const result = resolveClassName('unknown selector')
			expect(result).toEqual({})
		})

		it('handles single word className (no compound lookup)', () => {
			registerStyles({ container: { padding: 2 } })
			const result = resolveClassName('container')
			expect(result).toEqual({ padding: 2 })
		})
	})

	describe('Real-world compound selector patterns', () => {
		it('handles BEM-style modifiers', () => {
			registerStyles({
				button: { padding: 1 },
				'button--primary': { borderColor: 'magenta' },
				'button--large': { padding: 2 },
			})
			const result = resolveClassName('button button--primary button--large')
			expect(result).toEqual({ padding: 2, borderColor: 'magenta' })
		})

		it('handles state-based compound selectors', () => {
			registerStyles({
				card: { padding: 1 },
				'card.active': { borderColor: 'cyan', padding: 1 },
				'card.selected': { backgroundColor: 'blue', padding: 1 },
			})
			const activeResult = resolveClassName('card active')
			expect(activeResult).toEqual({ padding: 1, borderColor: 'cyan' })

			const selectedResult = resolveClassName('card selected')
			expect(selectedResult).toEqual({ padding: 1, backgroundColor: 'blue' })
		})

		it('handles size variants with compounds', () => {
			registerStyles({
				input: { borderStyle: 'single' },
				'input.small': { padding: 0 },
				'input.large': { padding: 2 },
			})
			const small = resolveClassName('input small')
			const large = resolveClassName('input large')
			expect(small.padding).toBe(0)
			expect(large.padding).toBe(2)
		})
	})
})
