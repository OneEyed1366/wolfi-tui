import { createRenderer, type App, type Component } from 'vue'
import { EventEmitter } from 'node:events'
import { nodeOps } from './renderer/nodeOps'
import { patchProp } from './renderer/patchProp'
import {
	createNode,
	renderer as coreRenderer,
	logUpdate,
	type LogUpdate,
	squashTextNodes,
	measureText,
	wrapText,
	resolveViewportUnits,
	parseNumericValue,
	applyLayoutStyle,
	type DOMElement,
	type LayoutTree,
	type ElementNames,
	type DOMNode,
} from '@wolfie/core'
import { LayoutTree as TaffyLayoutTree } from '@wolfie/core/layout'
import { throttle } from 'es-toolkit/compat'
import signalExit from 'signal-exit'
import {
	StdinSymbol,
	StdoutSymbol,
	StderrSymbol,
	AppSymbol,
} from './context/symbols'
import { compile as compileCss, parseCSS } from '@wolfie/css-parser'

// Lazy initialization
let _createApp:
	| ReturnType<typeof createRenderer<DOMNode, DOMElement>>['createApp']
	| null = null
const getCreateApp = () => {
	if (!_createApp) {
		const renderer = createRenderer<DOMNode, DOMElement>({
			...nodeOps,
			patchProp,
		})
		_createApp = renderer.createApp
	}
	return _createApp
}

export interface RenderOptions {
	stdout?: NodeJS.WriteStream
	stdin?: NodeJS.ReadStream
	stderr?: NodeJS.WriteStream
	maxFps?: number
}

export type WolfieVueInstance = {
	layoutTree: LayoutTree
	onRender: () => void
}

export const layoutTreeRegistry = new WeakMap<DOMElement, WolfieVueInstance>()

class WolfieVue {
	private rootNode: DOMElement
	private app!: App<DOMNode>
	private stdout: NodeJS.WriteStream
	private stdin: NodeJS.ReadStream
	private stderr: NodeJS.WriteStream
	private log: LogUpdate
	private isUnmounted = false
	private layoutTree: LayoutTree
	private eventEmitter: EventEmitter
	private lastTerminalWidth: number
	private unsubscribeResize?: () => void

	constructor(options: RenderOptions = {}) {
		this.stdout = options.stdout || process.stdout
		this.stdin = options.stdin || process.stdin
		this.stderr = options.stderr || process.stderr

		this.layoutTree = new TaffyLayoutTree()
		this.rootNode = createNode('wolfie-root' as ElementNames, this.layoutTree)

		this.log = logUpdate.create(this.stdout)
		this.eventEmitter = new EventEmitter()
		this.lastTerminalWidth = this.getTerminalWidth()

		const maxFps = options.maxFps ?? 30
		const renderThrottleMs =
			maxFps > 0 ? Math.max(1, Math.ceil(1000 / maxFps)) : 0

		const throttledRender = throttle(
			this.onRender.bind(this),
			renderThrottleMs,
			{
				leading: true,
				trailing: true,
			}
		)

		this.rootNode.onRender = throttledRender

		layoutTreeRegistry.set(this.rootNode, {
			layoutTree: this.layoutTree,
			onRender: throttledRender,
		})

		this.rootNode.style = {
			flexDirection: 'column',
			alignItems: 'stretch',
			width: 80,
		}

		this.stdin.on('data', (data: Buffer) => {
			this.eventEmitter.emit('input', data.toString())
		})

		if (this.stdout.isTTY) {
			this.stdout.on('resize', this.resized)
			this.unsubscribeResize = () => {
				this.stdout.off('resize', this.resized)
			}
		}

		signalExit(() => this.unmount())
	}

	getTerminalWidth = () => {
		return this.stdout.columns || 80
	}

	resized = () => {
		const currentWidth = this.getTerminalWidth()

		if (currentWidth < this.lastTerminalWidth) {
			this.log.clear()
		}

		this.calculateLayout()
		this.onRender()

		this.lastTerminalWidth = currentWidth
	}

