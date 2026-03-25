import * as esbuild from 'esbuild'
import { wolfie, generateNativeBanner } from '@wolf-tui/plugin/esbuild'
import { solidPlugin } from 'esbuild-plugin-solid'

await esbuild.build({
	entryPoints: ['index.tsx'],
	bundle: true,
	outfile: 'dist/index.cjs',
	format: 'cjs',
	platform: 'node',
	external: ['solid-js', '@wolf-tui/solid'],
	banner: { js: generateNativeBanner('cjs') },
	plugins: [
		solidPlugin({
			solid: {
				generate: 'universal',
				moduleName: '@wolf-tui/solid/renderer',
			},
		}),
		wolfie('solid'),
	],
	logLevel: 'info',
})
