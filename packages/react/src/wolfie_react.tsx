import process from 'node:process'
import React, { type ReactNode } from 'react'
import { throttle } from 'es-toolkit/compat'
import ansiEscapes from 'ansi-escapes'
import isInCi from 'is-in-ci'
import autoBind from 'auto-bind'
import signalExit from 'signal-exit'
import patchConsole from 'patch-console'
import { LegacyRoot } from 'react-reconciler/constants'
import { type FiberRoot } from 'react-reconciler'
import wrapAnsi from 'wrap-ansi'
import {
	renderer,
	createNode,
	logUpdate,
	squashTextNodes,
	measureText,
	wrapText,
	type DOMElement,
	type LogUpdate,
	type LayoutTree,
	resolveViewportUnits,
	applyLayoutStyle,
	parseNumericValue,
} from '@wolfie/core'
import reconciler, {
	registerLayoutTree,
	unregisterLayoutTree,
} from './reconciler'
import instances from './instances'
import { App } from './components/App'
import { accessibilityContext as AccessibilityContext } from './context/AccessibilityContext'

const noop = () => {}

/**
Performance metrics for a render operation.
*/
export type IRenderMetrics = {
	/**
	Time spent rendering in milliseconds.
	*/
	renderTime: number
}

export type IOptions = {
	stdout: NodeJS.WriteStream
	stdin: NodeJS.ReadStream
	stderr: NodeJS.WriteStream
	debug: boolean
	exitOnCtrlC: boolean
	patchConsole: boolean
	onRender?: (metrics: IRenderMetrics) => void
	isScreenReaderEnabled?: boolean
	waitUntilExit?: () => Promise<void>
	maxFps?: number
	incrementalRendering?: boolean
	/**
	 * Taffy layout tree for layout calculations.
	 * Required for proper layout functionality.
	 */
	layoutTree?: LayoutTree
}

export default class WolfieReact {
	private options: IOptions
	private log: LogUpdate
	private throttledLog: LogUpdate
	private isScreenReaderEnabled: boolean

	// Ignore last render after unmounting a tree to prevent empty output before exit
	private isUnmounted: boolean
	private lastOutput: string
	private lastOutputHeight: number
	private lastTerminalWidth: number
	private container: FiberRoot
	private rootNode: DOMElement
	// Phase 2: Taffy layout tree (optional - only used if LayoutTree implementation is available)
	private layoutTree?: LayoutTree
	// This variable is used only in debug mode to store full static output
	// so that it's rerendered every time, not just new static parts, like in non-debug mode
	private fullStaticOutput: string
	private exitPromise?: Promise<void>
	private restoreConsole?: () => void
	private unsubscribeResize?: () => void

