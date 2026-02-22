import type { LayoutTree, LayoutStyle, ComputedLayout } from './layout-types'
import type { logger as LoggerType } from './logger'

type ILogger = Pick<typeof LoggerType, 'enabled' | 'log'>

// #region LoggedLayoutTree
export class LoggedLayoutTree implements LayoutTree {
	constructor(
		private inner: LayoutTree,
		private log: ILogger
	) {}

	createNode(style: LayoutStyle): number {
		const id = this.inner.createNode(style)
		if (this.log.enabled) {
			this.log.log({
				ts: performance.now(),
				cat: 'layout',
				op: 'createNode',
				nodeId: id,
			})
		}
		return id
	}

	insertChild(parent: number, child: number, index: number): void {
		if (this.log.enabled) {
			this.log.log({
				ts: performance.now(),
				cat: 'layout',
				op: 'insertChild',
				parent,
				child,
				index,
			})
		}
		this.inner.insertChild(parent, child, index)
	}

	removeChild(parent: number, child: number): void {
		if (this.log.enabled) {
			this.log.log({
				ts: performance.now(),
				cat: 'layout',
				op: 'removeChild',
				parent,
				child,
			})
		}
		this.inner.removeChild(parent, child)
	}

	removeNode(node: number): void {
		if (this.log.enabled) {
			this.log.log({
				ts: performance.now(),
				cat: 'layout',
				op: 'removeNode',
				nodeId: node,
			})
		}
		this.inner.removeNode(node)
	}

	setStyle(node: number, style: LayoutStyle): void {
		if (this.log.enabled) {
			this.log.log({
				ts: performance.now(),
				cat: 'layout',
				op: 'setStyle',
				nodeId: node,
				style,
			})
		}
		this.inner.setStyle(node, style)
	}

	setTextDimensions(node: number, width: number, height: number): void {
		if (this.log.enabled) {
			this.log.log({
				ts: performance.now(),
				cat: 'layout',
				op: 'setTextDims',
				nodeId: node,
				width,
				height,
			})
		}
		this.inner.setTextDimensions(node, width, height)
	}

	markDirty(node: number): void {
		if (this.log.enabled) {
			this.log.log({
				ts: performance.now(),
				cat: 'layout',
				op: 'markDirty',
				nodeId: node,
			})
		}
		this.inner.markDirty(node)
	}

	setDisplayNone(node: number): void {
		// WHY: no logging — display:none toggles happen often (conditional rendering)
		// and don't carry info useful for adapter debugging
		this.inner.setDisplayNone(node)
	}

	setDisplayFlex(node: number): void {
		this.inner.setDisplayFlex(node)
	}

	computeLayout(root: number, width: number, height?: number | null): void {
		// WHY: computeLayout is the Taffy Flexbox solver — the most expensive operation.
		// Timing it reveals layout performance regressions in new adapter implementations.
		const t0 = performance.now()
		this.inner.computeLayout(root, width, height)
		if (this.log.enabled) {
			this.log.log({
				ts: t0,
				cat: 'layout',
				op: 'computeLayout',
				rootId: root,
				width,
				durationMs: performance.now() - t0,
			})
		}
	}

	getLayout(node: number): ComputedLayout {
		return this.inner.getLayout(node)
	}

	getChildCount(node: number): number {
		return this.inner.getChildCount(node)
	}
}
// #endregion LoggedLayoutTree
