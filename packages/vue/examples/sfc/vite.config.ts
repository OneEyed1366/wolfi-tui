import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { wolfieVuePlugin } from '@wolfie/vue'

export default defineConfig({
	resolve: {
		alias: {
			'@wolfie/vue': resolve(__dirname, '../../src/index.ts'),
		},
		dedupe: ['vue'],
	},
	plugins: [
		// Rewrite Vue imports in .vue files to use @wolfie/vue
		// This ensures single Vue instance between SFCs and renderer
		wolfieVuePlugin(),
		vue({
			isProduction: false,
			template: {
				compilerOptions: {
					isCustomElement: (tag) => tag.startsWith('wolfie-'),
					hoistStatic: false,
				},
			},
		}),
	],
})
