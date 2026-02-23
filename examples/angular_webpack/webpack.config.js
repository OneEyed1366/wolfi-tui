import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { wolfie } from '@wolfie/plugin/webpack'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default {
	mode: 'production',
	target: 'node',
	entry: './src/main.ts',
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: 'index.cjs',
		chunkFormat: 'commonjs',
		clean: true,
	},
	resolve: {
		extensions: ['.ts', '.js'],
	},
	module: {
		rules: [
			{
				test: /\.ts$/,
				use: {
					loader: 'ts-loader',
					options: {
						// WHY: transpileOnly skips full type-checking for faster builds;
						// experimentalDecorators + emitDecoratorMetadata are still read
						// from tsconfig.json and applied per file
						transpileOnly: true,
						configFile: 'tsconfig.json',
					},
				},
				exclude: /node_modules/,
			},
		],
	},
	optimization: { minimize: false },
	plugins: [wolfie('angular')],
	// WHY: @wolfie/angular carries native .node bindings that can't be bundled;
	// Angular packages and zone.js are runtime deps loaded from node_modules
	externals: {
		'@angular/core': 'commonjs @angular/core',
		'@angular/common': 'commonjs @angular/common',
		'@angular/compiler': 'commonjs @angular/compiler',
		'zone.js': 'commonjs zone.js',
		'@wolfie/angular': 'commonjs @wolfie/angular',
	},
}
