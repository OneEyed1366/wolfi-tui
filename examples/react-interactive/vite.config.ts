import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			'@wolfie/core/layout': resolve(
				__dirname,
				'../../packages/core/layout.js'
			),
			'@wolfie/core': resolve(__dirname, '../../packages/core/src'),
			'@wolfie/react': resolve(__dirname, '../../packages/react/src'),
			'@wolfie/css-parser': resolve(__dirname, '../../packages/css-parser/src'),
		},
	},
})
