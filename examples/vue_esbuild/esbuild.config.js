import * as esbuild from 'esbuild'
import { wolfie } from '@wolfie/plugin/esbuild'
import Vue from 'unplugin-vue/esbuild'

await esbuild.build({
	entryPoints: ['src/index.ts'],
	bundle: true,
	outfile: 'dist/index.js',
	format: 'esm',
	platform: 'node',
	target: 'node20',
	treeShaking: true,
	sourcemap: false,
	sourcesContent: false,
	plugins: [wolfie('vue'), Vue()],
	define: {
		__VUE_OPTIONS_API__: 'true',
		__VUE_PROD_DEVTOOLS__: 'false',
	},
	external: [
		'vue',
		'@wolfie/core',
		'@wolfie/css-parser',
		'ansi-escapes',
		'ansi-styles',
		'auto-bind',
		'cli-boxes',
		'cli-cursor',
		'cli-truncate',
		'code-excerpt',
		'es-toolkit',
		'indent-string',
		'is-in-ci',
		'patch-console',
		'signal-exit',
		'stack-utils',
		'type-fest',
		'wrap-ansi',
	],
	banner: {
		js: 'import { createRequire } from "module"; const require = createRequire(import.meta.url);',
	},
})

console.log('Build complete: dist/index.js')
