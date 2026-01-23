import { createRenderer, type App, type Component } from 'vue'
import { EventEmitter } from 'node:events'
import { nodeOps } from './renderer/nodeOps'
import { patchProp } from './renderer/patchProp'
import {
	createNode,
	renderer as coreRenderer,
	logUpdate,
	squashTextNodes,
	measureText,
	wrapText,
	resolveViewportUnits,
	parseNumericValue,
	applyLayoutStyle,
	type DOMElement,
	type LayoutTree,
	type ElementNames,
} from '@wolfie/core'
import { LayoutTree as TaffyLayoutTree } from '@wolfie/core/layout'
import { throttle } from 'es-toolkit/compat'
import signalExit from 'signal-exit'
import { StdinSymbol, StdoutSymbol, StderrSymbol, AppSymbol } from './symbols'

const { createApp: createVueApp } = createRenderer({ ...nodeOps, patchProp })

export interface RenderOptions {
	stdout?: NodeJS.WriteStream
	stdin?: NodeJS.ReadStream
	stderr?: NodeJS.WriteStream
	maxFps?: number
}

// Registry to allow nodeOps and patchProp to find the layoutTree for a given node
export const layoutTreeRegistry = new WeakMap<DOMElement, LayoutTree>()

class WolfieVue {
	private rootNode: DOMElement
	private app!: App<DOMElement>
	private stdout: NodeJS.WriteStream
	private stdin: NodeJS.ReadStream
	private stderr: NodeJS.WriteStream
	private log: any
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
		layoutTreeRegistry.set(this.rootNode, this.layoutTree)
		this.rootNode.style = {
			flexDirection: 'column',
			alignItems: 'stretch',
			width: 80,
		}

		this.log = logUpdate.create(this.stdout)
		this.eventEmitter = new EventEmitter()
		this.lastTerminalWidth = this.getTerminalWidth()

		const maxFps = options.maxFps ?? 30
		const renderThrottleMs =
			maxFps > 0 ? Math.max(1, Math.ceil(1000 / maxFps)) : 0

		this.rootNode.onRender = throttle(
			this.onRender.bind(this),
			renderThrottleMs,
			{
				leading: true,
				trailing: true,
			}
		)

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
		// Determine the effective max width for this node
		let effectiveMaxWidth = maxWidth
		const nodeWidth = node.style?.width
		if (typeof nodeWidth === 'number') {
			// Account for padding and border
			const paddingH =
				parseNumericValue(
					node.style?.paddingLeft ?? node.style?.paddingX ?? node.style?.padding
				) +
				parseNumericValue(
					node.style?.paddingRight ??
						node.style?.paddingX ??
						node.style?.padding
				)
			const borderH = node.style?.borderStyle ? 2 : 0 // 1 char each side if border
			effectiveMaxWidth = Math.max(0, nodeWidth - paddingH - borderH)
		}

		// For wolfie-text nodes, measure the text content
		if (node.nodeName === 'wolfie-text' && node.layoutNodeId !== undefined) {
			const text = squashTextNodes(node)
			const textWrap = node.style?.textWrap ?? 'wrap'

			// Measure or wrap text based on available width
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

		// Recurse into children
		for (const child of node.childNodes) {
			if ('childNodes' in child) {
				this.preMeasureTextNodes(child as DOMElement, effectiveMaxWidth)
			}
		}
	}

	private resolveViewportUnitsInTree(node: DOMElement): void {
		if (!node.style) return

		const terminalWidth = this.getTerminalWidth()
		const terminalHeight = this.stdout.rows || 24

		// Check if any viewport units are present in the style
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

			// Update the node's style with resolved values
			for (const [key, value] of Object.entries(resolvedStyle)) {
				;(node.style as any)[key] = value
			}

			if (node.layoutNodeId !== undefined) {
				applyLayoutStyle(this.layoutTree, node.layoutNodeId, resolvedStyle)
			}
		}

		// Recurse into children
		for (const child of node.childNodes) {
			if ('childNodes' in child) {
				this.resolveViewportUnitsInTree(child as DOMElement)
			}
		}
	}

	calculateLayout = () => {
		const terminalWidth = this.getTerminalWidth()

		if (this.rootNode.layoutNodeId !== undefined) {
			this.resolveViewportUnitsInTree(this.rootNode)
			this.preMeasureTextNodes(this.rootNode, terminalWidth)

			const rootStyle: any = {
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
		this.app = createVueApp(component)

		// Disable SSR warnings and logic in TUI environment
		this.app.config.compilerOptions.isCustomElement = (tag) =>
			tag.startsWith('wolfie-')

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

		this.app.mount(this.rootNode)

		// Initial render trigger
		this.onRender()
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

export * from './components/index'
export * from './hooks/use-input'
export * from './hooks/use-stdin'
export * from './hooks/use-stdout'
export * from './hooks/use-stderr'
export * from './hooks/use-app'
