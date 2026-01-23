import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import dts from 'vite-plugin-dts'
import { wolfieCSS } from '@wolfie/css-parser/vite'

export default defineConfig({
	build: {
		lib: {
			entry: resolve(__dirname, 'src/index.ts'),
			formats: ['es'],
			fileName: 'index',
		},
		outDir: 'build',
		sourcemap: true,
		minify: false,
		target: 'node20',
		rollupOptions: {
			input: {
				index: resolve(__dirname, 'src/index.ts'),
				// 'styles/index': resolve(__dirname, 'src/styles/index.ts'),
			},
			output: {
				entryFileNames: '[name].js',
				preserveModules: false,
			},
			external: (id) => {
				if (id.startsWith('node:')) return true
				if (id.startsWith('.') || id.startsWith('/')) return false
				return true
			},
		},
	},
	plugins: [
		wolfieCSS({
			mode: 'module',
			include: /\.module\.css$/,
		}),
		vue(),
		vueJsx(),
		dts({ rollupTypes: true }),
	],
})