	private preMeasureTextNodes(node: DOMElement, maxWidth: number): void {
		let effectiveMaxWidth = maxWidth
		const nodeWidth = node.style?.width
		if (typeof nodeWidth === 'number') {
			const paddingH =
				parseNumericValue(
					node.style?.paddingLeft ?? node.style?.paddingX ?? node.style?.padding
				) +
				parseNumericValue(
					node.style?.paddingRight ??
						node.style?.paddingX ??
						node.style?.padding
				)
			const borderH = node.style?.borderStyle ? 2 : 0
			effectiveMaxWidth = Math.max(0, nodeWidth - paddingH - borderH)
		}

		if (node.nodeName === 'wolfie-text' && node.layoutNodeId !== undefined) {
			const text = squashTextNodes(node)
			const textWrap = node.style?.textWrap ?? 'wrap'

			let dimensions = measureText(text)

			if (dimensions.width > effectiveMaxWidth) {
				const wrappedText = wrapText(text, effectiveMaxWidth, textWrap)
				dimensions = measureText(wrappedText)
			}

			this.layoutTree.setTextDimensions(
				node.layoutNodeId,
				dimensions.width,
				dimensions.height
			)
		}

		for (const child of node.childNodes) {
			if (child.nodeName !== '#text') {
				this.preMeasureTextNodes(child as DOMElement, effectiveMaxWidth)
			}
		}
	}

	private resolveViewportUnitsInTree(node: DOMElement): void {
		if (!node.style) return

		const terminalWidth = this.getTerminalWidth()
		const terminalHeight = this.stdout.rows || 24

		const hasViewportUnits = Object.values(node.style).some(
			(val) =>
				typeof val === 'string' &&
				(val.includes('vw') ||
					val.includes('vh') ||
					val.includes('vmin') ||
					val.includes('vmax'))
		)

		if (hasViewportUnits) {
			const resolvedStyle = resolveViewportUnits(
				node.style,
				terminalWidth,
				terminalHeight
			)

			for (const [key, value] of Object.entries(resolvedStyle)) {
				node.style[key] = value
			}

			if (node.layoutNodeId !== undefined) {
				applyLayoutStyle(this.layoutTree, node.layoutNodeId, resolvedStyle)
			}
		}

		for (const child of node.childNodes) {
			if (child.nodeName !== '#text') {
				this.resolveViewportUnitsInTree(child as DOMElement)
			}
		}
	}

	calculateLayout = () => {
		const terminalWidth = this.getTerminalWidth()

		if (this.rootNode.layoutNodeId !== undefined) {
			this.resolveViewportUnitsInTree(this.rootNode)
			this.preMeasureTextNodes(this.rootNode, terminalWidth)

			const rootStyle: Record<string, unknown> = {
				flexDirection: 'column',
				alignItems: 'stretch',
			}

			if (!this.rootNode.style?.width) {
				rootStyle.width = { value: terminalWidth, unit: 'px' }
			}

			this.layoutTree.setStyle(this.rootNode.layoutNodeId, rootStyle)
			this.layoutTree.computeLayout(this.rootNode.layoutNodeId, terminalWidth)
		}
	}

	private onRender() {
		if (this.isUnmounted) return

		this.calculateLayout()
		const { output } = coreRenderer(this.rootNode, false, this.layoutTree)
		this.log(output)
	}

	writeToStdout(data: string): void {
		if (this.isUnmounted) return
		this.log.clear()
		this.stdout.write(data)
		const { output } = coreRenderer(this.rootNode, false, this.layoutTree)
		this.log(output)
	}

	writeToStderr(data: string): void {
		if (this.isUnmounted) return
		this.log.clear()
		this.stderr.write(data)
		const { output } = coreRenderer(this.rootNode, false, this.layoutTree)
		this.log(output)
	}

