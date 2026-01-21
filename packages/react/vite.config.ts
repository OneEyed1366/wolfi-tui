import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'

export default defineConfig(({ command }) => {
	const babelPlugins: [string, object][] = [['babel-plugin-react-compiler', {}]]
	if (command === 'serve') {
		babelPlugins.push(['@babel/plugin-transform-react-jsx-development', {}])
	}

	return {
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
					'styles/index': resolve(__dirname, 'src/styles/index.ts'),
				},
				output: {
					// Maintain file structure
					entryFileNames: '[name].js',
					preserveModules: false,
				},
				// Externalize all dependencies - library consumers will provide them
				external: (id) => {
					if (id.startsWith('node:')) return true
					if (id.startsWith('.') || id.startsWith('/')) return false
					return true
				},
			},
		},
		plugins: [
			react({
				babel: {
					plugins: babelPlugins,
				},
			}),
			dts({ rollupTypes: true }),
		],
	}
})
