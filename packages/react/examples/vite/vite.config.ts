import { defineConfig } from 'vite'
import { wolfieCSS } from '@wolfie/css-parser/vite'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import { viteStaticCopy } from 'vite-plugin-static-copy'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
	root: __dirname,
	plugins: [
		wolfieCSS({
			mode: 'global',
			camelCaseClasses: false,
		}),
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
			formats: ['cjs'],
			fileName: 'index',
		},
		rollupOptions: {
			output: {
				banner:
					'#!/usr/bin/env node\nconst path = require("path");const fs = require("fs");const platform = "' +
					process.platform +
					'";const arch = "' +
					process.arch +
					'";const candidates = ["wolfie-core." + platform + "-" + arch + ".node","wolfie-core." + platform + "-" + arch + "-gnu.node","wolfie-core." + platform + "-" + arch + "-musl.node"];const nativePath = candidates.find(f => fs.existsSync(path.join(__dirname, "native/" + f)));if (nativePath) {process.env.NAPI_RS_NATIVE_LIBRARY_PATH = path.join(__dirname, "native/" + nativePath);} else {console.error("Native binding not found for", platform, arch);process.exit(1);}',
			},
			external: ['react', '@wolfie/react', 'path'],
		},
	},
})
