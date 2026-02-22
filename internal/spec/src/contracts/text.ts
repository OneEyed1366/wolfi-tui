import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import chalk, { supportsColor } from 'chalk'
import type { Styles } from '@wolfie/core'
import type { ClassNameValue } from '@wolfie/shared'

export type TextRenderResult = {
	/** The raw terminal output string (may contain ANSI codes) */
	output: string
}

export type TextTestRenderer = (
	props: {
		children: string
		className?: ClassNameValue
		style?: Partial<Styles>
	},
	options?: { parentBg?: string }
) => TextRenderResult

const ESC = String.fromCharCode(27)
// eslint-disable-next-line no-control-regex
const stripAnsi = (str: string) => str.replace(/\x1b\[[0-9;]*m/g, '')
const hasAnsi = (str: string) => str.includes(ESC + '[')

export function describeTextContract(renderText: TextTestRenderer) {
	// Force chalk to output ANSI codes even in non-TTY test environments.
	// Text rendering assertions check for actual ANSI escape sequences.
	beforeAll(() => {
		chalk.level = 3
	})
	afterAll(() => {
		chalk.level = supportsColor ? supportsColor.level : 0
	})

	describe('Text contract: content preservation', () => {
		it('renders text content', () => {
			const { output } = renderText({ children: 'hello world' })
			expect(stripAnsi(output)).toContain('hello world')
		})
	})

	describe('Text contract: text decoration', () => {
		it('applies bold', () => {
			const { output } = renderText({
				children: 'hi',
				style: { fontWeight: 'bold' },
			})
			expect(output).toContain(ESC + '[1m')
			expect(stripAnsi(output)).toBe('hi')
		})

		it('applies italic', () => {
			const { output } = renderText({
				children: 'hi',
				style: { fontStyle: 'italic' },
			})
			expect(output).toContain(ESC + '[3m')
		})

		it('applies underline', () => {
			const { output } = renderText({
				children: 'hi',
				style: { textDecoration: 'underline' },
			})
			expect(output).toContain(ESC + '[4m')
		})
	})

	describe('Text contract: color', () => {
		it('applies foreground color as ANSI escape', () => {
			const { output } = renderText({
				children: 'hi',
				style: { color: '#ff0000' },
			})
			expect(hasAnsi(output)).toBe(true)
			expect(stripAnsi(output)).toBe('hi')
		})

		it('applies background color from parentBg when own not set', () => {
			const { output } = renderText({ children: 'hi' }, { parentBg: '#333333' })
			expect(hasAnsi(output)).toBe(true) // background ANSI escape present
		})

		it('no ANSI codes when no styles', () => {
			const { output } = renderText({ children: 'hello' })
			expect(output).toBe('hello')
		})
	})
}
