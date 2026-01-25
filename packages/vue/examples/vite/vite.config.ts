import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { wolfie } from '@wolfie/plugin/vite'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
	plugins: [
		vue({
			template: {
				compilerOptions: {
					isCustomElement: (tag) => tag.startsWith('wolfie-'),
					hoistStatic: false,
				},
			},
		}),
		// nativeBindings: true by default - handles banner + file copying
		wolfie('vue', { mode: 'global' }),
	],
	css: {
		postcss: resolve(__dirname, 'postcss.config.cjs'),
	},
	build: {
		lib: {
			entry: resolve(__dirname, 'index.ts'),
			formats: ['cjs'],
			fileName: 'index',
		},
		rollupOptions: {
			external: ['vue', '@wolfie/vue'],
		},
	},
})
