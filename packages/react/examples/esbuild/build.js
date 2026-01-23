import esbuild from 'esbuild'
import { wolfieCSS } from '@wolfie/css-parser/esbuild'

await esbuild.build({
	entryPoints: ['index.tsx'],
	bundle: true,
	outfile: 'dist/index.js',
	format: 'esm',
	platform: 'node',
	external: ['@wolfie/react', 'react', 'node:fs', 'node:path'],
	plugins: [
		wolfieCSS({
			inline: true,
		}),
	],
	logLevel: 'info',
})
