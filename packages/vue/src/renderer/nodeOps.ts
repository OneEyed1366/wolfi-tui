import {
	createNode,
	createTextNode,
	appendChildNode,
	insertBeforeNode,
	removeChildNode,
	setAttribute,
	setTextNodeValue,
	applyLayoutStyle,
	isElement,
	isText,
	type DOMElement,
	type TextNode,
	type ElementNames,
	type LayoutTree,
	type DOMNode,
} from '@wolfie/core'
import { type RendererOptions } from 'vue'
import { layoutTreeRegistry, type WolfieVueInstance } from '../index'

const getInstance = (node: DOMNode): WolfieVueInstance | undefined => {
	let current: DOMElement | undefined
	if (isElement(node)) {
		current = node
	} else if (isText(node)) {
		current = node.parentNode
	}
	// Find root node by traversing up the tree
	while (current?.parentNode) {
		current = current.parentNode
	}
	return current ? layoutTreeRegistry.get(current) : undefined
}

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
	for (let i = 0; i < children.length; i++) {
		const child = children[i]
		if (isElement(child)) {
			initLayoutTreeRecursively(child, layoutTree)

			if (
				wasUndefined &&
				node.layoutNodeId !== undefined &&
				child.layoutNodeId !== undefined
			) {
				layoutTree.insertChild(node.layoutNodeId, child.layoutNodeId, i)
			}
		}
	}
}

export const nodeOps: Omit<
	RendererOptions<DOMNode, DOMElement>,
	'patchProp'
> = {
	createElement(tag) {
		const wolfieTag = tag.startsWith('wolfie-') ? tag : `wolfie-${tag}`
		const node = createNode(wolfieTag as ElementNames)
		return node
	},

	insert(child, parent, anchor) {
		const instance = getInstance(parent)

		if (instance && isElement(child)) {
			initLayoutTreeRecursively(child, instance.layoutTree)
		}

		if (anchor) {
			insertBeforeNode(parent, child, anchor, instance?.layoutTree)
		} else {
			appendChildNode(parent, child, instance?.layoutTree)
		}

		// Important: If this is a text component or attached to one, we might need to compute its dimensions
		if (
			instance &&
			(child.nodeName === 'wolfie-text' || parent.nodeName === 'wolfie-text')
		) {
			instance.layoutTree.markDirty(parent.layoutNodeId ?? child.layoutNodeId!)
		}

		// Trigger re-render on any tree change
		instance?.onRender()
	},

	remove(child) {
		const parent = child.parentNode
		if (parent) {
			const instance = getInstance(parent)
			removeChildNode(parent, child, instance?.layoutTree)

			// Trigger re-render on any tree change
			instance?.onRender()
		}
	},

	createText(text) {
		return createTextNode(text)
	},

	createComment(_text) {
		// Wolfie doesn't have comments, using a hidden text node as placeholder
		return createTextNode('')
	},

	setElementText(el, text) {
		const instance = getInstance(el)

		// OPTIMIZATION: If we already have a single text node, just update it
		// This prevents destroying layout nodes during SFC "PatchFlags.TEXT" updates
		if (el.childNodes.length === 1 && isText(el.childNodes[0])) {
			setTextNodeValue(el.childNodes[0] as TextNode, text, instance?.layoutTree)
		} else {
			// Fallback for complex changes: Remove all existing children and add a single text node
			while (el.childNodes.length > 0) {
				removeChildNode(el, el.childNodes[0]!, instance?.layoutTree)
			}
			const textNode = createTextNode(text)
			appendChildNode(el, textNode, instance?.layoutTree)
		}

		// Trigger re-render on element text change
		instance?.onRender()
	},

	setText(node, text) {
		const instance = getInstance(node)

		if (isText(node)) {
			setTextNodeValue(node as TextNode, text, instance?.layoutTree)
		}

		// Trigger re-render on text node change
		instance?.onRender()
	},

	parentNode(node) {
		return node.parentNode || null
	},

	nextSibling(node) {
		const parent = node.parentNode
		if (!parent) return null
		const index = parent.childNodes.indexOf(node)
		return parent.childNodes[index + 1] || null
	},

	querySelector() {
		// Minimal implementation for Vue internals if needed
		return null
	},

	setScopeId(el, id) {
		setAttribute(el, id, true)
	},
}
