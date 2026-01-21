import { describe, it, expect } from 'vitest'
import { parseCSS } from '../src/parser'

describe('Complex Selectors - Tailwind Style', () => {
	describe('Escaped characters', () => {
		it('preserves escaped slashes in literal mode', () => {
			const result = parseCSS('.w-1\\/2 { padding: 1 }', {
				camelCaseClasses: false,
			})
			expect(result['w-1/2']).toBeDefined()
			expect(result['w-1/2']?.paddingTop).toBe(1)
		})

		it('preserves escaped hyphens in literal mode', () => {
			const result = parseCSS('.bg-\\-blue-500 { color: blue }', {
				camelCaseClasses: false,
			})
			expect(result['bg--blue-500']).toBeDefined()
		})
	})

	describe('Compound with literal keys', () => {
		it('preserves dots in compound literal mode', () => {
			const result = parseCSS('.btn.primary { padding: 2 }', {
				camelCaseClasses: false,
			})
			expect(result['btn.primary']).toBeDefined()
			expect(result['btn.primary']?.paddingTop).toBe(2)
		})

		it('handles 3-way compound in literal mode', () => {
			const result = parseCSS('.card.title.subtitle { color: cyan }', {
				camelCaseClasses: false,
			})
			expect(result['card.title.subtitle']).toBeDefined()
			expect(result['card.title.subtitle']?.color).toBe('cyan')
		})

		it('handles multiple compound classes in comma list', () => {
			const result = parseCSS(
				'.btn.primary, .btn.secondary, .link.primary { padding: 2 }',
				{
					camelCaseClasses: false,
				}
			)
			expect(result['btn.primary']).toBeDefined()
			expect(result['btn.secondary']).toBeDefined()
			expect(result['link.primary']).toBeDefined()
		})
	})

	describe('Tailwind utility patterns', () => {
		it('parses w-1/2 utility', () => {
			const result = parseCSS('.w-1\\/2 { width: 50% }', {
				camelCaseClasses: false,
			})
			expect(result['w-1/2']).toBeDefined()
		})

		it('parses bg-blue-500 utility', () => {
			const result = parseCSS('.bg-blue-500 { background-color: blue }', {
				camelCaseClasses: false,
			})
			expect(result['bg-blue-500']).toBeDefined()
			expect(result['bg-blue-500']?.backgroundColor).toBe('blue')
		})

		it('parses font-bold utility', () => {
			const result = parseCSS('.font-bold { font-weight: bold }', {
				camelCaseClasses: false,
			})
			expect(result['font-bold']).toBeDefined()
		})

		it('parses p-4 utility', () => {
			const result = parseCSS('.p-4 { padding: 4 }', {
				camelCaseClasses: false,
			})
			expect(result['p-4']).toBeDefined()
		})

		it('parses gap-2 utility', () => {
			const result = parseCSS('.gap-2 { gap: 2 }', {
				camelCaseClasses: false,
			})
			expect(result['gap-2']).toBeDefined()
		})

		it('parses flex-row utility', () => {
			const result = parseCSS('.flex-row { flex-direction: row }', {
				camelCaseClasses: false,
			})
			expect(result['flex-row']).toBeDefined()
			expect(result['flex-row']?.flexDirection).toBe('row')
		})
	})
})

describe('Complex Selectors - Multi-level', () => {
	it('flattens 4-level descendant selector', () => {
		const result = parseCSS('.a .b .c .d { padding: 1 }')
		expect(result.aBCD).toBeDefined()
		expect(result.aBCD?.paddingTop).toBe(1)
	})

	it('handles element + class + descendant', () => {
		const result = parseCSS('div.container .title { padding: 2 }')
		expect(result.containerTitle).toBeDefined()
		expect(result.containerTitle?.paddingTop).toBe(2)
	})

	it('handles ID with class descendant', () => {
		const result = parseCSS('#header .active { color: red }')
		expect(result.headerActive).toBeDefined()
		expect(result.headerActive?.color).toBe('red')
	})

	it('handles attribute selector with class descendant', () => {
		const result = parseCSS('[data-theme].content { color: white }')
		expect(result.content).toBeDefined()
		expect(result.content?.color).toBe('white')
	})
})

describe('Complex Selectors - Edge Cases', () => {
	it('handles 3-way compound selector', () => {
		const result = parseCSS('.btn.primary.large { padding: 4 }')
		expect(result.btnPrimaryLarge).toBeDefined()
		expect(result.btnPrimaryLarge?.paddingTop).toBe(4)
	})

	it('handles BEM-style compound (not flattened)', () => {
		const result = parseCSS('.button--primary { padding: 2 }')
		expect(result['button--primary']).toBeUndefined()
	})

	it('handles namespace-like selectors', () => {
		const result = parseCSS('.ns-card .ns-title { padding: 1 }')
		expect(result.nsCardNsTitle).toBeDefined()
	})

	it('handles complex comma list with compound selectors', () => {
		const result = parseCSS(
			'.btn.primary, .btn.secondary, .card.large, .title { padding: 2 }'
		)
		expect(result.btnPrimary).toBeDefined()
		expect(result.btnSecondary).toBeDefined()
		expect(result.cardLarge).toBeDefined()
		expect(result.title).toBeDefined()
	})
})

describe('Complex Selectors - TUI Specific', () => {
	it('handles card with title descendant', () => {
		const result = parseCSS('.card .title { padding: 2; font-weight: bold; }')
		expect(result.cardTitle).toBeDefined()
		expect(result.cardTitle?.paddingTop).toBe(2)
		expect(result.cardTitle?.fontWeight).toBe('bold')
	})

	it('handles container with multiple descendants', () => {
		const result = parseCSS('.container .header .content .footer { gap: 1 }')
		expect(result.containerHeaderContentFooter).toBeDefined()
		expect(result.containerHeaderContentFooter?.gap).toBe(1)
	})

	it('handles flex-container with item descendants', () => {
		const result = parseCSS('.flex-container .item { flex: 1 }')
		expect(result.flexContainerItem).toBeDefined()
		expect(result.flexContainerItem?.flexGrow).toBe(1)
	})

	it('handles menu with active-state compound', () => {
		const result = parseCSS('.menu .item .active { color: cyan }')
		expect(result.menuItemActive).toBeDefined()
		expect(result.menuItemActive?.color).toBe('cyan')
	})
})
