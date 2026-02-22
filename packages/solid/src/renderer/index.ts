import { createRenderer } from 'solid-js/universal'
import { createNodeOps, type NodeOpsConfig } from './node-ops'
import type { DOMNode } from '@wolfie/core'
import type { Renderer } from 'solid-js/universal'

//#region Renderer Singleton
let activeConfig: NodeOpsConfig | null = null
let _renderer: Renderer<DOMNode> | null = null

export function setRendererConfig(config: NodeOpsConfig) {
	activeConfig = config
	_renderer = null // Reset on config change
}

function getRenderer(): Renderer<DOMNode> {
	if (!_renderer) {
		if (!activeConfig) {
			throw new Error(
				'Renderer config not set. Call setRendererConfig() before using the renderer.'
			)
		}
		_renderer = createRenderer<DOMNode>(createNodeOps(activeConfig))
	}
	return _renderer
}
//#endregion Renderer Singleton

//#region Re-exports for compiled JSX
export function render(code: () => DOMNode, node: DOMNode): () => void {
	return getRenderer().render(code, node)
}

export function effect<T>(fn: (prev?: T) => T, init?: T): void {
	return getRenderer().effect(fn, init)
}

export function memo<T>(fn: () => T, equal: boolean): () => T {
	return getRenderer().memo(fn, equal)
}

export function createComponent<T>(
	Comp: (props: T) => DOMNode,
	props: T
): DOMNode {
	return getRenderer().createComponent(Comp, props)
}

export function createElement(tag: string): DOMNode {
	return getRenderer().createElement(tag)
}

export function createTextNode(value: string): DOMNode {
	return getRenderer().createTextNode(value)
}

export function insertNode(
	parent: DOMNode,
	node: DOMNode,
	anchor?: DOMNode
): void {
	return getRenderer().insertNode(parent, node, anchor)
}

export function insert<T>(
	parent: any,
	accessor: (() => T) | T,
	marker?: any | null,
	initial?: any
): DOMNode {
	return getRenderer().insert(parent, accessor, marker, initial)
}

export function spread<T>(
	node: any,
	accessor: (() => T) | T,
	skipChildren?: boolean
): void {
	return getRenderer().spread(node, accessor, skipChildren)
}

export function setProp<T>(node: DOMNode, name: string, value: T, prev?: T): T {
	return getRenderer().setProp(node, name, value, prev)
}

export function mergeProps(...sources: unknown[]): unknown {
	return getRenderer().mergeProps(...sources)
}

export function use<A, T>(
	fn: (element: DOMNode, arg: A) => T,
	element: DOMNode,
	arg: A
): T {
	return getRenderer().use(fn, element, arg)
}
//#endregion Re-exports for compiled JSX
