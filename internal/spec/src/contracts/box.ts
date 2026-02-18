import { describe, it, expect } from 'vitest'
import type { Styles } from '@wolfie/core'
import type { ClassNameValue } from '@wolfie/shared'

/**
 * What a Box test renderer must return.
 * Framework-specific adapters (see packages/*\/test/contracts/) implement this.
 */
export type BoxRenderResult = {
	/** The style object that was applied to the wolfie-box DOM element */
	appliedStyle: Partial<Styles>
	/** The background color provided to children via context (BACKGROUND_TOKEN/backgroundContext) */
	providedBg: string | undefined
	/** The rendered terminal string output */
	output: string
}

export type BoxTestRenderer = (
	props: {
		className?: ClassNameValue
		style?: Partial<Styles>
		children?: string
	},
	options?: {
		/** Simulate a parent Box having this background color */
		parentBg?: string
	}
) => BoxRenderResult

/**
 * Behavioral contract test suite for Box.
 *
 * Usage in each framework's test directory:
 *
 * ```typescript
 * import { describeBoxContract } from '@wolfie/spec'
 * describeBoxContract(myFrameworkBoxRenderer)
 * ```
 *
 * The renderer is a thin adapter that renders Box using the framework
 * and returns BoxRenderResult. See existing adapters for reference.
 */
export function describeBoxContract(renderBox: BoxTestRenderer) {
	describe('Box contract: background context', () => {
		it('provides own backgroundColor to children', () => {
			const { providedBg } = renderBox({
				style: { backgroundColor: '#ff0000' },
			})
			expect(providedBg).toBe('#ff0000')
		})

		it('provides parentBg to children when own backgroundColor not set', () => {
			const { providedBg } = renderBox({}, { parentBg: '#00ff00' })
			expect(providedBg).toBe('#00ff00')
		})

		it('own backgroundColor overrides parentBg', () => {
			const { providedBg } = renderBox(
				{ style: { backgroundColor: '#0000ff' } },
				{ parentBg: '#00ff00' }
			)
			expect(providedBg).toBe('#0000ff')
		})

		it('provides undefined when neither own nor parent background set', () => {
			const { providedBg } = renderBox({})
			expect(providedBg).toBeUndefined()
		})
	})

	describe('Box contract: style computation', () => {
		it('applies overflowX:visible and overflowY:visible by default', () => {
			const { appliedStyle } = renderBox({})
			expect(appliedStyle.overflowX).toBe('visible')
			expect(appliedStyle.overflowY).toBe('visible')
		})

		it('overflow shorthand sets both overflowX and overflowY', () => {
			const { appliedStyle } = renderBox({
				style: { overflow: 'hidden' } as Partial<Styles>,
			})
			expect(appliedStyle.overflowX).toBe('hidden')
			expect(appliedStyle.overflowY).toBe('hidden')
		})

		it('explicit overflowX overrides overflow shorthand', () => {
			const { appliedStyle } = renderBox({
				style: { overflow: 'hidden', overflowX: 'visible' } as Partial<Styles>,
			})
			expect(appliedStyle.overflowX).toBe('visible')
			expect(appliedStyle.overflowY).toBe('hidden')
		})

		it('applies default flex direction: row', () => {
			const { appliedStyle } = renderBox({})
			expect(appliedStyle.flexDirection).toBe('row')
		})
	})
}
