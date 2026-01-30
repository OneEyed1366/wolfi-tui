import type { Renderer2, RendererStyleFlags2 } from '@angular/core'
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
	colorize,
	isElement,
	isText,
	type DOMElement,
	type TextNode,
	type ElementNames,
	type Styles,
	type DOMNode,
	type LayoutTree,
	type OutputTransformer,
} from '@wolfie/core'
import chalk from 'chalk'
import {
	layoutTreeRegistry,
	type WolfieAngularInstance,
} from '../wolfie-angular'
import { resolveClassName } from '../styles'

/**
 * Create a text transform function for wolfie-text elements.
 * This applies color, bold, italic, etc. using chalk.
 */
const createTextTransform = (el: DOMElement): OutputTransformer => {
	return (text: string): string => {
		const styles = el.style || {}

		let result = text

		if (styles.color) {
			result = colorize(result, styles.color, 'foreground')
		}

		if (styles.backgroundColor) {
			result = colorize(result, styles.backgroundColor, 'background')
		}

		if (styles.fontWeight === 'bold') {
			result = chalk.bold(result)
		}

		if (styles.fontStyle === 'italic') {
			result = chalk.italic(result)
		}

		if (styles.textDecoration === 'underline') {
			result = chalk.underline(result)
		}

		if (styles.textDecoration === 'line-through') {
			result = chalk.strikethrough(result)
		}

		if (styles.inverse) {
			result = chalk.inverse(result)
		}

		return result
	}
}

//#region Helper Functions
/**
 * Get the WolfieAngular instance from any node by traversing to root
 */
