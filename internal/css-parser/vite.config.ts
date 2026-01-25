import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
	build: {
		lib: {
			entry: {
				index: resolve(__dirname, 'src/index.ts'),
				vite: resolve(__dirname, 'src/vite.ts'),
				esbuild: resolve(__dirname, 'src/esbuild.ts'),
				cli: resolve(__dirname, 'src/cli.ts'),
			},
			formats: ['es'],
		},
		outDir: 'build',
		sourcemap: true,
		minify: false,
		target: 'node20',
		rollupOptions: {
			// Externalize all dependencies - library consumers will provide them
			external: (id) => {
				if (id.startsWith('node:')) return true
				if (id.startsWith('.') || id.startsWith('/')) return false
				return true
			},
		},
	},
	plugins: [dts({ rollupTypes: false })],
})
