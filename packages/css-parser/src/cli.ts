#!/usr/bin/env node
/**
 * wolf-css CLI
 *
 * Command-line interface for CSS/SCSS/Less/Stylus compilation to wolfie styles
 */

import fs from 'node:fs'
import path from 'node:path'
import { parseCSS } from './parser'
import { compile, detectLanguage } from './preprocessors'
import { generateTypeScript, generateJavaScript } from './generator'
import type { CodeGeneratorOptions } from './types'

//#region Types

interface CLIOptions {
	watch: boolean
	output: string | undefined
	mode: 'module' | 'global'
	javascript: boolean
	minify: boolean
	help: boolean
	version: boolean
}

//#endregion Types

//#region Argument Parsing

/**
 * Get the value following a flag argument
 */
function getArgValue(args: string[], flag: string): string | undefined {
	const index = args.indexOf(flag)
	if (index !== -1 && index + 1 < args.length) {
		return args[index + 1]
	}
	return undefined
}

/**
 * Check if an argument is a value for a flag (not a standalone argument)
 */
function isArgValue(args: string[], arg: string): boolean {
	const flagsWithValues = ['-o', '--output', '--mode']
	for (const flag of flagsWithValues) {
		const index = args.indexOf(flag)
		if (index !== -1 && args[index + 1] === arg) {
			return true
		}
	}
	return false
}

/**
 * Parse CLI arguments into options
 */
function parseArgs(args: string[]): {
	options: CLIOptions
	inputFiles: string[]
} {
	const options: CLIOptions = {
		watch: args.includes('--watch') || args.includes('-w'),
		output: getArgValue(args, '--output') ?? getArgValue(args, '-o'),
		mode: (getArgValue(args, '--mode') as 'module' | 'global') ?? 'module',
		javascript: args.includes('--javascript') || args.includes('--js'),
		minify: args.includes('--minify') || args.includes('-m'),
		help: args.includes('--help') || args.includes('-h'),
		version: args.includes('--version') || args.includes('-v'),
	}

	// Get input files (non-flag arguments that aren't flag values)
	const inputFiles = args.filter(
		(arg) => !arg.startsWith('-') && !isArgValue(args, arg)
	)

	return { options, inputFiles }
}

//#endregion Argument Parsing

//#region Help & Version

function printHelp(): void {
	console.log(`
wolf-css - CSS/SCSS/Less/Stylus to wolfie styles compiler

USAGE:
  wolf-css <input.css> [options]
  wolf-css <input.scss> [options]
  wolf-css <input.less> [options]
  wolf-css <input.styl> [options]

OPTIONS:
  -o, --output <file>  Output file path (default: <input>.<ts|js>)
  --mode <mode>        Output mode: module (default) or global
                       - module: CSS Modules pattern (default export)
                       - global: registerStyles() side-effect import
  --js, --javascript   Output JavaScript instead of TypeScript
  -m, --minify         Minify output (compact, no whitespace)
  -w, --watch          Watch for file changes (not yet implemented)
  -h, --help           Show this help message
  -v, --version        Show version

EXAMPLES:
  wolf-css styles.css                    # → styles.css.ts
  wolf-css styles.scss -o styles.ts      # → styles.ts
  wolf-css theme.less --mode global      # → theme.less.ts (registerStyles)
  wolf-css app.styl --js -m              # → app.styl.js (minified JS)

SUPPORTED FORMATS:
  .css      Plain CSS
  .scss     SCSS (Sass with braces)
  .sass     Indented Sass syntax
  .less     Less
  .styl     Stylus
`)
}

function printVersion(): void {
	// Read version from package.json at runtime would be ideal,
	// but for simplicity we hardcode it (should match package.json)
	console.log('wolf-css v0.1.0')
}

//#endregion Help & Version

//#region File Processing

/**
 * Process a single input file
 */
async function processFile(
	inputFile: string,
	options: CLIOptions
): Promise<void> {
	const absolutePath = path.resolve(inputFile)

	// Verify file exists
	if (!fs.existsSync(absolutePath)) {
		throw new Error(`Input file not found: ${absolutePath}`)
	}

	// Read source
	const source = fs.readFileSync(absolutePath, 'utf-8')

	// Detect language and compile to CSS
	const lang = detectLanguage(inputFile)
	const result = await compile(source, lang, absolutePath)

	// Parse CSS to styles
	const styles = parseCSS(result.css, { filename: inputFile })

	// Generate output code
	const generatorOptions: Partial<CodeGeneratorOptions> = {
		mode: options.mode,
		minify: options.minify,
	}

	const generator = options.javascript ? generateJavaScript : generateTypeScript
	const output = generator(styles, generatorOptions)

	// Determine output path
	const ext = options.javascript ? '' : '.ts'
	const outputPath = options.output ?? inputFile + ext
	const absoluteOutputPath = path.resolve(outputPath)

	// Ensure output directory exists
	const outputDir = path.dirname(absoluteOutputPath)
	if (!fs.existsSync(outputDir)) {
		fs.mkdirSync(outputDir, { recursive: true })
	}

	// Write output
	fs.writeFileSync(absoluteOutputPath, output)
	console.log(`Generated: ${absoluteOutputPath}`)
}

//#endregion File Processing

//#region Main

async function main(): Promise<void> {
	const args = process.argv.slice(2)
	const { options, inputFiles } = parseArgs(args)

	// Handle --help
	if (options.help) {
		printHelp()
		process.exit(0)
	}

	// Handle --version
	if (options.version) {
		printVersion()
		process.exit(0)
	}

	// Validate input files
	if (inputFiles.length === 0) {
		console.error('Error: No input files specified\n')
		printHelp()
		process.exit(1)
	}

	// Validate mode
	if (options.mode !== 'module' && options.mode !== 'global') {
		console.error(
			`Error: Invalid mode "${options.mode}". Use "module" or "global".`
		)
		process.exit(1)
	}

	// Watch mode not yet implemented
	if (options.watch) {
		console.error('Error: Watch mode is not yet implemented')
		process.exit(1)
	}

	// Process each input file
	for (const inputFile of inputFiles) {
		await processFile(inputFile, options)
	}
}

//#endregion Main

main().catch((err: Error) => {
	console.error('Error:', err.message)
	process.exit(1)
})