	constructor(options: IOptions) {
		autoBind(this)

		this.options = options

		// Phase 2: Use Taffy layout tree if provided via options
		this.layoutTree = options.layoutTree

		this.rootNode = createNode('wolfie-root', this.layoutTree)

		// Set default style for root node to match Yoga behavior
		// flexDirection: 'column' makes the main axis vertical, so alignItems: 'stretch'
		// stretches children horizontally (along the cross-axis = width)
		this.rootNode.style = { flexDirection: 'column', alignItems: 'stretch' }

		// Register layoutTree with reconciler if available
		if (this.layoutTree) {
			registerLayoutTree(this.rootNode, this.layoutTree)

			// Apply default style to Taffy layout node
			if (this.rootNode.layoutNodeId !== undefined) {
				this.layoutTree.setStyle(this.rootNode.layoutNodeId, {
					flexDirection: 'column',
					alignItems: 'stretch',
				})
			}
		}

		this.rootNode.onComputeLayout = this.calculateLayout

		this.isScreenReaderEnabled =
			options.isScreenReaderEnabled ??
			process.env['INK_SCREEN_READER'] === 'true'

		const unthrottled = options.debug || this.isScreenReaderEnabled
		const maxFps = options.maxFps ?? 30
		const renderThrottleMs =
			maxFps > 0 ? Math.max(1, Math.ceil(1000 / maxFps)) : 0

		this.rootNode.onRender = unthrottled
			? this.onRender
			: throttle(this.onRender, renderThrottleMs, {
					leading: true,
					trailing: true,
				})

		this.rootNode.onImmediateRender = this.onRender
		this.log = logUpdate.create(options.stdout, {
			incremental: options.incrementalRendering,
		})
		this.throttledLog = unthrottled
			? this.log
			: (throttle(this.log, undefined, {
					leading: true,
					trailing: true,
				}) as unknown as LogUpdate)

		// Ignore last render after unmounting a tree to prevent empty output before exit
		this.isUnmounted = false

		// Store last output to only rerender when needed
		this.lastOutput = ''
		this.lastOutputHeight = 0
		this.lastTerminalWidth = this.getTerminalWidth()

		// This variable is used only in debug mode to store full static output
		// so that it's rerendered every time, not just new static parts, like in non-debug mode
		this.fullStaticOutput = ''

		this.container = reconciler.createContainer(
			this.rootNode,
			LegacyRoot,
			null,
			false,
			null,
			'id',
			() => {},
			() => {},
			() => {},
			() => {},
			null
		)

		// Unmount when process exits
		this.unsubscribeExit = signalExit(this.unmount, { alwaysLast: false })

		if (process.env['DEV'] === 'true') {
			reconciler.injectIntoDevTools({
				bundleType: 0,
				// Reporting React DOM's version, not Wolfie's
				// See https://github.com/facebook/react/issues/16666#issuecomment-532639905
				version: '16.13.1',
				rendererPackageName: 'ink',
			})
		}

		if (options.patchConsole) {
			this.patchConsole()
		}

		if (!isInCi) {
			options.stdout.on('resize', this.resized)

			this.unsubscribeResize = () => {
				options.stdout.off('resize', this.resized)
			}
		}
	}

	getTerminalWidth = () => {
		// The 'columns' property can be undefined or 0 when not using a TTY.
		// In that case we fall back to 80.
		return this.options.stdout.columns || 80
	}

	resized = () => {
		const currentWidth = this.getTerminalWidth()

		if (currentWidth < this.lastTerminalWidth) {
			// We clear the screen when decreasing terminal width to prevent duplicate overlapping re-renders.
			this.log.clear()
			this.lastOutput = ''
		}

		this.calculateLayout()
		this.onRender()

		this.lastTerminalWidth = currentWidth
	}

	resolveExitPromise: () => void = () => {}
	rejectExitPromise: (reason?: Error) => void = () => {}
	unsubscribeExit: () => void = () => {}

	/**
	 * Pre-measure all text nodes for Taffy layout.
	 * Must be called before computeLayout() since Taffy doesn't support measure callbacks.
	 *
	 * Note: Taffy requires dimensions to be set BEFORE computeLayout() - no callbacks.
	 * We propagate constraints from parent nodes with explicit widths to enable
	 * proper text wrapping within constrained containers.
	 */
	private preMeasureTextNodes(node: DOMElement, maxWidth: number): void {
		if (!this.layoutTree) return

		// Determine the effective max width for this node
		// If the node has an explicit width, use that for children
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

		// Recurse into children with the effective max width
		for (const child of node.childNodes) {
			if ('childNodes' in child) {
				this.preMeasureTextNodes(child as DOMElement, effectiveMaxWidth)
			}
		}
	}

