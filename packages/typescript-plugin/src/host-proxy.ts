/**
 * Language Service Host Proxy
 *
 * Proxies the TypeScript LanguageServiceHost to intercept CSS module resolution
 * and provide virtual .d.ts files with specific class names for true type safety.
 */

import type ts from 'typescript/lib/tsserverlibrary'
import type { PluginOptions } from './types'
import { CSSModuleResolver } from './css-resolver'
import { generateDtsContent } from './type-generator'

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

//#region Host Proxy

export interface HostProxyOptions extends PluginOptions {
	logger?: ts.server.Logger
}

/**
 * Creates the overridden methods for LanguageServiceHost.
 * Returns an object with just the methods we want to override.
 */
export function createLanguageServiceHostProxy(
	host: ts.LanguageServiceHost,
	project: ts.server.Project,
	typescript: typeof ts,
	options: HostProxyOptions
): Partial<ts.LanguageServiceHost> {
	const matcher = createMatcher(options.customMatcher)
	const cssResolver = new CSSModuleResolver(project, options)
	const logger = options.logger

	// Cache for generated .d.ts content
	const dtsCache = new Map<string, { content: string; version: string }>()

	logger?.info('[@wolfie/typescript-plugin] Creating host proxy...')

	/**
	 * Get or generate the .d.ts content for a CSS module.
	 */
	function getDtsContent(cssPath: string): string {
		const classNames = cssResolver.getClassNames(cssPath)
		logger?.info(
			`[@wolfie/typescript-plugin] getDtsContent for ${cssPath}: ${classNames?.length || 0} classes`
		)
		return generateDtsContent(classNames || [])
	}

	/**
	 * Get cached .d.ts content with version tracking.
	 */
	function getCachedDts(cssPath: string): { content: string; version: string } {
		const currentVersion = host.getScriptVersion?.(cssPath) || '0'
		const cached = dtsCache.get(cssPath)

		if (cached && cached.version === currentVersion) {
			return cached
		}

		const content = getDtsContent(cssPath)
		const entry = { content, version: currentVersion }
		dtsCache.set(cssPath, entry)

		return entry
	}

	/**
	 * Resolve relative path to absolute.
	 */
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

	// Return object with overridden methods
	const overrides: Partial<ts.LanguageServiceHost> = {
		//#region getScriptKind
		getScriptKind(fileName: string): ts.ScriptKind {
			if (isCSSModule(fileName, matcher)) {
				logger?.info(
					`[@wolfie/typescript-plugin] getScriptKind: ${fileName} -> TS`
				)
				return typescript.ScriptKind.TS
			}
			return host.getScriptKind?.(fileName) ?? typescript.ScriptKind.Unknown
		},
		//#endregion getScriptKind

		//#region getScriptSnapshot
		getScriptSnapshot(fileName: string): ts.IScriptSnapshot | undefined {
			if (isCSSModule(fileName, matcher)) {
				logger?.info(
					`[@wolfie/typescript-plugin] getScriptSnapshot: ${fileName}`
				)
				const { content } = getCachedDts(fileName)
				return typescript.ScriptSnapshot.fromString(content)
			}
			return host.getScriptSnapshot(fileName)
		},
		//#endregion getScriptSnapshot

		//#region resolveModuleNameLiterals (TS 5.x)
		resolveModuleNameLiterals(
			moduleLiterals: readonly ts.StringLiteralLike[],
			containingFile: string,
			redirectedReference: ts.ResolvedProjectReference | undefined,
			compilerOptions: ts.CompilerOptions,
			containingSourceFile: ts.SourceFile,
			reusedNames: readonly ts.StringLiteralLike[] | undefined
		): readonly ts.ResolvedModuleWithFailedLookupLocations[] {
			logger?.info(
				`[@wolfie/typescript-plugin] resolveModuleNameLiterals called for ${containingFile}`
			)

			return moduleLiterals.map((literal) => {
				const moduleName = literal.text

				if (isCSSModule(moduleName, matcher)) {
					logger?.info(
						`[@wolfie/typescript-plugin] Resolving CSS module: ${moduleName}`
					)

					// Resolve the path
					let resolvedPath: string
					if (moduleName.startsWith('.')) {
						resolvedPath = resolveRelativePath(moduleName, containingFile)
					} else {
						// Non-relative imports not supported yet
						return { resolvedModule: undefined }
					}

					// Check if file exists
					const exists = host.fileExists?.(resolvedPath) ?? false
					logger?.info(
						`[@wolfie/typescript-plugin] Resolved to: ${resolvedPath}, exists: ${exists}`
					)

					if (exists) {
						return {
							resolvedModule: {
								resolvedFileName: resolvedPath,
								extension: typescript.Extension.Dts,
								isExternalLibraryImport: false,
							},
						}
					}
				}

				// Fallback to original resolution
				if (host.resolveModuleNameLiterals) {
					const results = host.resolveModuleNameLiterals(
						[literal],
						containingFile,
						redirectedReference,
						compilerOptions,
						containingSourceFile,
						reusedNames
					)
					return results[0]!
				}

				return { resolvedModule: undefined }
			})
		},
		//#endregion resolveModuleNameLiterals
	}

	// Also add resolveModuleNames for TS 4.x compatibility
	if (!host.resolveModuleNameLiterals) {
		logger?.info(
			'[@wolfie/typescript-plugin] Adding resolveModuleNames for TS 4.x'
		)
		;(overrides as any).resolveModuleNames = (
			moduleNames: string[],
			containingFile: string,
			_reusedNames: string[] | undefined,
			redirectedReference: ts.ResolvedProjectReference | undefined,
			compilerOptions: ts.CompilerOptions
		): (ts.ResolvedModule | undefined)[] => {
			return moduleNames.map((moduleName) => {
				if (isCSSModule(moduleName, matcher)) {
					let resolvedPath: string
					if (moduleName.startsWith('.')) {
						resolvedPath = resolveRelativePath(moduleName, containingFile)
					} else {
						return undefined
					}

					const exists = host.fileExists?.(resolvedPath) ?? false
					if (exists) {
						return {
							resolvedFileName: resolvedPath,
							extension: typescript.Extension.Dts,
							isExternalLibraryImport: false,
						}
					}
				}

				// Fallback
				const result = typescript.resolveModuleName(
					moduleName,
					containingFile,
					compilerOptions,
					host
				)
				return result.resolvedModule
			})
		}
	}

	logger?.info('[@wolfie/typescript-plugin] Host proxy created')

	return overrides
}

//#endregion Host Proxy
