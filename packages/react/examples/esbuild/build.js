import esbuild from 'esbuild'
import { wolfie, generateNativeBanner } from '@wolfie/plugin/esbuild'

await esbuild.build({
	entryPoints: ['index.tsx'],
	bundle: true,
	outfile: 'dist/index.cjs',
	format: 'cjs',
	platform: 'node',
	external: ['react', '@wolfie/react'],
	banner: { js: generateNativeBanner('cjs') },
	plugins: [wolfie('react')],
	logLevel: 'info',
})
