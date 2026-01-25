import { test, expect, describe, vi } from 'vitest'
import { wolfieCSS } from '../src/vite'
import { readFileSync, existsSync } from 'node:fs'

// We only mock the file system to avoid actual disk IO
vi.mock('node:fs', async () => {
	const actual = (await vi.importActual('node:fs')) as any
	return {
		...actual,
		existsSync: vi.fn(() => true),
		readFileSync: vi.fn(),
	}
})

describe('Vite Plugin - Inlining Integration', () => {
	const mockContext = {
		error: (msg: string) => {
			throw new Error(msg)
		},
		load: vi.fn(async () => null),
		resolve: vi.fn(),
	}

	test('fully resolves classes and removes className', async () => {
		const plugin = wolfieCSS({ inline: true }) as any

		// Real CSS that should be parsed by the actual logic
		const cssContent = `
			.container { flex-direction: column; }
			.p-4 { padding: 4px; }
		`
		vi.mocked(readFileSync).mockReturnValue(cssContent)
		vi.mocked(existsSync).mockReturnValue(true)

		// 1. Scan phase
		await plugin.transform.call(
			mockContext,
			'<Box className="container p-4" />',
			'test.tsx'
		)

		// 2. Load phase (populates global map using real parseCSS)
		await plugin.load.call(mockContext, '\0wolfie:/project/style.css.js')

		// 3. Transform phase
		const result = await plugin.transform.call(
			mockContext,
			'<Box className="container p-4" />',
			'test.tsx'
		)

		expect(result.code).toContain(
			'style={{"flexDirection":"column","paddingTop":1,"paddingRight":1,"paddingBottom":1,"paddingLeft":1}}'
		)
		expect(result.code).not.toContain('className="container p-4"')
	})

	test('preserves className when some classes are missing from CSS', async () => {
		const plugin = wolfieCSS({ inline: true }) as any

		// CSS only defines .p-4
		vi.mocked(readFileSync).mockReturnValue('.p-4 { padding: 4px; }')

		// 1. Scan phase (noticing p-4 and unknown-class)
		await plugin.transform.call(
			mockContext,
			'<Box className="p-4 unknown-class" />',
			'test.tsx'
		)

		// 2. Load phase
		await plugin.load.call(mockContext, '\0wolfie:/project/style.css.js')

		// 3. Transform phase
		const result = await plugin.transform.call(
			mockContext,
			'<Box className="p-4 unknown-class" />',
			'test.tsx'
		)

		// Should have BOTH className (for the unknown one) and style (for the resolved p-4)
		expect(result.code).toContain('className="p-4 unknown-class"')
		expect(result.code).toContain(
			'style={{"paddingTop":1,"paddingRight":1,"paddingBottom":1,"paddingLeft":1}}'
		)
	})

	test('handles camelCase and kebab-case mapping', async () => {
		const plugin = wolfieCSS({ inline: true }) as any

		// CSS defines a kebab-case class
		vi.mocked(readFileSync).mockReturnValue('.my-custom-box { margin: 2px; }')

		await plugin.transform.call(
			mockContext,
			'<Box className="my-custom-box" />',
			'test.tsx'
		)
		await plugin.load.call(mockContext, '\0wolfie:/project/style.css.js')

		const result = await plugin.transform.call(
			mockContext,
			'<Box className="my-custom-box" />',
			'test.tsx'
		)

		// The plugin should have matched 'my-custom-box' to the camelCased 'myCustomBox' style
		expect(result.code).toContain(
			'style={{"marginTop":1,"marginRight":1,"marginBottom":1,"marginLeft":1}}'
		)
		expect(result.code).not.toContain('className')
	})
})
