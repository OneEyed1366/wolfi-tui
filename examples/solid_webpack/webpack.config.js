import path from 'node:path'
import { fileURLToPath } from 'node:url'
import webpack from 'webpack'
import fs from 'node:fs'
import { wolfie } from '@wolf-tui/plugin/webpack'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

class CopyNativeBinariesPlugin {
	apply(compiler) {
		compiler.hooks.afterEmit.tap('CopyNativeBinariesPlugin', () => {
			const coreDir = path.resolve(__dirname, '../../internal/core')
			const distNativeDir = path.resolve(__dirname, 'dist/native')

			if (!fs.existsSync(distNativeDir)) {
				fs.mkdirSync(distNativeDir, { recursive: true })
			}

			const files = fs.readdirSync(coreDir)
			for (const file of files) {
				if (file.endsWith('.node')) {
					fs.copyFileSync(
						path.join(coreDir, file),
						path.join(distNativeDir, file)
					)

					if (file.includes('linux-arm64-gnu')) {
						fs.copyFileSync(
							path.join(coreDir, file),
							path.join(distNativeDir, file.replace('-gnu', ''))
						)
					}
				}
			}
		})
	}
}

export default {
	mode: 'production',
	target: 'node',
	entry: './src/index.tsx',
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: 'index.cjs',
		libraryTarget: 'commonjs',
		chunkFormat: 'commonjs',
		clean: true,
	},
	resolve: {
		extensions: ['.tsx', '.ts', '.js', '.node'],
		alias: {
			'@wolf-tui/core/layout': path.resolve(
				__dirname,
				'../../internal/core/layout.js'
			),
			'@wolf-tui/core': path.resolve(
				__dirname,
				'../../internal/core/src/index.ts'
			),
			'@wolf-tui/solid/styles': path.resolve(
				__dirname,
				'../../packages/solid/src/styles/index.ts'
			),
			'@wolf-tui/solid/renderer': path.resolve(
				__dirname,
				'../../packages/solid/src/renderer/index.ts'
			),
			'@wolf-tui/solid': path.resolve(
				__dirname,
				'../../packages/solid/src/index.tsx'
			),
		},
		conditionNames: ['browser', 'development', 'node', 'import', 'require'],
	},
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: [
							[
								'babel-preset-solid',
								{
									generate: 'universal',
									moduleName: '@wolf-tui/solid/renderer',
								},
							],
							'@babel/preset-typescript',
						],
					},
				},
				exclude: /node_modules/,
			},
			{
				test: /\.node$/,
				loader: 'node-loader',
				options: {
					name: 'native/[name].[ext]',
				},
			},
		],
	},
	optimization: {
		minimize: false,
	},
	plugins: [
		wolfie('solid'),
		new webpack.BannerPlugin({
			banner:
				'#!/usr/bin/env node\nprocess.env.NAPI_RS_NATIVE_LIBRARY_PATH = require("path").join(__dirname, "native/wolfie-core.' +
				process.platform +
				'-' +
				process.arch +
				'.node");',
			raw: true,
		}),
		new CopyNativeBinariesPlugin(),
	],
	node: {
		__dirname: false,
		__filename: false,
	},
}