	render(component: Component) {
		this.app = getCreateApp()(component)

		const { mount } = this.app
		this.app.mount = (container: DOMElement) => {
			this.app.provide(StdinSymbol, {
				stdin: this.stdin,
				setRawMode: (value: boolean) => {
					if (this.stdin.isTTY) {
						this.stdin.setRawMode(value)
					}
				},
				isRawModeSupported: this.stdin.isTTY,
				internal_exitOnCtrlC: true,
				internal_eventEmitter: this.eventEmitter,
			})

			this.app.provide(StdoutSymbol, {
				stdout: this.stdout,
				write: (data: string) => this.writeToStdout(data),
			})

			this.app.provide(StderrSymbol, {
				stderr: this.stderr,
				write: (data: string) => this.writeToStderr(data),
			})

			this.app.provide(AppSymbol, {
				exit: (error?: Error) => {
					if (error) {
						this.stderr.write(error.stack || error.message)
					}
					this.unmount()
					process.exit(error ? 1 : 0)
				},
			})

			const proxy = mount(container)
			this.onRender()
			return proxy
		}

		this.app.mount(this.rootNode)
	}

	unmount() {
		if (this.isUnmounted) return
		this.isUnmounted = true
		if (this.app) {
			this.app.unmount()
		}

		if (this.unsubscribeResize) {
			this.unsubscribeResize()
		}

		this.log.done()
	}
}

export const render = (component: Component, options?: RenderOptions) => {
	const instance = new WolfieVue(options)
	instance.render(component)
	return instance
}

export {
	registerStyles,
	registerTailwindMetadata,
	clearGlobalStyles,
	getGlobalStyle,
	resolveClassName,
} from './styles'

export type { ClassNameValue } from './styles'

// Re-export Vue APIs
export {
	ref,
	reactive,
	computed,
	watch,
	watchEffect,
	onMounted,
	onUnmounted,
	onBeforeMount,
	onBeforeUnmount,
	onUpdated,
	onBeforeUpdate,
	getCurrentInstance,
	provide,
	inject,
	nextTick,
	toRef,
	toRefs,
	toRaw,
	unref,
	isRef,
	isReactive,
	isReadonly,
	shallowRef,
	shallowReactive,
	shallowReadonly,
	triggerRef,
	customRef,
	markRaw,
	effectScope,
	getCurrentScope,
	onScopeDispose,
	defineComponent,
	h,
} from 'vue'

export interface WolfieVuePluginOptions {
	tailwind?: boolean
}

//#region Vite Plugins

const WOLFIE_STYLE_PREFIX = '\x00wolfie-vue-style:'
const WOLFIE_CSS_MODULE_PREFIX = '\x00wolfie-vue-css-module:'

/**
 * Generate a short hash from a string (for scope IDs)
 */
function generateScopeId(input: string): string {
	let hash = 0
	for (let i = 0; i < input.length; i++) {
		const char = input.charCodeAt(i)
		hash = (hash << 5) - hash + char
		hash = hash & hash // Convert to 32bit integer
	}
	return Math.abs(hash).toString(36).slice(0, 8)
}

/**
 * SFC style handler plugin - redirects Vue SFC style modules to JavaScript
 * Uses resolveId + load hooks to completely replace the module before CSS pipeline
 */
