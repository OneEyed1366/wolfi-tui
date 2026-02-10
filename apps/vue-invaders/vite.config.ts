import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { wolfie } from '@wolfie/plugin/vite'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import { builtinModules } from 'node:module'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Node.js built-in modules (with and without node: prefix)
const nodeBuiltins = [
	...builtinModules,
	...builtinModules.map((m) => `node:${m}`),
]

export default defineConfig({
	root: __dirname,
	plugins: [
		vue({
			template: {
				compilerOptions: {
					isCustomElement: (tag) =>
						tag.startsWith('wolfie-') || tag.startsWith('Wolfie'),
					hoistStatic: false,
					whitespace: 'condense',
				},
			},
		}),
		wolfie('vue'),
	],
	css: {
		postcss: resolve(__dirname, 'postcss.config.cjs'),
	},
	build: {
		target: 'node18',
		lib: {
			entry: resolve(__dirname, 'src/index.ts'),
			formats: ['es'],
			fileName: 'index',
		},
		rollupOptions: {
			preserveEntrySignatures: 'exports-only',
			external: ['vue', '@wolfie/vue', ...nodeBuiltins],
		},
	},
})