const getInstance = (node: DOMNode): WolfieAngularInstance | undefined => {
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

/**
 * Recursively initialize layout tree nodes when inserting into the tree
 * Critical: Layout nodes must be created when nodes are attached to the tree,
 * not when they are created (bc layoutTree is not available at creation time)
 */
const initLayoutTreeRecursively = (
	node: DOMElement,
	layoutTree: LayoutTree
): void => {
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
//#endregion Helper Functions

//#region WolfieRenderer
/**
 * Custom Renderer2 implementation for Wolfie TUI
 * Maps Angular's Renderer2 API to @wolfie/core DOM operations
 */
export class WolfieRenderer implements Renderer2 {
	readonly data: { [key: string]: unknown } = {}
	destroyNode: ((node: DOMNode) => void) | null = null

	constructor(private rootNode: DOMElement) {}

	destroy(): void {
		// Cleanup handled by WolfieAngular.unmount()
	}

	createElement(name: string, _namespace?: string | null): DOMElement {
		// Map Angular component selectors to Wolfie element names
		// w-box -> wolfie-box, w-text -> wolfie-text, etc.
		let wolfieTag: string
		if (name.startsWith('wolfie-')) {
			wolfieTag = name
		} else if (name.startsWith('w-')) {
			// Angular component selectors: w-box -> wolfie-box
			wolfieTag = `wolfie-${name.slice(2)}`
		} else if (name.startsWith('app-')) {
			// App components become boxes (containers)
			wolfieTag = 'wolfie-box'
		} else {
			// Other elements become boxes by default
			wolfieTag = 'wolfie-box'
		}
		// Don't pass layoutTree here - init recursively on insert (Vue pattern)
		const node = createNode(wolfieTag as ElementNames)
		return node
	}

	createComment(_value: string): DOMNode {
		// Wolfie doesn't have comments, using a hidden text node as placeholder
		return createTextNode('')
	}

	createText(value: string): TextNode {
		return createTextNode(value)
	}

	appendChild(parent: DOMElement, newChild: DOMNode): void {
		const instance = getInstance(parent)

		if (instance && isElement(newChild)) {
			initLayoutTreeRecursively(newChild, instance.layoutTree)
		}

		appendChildNode(parent, newChild, instance?.layoutTree)

		// Mark dirty if text component
		if (
			instance &&
			(newChild.nodeName === 'wolfie-text' || parent.nodeName === 'wolfie-text')
		) {
			const nodeId =
				parent.layoutNodeId ?? (newChild as DOMElement).layoutNodeId
			if (nodeId !== undefined) {
				instance.layoutTree.markDirty(nodeId)
			}
		}

		// Trigger re-render on any tree change
		instance?.onRender()
	}

	insertBefore(
		parent: DOMElement,
		newChild: DOMNode,
		refChild: DOMNode,
		_isMove?: boolean
	): void {
		const instance = getInstance(parent)

		if (instance && isElement(newChild)) {
			initLayoutTreeRecursively(newChild, instance.layoutTree)
		}

		insertBeforeNode(parent, newChild, refChild, instance?.layoutTree)

		// Mark dirty if text component
		if (
			instance &&
			(newChild.nodeName === 'wolfie-text' || parent.nodeName === 'wolfie-text')
		) {
			const nodeId =
				parent.layoutNodeId ?? (newChild as DOMElement).layoutNodeId
			if (nodeId !== undefined) {
				instance.layoutTree.markDirty(nodeId)
			}
		}

		// Trigger re-render on any tree change
		instance?.onRender()
	}

	removeChild(
		parent: DOMElement,
		oldChild: DOMNode,
		_isHostElement?: boolean
	): void {
		const instance = getInstance(parent)
		removeChildNode(parent, oldChild, instance?.layoutTree)

		// Trigger re-render on any tree change
		instance?.onRender()
	}

	selectRootElement(
		_selectorOrNode: string | DOMNode,
		_preserveContent?: boolean
	): DOMElement {
		return this.rootNode
	}

	parentNode(node: DOMNode): DOMElement | null {
		return node.parentNode || null
	}

	nextSibling(node: DOMNode): DOMNode | null {
		const parent = node.parentNode
		if (!parent) return null
		const index = parent.childNodes.indexOf(node)
		return parent.childNodes[index + 1] || null
	}

	setAttribute(
		el: DOMElement,
		name: string,
		value: string,
		_namespace?: string | null
	): void {
		const instance = getInstance(el)

		if (name === 'class') {
			setAttribute(el, 'class', value)

			// Resolve classes to styles
			const classStyles = resolveClassName(value)
			// Merge with existing style prop
			const existingStyle = el.style || {}
			const mergedStyles = { ...classStyles, ...existingStyle }

			setStyle(el, mergedStyles)
			if (instance && el.layoutNodeId !== undefined) {
				applyLayoutStyle(instance.layoutTree, el.layoutNodeId, mergedStyles)
			}

			// For wolfie-text elements, create a transform function for text styling
			if (el.nodeName === 'wolfie-text') {
				el.internal_transform = createTextTransform(el)
			}
		} else if (name === 'internal_transform') {
			// Set transform function directly on node, not as attribute
			// This is handled specially in setProperty
		} else if (name === 'internal_static') {
			el.internal_static = value === 'true'
		} else {
			setAttribute(el, name, value)
		}

		// Trigger re-render on any prop change
		instance?.onRender()
	}

	removeAttribute(
		el: DOMElement,
		name: string,
		_namespace?: string | null
	): void {
		const instance = getInstance(el)
		setAttribute(el, name, undefined as unknown as string)
		instance?.onRender()
	}

	addClass(el: DOMElement, name: string): void {
		const instance = getInstance(el)
		const currentClass = (el.attributes['class'] as string) || ''
		const classes = currentClass.split(/\s+/).filter(Boolean)
		if (!classes.includes(name)) {
			classes.push(name)
			const newClass = classes.join(' ')
			setAttribute(el, 'class', newClass)

			// Resolve and apply styles
			const classStyles = resolveClassName(newClass)
			const existingStyle = el.style || {}
			const mergedStyles = { ...classStyles, ...existingStyle }

			setStyle(el, mergedStyles)
			if (instance && el.layoutNodeId !== undefined) {
				applyLayoutStyle(instance.layoutTree, el.layoutNodeId, mergedStyles)
			}
		}
		instance?.onRender()
	}

	removeClass(el: DOMElement, name: string): void {
		const instance = getInstance(el)
		const currentClass = (el.attributes['class'] as string) || ''
		const classes = currentClass.split(/\s+/).filter((c) => c !== name)
		const newClass = classes.join(' ')
		setAttribute(el, 'class', newClass)

		// Resolve and apply styles
		const classStyles = resolveClassName(newClass)
		const existingStyle = el.style || {}
		const mergedStyles = { ...classStyles, ...existingStyle }

		setStyle(el, mergedStyles)
		if (instance && el.layoutNodeId !== undefined) {
			applyLayoutStyle(instance.layoutTree, el.layoutNodeId, mergedStyles)
		}
		instance?.onRender()
	}

	setStyle(
		el: DOMElement,
		style: string,
		value: unknown,
		_flags?: RendererStyleFlags2
	): void {
		const instance = getInstance(el)

		// Merge with resolved classes if any
		const classStyles = resolveClassName(el.attributes['class'] as string)
		const currentStyle = el.style || {}

		// Update the specific style property
		const updatedStyle = {
			...classStyles,
			...currentStyle,
			[style]: value,
		} as Partial<Styles>

		setStyle(el, updatedStyle)

		if (instance && el.layoutNodeId !== undefined) {
			applyLayoutStyle(instance.layoutTree, el.layoutNodeId, updatedStyle)
		}

		// Update transform for wolfie-text elements when style changes
		if (el.nodeName === 'wolfie-text') {
			el.internal_transform = createTextTransform(el)
		}

		instance?.onRender()
	}

	removeStyle(
		el: DOMElement,
		style: string,
		_flags?: RendererStyleFlags2
	): void {
		const instance = getInstance(el)
		const currentStyle = { ...el.style }
		delete currentStyle[style as keyof Styles]
		setStyle(el, currentStyle)

		if (instance && el.layoutNodeId !== undefined) {
			applyLayoutStyle(instance.layoutTree, el.layoutNodeId, currentStyle)
		}

		instance?.onRender()
	}

	setProperty(el: DOMElement, name: string, value: unknown): void {
		const instance = getInstance(el)

		if (name === 'style') {
			// Don't re-merge with class - components (BoxComponent, etc.) already handle
			// class resolution internally by reading ElementRef.nativeElement.attributes['class'].
			// Double-merging would cause the spread order to overwrite class-resolved styles.
			const styles = value as Styles
			setStyle(el, styles)

			if (instance && el.layoutNodeId !== undefined) {
				applyLayoutStyle(instance.layoutTree, el.layoutNodeId, styles)
			}
		} else if (name === 'textContent' || name === 'innerText') {
			// Handle text content updates
			const text = String(value)
			if (el.childNodes.length === 1 && isText(el.childNodes[0])) {
				setTextNodeValue(
					el.childNodes[0] as TextNode,
					text,
					instance?.layoutTree
				)
			} else {
				while (el.childNodes.length > 0) {
					removeChildNode(el, el.childNodes[0]!, instance?.layoutTree)
				}
				const textNode = createTextNode(text)
				appendChildNode(el, textNode, instance?.layoutTree)
			}
		} else if (name === 'internal_transform') {
			// Set transform function directly on node
			el.internal_transform = value as OutputTransformer
		} else if (name === 'internal_static') {
			el.internal_static = value as boolean
		} else if (name === 'internal_accessibility') {
			// Set accessibility info directly on node
			;(el as DOMElement).internal_accessibility =
				value as DOMElement['internal_accessibility']
		} else {
			setAttribute(el, name, value as string)
		}

		instance?.onRender()
	}

	setValue(node: DOMNode, value: string): void {
		const instance = getInstance(node)

		if (isText(node)) {
			setTextNodeValue(node as TextNode, value, instance?.layoutTree)
		}

		instance?.onRender()
	}

	listen(
		_target: DOMNode | 'window' | 'document' | 'body',
		_eventName: string,
		_callback: (event: unknown) => boolean | void
	): () => void {
		// Terminal input is handled through services, not DOM events
		// Return no-op unlisten function
		return () => {}
	}
}
//#endregion WolfieRenderer
