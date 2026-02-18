/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'

export default defineConfig({
	test: {
		globals: true,
		environment: 'node',
		env: {
			FORCE_COLOR: '3',
		},
	},
})
