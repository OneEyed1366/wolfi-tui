import { defineConfig } from 'vite'
import { wolfie } from '@wolfie/plugin/vite'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
	plugins: [wolfie('angular')],
	css: {
		postcss: resolve(__dirname, 'postcss.config.cjs'),
	},
	build: {
		target: 'node20',
		ssr: resolve(__dirname, 'main.ts'),
		rollupOptions: {
			output: {
				format: 'cjs',
				entryFileNames: 'index.cjs',
			},
			external: [
				'@angular/core',
				'@angular/common',
				'@wolfie/angular',
				'zone.js',
				'@angular/compiler',
			],
		},
	},
})
