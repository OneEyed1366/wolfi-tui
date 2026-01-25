import { defineConfig } from 'vite'
import { wolfie } from '@wolfie/plugin/vite'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import { viteStaticCopy } from 'vite-plugin-static-copy'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
	root: __dirname,
	plugins: [
		wolfie('react', { mode: 'global' }),
		viteStaticCopy({
			targets: [
				{
					src: resolve(__dirname, '../../../core/*.node'),
					dest: 'native',
				},
			],
		}),
	],
	css: {
		postcss: resolve(__dirname, 'postcss.config.cjs'),
	},
	build: {
		lib: {
			entry: resolve(__dirname, 'index.tsx'),
			formats: ['es'],
			fileName: 'index',
		},
		rollupOptions: {
			output: {
				banner:
					'#!/usr/bin/env node\nimport { createRequire } from "node:module";\nimport { fileURLToPath } from "node:url";\nimport { dirname, join } from "node:path";\nimport { existsSync } from "node:fs";\nconst __filename = fileURLToPath(import.meta.url);\nconst __dirname = dirname(__filename);\nconst platform = "' +
					process.platform +
					'";\nconst arch = "' +
					process.arch +
					'";\nconst candidates = ["wolfie-core." + platform + "-" + arch + ".node","wolfie-core." + platform + "-" + arch + "-gnu.node","wolfie-core." + platform + "-" + arch + "-musl.node"];\nconst nativePath = candidates.find(f => existsSync(join(__dirname, "native/" + f)));\nif (nativePath) {process.env.NAPI_RS_NATIVE_LIBRARY_PATH = join(__dirname, "native/" + nativePath);} else {console.error("Native binding not found for", platform, arch);process.exit(1);}\n',
			},
			external: [
				'react',
				'react/jsx-runtime',
				'react/jsx-dev-runtime',
				'@wolfie/react',
				'node:module',
				'node:url',
				'node:path',
				'node:fs',
			],
		},
	},
})
