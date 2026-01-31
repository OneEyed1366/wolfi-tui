/**
 * Shared types for @wolfie/typescript-plugin
 */

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
export interface PluginOptions {
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
