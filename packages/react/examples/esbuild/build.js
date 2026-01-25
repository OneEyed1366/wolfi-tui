import esbuild from 'esbuild'
import { wolfie } from '@wolfie/plugin/esbuild'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Copy native binaries
const coreDir = path.resolve(__dirname, '../../../core')
const distNativeDir = path.resolve(__dirname, 'dist/native')

if (!fs.existsSync(distNativeDir)) {
	fs.mkdirSync(distNativeDir, { recursive: true })
}

const files = fs.readdirSync(coreDir)
for (const file of files) {
	if (file.endsWith('.node')) {
		fs.copyFileSync(path.join(coreDir, file), path.join(distNativeDir, file))
	}
}

await esbuild.build({
	entryPoints: ['index.tsx'],
	bundle: true,
	outfile: 'dist/index.cjs',
	format: 'cjs',
	platform: 'node',
	external: ['react', '@wolfie/react'],
	banner: {
		js:
			'#!/usr/bin/env node\nprocess.env.NAPI_RS_NATIVE_LIBRARY_PATH = require("path").join(__dirname, "native/wolfie-core.' +
			process.platform +
			'-' +
			process.arch +
			'.node");',
	},
	plugins: [wolfie('react', { inline: true })],
	logLevel: 'info',
})
