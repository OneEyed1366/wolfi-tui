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
					'#!/usr/bin/env node\nprocess.env.NAPI_RS_NATIVE_LIBRARY_PATH = require("path").join(__dirname, "native/wolfie-core.' +
					process.platform +
					'-' +
					process.arch +
					'.node");',
			},
			external: ['react', '@wolfie/react', 'path'],
		},
	},
})
