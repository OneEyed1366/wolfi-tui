import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { wolfieVuePlugin } from '../../src/index'
import { wolfieCSS } from '../../../css-parser/src/vite'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import { viteStaticCopy } from 'vite-plugin-static-copy'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
	root: __dirname,
	plugins: [
		vue({
			template: {
				compilerOptions: {
					isCustomElement: (tag) => tag.startsWith('wolfie-'),
					hoistStatic: false,
				},
			},
		}),
		...wolfieVuePlugin({ tailwind: true }), // Returns array of plugins
		wolfieCSS({
			mode: 'global',
			camelCaseClasses: false,
			framework: 'vue',
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
			entry: resolve(__dirname, 'index.ts'),
			formats: ['cjs'],
			fileName: 'index',
		},
		rollupOptions: {
			output: {
				banner:
					'#!/usr/bin/env node\nconst path = require("path");const fs = require("fs");const platform = process.platform;const arch = process.arch;const candidates = ["wolfie-core." + platform + "-" + arch + ".node","wolfie-core." + platform + "-" + arch + "-gnu.node","wolfie-core." + platform + "-" + arch + "-musl.node"];const nativePath = candidates.find(f => fs.existsSync(path.join(__dirname, "native/" + f)));if (nativePath) {process.env.NAPI_RS_NATIVE_LIBRARY_PATH = path.join(__dirname, "native/" + nativePath);} else {console.error("Native binding not found for", platform, arch);process.exit(1);}',
			},
			external: ['vue', '@wolfie/vue', 'path', 'fs'],
		},
	},
})
