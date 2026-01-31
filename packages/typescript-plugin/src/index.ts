/**
 * @wolfie/typescript-plugin
 *
 * TypeScript language service plugin for CSS module type safety.
 * Provides autocomplete and type checking for CSS module imports.
 */

import type ts from 'typescript/lib/tsserverlibrary'

const CSS_MODULE_REGEX = /\.module\.(css|scss|less|styl)$/

function isCSSModule(fileName: string): boolean {
	return CSS_MODULE_REGEX.test(fileName)
}

function generateDts(classNames: string[]): string {
	if (classNames.length === 0) {
		return `import type { Styles } from '@wolfie/core';
declare const styles: Record<string, Styles>;
export default styles;`
	}

	const props = classNames
		.map((name) => {
			if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(name)) {
				return `  readonly ${name}: Styles;`
			}
			return `  readonly ['${name.replace(/'/g, "\\'")}']: Styles;`
		})
		.join('\n')

	return `import type { Styles } from '@wolfie/core';
declare const styles: {
${props}
};
export default styles;`
}

function extractClassNames(css: string): string[] {
	const classNames: string[] = []
	const seen = new Set<string>()
	const regex = /\.([a-zA-Z_][\w-]*)/g
	let match

	while ((match = regex.exec(css)) !== null) {
		const name = match[1]!
		if (!seen.has(name)) {
			seen.add(name)
			classNames.push(name)
		}
	}

	return classNames
}

function resolveRelativePath(
	moduleName: string,
	containingFile: string
): string {
	const dir = containingFile.substring(0, containingFile.lastIndexOf('/'))
	const parts = dir.split('/')
	const relParts = moduleName.split('/')

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

function init(modules: { typescript: typeof ts }) {
	const typescript = modules.typescript

	function create(info: ts.server.PluginCreateInfo): ts.LanguageService {
		const logger = info.project.projectService.logger
		const host = info.languageServiceHost

		logger.info('[@wolfie/typescript-plugin] Initializing...')

		const dtsCache = new Map<string, string>()

		function getDtsForCSS(cssPath: string): string {
			const cached = dtsCache.get(cssPath)
			if (cached) return cached

			try {
				const content = host.readFile?.(cssPath)
				if (content) {
					const classNames = extractClassNames(content)
					const dts = generateDts(classNames)
					dtsCache.set(cssPath, dts)
					logger.info(
						`[@wolfie/typescript-plugin] Generated DTS: ${cssPath} (${classNames.length} classes)`
					)
					return dts
				}
			} catch (e) {
				logger.info(`[@wolfie/typescript-plugin] Error reading CSS: ${e}`)
			}

			return generateDts([])
		}

		// Store ALL originals BEFORE any overrides
		const _getScriptKind = host.getScriptKind?.bind(host)
		const _getScriptSnapshot = host.getScriptSnapshot.bind(host)
		const _resolveModuleNameLiterals = host.resolveModuleNameLiterals

		// Override getScriptKind
		host.getScriptKind = (fileName: string) => {
			if (isCSSModule(fileName)) {
				return typescript.ScriptKind.TS
			}
			return _getScriptKind?.(fileName) ?? typescript.ScriptKind.Unknown
		}

		// Override getScriptSnapshot
		host.getScriptSnapshot = (fileName: string) => {
			if (isCSSModule(fileName)) {
				const dts = getDtsForCSS(fileName)
				return typescript.ScriptSnapshot.fromString(dts)
			}
			return _getScriptSnapshot(fileName)
		}

		// Override resolveModuleNameLiterals (TypeScript 5.x)
		// CRITICAL: Call stored _resolveModuleNameLiterals directly, NOT via host
		// bc host === info.languageServiceHost → calling via host = infinite recursion
		if (_resolveModuleNameLiterals) {
			host.resolveModuleNameLiterals = (
				literals,
				containingFile,
				redirectedReference,
				options,
				sourceFile,
				reusedNames
			) => {
				// Call STORED original directly - not host.resolveModuleNameLiterals!
				const resolvedModules = _resolveModuleNameLiterals.call(
					host,
					literals,
					containingFile,
					redirectedReference,
					options,
					sourceFile,
					reusedNames
				)

				return literals.map((literal, index) => {
					const moduleName = literal.text

					// Only handle relative CSS modules
					if (isCSSModule(moduleName) && moduleName.startsWith('.')) {
						try {
							const resolved = resolveRelativePath(moduleName, containingFile)
							if (host.fileExists?.(resolved)) {
								logger.info(
									`[@wolfie/typescript-plugin] Resolved: ${moduleName} -> ${resolved}`
								)
								return {
									resolvedModule: {
										resolvedFileName: resolved,
										extension: typescript.Extension.Dts,
										isExternalLibraryImport: false,
									},
								}
							}
						} catch (e) {
							logger.info(`[@wolfie/typescript-plugin] Resolution error: ${e}`)
						}
					}

					return resolvedModules[index]!
				})
			}
		}

		logger.info('[@wolfie/typescript-plugin] Plugin ready!')
		return info.languageService
	}

	return { create }
}

export = init
