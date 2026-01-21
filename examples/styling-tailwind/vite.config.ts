import { defineConfig } from 'vite'
import { wolfieCSS } from '@wolfie/css-parser/vite'

export default defineConfig({
	plugins: [
		wolfieCSS({
			mode: 'global',
			camelCaseClasses: false,
		}),
	],
})
