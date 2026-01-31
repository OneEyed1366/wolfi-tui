/**
 * Type Declaration Generator
 *
 * Generates virtual TypeScript type declarations for CSS modules.
 */

//#region Type Generation

/**
 * Generate a complete .d.ts file content for a CSS module.
 * This is used by the host proxy to create virtual declaration files.
 *
 * @example
 * generateDtsContent(['container', 'button', 'active'])
 * // Returns:
 * // import type { Styles } from '@wolfie/core';
 * // declare const styles: {
 * //   readonly container: Styles;
 * //   readonly button: Styles;
 * //   readonly active: Styles;
 * // };
 * // export default styles;
 * // export { styles };
 */
export function generateDtsContent(classNames: string[]): string {
	if (classNames.length === 0) {
		return `import type { Styles } from '@wolfie/core';
declare const styles: Record<string, Styles>;
export default styles;
export { styles };`
	}

	const properties = classNames
		.map((name) => `  readonly ${escapePropertyName(name)}: Styles;`)
		.join('\n')

	return `import type { Styles } from '@wolfie/core';
declare const styles: {
${properties}
};
export default styles;
export { styles };`
}

/**
 * Generate a virtual TypeScript declaration for CSS module exports.
 * @deprecated Use generateDtsContent instead for full .d.ts file generation.
 *
 * @example
 * generateTypeDeclaration(['container', 'button', 'active'])
 * // Returns:
 * // declare const styles: {
 * //   readonly container: Styles;
 * //   readonly button: Styles;
 * //   readonly active: Styles;
 * // };
 * // export default styles;
 */
export function generateTypeDeclaration(classNames: string[]): string {
	if (classNames.length === 0) {
		return `
import type { Styles } from '@wolfie/core';
declare const styles: Record<string, Styles>;
export default styles;
`.trim()
	}

	const properties = classNames
		.map((name) => `  readonly ${escapePropertyName(name)}: Styles;`)
		.join('\n')

	return `
import type { Styles } from '@wolfie/core';
declare const styles: {
${properties}
};
export default styles;
`.trim()
}

/**
 * Generate type declaration as a TypeScript interface.
 */
export function generateTypeInterface(
	modulePath: string,
	classNames: string[]
): string {
	const interfaceName = generateInterfaceName(modulePath)

	if (classNames.length === 0) {
		return `
import type { Styles } from '@wolfie/core';
export interface ${interfaceName} extends Record<string, Styles> {}
`.trim()
	}

	const properties = classNames
		.map((name) => `  readonly ${escapePropertyName(name)}: Styles;`)
		.join('\n')

	return `
import type { Styles } from '@wolfie/core';
export interface ${interfaceName} {
${properties}
}
`.trim()
}

//#endregion Type Generation

//#region Helpers

/**
 * Escape property names that aren't valid identifiers.
 * e.g., "my-class" -> "['my-class']"
 */
function escapePropertyName(name: string): string {
	// Check if name is a valid JS identifier
	if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(name)) {
		return name
	}
	// Need to escape
	return `['${name.replace(/'/g, "\\'")}']`
}

/**
 * Generate an interface name from module path.
 * e.g., "./Button.module.css" -> "ButtonModuleStyles"
 */
function generateInterfaceName(modulePath: string): string {
	const baseName = modulePath
		.split('/')
		.pop()!
		.replace(/\.module\.(css|scss|less|styl)$/, '')
		.replace(/[^a-zA-Z0-9]/g, '')

	return `${capitalize(baseName)}ModuleStyles`
}

/**
 * Capitalize first letter.
 */
function capitalize(str: string): string {
	return str.charAt(0).toUpperCase() + str.slice(1)
}

//#endregion Helpers
