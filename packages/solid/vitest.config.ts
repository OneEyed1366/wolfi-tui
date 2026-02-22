import { resolve } from 'path'
import { defineConfig } from 'vitest/config'
import solidPlugin from 'vite-plugin-solid'
import { wolfie } from '@wolfie/plugin/vite'

export default defineConfig({
	resolve: {
		// Map @wolfie/solid/renderer to source so JSX transform uses local renderer
		alias: {
			'@wolfie/solid/renderer': resolve(__dirname, 'src/renderer/index.ts'),
		},
		// Force browser build of solid-js (Node resolves to server build otherwise)
		conditions: ['browser', 'development'],
	},
	plugins: [
		wolfie('solid', { include: /\.module\.css$/ }),
		solidPlugin({
			solid: {
				moduleName: '@wolfie/solid/renderer',
				generate: 'universal',
			},
		}),
	],
	test: {
		globals: true,
		environment: 'node',
		include: ['test/**/*.{ts,tsx}'],
		exclude: ['test/helpers/**'],
		server: {
			deps: {
				// Inline @wolfie workspace packages so Vite transforms their source
				inline: [/@wolfie/],
			},
		},
		pool: 'forks',
		poolOptions: {
			forks: { singleFork: true },
		},
	},
})
