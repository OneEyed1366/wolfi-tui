#!/usr/bin/env node
/**
 * wolf-css CLI
 *
 * Command-line interface for the CSS parser and code generator
 */

// Imports will be used when CLI is fully implemented
// import { parse } from './parser.js';
// import { generate } from './generator.js';
// import { preprocess, type PreprocessorType } from './preprocessors.js';

//#region CLI

async function main(): Promise<void> {
	const args = process.argv.slice(2);

	if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
		printHelp();
		process.exit(0);
	}

	if (args.includes('--version') || args.includes('-v')) {
		console.log('wolf-css v0.1.0');
		process.exit(0);
	}

	// TODO: Implement CLI argument parsing and execution
	console.log('wolf-css: CSS parser for wolf-tui');
	console.log('Arguments:', args);
}

function printHelp(): void {
	console.log(`
wolf-css - CSS parser and code generator for wolf-tui

USAGE:
  wolf-css [options] <input-file>

OPTIONS:
  -o, --output <file>    Output file path (default: stdout)
  -f, --format <format>  Output format: esm | cjs (default: esm)
  -p, --preprocessor     Preprocessor: sass | less | stylus | none
  -w, --watch            Watch mode
  -h, --help             Show this help message
  -v, --version          Show version

EXAMPLES:
  wolf-css styles.css -o styles.ts
  wolf-css styles.scss -p sass -o styles.ts
  wolf-css styles.css --watch
`);
}

//#endregion CLI

main().catch((error) => {
	console.error('Error:', error);
	process.exit(1);
});
