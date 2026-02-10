import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
	test: {
		root: resolve(__dirname),
		include: ['tests/**/*.test.ts'],
		pool: 'forks',
		poolOptions: {
			forks: {
				singleFork: true,
			},
		},
		testTimeout: 30_000,
		globalSetup: resolve(__dirname, 'utils/global-setup.ts'),
	},
})
