// Taffy-based computed layout access
// Yoga has been removed - Taffy is now the only layout engine

import type { DOMNode } from './dom'
import type { ComputedLayout, LayoutTree } from './layout-types'

//#region Types

/**
 * Get computed layout for a DOM node using Taffy.
 *
 * @param node - The DOM node to get layout for
 * @param layoutTree - LayoutTree for Taffy-based layout (optional, uses node.layoutTree if not provided)
 * @returns ComputedLayout or undefined if no layout available
 */
export const getComputedLayout = (
	node: DOMNode,
	layoutTree?: LayoutTree
): ComputedLayout | undefined => {
	// Use provided layoutTree or fall back to node's layoutTree
	const effectiveLayoutTree = layoutTree ?? node.layoutTree
	if (effectiveLayoutTree && node.layoutNodeId !== undefined) {
		return effectiveLayoutTree.getLayout(node.layoutNodeId)
	}

	return undefined
}

//#endregion Types

//#region Display Check

/**
 * Check if a node's display is set to none.
 *
 * @param node - The DOM node to check
 * @param _layoutTree - Optional LayoutTree (unused, kept for API compatibility)
 * @returns true if display is none, false otherwise
 */
export const isDisplayNone = (
	node: DOMNode,
	_layoutTree?: LayoutTree
): boolean => {
	return node.style.display === 'none'
}

//#endregion Display Check

export type { ComputedLayout }
