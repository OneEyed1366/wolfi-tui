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
	isElement,
	isText,
	type DOMElement,
	type TextNode,
	type ElementNames,
	type Styles,
	type DOMNode,
	type LayoutTree,
	type OutputTransformer,
	logger,
} from '@wolfie/core'
import {
	layoutTreeRegistry,
	type WolfieAngularInstance,
} from '../wolfie-angular'

//#region Helper Functions
/**
 * Get the WolfieAngular instance from any node by traversing to root
 */
const getInstance = (
	node: DOMNode | null
): WolfieAngularInstance | undefined => {
	if (!node) return undefined

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
 * Find the nearest ancestor with a layout node ID.
 * Used to attach children of host elements to the correct layout parent.
 */
const findLayoutAncestorId = (node: DOMElement): number | undefined => {
	let current = node.parentNode
	while (current) {
		if (current.layoutNodeId !== undefined) return current.layoutNodeId
		current = current.parentNode
	}
	return undefined
}

/**
 * Recursively remove layout tree nodes from a host element subtree.
 * When a host element (layoutNodeId === undefined) is removed from a non-host parent,
 * core removeChildNode skips it bc layoutNodeId is undefined. Its children's layout
 * nodes become orphaned in Taffy, inflating computed root height.
 */
const removeLayoutTreeRecursively = (
	node: DOMNode,
	layoutTree: LayoutTree
): void => {
	if (!isElement(node)) return

	for (const child of node.childNodes) {
		if (!isElement(child)) continue
		// Recurse first (depth-first) so children are detached before parents
		removeLayoutTreeRecursively(child, layoutTree)

		if (child.layoutNodeId !== undefined) {
			// Find the layout parent: for normal nodes it's node.layoutNodeId,
			// for children of host elements it's the nearest ancestor with a layout ID
			const layoutParentId = node.layoutNodeId ?? findLayoutAncestorId(node)
			if (layoutParentId !== undefined) {
				layoutTree.removeChild(layoutParentId, child.layoutNodeId)
			}
		}
	}
}

/**
 * Recursively initialize layout tree nodes when inserting into the tree
 * Critical: Layout nodes must be created when nodes are attached to the tree,
 * not when they are created (bc layoutTree is not available at creation time)
 */
const initLayoutTreeRecursively = (
	node: DOMElement,
	layoutTree: LayoutTree,
	effectiveLayoutParentId?: number
): void => {
	const wasUndefined = node.layoutNodeId === undefined
	const isHostElement = node.internal_isHostElement === true

	if (
		wasUndefined &&
		node.nodeName !== 'wolfie-virtual-text' &&
		!isHostElement
	) {
		node.layoutNodeId = layoutTree.createNode({})
		node.layoutTree = layoutTree
		if (Object.keys(node.style).length > 0) {
			applyLayoutStyle(layoutTree, node.layoutNodeId, node.style)
		}
	}

	// For host elements: propagate styles to effective layout parent
	// Host elements don't have their own layout node, so styles must be applied to ancestor
	if (
		isHostElement &&
		effectiveLayoutParentId !== undefined &&
		Object.keys(node.style).length > 0
	) {
		applyLayoutStyle(layoutTree, effectiveLayoutParentId, node.style)
	}

	// Propagate layoutTree to host elements (needed for child operations)
	if (!node.layoutTree) {
		node.layoutTree = layoutTree
	}

	// For host elements, children's layout nodes are inserted into the
	// effective layout parent (inherited from the caller). For normal
	// elements, children are inserted into this node's own layout node.
	const childLayoutParentId = isHostElement
		? effectiveLayoutParentId
		: node.layoutNodeId

	const children = node.childNodes
	// Track actual layout child index separately since not all DOM children
	// get layout nodes (e.g., text nodes, wolfie-virtual-text)
	let layoutChildIndex = 0
	for (let i = 0; i < children.length; i++) {
		const child = children[i]
		if (isElement(child)) {
			initLayoutTreeRecursively(child, layoutTree, childLayoutParentId)

			if (wasUndefined && child.layoutNodeId !== undefined) {
				if (node.layoutNodeId !== undefined) {
					// Normal case: insert into this node's layout
					layoutTree.insertChild(
						node.layoutNodeId,
						child.layoutNodeId,
						layoutChildIndex
					)
					layoutChildIndex++
				} else if (childLayoutParentId !== undefined) {
					// Host element case: insert into effective layout ancestor
					const index = layoutTree.getChildCount(childLayoutParentId)
					layoutTree.insertChild(childLayoutParentId, child.layoutNodeId, index)
				}
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
		// Only wolfie-root, wolfie-box, wolfie-text, wolfie-virtual-text are valid ElementNames
		let wolfieTag: ElementNames
		let isHostElement = false
		if (name === 'wolfie-root') {
			wolfieTag = 'wolfie-root'
		} else if (name === 'w-box' || name === 'wolfie-box') {
			wolfieTag = 'wolfie-box'
		} else if (name === 'w-text' || name === 'wolfie-text') {
			wolfieTag = 'wolfie-text'
		} else if (name === 'wolfie-virtual-text') {
			wolfieTag = 'wolfie-virtual-text'
		} else {
			// All other elements (w-alert, w-select, w-ordered-list, app-*, etc.)
			// become wolfie-box containers — marked as host elements for layout transparency
			wolfieTag = 'wolfie-box'
			isHostElement = true
		}
		// Don't pass layoutTree here - init recursively on insert (Vue pattern)
		const node = createNode(wolfieTag)
		if (isHostElement) {
			node.internal_isHostElement = true
		}
		logger.log({
			ts: performance.now(),
			cat: 'angular',
			op: 'createElement',
			name,
			isHost: isHostElement,
		})
		return node
	}

	createComment(_value: string): DOMNode {
		// Wolfie doesn't have comments, using a hidden text node as placeholder
		return createTextNode('')
	}

	createText(value: string): TextNode {
		return createTextNode(value)
	}

	appendChild(parent: DOMElement | null, newChild: DOMNode | null): void {
		if (!parent || !newChild) return

		const instance = getInstance(parent)

		if (instance && isElement(newChild)) {
			initLayoutTreeRecursively(
				newChild,
				instance.layoutTree,
				parent.layoutNodeId
			)
		}

		appendChildNode(parent, newChild, instance?.layoutTree)
		if (logger.enabled) {
			logger.log({
				ts: performance.now(),
				cat: 'angular',
				op: 'appendChild',
				parentName: parent.nodeName,
				childName: isElement(newChild) ? newChild.nodeName : '#text',
			})
		}

		// Host element parent (already in tree): adopt child's layout node into ancestor.
		// Only needed when parent.layoutNodeId is undefined (host element) —
		// initLayoutTreeRecursively handles subtrees built detached via effectiveLayoutParentId.
		if (
			parent.internal_isHostElement &&
			instance &&
			isElement(newChild) &&
			newChild.layoutNodeId !== undefined
		) {
			const layoutAncestorId = findLayoutAncestorId(parent)
			if (layoutAncestorId !== undefined) {
				const index = instance.layoutTree.getChildCount(layoutAncestorId)
				instance.layoutTree.insertChild(
					layoutAncestorId,
					newChild.layoutNodeId,
					index
				)
			}
		}

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
	}

	insertBefore(
		parent: DOMElement | null,
		newChild: DOMNode | null,
		refChild: DOMNode | null,
		_isMove?: boolean
	): void {
		if (!parent || !newChild) return

		const instance = getInstance(parent)

		if (instance && isElement(newChild)) {
			initLayoutTreeRecursively(
				newChild,
				instance.layoutTree,
				parent.layoutNodeId
			)
		}

		// If refChild is null, append to end (insertBeforeNode requires non-null refChild)
		if (refChild) {
			insertBeforeNode(parent, newChild, refChild, instance?.layoutTree)
		} else {
			appendChildNode(parent, newChild, instance?.layoutTree)
		}
		if (logger.enabled) {
			logger.log({
				ts: performance.now(),
				cat: 'angular',
				op: 'insertBefore',
				parentName: parent.nodeName,
				childName: isElement(newChild) ? newChild.nodeName : '#text',
			})
		}

		// Host element parent: manually insert child's layout node into layout ancestor
		if (
			parent.internal_isHostElement &&
			instance &&
			isElement(newChild) &&
			newChild.layoutNodeId !== undefined
		) {
			const layoutAncestorId = findLayoutAncestorId(parent)
			if (layoutAncestorId !== undefined) {
				const index = instance.layoutTree.getChildCount(layoutAncestorId)
				instance.layoutTree.insertChild(
					layoutAncestorId,
					newChild.layoutNodeId,
					index
				)
			}
		}

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
	}

	removeChild(
		parent: DOMElement | null,
		oldChild: DOMNode | null,
		_isHostElement?: boolean
	): void {
		if (!oldChild) return

		// Use the child's actual parent if the provided parent is null
		const actualParent = parent ?? oldChild.parentNode
		if (!actualParent) return

		const instance = getInstance(actualParent)

		// Host element parent: manually remove from layout ancestor before core removal
		if (
			actualParent.internal_isHostElement &&
			instance &&
			isElement(oldChild) &&
			oldChild.layoutNodeId !== undefined
		) {
			const layoutAncestorId = findLayoutAncestorId(actualParent)
			if (layoutAncestorId !== undefined) {
				instance.layoutTree.removeChild(layoutAncestorId, oldChild.layoutNodeId)
			}
		}

		// Host element child being removed: its layoutNodeId is undefined so
		// core removeChildNode won't clean up its children's layout nodes.
		// Recursively detach them from Taffy before DOM removal.
		if (isElement(oldChild) && oldChild.internal_isHostElement && instance) {
			removeLayoutTreeRecursively(oldChild, instance.layoutTree)
		}

		if (logger.enabled) {
			logger.log({
				ts: performance.now(),
				cat: 'angular',
				op: 'removeChild',
				parentName: actualParent.nodeName,
				childName: isElement(oldChild) ? oldChild.nodeName : '#text',
				isHostChild: isElement(oldChild) && !!oldChild.internal_isHostElement,
			})
		}
		removeChildNode(actualParent, oldChild, instance?.layoutTree)
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
		if (name === 'class') {
			// Store class attribute; components handle className → style resolution internally
			setAttribute(el, 'class', value)
		} else if (name === 'internal_transform') {
			// Set transform function directly on node, not as attribute
			// This is handled specially in setProperty
		} else if (name === 'internal_static') {
			el.internal_static = value === 'true'
		} else {
			setAttribute(el, name, value)
		}
	}

	removeAttribute(
		el: DOMElement,
		name: string,
		_namespace?: string | null
	): void {
		setAttribute(el, name, undefined as unknown as string)
	}

	addClass(el: DOMElement, name: string): void {
		const currentClass = (el.attributes['class'] as string) || ''
		const classes = currentClass.split(/\s+/).filter(Boolean)
		if (!classes.includes(name)) {
			classes.push(name)
			// Store class attribute; components handle className → style resolution internally
			setAttribute(el, 'class', classes.join(' '))
		}
	}

	removeClass(el: DOMElement, name: string): void {
		const currentClass = (el.attributes['class'] as string) || ''
		const classes = currentClass.split(/\s+/).filter((c) => c !== name)
		// Store class attribute; components handle className → style resolution internally
		setAttribute(el, 'class', classes.join(' '))
	}

	setStyle(
		el: DOMElement,
		style: string,
		value: unknown,
		_flags?: RendererStyleFlags2
	): void {
		const instance = getInstance(el)

		// Merge with existing styles (className already resolved by components via setProperty)
		const updatedStyle = {
			...el.style,
			[style]: value,
		} as Partial<Styles>

		setStyle(el, updatedStyle)

		if (instance && el.layoutNodeId !== undefined) {
			applyLayoutStyle(instance.layoutTree, el.layoutNodeId, updatedStyle)
		}
		if (logger.enabled) {
			logger.log({
				ts: performance.now(),
				cat: 'angular',
				op: 'setStyle',
				nodeId: el.layoutNodeId,
				key: style,
			})
		}
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
	}

	setProperty(el: DOMElement, name: string, value: unknown): void {
		if (logger.enabled) {
			logger.log({
				ts: performance.now(),
				cat: 'angular',
				op: 'setProperty',
				name,
			})
		}
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
	}

	setValue(node: DOMNode, value: string): void {
		if (isText(node)) {
			const instance = getInstance(node)
			setTextNodeValue(node as TextNode, value, instance?.layoutTree)
		}
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
