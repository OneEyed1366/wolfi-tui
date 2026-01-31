/**
 * @wolfie/typescript-plugin
 *
 * TypeScript language service plugin that provides type information
 * for CSS module imports in Wolfie projects.
 */

import type * as ts from 'typescript/lib/tsserverlibrary'

/**
 * TypeScript language service plugin factory.
 */
declare function init(modules: { typescript: typeof ts }): {
	create(info: ts.server.PluginCreateInfo): ts.LanguageService
}

declare namespace init {
	/**
	 * Plugin configuration options.
	 * Configure in tsconfig.json:
	 *
	 * @example
	 * {
	 *   "compilerOptions": {
	 *     "plugins": [
	 *       {
	 *         "name": "@wolfie/typescript-plugin",
	 *         "customMatcher": "\\.module\\.css$",
	 *         "classnameTransform": "camelCase"
	 *       }
	 *     ]
	 *   }
	 * }
	 */
	interface PluginOptions {
		/**
		 * Custom regex pattern to match CSS module files.
		 * @default "\\.module\\.(css|scss|less|styl)$"
		 */
		customMatcher?: string

		/**
		 * Transform class names to a specific format.
		 * - 'asIs' - Keep class names as-is (default)
		 * - 'camelCase' - Convert to camelCase
		 * - 'dashes' - Convert to dashes (kebab-case)
		 */
		classnameTransform?: 'asIs' | 'camelCase' | 'dashes'
	}
}

export = init
