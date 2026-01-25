/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'

export default defineConfig({
	test: {
		globals: true,
		environment: 'node',
		include: ['test/**/*.{ts,tsx}'],
		pool: 'forks',
		poolOptions: {
			forks: { singleFork: true },
		},
	},
})
