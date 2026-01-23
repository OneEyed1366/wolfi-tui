import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

export default defineConfig({
	resolve: {
		alias: {
			'@wolfie/vue': resolve(__dirname, '../src/index.ts'),
		},
	},
	plugins: [
		vue({
			isProduction: true,
			template: {
				compilerOptions: {
					isCustomElement: (tag) => tag.startsWith('wolfie-'),
				},
			},
		}),
		vueJsx({
			optimize: false,
		}),
	],
})
