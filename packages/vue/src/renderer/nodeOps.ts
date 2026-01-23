import {
	createNode,
	createTextNode,
	appendChildNode,
	insertBeforeNode,
	removeChildNode,
	setAttribute,
	setTextNodeValue,
	applyLayoutStyle,
	type DOMElement,
	type TextNode,
	type ElementNames,
	type LayoutTree,
	type DOMNode,
} from '@wolfie/core'
import { type RendererOptions } from 'vue'
import { layoutTreeRegistry } from '../index'

const getLayoutTree = (node: DOMNode): LayoutTree | undefined => {
	let current: DOMElement | undefined
	if (node.nodeName !== '#text') {
		current = node
	} else {
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
		if ('childNodes' in child) {
			initLayoutTreeRecursively(child as DOMElement, layoutTree)

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
	RendererOptions<DOMElement | TextNode, DOMElement>,
	'patchProp'
> = {
	createElement(tag) {
		const wolfieTag = tag.startsWith('wolfie-') ? tag : `wolfie-${tag}`

		// When creating an element, we don't always have the parent/root yet in Vue's flow
		// But Wolfie's createNode needs a LayoutTree to create a layoutNodeId.
		// We'll attempt to find the layoutTree from the registry if we can identify the target root.
		// However, Vue's createElement doesn't provide the root.
		// As a fallback, createNode in @wolfie/core handles undefined layoutTree by creating a node without layoutNodeId,
		// and appendChildNode will propagate the layoutTree and create the layoutNodeId when it's attached.
		const node = createNode(wolfieTag as ElementNames)

		// Optimization: If it's a text component, we can pre-measure it if it has text content
		// But in Vue, text content is usually added via createText/setText later.

		return node
	},

	insert(child, parent, anchor) {
		const layoutTree = getLayoutTree(parent)

		if (layoutTree) {
			initLayoutTreeRecursively(child as DOMElement, layoutTree)
		}

		if (anchor) {
			insertBeforeNode(parent, child, anchor, layoutTree)
		} else {
			appendChildNode(parent, child as DOMElement, layoutTree)
		}

		// Important: If this is a text component or attached to one, we might need to compute its dimensions
		if (
			layoutTree &&
			(child.nodeName === 'wolfie-text' || parent.nodeName === 'wolfie-text')
		) {
			layoutTree.markDirty(parent.layoutNodeId ?? child.layoutNodeId!)
		}

		// Trigger re-render on any tree change
		let root: DOMElement = parent
		while (root.parentNode) {
			root = root.parentNode
		}
		root.onRender?.()
	},

	remove(child) {
		const parent = child.parentNode
		if (parent) {
			const layoutTree = getLayoutTree(parent)
			removeChildNode(parent, child, layoutTree)

			// Trigger re-render on any tree change
			let root: DOMElement = parent
			while (root.parentNode) {
				root = root.parentNode
			}
			root.onRender?.()
		}
	},

	createText(text) {
		return createTextNode(text)
	},

	createComment(text) {
		// Wolfie doesn't have comments, using a hidden text node as placeholder
		const node = createTextNode('')
		return node as any
	},

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	setText(node, text) {
		const layoutTree = getLayoutTree(node as TextNode)
		setTextNodeValue(node as TextNode, text, layoutTree)
	},

	setElementText(el, text) {
		const layoutTree = getLayoutTree(el)
		// Remove all existing children and add a single text node
		while (el.childNodes.length > 0) {
			removeChildNode(el, el.childNodes[0]!, layoutTree)
		}
		const textNode = createTextNode(text)
		appendChildNode(el, textNode as any, layoutTree)
	},

	parentNode(node) {
		return node.parentNode || null
	},

	nextSibling(node) {
		const parent = node.parentNode
		if (!parent) return null
		const index = parent.childNodes.indexOf(node)
		return (parent.childNodes[index + 1] as any) || null
	},

	querySelector() {
		// Minimal implementation for Vue internals if needed
		return null
	},

	setScopeId(el, id) {
		setAttribute(el, id, true)
	},
}