	/**
	 * Resolve viewport units in DOM tree before computing layout
	 * Traverses the DOM tree and updates styles with resolved values
	 */
	private resolveViewportUnitsInTree(node: DOMElement): void {
		if (!node.style) return

		// Resolve viewport units in this node's style
		const terminalWidth = this.getTerminalWidth()
		const terminalHeight = this.options.stdout.rows || 24

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
			// Resolve viewport units and update style
			const resolvedStyle = resolveViewportUnits(
				node.style,
				terminalWidth,
				terminalHeight
			)

			// Update the node's style with resolved values
			for (const [key, value] of Object.entries(resolvedStyle)) {
				;(node.style as any)[key] = value
			}

			// Update the layout tree with resolved style
			if (this.layoutTree && node.layoutNodeId !== undefined) {
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

		// Taffy layout - requires pre-measurement before computeLayout
		if (this.layoutTree && this.rootNode.layoutNodeId !== undefined) {
			// Resolve viewport units in the entire tree
			this.resolveViewportUnitsInTree(this.rootNode)

			// Pre-measure text nodes before layout (Taffy has no measure callbacks)
			this.preMeasureTextNodes(this.rootNode, terminalWidth)

			// Set root style, preserving existing width if set
			// This is important for viewport units like 100vw on root children
			const rootStyle: any = {
				flexDirection: 'column',
				alignItems: 'stretch',
			}

			// Only set width if root node doesn't have one already (to avoid overriding viewport units)
			if (!this.rootNode.style?.width) {
				rootStyle.width = { value: terminalWidth, unit: 'px' }
			}

			this.layoutTree.setStyle(this.rootNode.layoutNodeId, rootStyle)
			this.layoutTree.computeLayout(this.rootNode.layoutNodeId, terminalWidth)
		}
	}

	onRender: () => void = () => {
		if (this.isUnmounted) {
			return
		}

		const startTime = performance.now()
		const { output, outputHeight, staticOutput } = renderer(
			this.rootNode,
			this.isScreenReaderEnabled,
			this.layoutTree
		)

		this.options.onRender?.({ renderTime: performance.now() - startTime })

		// If <Static> output isn't empty, it means new children have been added to it
		const hasStaticOutput = staticOutput && staticOutput !== '\n'

		if (this.options.debug) {
			if (hasStaticOutput) {
				this.fullStaticOutput += staticOutput
			}

			this.options.stdout.write(this.fullStaticOutput + output)
			return
		}

		if (isInCi) {
			if (hasStaticOutput) {
				this.options.stdout.write(staticOutput)
			}

			this.lastOutput = output
			this.lastOutputHeight = outputHeight
			return
		}

		if (this.isScreenReaderEnabled) {
			if (hasStaticOutput) {
				// We need to erase the main output before writing new static output
				const erase =
					this.lastOutputHeight > 0
						? ansiEscapes.eraseLines(this.lastOutputHeight)
						: ''
				this.options.stdout.write(erase + staticOutput)
				// After erasing, the last output is gone, so we should reset its height
				this.lastOutputHeight = 0
			}

			if (output === this.lastOutput && !hasStaticOutput) {
				return
			}

			const terminalWidth = this.options.stdout.columns || 80

			const wrappedOutput = wrapAnsi(output, terminalWidth, {
				trim: false,
				hard: true,
			})

			// If we haven't erased yet, do it now.
			if (hasStaticOutput) {
				this.options.stdout.write(wrappedOutput)
			} else {
				const erase =
					this.lastOutputHeight > 0
						? ansiEscapes.eraseLines(this.lastOutputHeight)
						: ''
				this.options.stdout.write(erase + wrappedOutput)
			}

			this.lastOutput = output
			this.lastOutputHeight =
				wrappedOutput === '' ? 0 : wrappedOutput.split('\n').length
			return
		}

		if (hasStaticOutput) {
			this.fullStaticOutput += staticOutput
		}

		if (this.lastOutputHeight >= this.options.stdout.rows) {
			this.options.stdout.write(
				ansiEscapes.clearTerminal + this.fullStaticOutput + output
			)
			this.lastOutput = output
			this.lastOutputHeight = outputHeight
			this.log.sync(output)
			return
		}

		// To ensure static output is cleanly rendered before main output, clear main output first
		if (hasStaticOutput) {
			this.log.clear()
			this.options.stdout.write(staticOutput)
			this.log(output)
		}

		if (!hasStaticOutput && output !== this.lastOutput) {
			this.throttledLog(output)
		}

		this.lastOutput = output
		this.lastOutputHeight = outputHeight
	}

	render(node: ReactNode): void {
		const tree = (
			<AccessibilityContext.Provider
				value={{ isScreenReaderEnabled: this.isScreenReaderEnabled }}
			>
				<App
					stdin={this.options.stdin}
					stdout={this.options.stdout}
					stderr={this.options.stderr}
					writeToStdout={this.writeToStdout}
					writeToStderr={this.writeToStderr}
					exitOnCtrlC={this.options.exitOnCtrlC}
					onExit={this.unmount}
				>
					{node}
				</App>
			</AccessibilityContext.Provider>
		)

		// @ts-expect-error the types for `react-reconciler` are not up to date with the library.

		reconciler.updateContainerSync(tree, this.container, null, noop)
		// @ts-expect-error the types for `react-reconciler` are not up to date with the library.

		reconciler.flushSyncWork()
	}

	writeToStdout(data: string): void {
		if (this.isUnmounted) {
			return
		}

		if (this.options.debug) {
			this.options.stdout.write(data + this.fullStaticOutput + this.lastOutput)
			return
		}

		if (isInCi) {
			this.options.stdout.write(data)
			return
		}

		this.log.clear()
		this.options.stdout.write(data)
		this.log(this.lastOutput)
	}

	writeToStderr(data: string): void {
		if (this.isUnmounted) {
			return
		}

		if (this.options.debug) {
			this.options.stderr.write(data)
			this.options.stdout.write(this.fullStaticOutput + this.lastOutput)
			return
		}

		if (isInCi) {
			this.options.stderr.write(data)
			return
		}

		this.log.clear()
		this.options.stderr.write(data)
		this.log(this.lastOutput)
	}

	unmount(error?: Error | number | null): void {
		if (this.isUnmounted) {
			return
		}

		this.calculateLayout()
		this.onRender()
		this.unsubscribeExit()

		if (typeof this.restoreConsole === 'function') {
			this.restoreConsole()
		}

		if (typeof this.unsubscribeResize === 'function') {
			this.unsubscribeResize()
		}

		// CIs don't handle erasing ansi escapes well, so it's better to
		// only render last frame of non-static output
		if (isInCi) {
			this.options.stdout.write(this.lastOutput + '\n')
		} else if (!this.options.debug) {
			this.log.done()
		}

		this.isUnmounted = true

		// @ts-expect-error the types for `react-reconciler` are not up to date with the library.

		reconciler.updateContainerSync(null, this.container, null, noop)
		// @ts-expect-error the types for `react-reconciler` are not up to date with the library.

		reconciler.flushSyncWork()
		instances.delete(this.options.stdout)

		// Phase 2: Unregister layoutTree from reconciler
		unregisterLayoutTree(this.rootNode)

		if (error instanceof Error) {
			this.rejectExitPromise(error)
		} else {
			this.resolveExitPromise()
		}
	}

	async waitUntilExit(): Promise<void> {
		this.exitPromise ||= new Promise((resolve, reject) => {
			this.resolveExitPromise = resolve
			this.rejectExitPromise = reject
		})

		return this.exitPromise
	}

	clear(): void {
		if (!isInCi && !this.options.debug) {
			this.log.clear()
		}
	}

	patchConsole(): void {
		if (this.options.debug) {
			return
		}

		this.restoreConsole = patchConsole((stream, data) => {
			if (stream === 'stdout') {
				this.writeToStdout(data)
			}

			if (stream === 'stderr') {
				const isReactMessage = data.startsWith('The above error occurred')

				if (!isReactMessage) {
					this.writeToStderr(data)
				}
			}
		})
	}
}
