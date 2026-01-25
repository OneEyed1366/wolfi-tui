import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import vueJsx from '@vitejs/plugin-vue-jsx'

export default defineConfig({
	resolve: {
		alias: {
			'@wolfie/vue': resolve(__dirname, '../../src/index.ts'),
		},
		dedupe: ['vue'],
	},
	plugins: [vueJsx({ optimize: false })],
})
