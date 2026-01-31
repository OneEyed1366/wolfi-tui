/**
 * Language Service Enhancements
 *
 * Provides IDE-specific enhancements for CSS modules:
 * - Go-to-definition: Jump to the actual CSS class in the .css file
 *
 * Note: Type safety is handled by the LanguageServiceHost proxy.
 * These enhancements are optional UX improvements.
 */

import type ts from 'typescript/lib/tsserverlibrary'
import type { PluginOptions } from './types'
import { CSSModuleResolver } from './css-resolver'

//#region Constants

const DEFAULT_MATCHER = /\.module\.(css|scss|less|styl)$/

//#endregion Constants

//#region Helpers

function createMatcher(pattern?: string): RegExp {
	if (!pattern) return DEFAULT_MATCHER
	try {
		return new RegExp(pattern)
	} catch {
		return DEFAULT_MATCHER
	}
}

function isCSSModule(fileName: string, matcher: RegExp): boolean {
	return matcher.test(fileName)
}

//#endregion Helpers

//#region Language Service Enhancements

export interface EnhancementsOptions extends PluginOptions {
	logger?: ts.server.Logger
}

/**
 * Creates a proxy for the LanguageService that enhances CSS module handling.
 *
 * Enhancements:
 * - getDefinitionAtPosition: Jump to CSS class in the actual .css file
 */
export function createLanguageServiceEnhancements(
	info: ts.server.PluginCreateInfo,
	typescript: typeof ts,
	options: EnhancementsOptions
): ts.LanguageService {
	const { languageService, project } = info
	const matcher = createMatcher(options.customMatcher)
	const cssResolver = new CSSModuleResolver(project, options)
	const logger = options.logger

	// Create a proxy that delegates to the original service
	const proxy: ts.LanguageService = Object.create(null)

	// Copy all methods from the original service
	for (const key of Object.keys(languageService) as Array<
		keyof ts.LanguageService
	>) {
		const original = languageService[key]
		// @ts-expect-error - Dynamic property assignment
		proxy[key] =
			typeof original === 'function' ? original.bind(languageService) : original
	}

	//#region getDefinitionAtPosition

	proxy.getDefinitionAtPosition = (
		fileName: string,
		position: number
	): readonly ts.DefinitionInfo[] | undefined => {
		const prior = languageService.getDefinitionAtPosition(fileName, position)

		const sourceFile = languageService.getProgram()?.getSourceFile(fileName)
		if (!sourceFile) return prior

		const cssModuleInfo = findCSSModulePropertyAccess(
			sourceFile,
			position,
			typescript,
			matcher
		)

		if (!cssModuleInfo || !cssModuleInfo.propertyName) return prior

		// Check if the property exists in the CSS module
		const classNames = cssResolver.getClassNames(cssModuleInfo.cssModulePath)
		if (!classNames?.includes(cssModuleInfo.propertyName)) return prior

		// Get the position of the class in the CSS file
		const classPosition = cssResolver.getClassPosition(
			cssModuleInfo.cssModulePath,
			cssModuleInfo.propertyName
		)

		if (classPosition === undefined) return prior

		logger?.info(
			`[@wolfie/typescript-plugin] Go-to-definition: ${cssModuleInfo.propertyName} in ${cssModuleInfo.cssModulePath}`
		)

		// Return definition pointing to CSS file
		return [
			{
				fileName: cssModuleInfo.cssModulePath,
				textSpan: {
					start: classPosition,
					length: cssModuleInfo.propertyName.length,
				},
				kind: typescript.ScriptElementKind.memberVariableElement,
				name: cssModuleInfo.propertyName,
				containerName: '',
				containerKind: typescript.ScriptElementKind.unknown,
			},
		]
	}

	//#endregion getDefinitionAtPosition

	return proxy
}

//#endregion Language Service Enhancements

//#region AST Helpers

interface CSSModulePropertyAccess {
	cssModulePath: string
	propertyName?: string
}

