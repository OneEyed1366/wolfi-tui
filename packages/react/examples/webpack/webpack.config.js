import path from 'node:path'
import { fileURLToPath } from 'node:url'
import webpack from 'webpack'
import fs from 'node:fs'
import { wolfie } from '@wolfie/plugin/webpack'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

class CopyNativeBinariesPlugin {
	apply(compiler) {
		compiler.hooks.afterEmit.tap('CopyNativeBinariesPlugin', (compilation) => {
			const coreDir = path.resolve(__dirname, '../../../../internal/core')
			const distNativeDir = path.resolve(__dirname, 'dist/native')

			if (!fs.existsSync(distNativeDir)) {
				fs.mkdirSync(distNativeDir, { recursive: true })
			}

			const files = fs.readdirSync(coreDir)
			for (const file of files) {
				if (file.endsWith('.node')) {
					// We rename wolfie-core to wolfie-layout if needed by the loader
					// Or just copy all of them.
					fs.copyFileSync(
						path.join(coreDir, file),
						path.join(distNativeDir, file)
					)

					// Also provide the non-gnu version for the loader if it expects it
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
			'@wolfie/core/layout': path.resolve(
				__dirname,
				'../../../../internal/core/layout.js'
			),
			'@wolfie/core': path.resolve(
				__dirname,
				'../../../../internal/core/src/index.ts'
			),
			'@wolfie/react/styles': path.resolve(
				__dirname,
				'../../src/styles/index.ts'
			),
			'@wolfie/react': path.resolve(__dirname, '../../src/index.ts'),
		},
		conditionNames: ['node', 'import', 'require'],
	},
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: [
					{
						loader: 'ts-loader',
						options: {
							transpileOnly: true,
							configFile: 'tsconfig.json',
						},
					},
				],
				exclude: /node_modules/,
			},
			{
				test: /\.node$/,
				loader: 'node-loader',
				options: {
					name: 'native/[name].[ext]',
				},
			},
			{
				test: /\.css$/,
				use: [
					{
						loader: 'null-loader',
					},
					{
						loader: 'postcss-loader',
						options: {
							postcssOptions: {
								config: path.resolve(__dirname, 'postcss.config.cjs'),
							},
						},
					},
				],
			},
		],
	},
	optimization: {
		minimize: false,
	},
	plugins: [
		wolfie('react'),
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
