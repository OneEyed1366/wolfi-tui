import * as esbuild from 'esbuild'
import { wolfie } from '@wolfie/plugin/esbuild'

await esbuild.build({
	entryPoints: ['src/main.ts'],
	bundle: true,
	outfile: 'dist/index.cjs',
	format: 'cjs',
	platform: 'node',
	target: 'node20',
	tsconfig: 'tsconfig.json',
	plugins: [
		// WHY: nativeBindings disabled because @wolfie/angular is externalized;
		// native .node files are resolved through node_modules at runtime
		wolfie('angular', { nativeBindings: false }),
	],
	// WHY: @wolfie/angular carries native .node bindings that can't be bundled;
	// Angular packages and zone.js are runtime deps loaded from node_modules
	external: [
		'@angular/core',
		'@angular/common',
		'@angular/compiler',
		'zone.js',
		'@wolfie/angular',
	],
	logLevel: 'info',
})

console.log('Build complete: dist/index.cjs')
