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
	AccessibilitySymbol,
} from './context/symbols'
// Note: CSS compilation moved to @wolfie/plugin

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
	/**
	 * Enable debug mode (disables throttling for synchronous testing)
	 */
	debug?: boolean
	/**
	 * Enable screen reader mode. When enabled, the renderer outputs
	 * plain text optimized for screen readers without ANSI styles.
	 *
	 * @default process.env['INK_SCREEN_READER'] === 'true'
	 */
	isScreenReaderEnabled?: boolean
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
	private isScreenReaderEnabled!: boolean

	constructor(options: RenderOptions = {}) {
		this.stdout = options.stdout || process.stdout
		this.stdin = options.stdin || process.stdin
		this.stderr = options.stderr || process.stderr

		this.layoutTree = new TaffyLayoutTree()
		this.rootNode = createNode('wolfie-root' as ElementNames, this.layoutTree)

		this.log = logUpdate.create(this.stdout)
		this.eventEmitter = new EventEmitter()
		this.lastTerminalWidth = this.getTerminalWidth()

		this.isScreenReaderEnabled =
			options.isScreenReaderEnabled ??
			process.env['INK_SCREEN_READER'] === 'true'

		// In debug mode or screen reader mode, disable throttling for synchronous rendering
		const unthrottled = options.debug === true || this.isScreenReaderEnabled
		const maxFps = options.maxFps ?? 30
		const renderThrottleMs =
			unthrottled || maxFps <= 0 ? 0 : Math.max(1, Math.ceil(1000 / maxFps))

		const renderFn = this.onRender.bind(this)
		const throttledRender =
			renderThrottleMs > 0
				? throttle(renderFn, renderThrottleMs, {
						leading: true,
						trailing: true,
					})
				: renderFn

		this.rootNode.onRender = throttledRender

		layoutTreeRegistry.set(this.rootNode, {
			layoutTree: this.layoutTree,
			onRender: throttledRender,
		})

		// Set default style for root node to match React behavior
		// flexDirection: 'column' makes the main axis vertical, so alignItems: 'stretch'
		// stretches children horizontally (along the cross-axis = width)
		// NOTE: Do NOT set width here - it's set dynamically in calculateLayout
		this.rootNode.style = {
			flexDirection: 'column',
			alignItems: 'stretch',
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
		const { output } = coreRenderer(
			this.rootNode,
			this.isScreenReaderEnabled,
			this.layoutTree
		)
		this.log(output)
	}

	writeToStdout(data: string): void {
		if (this.isUnmounted) return
		this.log.clear()
		this.stdout.write(data)
		const { output } = coreRenderer(
			this.rootNode,
			this.isScreenReaderEnabled,
			this.layoutTree
		)
		this.log(output)
	}

	writeToStderr(data: string): void {
		if (this.isUnmounted) return
		this.log.clear()
		this.stderr.write(data)
		const { output } = coreRenderer(
			this.rootNode,
			this.isScreenReaderEnabled,
			this.layoutTree
		)
		this.log(output)
	}

	render(component: Component) {
		this.app = getCreateApp()(component)

		// Reference count for raw mode - only disable when all consumers release
		let rawModeRefCount = 0

		// Provide context values BEFORE mounting - Vue requires this
		this.app.provide(StdinSymbol, {
			stdin: this.stdin,
			setRawMode: (value: boolean) => {
				if (this.stdin.isTTY) {
					if (value) {
						rawModeRefCount++
						if (rawModeRefCount === 1) {
							this.stdin.setRawMode(true)
						}
					} else {
						rawModeRefCount = Math.max(0, rawModeRefCount - 1)
						if (rawModeRefCount === 0) {
							this.stdin.setRawMode(false)
						}
					}
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

		this.app.provide(AccessibilitySymbol, {
			isScreenReaderEnabled: this.isScreenReaderEnabled,
		})

		const { mount } = this.app
		this.app.mount = (container: DOMElement) => {
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

// Re-export components
export * from './components'

// Re-export composables
export { useApp } from './composables/use-app'
export { useInput } from './composables/use-input'
export { useStdin } from './composables/use-stdin'
export { useStdout } from './composables/use-stdout'
export { useStderr } from './composables/use-stderr'

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
