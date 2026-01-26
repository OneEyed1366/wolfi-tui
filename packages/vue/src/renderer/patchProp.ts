import {
	setAttribute,
	setStyle,
	applyLayoutStyle,
	isElement,
	isText,
	setTextNodeValue,
	appendChildNode,
	removeChildNode,
	createTextNode,
	type DOMElement,
	type Styles,
	type DOMNode,
	type TextNode,
	type OutputTransformer,
} from '@wolfie/core'
import { layoutTreeRegistry, type WolfieVueInstance } from '../index'
import { resolveClassName } from '../styles'

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

export const patchProp = (
	el: DOMElement,
	key: string,
	_prevValue: unknown,
	nextValue: unknown
) => {
	const instance = getInstance(el)

	if (key === 'style') {
		// Merge with resolved classes if any
		const classStyles = resolveClassName(el.attributes['class'] as string)
		const mergedStyles = { ...classStyles, ...(nextValue as Styles) }
		setStyle(el, mergedStyles)

		if (instance && el.layoutNodeId !== undefined) {
			applyLayoutStyle(instance.layoutTree, el.layoutNodeId, mergedStyles)
		}
	} else if (key === 'class') {
		const nextClass = nextValue as string
		setAttribute(el, 'class', nextClass)

		// Resolve classes to styles
		const classStyles = resolveClassName(nextClass)
		// Merge with existing style prop
		const existingStyle = el.style || {}
		const mergedStyles = { ...classStyles, ...existingStyle }

		setStyle(el, mergedStyles)
		if (instance && el.layoutNodeId !== undefined) {
			applyLayoutStyle(instance.layoutTree, el.layoutNodeId, mergedStyles)
		}
	} else if (key === 'textContent' || key === 'innerText') {
		// SFC optimized paths or direct prop setting
		const text = String(nextValue)
		if (el.childNodes.length === 1 && isText(el.childNodes[0])) {
			setTextNodeValue(el.childNodes[0] as TextNode, text, instance?.layoutTree)
		} else {
			while (el.childNodes.length > 0) {
				removeChildNode(el, el.childNodes[0]!, instance?.layoutTree)
			}
			const textNode = createTextNode(text)
			appendChildNode(el, textNode, instance?.layoutTree)
		}
	} else if (key === 'internal_transform') {
		// Set transform function directly on node, not as attribute
		el.internal_transform = nextValue as OutputTransformer
	} else if (key === 'internal_static') {
		// Set static flag directly on node, not as attribute
		el.internal_static = nextValue as boolean
	} else if (key.startsWith('on')) {
		const eventName = key.slice(2).toLowerCase()
		setAttribute(el, `on${eventName}`, nextValue as string)
	} else {
		setAttribute(el, key, nextValue as string)
	}

	// Trigger re-render on any prop change
	instance?.onRender()
}
