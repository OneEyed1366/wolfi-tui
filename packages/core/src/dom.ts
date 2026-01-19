// Phase 2: Migrate from Yoga to Taffy
// NOTE: yoga-layout import kept for backwards compatibility during migration
// TODO: Remove yoga-layout import once migration is complete
import Yoga, { type Node as YogaNode } from 'yoga-layout'
import { type LayoutTree } from './layout-types'
import measureText from './measure-text'
import { type Styles } from './styles'
import wrapText from './wrap-text'
import squashTextNodes from './squash-text-nodes'
import { type OutputTransformer } from './render-node-to-output'

type InkNode = {
	parentNode: DOMElement | undefined
	yogaNode?: YogaNode
	layoutNodeId?: number
	internal_static?: boolean
	style: Styles
}

export type TextName = '#text'
export type ElementNames =
	| 'ink-root'
	| 'ink-box'
	| 'ink-text'
	| 'ink-virtual-text'

export type NodeNames = ElementNames | TextName

// eslint-disable-next-line @typescript-eslint/naming-convention
export type DOMElement = {
	nodeName: ElementNames
	attributes: Record<string, DOMNodeAttribute>
	childNodes: DOMNode[]
	internal_transform?: OutputTransformer

	internal_accessibility?: {
		role?:
			| 'button'
			| 'checkbox'
			| 'combobox'
			| 'list'
			| 'listbox'
			| 'listitem'
			| 'menu'
			| 'menuitem'
			| 'option'
			| 'progressbar'
			| 'radio'
			| 'radiogroup'
			| 'tab'
			| 'tablist'
			| 'table'
			| 'textbox'
			| 'timer'
			| 'toolbar'
		state?: {
			busy?: boolean
			checked?: boolean
			disabled?: boolean
			expanded?: boolean
			multiline?: boolean
			multiselectable?: boolean
			readonly?: boolean
			required?: boolean
			selected?: boolean
		}
	}

	// Internal properties
	isStaticDirty?: boolean
	staticNode?: DOMElement
	onComputeLayout?: () => void
	onRender?: () => void
	onImmediateRender?: () => void
} & InkNode

export type TextNode = {
	nodeName: TextName
	nodeValue: string
} & InkNode

// eslint-disable-next-line @typescript-eslint/naming-convention
export type DOMNode<T = { nodeName: NodeNames }> = T extends {
	nodeName: infer U
}
	? U extends '#text'
		? TextNode
		: DOMElement
	: never

// eslint-disable-next-line @typescript-eslint/naming-convention
export type DOMNodeAttribute = boolean | string | number

export const createNode = (
	nodeName: ElementNames,
	layoutTree?: LayoutTree
): DOMElement => {
	const node: DOMElement = {
		nodeName,
		style: {},
		attributes: {},
		childNodes: [],
		parentNode: undefined,
		// Yoga (legacy) - will be removed after migration
		yogaNode: nodeName === 'ink-virtual-text' ? undefined : Yoga.Node.create(),
		// Taffy (new) - layoutNodeId for tree-centric layout
		layoutNodeId:
			nodeName === 'ink-virtual-text' || !layoutTree
				? undefined
				: layoutTree.createNode({}),
		// eslint-disable-next-line @typescript-eslint/naming-convention
		internal_accessibility: {},
	}

	// Yoga measure func - kept for backwards compatibility
	if (nodeName === 'ink-text') {
		node.yogaNode?.setMeasureFunc(measureTextNode.bind(null, node))
	}
	// Note: Text measurement for Taffy handled via setTextDimensions() called from renderer

	return node
}

export const appendChildNode = (
	node: DOMElement,
	childNode: DOMElement,
	layoutTree?: LayoutTree
): void => {
	if (childNode.parentNode) {
		removeChildNode(childNode.parentNode, childNode, layoutTree)
	}

	childNode.parentNode = node
	node.childNodes.push(childNode)

	// Yoga (legacy)
	if (childNode.yogaNode) {
		node.yogaNode?.insertChild(
			childNode.yogaNode,
			node.yogaNode.getChildCount()
		)
	}

	// Taffy (new)
	if (
		childNode.layoutNodeId !== undefined &&
		node.layoutNodeId !== undefined &&
		layoutTree
	) {
		layoutTree.insertChild(
			node.layoutNodeId,
			childNode.layoutNodeId,
			layoutTree.getChildCount(node.layoutNodeId)
		)
	}

	if (node.nodeName === 'ink-text' || node.nodeName === 'ink-virtual-text') {
		markNodeAsDirty(node, layoutTree)
	}
}

