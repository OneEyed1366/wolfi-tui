import { test, expect, describe, vi } from 'vitest'
import { wolfieCSS } from '../src/esbuild'
import fs from 'node:fs'

vi.mock('fast-glob', () => ({
	default: vi.fn(async () => []),
}))

vi.mock('node:fs', async () => {
	const actual = (await vi.importActual('node:fs')) as any
	return {
		...actual,
		default: {
			...actual.default,
			promises: {
				readFile: vi.fn(),
			},
		},
	}
})

describe('esbuild Plugin', () => {
	test('tracks watchFiles for SCSS imports', async () => {
		const plugin = wolfieCSS()
		const mockBuild = {
			onLoad: vi.fn(),
			onResolve: vi.fn(),
			initialOptions: {},
		}

		plugin.setup(mockBuild as any)

		// Get the CSS loader
		const cssLoaderCall = mockBuild.onLoad.mock.calls.find((call) =>
			call[0].filter.source.includes('css|scss')
		)
		expect(cssLoaderCall).toBeDefined()
		const cssLoader = cssLoaderCall![1]

		// Mock file reading
		vi.mocked(fs.promises.readFile).mockResolvedValueOnce(
			'.main { @import "vars"; }'
		)

		// Mock preprocessor to return watchFiles
		vi.mock('../src/preprocessors', async (importOriginal) => {
			const actual = (await importOriginal()) as any
			return {
				...actual,
				compile: async (source: string) => {
					if (source.includes('.p-4')) {
						return {
							css: '.p-4 { padding: 4px; }',
							watchFiles: [],
						}
					}
					return {
						css: '.main { color: red; }',
						watchFiles: ['/path/to/vars.scss'],
					}
				},
				detectLanguage: (path: string) =>
					path.endsWith('.scss') ? 'scss' : 'css',
			}
		})

		const result = await cssLoader({ path: 'app.scss' })
		expect(result.watchFiles).toContain('/path/to/vars.scss')
	})

	test('performs static inlining in tsx files', async () => {
		const plugin = wolfieCSS({ inline: true })
		const mockBuild = {
			onLoad: vi.fn(),
			initialOptions: {
				absWorkingDir: process.cwd(),
			},
		}

		await plugin.setup(mockBuild as any)

		// Get loaders
		const allOnLoadCalls = mockBuild.onLoad.mock.calls

		const tsxLoaderCall = allOnLoadCalls.find(
			(call) =>
				call[0].filter.source.includes('jt') ||
				call[0].filter.source.includes('tsx')
		)
		const cssLoaderCall = allOnLoadCalls.find((call) =>
			call[0].filter.source.includes('css|scss')
		)

		expect(tsxLoaderCall).toBeDefined()
		expect(cssLoaderCall).toBeDefined()

		const tsxLoader = tsxLoaderCall![1]
		const cssLoader = cssLoaderCall![1]

		// 1. FIRST PASS: Scan TSX to populate usedCandidates
		const tsxSource = 'const App = () => <Box className="p-4" />'
		vi.mocked(fs.promises.readFile).mockResolvedValue(tsxSource)

		await tsxLoader({ path: '/home/node/projects/wolf-tui/test.tsx' })

		// 2. Load CSS
		vi.mocked(fs.promises.readFile).mockResolvedValue('.p-4 { padding: 4px; }')
		await cssLoader({
			path: '/home/node/projects/wolf-tui/style.css',
		})

		// 3. SECOND PASS: Transform TSX
		vi.mocked(fs.promises.readFile).mockResolvedValue(tsxSource)
		const transformRes = await tsxLoader({
			path: '/home/node/projects/wolf-tui/test2.tsx',
		})

		expect(transformRes).not.toBeNull()
		// p-4 should be resolved as paddingTop: 1, paddingRight: 1, etc.
		expect(transformRes.contents).toContain(
			'style={{"paddingTop":1,"paddingRight":1,"paddingBottom":1,"paddingLeft":1}}'
		)
		expect(transformRes.contents).not.toContain('className')
	})
})
