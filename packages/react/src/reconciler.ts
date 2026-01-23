import process from 'node:process'
import createReconciler, { type ReactContext } from 'react-reconciler'
import {
	DefaultEventPriority,
	NoEventPriority,
} from 'react-reconciler/constants'
import { createContext } from 'react'
import {
	createTextNode,
	appendChildNode,
	insertBeforeNode,
	removeChildNode,
	setStyle,
	setTextNodeValue,
	createNode,
	setAttribute,
	applyLayoutStyle,
	type DOMNodeAttribute,
	type TextNode,
	type ElementNames,
	type DOMElement,
	type Styles,
	type OutputTransformer,
	type LayoutTree,
} from '@wolfie/core'

// We need to conditionally perform devtools connection to avoid
// accidentally breaking other third-party code.
// See https://github.com/vadimdemedes/ink/issues/384
if (process.env['DEV'] === 'true') {
	try {
		await import('./devtools')
	} catch (error: any) {
		if (error.code === 'ERR_MODULE_NOT_FOUND') {
			console.warn(
				`
The environment variable DEV is set to true, so Wolfie tried to import \`react-devtools-core\`,
but this failed as it was not installed. Debugging with React Devtools requires it.

To install use this command:

$ npm install --save-dev react-devtools-core
				`.trim() + '\n'
			)
		} else {
			throw error
		}
	}
}

type AnyObject = Record<string, unknown>

const diff = (before: AnyObject, after: AnyObject): AnyObject | undefined => {
	if (before === after) {
		return
	}

	if (!before) {
		return after
	}

	const changed: AnyObject = {}
	let isChanged = false

	for (const key of Object.keys(before)) {
		const isDeleted = after ? !Object.hasOwn(after, key) : true

		if (isDeleted) {
			changed[key] = undefined
			isChanged = true
		}
	}

	if (after) {
		for (const key of Object.keys(after)) {
			if (after[key] !== before[key]) {
				changed[key] = after[key]
				isChanged = true
			}
		}
	}

	return isChanged ? changed : undefined
}

// Taffy cleanup - removes node from layout tree
const cleanupLayoutNode = (
	nodeId: number | undefined,
	layoutTree?: LayoutTree
): void => {
	if (nodeId !== undefined && layoutTree) {
		layoutTree.removeNode(nodeId)
	}
}

type Props = Record<string, unknown>

//#region LayoutTree Registry
// The reconciler is a singleton but needs access to per-instance LayoutTree.
// We use a WeakMap keyed by rootNode to store the layout tree for each instance.
const layoutTreeRegistry = new WeakMap<DOMElement, LayoutTree>()

/**
 * Register a LayoutTree for a root node.
 * Called by Wolfie class when creating a new instance.
 */
export const registerLayoutTree = (
	rootNode: DOMElement,
	layoutTree: LayoutTree
): void => {
	layoutTreeRegistry.set(rootNode, layoutTree)
}

/**
 * Unregister a LayoutTree when an instance is unmounted.
 */
export const unregisterLayoutTree = (rootNode: DOMElement): void => {
	layoutTreeRegistry.delete(rootNode)
}

/**
 * Get LayoutTree for a node by traversing up to find its root.
 * Works for both DOMElement and TextNode since both have parentNode.
 */
