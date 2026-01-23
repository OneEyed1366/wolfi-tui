import { defineConfig } from 'vite'
import { wolfieCSS } from '@wolfie/css-parser/vite'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
	root: __dirname,
	plugins: [
		wolfieCSS({
			mode: 'global',
			camelCaseClasses: false,
		}),
	],
	css: {
		postcss: resolve(__dirname, 'postcss.config.js'),
	},
})