function wolfieVueSfcStylePlugin(): import('vite').Plugin {
	const styleCache = new Map<string, string>()

	return {
		name: 'wolfie-vue-sfc-style',
		enforce: 'pre',

		// Intercept style modules and redirect to virtual JS module
		async resolveId(id, importer) {
			// 1. Handle Vue SFC style blocks
			if (id.includes('?vue&type=style')) {
				// Encode the original ID so other plugins don't recognize it as a Vue style
				// Use base64 to avoid any pattern matching issues
				const encoded = Buffer.from(id).toString('base64')
				return WOLFIE_STYLE_PREFIX + encoded + '.js'
			}

			// 2. Handle CSS Module imports (.module.css, .module.scss, etc.)
			// This intercepts BEFORE wolfieCSS so Vue gets class name exports
			const isCssModule =
				id.includes('.module.') &&
				/\.(css|scss|sass|less|styl|stylus)(\?.*)?$/.test(id)
			if (isCssModule && importer) {
				// Manually resolve the path to avoid other plugins transforming the ID
				const { dirname, resolve, isAbsolute } = await import('node:path')
				const importerDir = dirname(importer.split('?')[0]!)
				const resolvedPath = isAbsolute(id) ? id : resolve(importerDir, id)
				const cleanPath = resolvedPath.split('?')[0]! // Remove query string

				const encoded = Buffer.from(cleanPath).toString('base64')
				return WOLFIE_CSS_MODULE_PREFIX + encoded + '.js'
			}

			return null
		},

		// Provide JavaScript content for the virtual module
		async load(id) {
			const { readFileSync, existsSync } = await import('node:fs')

			// 1. Handle CSS Module imports (.module.css, .module.scss, etc.)
			if (id.startsWith(WOLFIE_CSS_MODULE_PREFIX)) {
				const encoded = id
					.slice(WOLFIE_CSS_MODULE_PREFIX.length)
					.replace(/\.js$/, '')
				const filePath = Buffer.from(encoded, 'base64').toString('utf-8')

				if (!existsSync(filePath)) {
					return { code: 'export default {}', map: null }
				}

				// Detect language from extension
				const extMatch = filePath.match(/\.(scss|sass|less|styl|stylus)$/)
				const ext = extMatch?.[1]
				const cssLang =
					ext === 'sass' || ext === 'scss'
						? 'scss'
						: ext === 'styl' || ext === 'stylus'
							? 'stylus'
							: ext === 'less'
								? 'less'
								: ('css' as const)

				const source = readFileSync(filePath, 'utf-8')
				const compiled = await compileCss(source, cssLang, filePath)
				const styles = parseCSS(compiled.css, {
					filename: filePath,
					camelCaseClasses: false,
				})

				// For CSS Modules: generate scoped class names and export mapping
				// This prevents collisions with global styles
				const scopeId = generateScopeId(filePath)
				const scopedStyles: Record<string, unknown> = {}
				const classNameMap: Record<string, string> = {}

				for (const [className, style] of Object.entries(styles)) {
					const scopedName = `${className}__${scopeId}`
					scopedStyles[scopedName] = style
					classNameMap[className] = scopedName
				}

				return {
					code: `import { registerStyles } from '@wolfie/vue'
registerStyles(${JSON.stringify(scopedStyles)})
export default ${JSON.stringify(classNameMap)}`,
					map: null,
				}
			}

			// 2. Handle Vue SFC style blocks
			if (!id.startsWith(WOLFIE_STYLE_PREFIX)) return null

			// Decode the original ID
			const encoded = id.slice(WOLFIE_STYLE_PREFIX.length).replace(/\.js$/, '')
			const originalId = Buffer.from(encoded, 'base64').toString('utf-8')

			// Extract file path and style block info from the virtual module ID
			// Format: /path/to/Component.vue?vue&type=style&index=0&lang.scss
			const [filePath] = originalId.split('?')
			const langMatch = originalId.match(/lang\.(\w+)/)
			const lang = (langMatch?.[1] || 'css') as
				| 'css'
				| 'scss'
				| 'less'
				| 'stylus'
			const indexMatch = originalId.match(/index=(\d+)/)
			const styleIndex = indexMatch ? parseInt(indexMatch[1]!, 10) : 0

			// Check for module attribute in the original ID
			const isModule = originalId.includes('&module')

			// Check cache first
			const cacheKey = `${filePath}:${styleIndex}`
			let styleContent = styleCache.get(cacheKey)
			let isModuleStyle = isModule

			if (!styleContent) {
				// Read the .vue file and extract the style block
				const vueContent = readFileSync(filePath!, 'utf-8')

				// Parse style blocks from the Vue SFC
				const styleBlocks = extractStyleBlocks(vueContent)
				const block = styleBlocks[styleIndex]

				if (!block) {
					return {
						code: 'export default {}',
						map: null,
					}
				}

				styleContent = block.content
				isModuleStyle = isModuleStyle || !!block.module
				styleCache.set(cacheKey, styleContent)
			}

			// Process the style content
			// 1. Compile SCSS/Less/Stylus to CSS
			const compiled = await compileCss(styleContent, lang, filePath!)
			// 2. Parse CSS to styles object, preserving original class names (no camelCase)
			const styles = parseCSS(compiled.css, {
				filename: filePath!,
				camelCaseClasses: false,
			})

			// Handle <style module> - prefix class names and export mapping
			if (isModuleStyle) {
				const scopeId = generateScopeId(filePath!)
				const scopedStyles: Record<string, unknown> = {}
				const classNameMap: Record<string, string> = {}

				for (const [className, style] of Object.entries(styles)) {
					const scopedName = `${className}__${scopeId}`
					scopedStyles[scopedName] = style
					classNameMap[className] = scopedName
				}

				return {
					code: `import { registerStyles } from '@wolfie/vue'
registerStyles(${JSON.stringify(scopedStyles)})
export default ${JSON.stringify(classNameMap)}`,
					map: null,
				}
			}

			// Regular styles - register and export style objects
			const stylesJson = JSON.stringify(styles)

			return {
				code: `import { registerStyles } from '@wolfie/vue'
const styles = ${stylesJson}
registerStyles(styles)
export default styles`,
				map: null,
			}
		},
	}
}