const getLayoutTree = (node: DOMElement | TextNode): LayoutTree | undefined => {
	// Start from the node itself if it's a DOMElement
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

/**
 * Get LayoutTree for a root node directly.
 */
const getLayoutTreeForRoot = (rootNode: DOMElement): LayoutTree | undefined => {
	return layoutTreeRegistry.get(rootNode)
}
//#endregion

type HostContext = {
	isInsideText: boolean
}

let currentUpdatePriority = NoEventPriority

let currentRootNode: DOMElement | undefined

export default createReconciler<
	ElementNames,
	Props,
	DOMElement,
	DOMElement,
	TextNode,
	DOMElement,
	unknown,
	unknown,
	unknown,
	HostContext,
	unknown,
	unknown,
	unknown,
	unknown
>({
	getRootHostContext: () => ({
		isInsideText: false,
	}),
	prepareForCommit: () => null,
	preparePortalMount: () => null,
	clearContainer: () => false,
	resetAfterCommit(rootNode) {
		if (typeof rootNode.onComputeLayout === 'function') {
			rootNode.onComputeLayout()
		}

		// Since renders are throttled at the instance level and <Static> component children
		// are rendered only once and then get deleted, we need an escape hatch to
		// trigger an immediate render to ensure <Static> children are written to output before they get erased
		if (rootNode.isStaticDirty) {
			rootNode.isStaticDirty = false
			if (typeof rootNode.onImmediateRender === 'function') {
				rootNode.onImmediateRender()
			}

			return
		}

		if (typeof rootNode.onRender === 'function') {
			rootNode.onRender()
		}
	},
	getChildHostContext(parentHostContext, type) {
		const previousIsInsideText = parentHostContext.isInsideText
		const isInsideText =
			type === 'wolfie-text' || type === 'wolfie-virtual-text'

		if (previousIsInsideText === isInsideText) {
			return parentHostContext
		}

		return { isInsideText }
	},
	shouldSetTextContent: () => false,
	createInstance(originalType, newProps, rootNode, hostContext) {
		if (hostContext.isInsideText && originalType === 'wolfie-box') {
			throw new Error(`<Box> can't be nested inside <Text> component`)
		}

		const type =
			originalType === 'wolfie-text' && hostContext.isInsideText
				? 'wolfie-virtual-text'
				: originalType

		// Get layoutTree from registry for this root
		const layoutTree = getLayoutTreeForRoot(rootNode)
		const node = createNode(type, layoutTree)

		for (const [key, value] of Object.entries(newProps)) {
			if (key === 'children') {
				continue
			}

			if (key === 'style') {
				setStyle(node, value as Styles)

				// Taffy layout
				if (layoutTree && node.layoutNodeId !== undefined) {
					applyLayoutStyle(layoutTree, node.layoutNodeId, value as Styles)
				}

				continue
			}

			if (key === 'internal_transform') {
				node.internal_transform = value as OutputTransformer
				continue
			}

			if (key === 'internal_static') {
				currentRootNode = rootNode
				node.internal_static = true
				rootNode.isStaticDirty = true

				// Save reference to <Static> node to skip traversal of entire
				// node tree to find it
				rootNode.staticNode = node
				continue
			}

			setAttribute(node, key, value as DOMNodeAttribute)
		}

		return node
	},
	createTextInstance(text, _root, hostContext) {
		if (!hostContext.isInsideText) {
			throw new Error(
				`Text string "${text}" must be rendered inside <Text> component`
			)
		}

		return createTextNode(text)
	},
	resetTextContent() {},
	hideTextInstance(node) {
		setTextNodeValue(node, '')
	},
	unhideTextInstance(node, text) {
		setTextNodeValue(node, text)
	},
	getPublicInstance: (instance) => instance,
	hideInstance(node) {
		const layoutTree = getLayoutTree(node)
		if (layoutTree && node.layoutNodeId !== undefined) {
			layoutTree.setDisplayNone(node.layoutNodeId)
		}
	},
	unhideInstance(node) {
		const layoutTree = getLayoutTree(node)
		if (layoutTree && node.layoutNodeId !== undefined) {
			layoutTree.setDisplayFlex(node.layoutNodeId)
		}
	},
	appendInitialChild(parentNode: DOMElement, childNode: DOMElement) {
		const layoutTree = getLayoutTree(parentNode)
		appendChildNode(parentNode, childNode, layoutTree)
	},
	appendChild(parentNode: DOMElement, childNode: DOMElement) {
		const layoutTree = getLayoutTree(parentNode)
		appendChildNode(parentNode, childNode, layoutTree)
	},
	insertBefore(parentNode: DOMElement, childNode: DOMElement, beforeChildNode) {
		const layoutTree = getLayoutTree(parentNode)
		insertBeforeNode(parentNode, childNode, beforeChildNode, layoutTree)
	},
	finalizeInitialChildren() {
		return false
	},
	isPrimaryRenderer: true,
	supportsMutation: true,
	supportsPersistence: false,
	supportsHydration: false,
	scheduleTimeout: setTimeout,
	cancelTimeout: clearTimeout,
	noTimeout: -1,
	beforeActiveInstanceBlur() {},
	afterActiveInstanceBlur() {},
	detachDeletedInstance() {},
	getInstanceFromNode: () => null,
	prepareScopeUpdate() {},
	getInstanceFromScope: () => null,
	appendChildToContainer(containerNode: DOMElement, childNode: DOMElement) {
		const layoutTree = getLayoutTreeForRoot(containerNode)
		appendChildNode(containerNode, childNode, layoutTree)
	},
	insertInContainerBefore(
		containerNode: DOMElement,
		childNode: DOMElement,
		beforeChildNode
	) {
		const layoutTree = getLayoutTreeForRoot(containerNode)
		insertBeforeNode(containerNode, childNode, beforeChildNode, layoutTree)
	},
	removeChildFromContainer(node, removeNode) {
		const layoutTree = getLayoutTreeForRoot(node)
		removeChildNode(node, removeNode, layoutTree)
		cleanupLayoutNode(removeNode.layoutNodeId, layoutTree)
	},
	commitUpdate(node, _type, oldProps, newProps) {
		if (currentRootNode && node.internal_static) {
			currentRootNode.isStaticDirty = true
		}

		const props = diff(oldProps, newProps)

		const styleDiff = diff(
			oldProps['style'] as Styles,
			newProps['style'] as Styles
		)

		if (!props && !styleDiff) {
			return
		}

		if (props) {
			for (const [key, value] of Object.entries(props)) {
				if (key === 'style') {
					setStyle(node, value as Styles)
					continue
				}

				if (key === 'internal_transform') {
					node.internal_transform = value as OutputTransformer
					continue
				}

				if (key === 'internal_static') {
					node.internal_static = true
					continue
				}

				setAttribute(node, key, value as DOMNodeAttribute)
			}
		}

		if (styleDiff) {
			// When updating layout styles, we must pass the FULL new style,
			// not just the diff, because setStyle replaces rather than merges.
			const layoutTree = getLayoutTree(node)
			if (layoutTree && node.layoutNodeId !== undefined) {
				applyLayoutStyle(
					layoutTree,
					node.layoutNodeId,
					newProps['style'] as Styles
				)
			}
		}
	},
	commitTextUpdate(node, _oldText, newText) {
		const layoutTree = getLayoutTree(node)
		setTextNodeValue(node, newText, layoutTree)
	},
	removeChild(node, removeNode) {
		const layoutTree = getLayoutTree(node)
		removeChildNode(node, removeNode, layoutTree)
		cleanupLayoutNode(removeNode.layoutNodeId, layoutTree)
	},
	setCurrentUpdatePriority(newPriority: number) {
		currentUpdatePriority = newPriority
	},
	getCurrentUpdatePriority: () => currentUpdatePriority,
	resolveUpdatePriority() {
		if (currentUpdatePriority !== NoEventPriority) {
			return currentUpdatePriority
		}

		return DefaultEventPriority
	},
	maySuspendCommit() {
		return false
	},
	NotPendingTransition: undefined,
	HostTransitionContext: createContext(
		null
	) as unknown as ReactContext<unknown>,
	resetFormInstance() {},
	requestPostPaintCallback() {},
	shouldAttemptEagerTransition() {
		return false
	},
	trackSchedulerEvent() {},
	resolveEventType() {
		return null
	},
	resolveEventTimeStamp() {
		return -1.1
	},
	preloadInstance() {
		return true
	},
	startSuspendingCommit() {},
	suspendInstance() {},
	waitForCommitToBeReady() {
		return null
	},
})
