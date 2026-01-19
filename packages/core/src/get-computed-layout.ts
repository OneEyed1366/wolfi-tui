// Phase 2: Unified computed layout access for Taffy and Yoga
// This helper provides a single interface to get layout values from either engine

import Yoga from 'yoga-layout'
import type { DOMNode } from './dom'
import type { ComputedLayout, LayoutTree } from './layout-types'

//#region Types

/**
 * Get computed layout for a DOM node.
 * Uses Taffy (via LayoutTree) if available, falls back to Yoga.
 *
 * @param node - The DOM node to get layout for
 * @param layoutTree - Optional LayoutTree for Taffy-based layout
 * @returns ComputedLayout or undefined if no layout available
 */
export const getComputedLayout = (
	node: DOMNode,
	layoutTree?: LayoutTree
): ComputedLayout | undefined => {
	// Taffy (new) - preferred if available
	if (layoutTree && node.layoutNodeId !== undefined) {
		return layoutTree.getLayout(node.layoutNodeId)
	}

	// Yoga (legacy) - fallback
	if (node.yogaNode) {
		const yogaNode = node.yogaNode
		return {
			x: yogaNode.getComputedLeft(),
			y: yogaNode.getComputedTop(),
			width: yogaNode.getComputedWidth(),
			height: yogaNode.getComputedHeight(),
			paddingTop: yogaNode.getComputedPadding(Yoga.EDGE_TOP),
			paddingRight: yogaNode.getComputedPadding(Yoga.EDGE_RIGHT),
			paddingBottom: yogaNode.getComputedPadding(Yoga.EDGE_BOTTOM),
			paddingLeft: yogaNode.getComputedPadding(Yoga.EDGE_LEFT),
			borderTop: yogaNode.getComputedBorder(Yoga.EDGE_TOP),
			borderRight: yogaNode.getComputedBorder(Yoga.EDGE_RIGHT),
			borderBottom: yogaNode.getComputedBorder(Yoga.EDGE_BOTTOM),
			borderLeft: yogaNode.getComputedBorder(Yoga.EDGE_LEFT),
		}
	}

	return undefined
}

//#endregion Types

//#region Display Check

/**
 * Check if a node's display is set to none.
 * Uses Taffy style check or Yoga's getDisplay method.
 *
 * @param node - The DOM node to check
 * @param layoutTree - Optional LayoutTree for Taffy-based layout
 * @returns true if display is none, false otherwise
 */
export const isDisplayNone = (
	node: DOMNode,
	_layoutTree?: LayoutTree
): boolean => {
	// Check style property first (works for both engines)
	if (node.style.display === 'none') {
		return true
	}

	// Yoga (legacy) - check computed display
	if (node.yogaNode) {
		return node.yogaNode.getDisplay() === Yoga.DISPLAY_NONE
	}

	return false
}

//#endregion Display Check

export type { ComputedLayout }
