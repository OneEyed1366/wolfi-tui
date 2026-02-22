import * as esbuild from 'esbuild'
import { wolfie, generateNativeBanner } from '@wolfie/plugin/esbuild'
import { solidPlugin } from 'esbuild-plugin-solid'

await esbuild.build({
	entryPoints: ['index.tsx'],
	bundle: true,
	outfile: 'dist/index.cjs',
	format: 'cjs',
	platform: 'node',
	external: ['solid-js', '@wolfie/solid'],
	banner: { js: generateNativeBanner('cjs') },
	plugins: [
		solidPlugin({
			solid: {
				generate: 'universal',
				moduleName: '@wolfie/solid/renderer',
			},
		}),
		wolfie('solid'),
	],
	logLevel: 'info',
})
