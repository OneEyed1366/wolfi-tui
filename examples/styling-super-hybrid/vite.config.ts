import { defineConfig } from 'vite'
import { wolfieCSS } from '@wolfie/css-parser/vite'
import path from 'node:path'

export default defineConfig({
	plugins: [
		wolfieCSS({
			mode: 'global',
			camelCaseClasses: false,
		}),
	],
	css: {
		postcss: path.resolve(__dirname, 'postcss.config.js'),
	},
})
