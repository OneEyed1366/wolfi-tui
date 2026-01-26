/**
 * Vitest setup file
 *
 * Patches Vue's SSR context to work with Wolfie's custom renderer.
 * The vue-jsx plugin injects SSR registration helpers that call useSSRContext(),
 * which expects a server-side context. Since Wolfie uses a custom renderer (not
 * Vue's DOM or SSR renderer), we need to provide a mock context.
 */
import { vi } from 'vitest'

// Mock the useSSRContext function from Vue at module level
vi.mock('vue', async (importOriginal) => {
	const actual = await importOriginal<typeof import('vue')>()
	return {
		...actual,
		useSSRContext: () => ({
			modules: new Set(),
		}),
	}
})
