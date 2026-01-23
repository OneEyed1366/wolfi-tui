import {
	setAttribute,
	setStyle,
	applyLayoutStyle,
	type DOMElement,
	type Styles,
	type LayoutTree,
	type DOMNode,
} from '@wolfie/core'
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

export const patchProp = (
	el: DOMElement,
	key: string,
	prevValue: any,
	nextValue: any
) => {
	if (key === 'style') {
		setStyle(el, nextValue as Styles)

		const layoutTree = getLayoutTree(el)
		if (layoutTree && el.layoutNodeId !== undefined) {
			applyLayoutStyle(layoutTree, el.layoutNodeId, nextValue as Styles)
		}
	} else if (key === 'class') {
		// Support for Tailwind/CSS classes via wolfie-css-parser logic
		// This might need more advanced integration like in React's resolveClassName
		setAttribute(el, 'class', nextValue)
	} else if (key.startsWith('on')) {
		// Handle events (e.g., onClick -> click)
		// For TUI, we might need a custom event emitter on the element
		const eventName = key.slice(2).toLowerCase()
		setAttribute(el, `on${eventName}`, nextValue)
	} else {
		setAttribute(el, key, nextValue)
	}

	// Trigger re-render on any prop change
	let root: DOMElement = el
	while (root.parentNode) {
		root = root.parentNode
	}
	root.onRender?.()
}