/**
 * Extract style blocks from Vue SFC content
 */
function extractStyleBlocks(
	content: string
): Array<{
	content: string
	lang?: string
	module?: boolean | string
	scoped?: boolean
}> {
	const styleRegex = /<style([^>]*)>([\s\S]*?)<\/style>/gi
	const blocks: Array<{
		content: string
		lang?: string
		module?: boolean | string
		scoped?: boolean
	}> = []

	let match
	while ((match = styleRegex.exec(content)) !== null) {
		const attrs = match[1] || ''
		const styleContent = match[2] || ''

		const langMatch = attrs.match(/lang=["']?(\w+)["']?/)
		const moduleMatch = attrs.match(/\bmodule(?:=["']?(\w+)["']?)?/)
		const scopedMatch = attrs.match(/\bscoped\b/)

		blocks.push({
			content: styleContent.trim(),
			lang: langMatch?.[1],
			module: moduleMatch ? moduleMatch[1] || true : undefined,
			scoped: !!scopedMatch,
		})
	}

	return blocks
}

/**
 * Main Vue plugin - runs AFTER @vitejs/plugin-vue compiles SFCs
 * Rewrites Vue imports to use @wolfie/vue
 */
function wolfieVueMainPlugin(): import('vite').Plugin {
	return {
		name: 'wolfie-vue',
		enforce: 'post',
		async transform(code, id) {
			// Rewrite Vue imports in compiled .vue files
			if (id.endsWith('.vue')) {
				code = code.replace(/from\s+['"]vue['"]/g, 'from "@wolfie/vue"')
				return { code, map: null }
			}
			return null
		},
	}
}

/**
 * Combined Vite plugin for wolfie Vue support
 * Returns array of plugins with different enforcement:
 * - SFC style handler (pre) - intercepts styles before CSS pipeline
 * - Main plugin (post) - rewrites Vue imports after SFC compilation
 */
export function wolfieVuePlugin(
	_options: WolfieVuePluginOptions = {}
): import('vite').Plugin[] {
	return [wolfieVueSfcStylePlugin(), wolfieVueMainPlugin()]
}

//#endregion Vite Plugins
