import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { wolfie } from '@wolfie/plugin/vite'

export default defineConfig({
	resolve: {
		alias: {
			'@wolfie/vue': resolve(__dirname, '../../src/index.ts'),
		},
		dedupe: ['vue'],
	},
	plugins: [
		vue({
			isProduction: false,
			template: {
				compilerOptions: {
					isCustomElement: (tag) => tag.startsWith('wolfie-'),
					hoistStatic: false,
				},
			},
		}),
		// Unified wolfie plugin handles CSS and Vue SFC styles
		wolfie('vue'),
	],
})