/**
 * Find if the position is within a CSS module property access
 * e.g., `styles.container` where `styles` is imported from a CSS module
 */
function findCSSModulePropertyAccess(
	sourceFile: ts.SourceFile,
	position: number,
	typescript: typeof ts,
	matcher: RegExp
): CSSModulePropertyAccess | undefined {
	// Find the node at position
	function findNodeAtPosition(node: ts.Node): ts.Node | undefined {
		if (position < node.getStart() || position > node.getEnd()) {
			return undefined
		}

		const children = node.getChildren()
		for (const child of children) {
			const found = findNodeAtPosition(child)
			if (found) return found
		}

		return node
	}

	const nodeAtPosition = findNodeAtPosition(sourceFile)
	if (!nodeAtPosition) return undefined

	// Walk up to find PropertyAccessExpression
	let current: ts.Node | undefined = nodeAtPosition
	let propertyAccess: ts.PropertyAccessExpression | undefined

	while (current && !typescript.isSourceFile(current)) {
		if (typescript.isPropertyAccessExpression(current)) {
			propertyAccess = current
			break
		}
		current = current.parent
	}

	if (!propertyAccess) return undefined

	// Get the identifier being accessed (e.g., `styles` in `styles.container`)
	const expression = propertyAccess.expression
	if (!typescript.isIdentifier(expression)) return undefined

	const identifierName = expression.text

	// Find the import for this identifier
	const cssModulePath = findCSSModuleImport(
		sourceFile,
		identifierName,
		typescript,
		matcher
	)

	if (!cssModulePath) return undefined

	// Get the property name if cursor is on it
	const propertyName = typescript.isIdentifier(propertyAccess.name)
		? propertyAccess.name.text
		: undefined

	return {
		cssModulePath,
		propertyName,
	}
}

/**
 * Find the CSS module import path for a given identifier
 */
function findCSSModuleImport(
	sourceFile: ts.SourceFile,
	identifierName: string,
	typescript: typeof ts,
	matcher: RegExp
): string | undefined {
	for (const statement of sourceFile.statements) {
		if (!typescript.isImportDeclaration(statement)) continue

		const importClause = statement.importClause
		if (!importClause) continue

		// Check default import: import styles from './foo.module.css'
		if (
			importClause.name &&
			typescript.isIdentifier(importClause.name) &&
			importClause.name.text === identifierName
		) {
			const moduleSpecifier = statement.moduleSpecifier
			if (typescript.isStringLiteral(moduleSpecifier)) {
				const modulePath = moduleSpecifier.text
				if (isCSSModule(modulePath, matcher)) {
					// Resolve relative path
					const dir = sourceFile.fileName.substring(
						0,
						sourceFile.fileName.lastIndexOf('/')
					)
					return resolvePath(dir, modulePath)
				}
			}
		}

		// Check namespace import: import * as styles from './foo.module.css'
		const namedBindings = importClause.namedBindings
		if (
			namedBindings &&
			typescript.isNamespaceImport(namedBindings) &&
			namedBindings.name.text === identifierName
		) {
			const moduleSpecifier = statement.moduleSpecifier
			if (typescript.isStringLiteral(moduleSpecifier)) {
				const modulePath = moduleSpecifier.text
				if (isCSSModule(modulePath, matcher)) {
					const dir = sourceFile.fileName.substring(
						0,
						sourceFile.fileName.lastIndexOf('/')
					)
					return resolvePath(dir, modulePath)
				}
			}
		}
	}

	return undefined
}

/**
 * Simple path resolution for relative imports
 */
function resolvePath(dir: string, relativePath: string): string {
	if (!relativePath.startsWith('.')) {
		// Absolute or node_modules path - return as-is
		return relativePath
	}

	const parts = dir.split('/')
	const relParts = relativePath.split('/')

	for (const part of relParts) {
		if (part === '.') continue
		if (part === '..') {
			parts.pop()
		} else {
			parts.push(part)
		}
	}

	return parts.join('/')
}

//#endregion AST Helpers
