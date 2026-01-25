import { defineConfig } from 'vite'
import { wolfie } from '@wolfie/plugin/vite'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
	root: __dirname,
	plugins: [
		// nativeBindings: true by default - handles banner + file copying
		wolfie('react', { mode: 'global' }),
	],
	css: {
		postcss: resolve(__dirname, 'postcss.config.cjs'),
	},
	build: {
		lib: {
			entry: resolve(__dirname, 'index.tsx'),
			formats: ['es'],
			fileName: 'index',
		},
		rollupOptions: {
			external: [
				'react',
				'react/jsx-runtime',
				'react/jsx-dev-runtime',
				'@wolfie/react',
			],
		},
	},
})
