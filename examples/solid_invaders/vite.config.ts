import { defineConfig } from 'vite'
import solidPlugin from 'vite-plugin-solid'
import { wolfie } from '@wolfie/plugin/vite'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import { builtinModules } from 'node:module'

const __dirname = dirname(fileURLToPath(import.meta.url))

const nodeBuiltins = [
	...builtinModules,
	...builtinModules.map((m) => `node:${m}`),
]

export default defineConfig({
	root: __dirname,
	plugins: [
		solidPlugin({
			solid: {
				moduleName: '@wolfie/solid/renderer',
				generate: 'universal',
			},
		}),
		wolfie('solid'),
	],
	css: {
		postcss: resolve(__dirname, 'postcss.config.cjs'),
	},
	resolve: {
		alias: {
			'solid-js': '@wolfie/solid',
		},
	},
	build: {
		target: 'node18',
		lib: {
			entry: resolve(__dirname, 'src/index.tsx'),
			formats: ['es'],
			fileName: 'index',
		},
		rollupOptions: {
			preserveEntrySignatures: 'exports-only',
			external: (id) =>
				id === '@wolfie/solid' ||
				id.startsWith('@wolfie/solid/') ||
				nodeBuiltins.includes(id),
		},
	},
})
