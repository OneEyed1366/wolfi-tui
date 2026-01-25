// Taffy-based element measurement
// Yoga has been removed - Taffy is now the only layout engine

import { type DOMElement } from './dom'
import { getComputedLayout } from './get-computed-layout'
import type { LayoutTree } from './layout-types'

type Output = {
	/**
	Element width.
	*/
	width: number

	/**
	Element height.
	*/
	height: number
}

/**
 * Measure the dimensions of a particular `<Box>` element.
 *
 * @param node - The DOM element to measure
 * @param layoutTree - LayoutTree for Taffy-based layout (optional, uses node.layoutTree if not provided)
 * @returns The computed width and height
 */
const measureElement = (node: DOMElement, layoutTree?: LayoutTree): Output => {
	// Use provided layoutTree or fall back to node's layoutTree
	const effectiveLayoutTree = layoutTree ?? node.layoutTree
	const computedLayout = getComputedLayout(node, effectiveLayoutTree)

	return {
		width: computedLayout?.width ?? 0,
		height: computedLayout?.height ?? 0,
	}
}

export default measureElement