export const insertBeforeNode = (
	node: DOMElement,
	newChildNode: DOMNode,
	beforeChildNode: DOMNode,
	layoutTree?: LayoutTree
): void => {
	if (newChildNode.parentNode) {
		removeChildNode(newChildNode.parentNode, newChildNode, layoutTree)
	}

	newChildNode.parentNode = node

	const index = node.childNodes.indexOf(beforeChildNode)
	if (index >= 0) {
		node.childNodes.splice(index, 0, newChildNode)

		// Yoga (legacy)
		if (newChildNode.yogaNode) {
			node.yogaNode?.insertChild(newChildNode.yogaNode, index)
		}

		// Taffy (new)
		if (
			newChildNode.layoutNodeId !== undefined &&
			node.layoutNodeId !== undefined &&
			layoutTree
		) {
			layoutTree.insertChild(node.layoutNodeId, newChildNode.layoutNodeId, index)
		}

		if (node.nodeName === 'ink-text' || node.nodeName === 'ink-virtual-text') {
			markNodeAsDirty(node, layoutTree)
		}
		return
	}

	node.childNodes.push(newChildNode)

	// Yoga (legacy)
	if (newChildNode.yogaNode) {
		node.yogaNode?.insertChild(
			newChildNode.yogaNode,
			node.yogaNode.getChildCount()
		)
	}

	// Taffy (new)
	if (
		newChildNode.layoutNodeId !== undefined &&
		node.layoutNodeId !== undefined &&
		layoutTree
	) {
		layoutTree.insertChild(
			node.layoutNodeId,
			newChildNode.layoutNodeId,
			layoutTree.getChildCount(node.layoutNodeId)
		)
	}

	if (node.nodeName === 'ink-text' || node.nodeName === 'ink-virtual-text') {
		markNodeAsDirty(node, layoutTree)
	}
}

export const removeChildNode = (
	node: DOMElement,
	removeNode: DOMNode,
	layoutTree?: LayoutTree
): void => {
	// Yoga (legacy)
	if (removeNode.yogaNode) {
		removeNode.parentNode?.yogaNode?.removeChild(removeNode.yogaNode)
	}

	// Taffy (new)
	if (
		removeNode.layoutNodeId !== undefined &&
		removeNode.parentNode?.layoutNodeId !== undefined &&
		layoutTree
	) {
		layoutTree.removeChild(
			removeNode.parentNode.layoutNodeId,
			removeNode.layoutNodeId
		)
	}

	removeNode.parentNode = undefined

	const index = node.childNodes.indexOf(removeNode)
	if (index >= 0) {
		node.childNodes.splice(index, 1)
	}

	if (node.nodeName === 'ink-text' || node.nodeName === 'ink-virtual-text') {
		markNodeAsDirty(node, layoutTree)
	}
}

export const setAttribute = (
	node: DOMElement,
	key: string,
	value: DOMNodeAttribute
): void => {
	if (key === 'internal_accessibility') {
		node.internal_accessibility = value as DOMElement['internal_accessibility']
		return
	}

	node.attributes[key] = value
}

export const setStyle = (node: DOMNode, style: Styles): void => {
	node.style = style
}

export const createTextNode = (text: string): TextNode => {
	const node: TextNode = {
		nodeName: '#text',
		nodeValue: text,
		yogaNode: undefined,
		layoutNodeId: undefined, // Text nodes don't have layout nodes
		parentNode: undefined,
		style: {},
	}

	setTextNodeValue(node, text)

	return node
}

const measureTextNode = function (
	node: DOMNode,
	width: number
): { width: number; height: number } {
	const text =
		node.nodeName === '#text' ? node.nodeValue : squashTextNodes(node)

	const dimensions = measureText(text)

	// Text fits into container, no need to wrap
	if (dimensions.width <= width) {
		return dimensions
	}

	// This is happening when <Box> is shrinking child nodes and Yoga asks
	// if we can fit this text node in a <1px space, so we just tell Yoga "no"
	if (dimensions.width >= 1 && width > 0 && width < 1) {
		return dimensions
	}

	const textWrap = node.style?.textWrap ?? 'wrap'
	const wrappedText = wrapText(text, width, textWrap)

	return measureText(wrappedText)
}

// Yoga (legacy) - find closest ancestor with a yoga node
const findClosestYogaNode = (node?: DOMNode): YogaNode | undefined => {
	if (!node?.parentNode) {
		return undefined
	}

	return node.yogaNode ?? findClosestYogaNode(node.parentNode)
}

// Taffy (new) - find closest ancestor with a layout node ID
const findClosestLayoutNodeId = (node?: DOMNode): number | undefined => {
	if (!node?.parentNode) {
		return undefined
	}

	return node.layoutNodeId ?? findClosestLayoutNodeId(node.parentNode)
}

const markNodeAsDirty = (node?: DOMNode, layoutTree?: LayoutTree): void => {
	// Mark closest Yoga node as dirty to measure text dimensions again
	// Yoga (legacy)
	const yogaNode = findClosestYogaNode(node)
	yogaNode?.markDirty()

	// Taffy (new)
	if (layoutTree) {
		const layoutNodeId = findClosestLayoutNodeId(node)
		if (layoutNodeId !== undefined) {
			layoutTree.markDirty(layoutNodeId)
		}
	}
}

export const setTextNodeValue = (
	node: TextNode,
	text: string,
	layoutTree?: LayoutTree
): void => {
	if (typeof text !== 'string') {
		text = String(text)
	}

	node.nodeValue = text
	markNodeAsDirty(node, layoutTree)
}

// Re-export LayoutTree type for consumers
export type { LayoutTree } from './layout-types'
