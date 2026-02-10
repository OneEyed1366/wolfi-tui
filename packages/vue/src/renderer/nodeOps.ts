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
	// Track actual layout child index separately since not all DOM children
	// get layout nodes (e.g., text nodes, wolfie-virtual-text)
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
	},

	remove(child) {
		const parent = child.parentNode
		if (parent) {
			const instance = getInstance(parent)
			removeChildNode(parent, child, instance?.layoutTree)
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
	},

	setText(node, text) {
		const instance = getInstance(node)

		if (isText(node)) {
			setTextNodeValue(node as TextNode, text, instance?.layoutTree)
		}
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

	insertStaticContent(content, parent, anchor, _isSvg, _start, _end) {
		// Vue uses insertStaticContent for static hoisting optimization
		// For terminal rendering, we just parse and insert the static HTML as regular nodes
		// Since we don't have innerHTML, we create a placeholder text node
		const instance = getInstance(parent)

		// Create a virtual container for static content
		const staticNode = createNode('wolfie-box' as ElementNames)
		staticNode.style = { display: 'none' as any }

		// Parse static content as text (simplified - real impl would parse HTML)
		const textNode = createTextNode(content)
		appendChildNode(staticNode, textNode, instance?.layoutTree)

		if (anchor) {
			insertBeforeNode(parent, staticNode, anchor, instance?.layoutTree)
		} else {
			appendChildNode(parent, staticNode, instance?.layoutTree)
		}

		// Return [el, anchor] tuple as Vue expects
		return [staticNode, staticNode]
	},
}
