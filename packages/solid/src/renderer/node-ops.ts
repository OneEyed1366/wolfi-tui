import {
	createNode,
	createTextNode,
	appendChildNode,
	insertBeforeNode,
	removeChildNode,
	setAttribute,
	setStyle,
	setTextNodeValue,
	applyLayoutStyle,
	isElement,
	isText,
	logger,
	type DOMElement,
	type DOMNode,
	type TextNode,
	type ElementNames,
	type LayoutTree,
	type Styles,
	type OutputTransformer,
} from '@wolfie/core'
import type { RendererOptions } from 'solid-js/universal'

//#region Types
export interface NodeOpsConfig {
	getLayoutTree: () => LayoutTree
	getScheduleRender: () => (() => void) | undefined
}
//#endregion Types

//#region Layout Tree Init
const initLayoutTreeRecursively = (
	node: DOMElement,
	layoutTree: LayoutTree
) => {
	const wasUndefined = node.layoutNodeId === undefined

	if (wasUndefined && node.nodeName !== 'wolfie-virtual-text') {
		node.layoutNodeId = layoutTree.createNode({})
		node.layoutTree = layoutTree
		if (Object.keys(node.style).length > 0) {
			applyLayoutStyle(layoutTree, node.layoutNodeId, node.style)
		}
	}

	const children = node.childNodes
	let layoutChildIndex = 0
	for (let i = 0; i < children.length; i++) {
		const child = children[i]
		if (isElement(child)) {
			initLayoutTreeRecursively(child, layoutTree)

			if (
				wasUndefined &&
				node.layoutNodeId !== undefined &&
				child.layoutNodeId !== undefined
			) {
				layoutTree.insertChild(
					node.layoutNodeId,
					child.layoutNodeId,
					layoutChildIndex
				)
				layoutChildIndex++
			}
		}
	}
}
//#endregion Layout Tree Init

//#region Factory
export function createNodeOps(config: NodeOpsConfig): RendererOptions<DOMNode> {
	return {
		createElement(tag: string): DOMNode {
			const wolfieTag = tag.startsWith('wolfie-') ? tag : `wolfie-${tag}`
			if (logger.enabled) {
				logger.log({
					ts: performance.now(),
					cat: 'solid',
					op: 'createElement',
					name: wolfieTag,
				})
			}
			return createNode(wolfieTag as ElementNames)
		},

		createTextNode(value: unknown): DOMNode {
			// WHY: Solid universal renderer passes numbers/booleans from dynamic JSX
			// expressions (e.g. {score}, {wave}) — coerce to string before hitting core
			const str = value == null ? '' : String(value)
			if (logger.enabled) {
				logger.log({
					ts: performance.now(),
					cat: 'solid',
					op: 'createTextNode',
					value: str,
				})
			}
			return createTextNode(str)
		},

		replaceText(textNode: DOMNode, value: unknown): void {
			if (isText(textNode)) {
				// WHY: same coercion as createTextNode — Solid may pass non-strings on reactive updates
				const str = value == null ? '' : String(value)
				const layoutTree = config.getLayoutTree()
				setTextNodeValue(textNode as TextNode, str, layoutTree)
				config.getScheduleRender()?.()
			}
		},

		isTextNode(node: DOMNode): boolean {
			return isText(node)
		},

		setProperty<T>(node: DOMNode, name: string, value: T): void {
			if (!isElement(node)) return
			const el = node as DOMElement
			const layoutTree = config.getLayoutTree()

			if (name === 'style') {
				if (logger.enabled) {
					logger.log({
						ts: performance.now(),
						cat: 'solid',
						op: 'setProperty',
						name: 'style',
						nodeName: el.nodeName,
					})
				}
				const styles = value as Styles
				setStyle(el, styles)
				if (el.layoutNodeId !== undefined) {
					applyLayoutStyle(layoutTree, el.layoutNodeId, styles)
				}
			} else if (name === 'class' || name === 'className') {
				setAttribute(el, 'class', value as string)
			} else if (name === 'internal_transform') {
				el.internal_transform = value as OutputTransformer
			} else if (name === 'internal_static') {
				el.internal_static = value as boolean
			} else if (name === 'internal_accessibility') {
				setAttribute(el, 'internal_accessibility', value as string)
			} else if (name.startsWith('on')) {
				const eventName = name.slice(2).toLowerCase()
				setAttribute(el, `on${eventName}`, value as string)
			} else {
				setAttribute(el, name, value as string)
			}

			config.getScheduleRender()?.()
		},

		insertNode(parent: DOMNode, node: DOMNode, anchor?: DOMNode): void {
			if (logger.enabled) {
				logger.log({
					ts: performance.now(),
					cat: 'solid',
					op: 'insertNode',
					parentName: parent.nodeName,
					childName: node.nodeName,
				})
			}
			const layoutTree = config.getLayoutTree()

			if (isElement(node)) {
				initLayoutTreeRecursively(node as DOMElement, layoutTree)
			}

			if (anchor) {
				insertBeforeNode(parent as DOMElement, node, anchor, layoutTree)
			} else {
				appendChildNode(parent as DOMElement, node, layoutTree)
			}

			// Mark dirty for text measurement
			if (
				node.nodeName === 'wolfie-text' ||
				parent.nodeName === 'wolfie-text'
			) {
				const layoutNodeId =
					(parent as DOMElement).layoutNodeId ??
					(node as DOMElement).layoutNodeId
				if (layoutNodeId !== undefined) {
					layoutTree.markDirty(layoutNodeId)
				}
			}

			config.getScheduleRender()?.()
		},

		removeNode(parent: DOMNode, node: DOMNode): void {
			if (logger.enabled) {
				logger.log({
					ts: performance.now(),
					cat: 'solid',
					op: 'removeNode',
					parentName: parent.nodeName,
					childName: node.nodeName,
				})
			}
			const layoutTree = config.getLayoutTree()
			removeChildNode(parent as DOMElement, node, layoutTree)
			config.getScheduleRender()?.()
		},

		getParentNode(node: DOMNode): DOMNode | undefined {
			return node.parentNode ?? undefined
		},

		getFirstChild(node: DOMNode): DOMNode | undefined {
			if (isElement(node)) {
				return (node as DOMElement).childNodes[0] ?? undefined
			}
			return undefined
		},

		getNextSibling(node: DOMNode): DOMNode | undefined {
			const parent = node.parentNode
			if (!parent) return undefined
			const index = parent.childNodes.indexOf(node)
			return parent.childNodes[index + 1] ?? undefined
		},
	}
}
//#endregion Factory
