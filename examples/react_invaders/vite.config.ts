import { defineConfig } from 'vite'
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
	plugins: [wolfie('react')],
	css: {
		postcss: resolve(__dirname, 'postcss.config.cjs'),
	},
	build: {
		lib: {
			entry: resolve(__dirname, 'src/index.tsx'),
			formats: ['es'],
			fileName: 'index',
		},
		rollupOptions: {
			preserveEntrySignatures: 'exports-only',
			external: [
				'react',
				'react/jsx-runtime',
				'react/jsx-dev-runtime',
				'@wolfie/react',
				...nodeBuiltins,
			],
		},
	},
})
