// Phase 2: Migrate from Yoga to Taffy
// NOTE: This file now supports both layout engines via getComputedLayout helper

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
 * Uses Taffy computed layout if available, falls back to Yoga.
 *
 * @param node - The DOM element to measure
 * @param layoutTree - Optional LayoutTree for Taffy-based layout
 * @returns The computed width and height
 */
const measureElement = (node: DOMElement, layoutTree?: LayoutTree): Output => {
	// Phase 2: Use Taffy computed layout if available, fallback to Yoga
	const computedLayout = getComputedLayout(node, layoutTree)

	return {
		width: computedLayout?.width ?? node.yogaNode?.getComputedWidth() ?? 0,
		height: computedLayout?.height ?? node.yogaNode?.getComputedHeight() ?? 0,
	}
}

export default measureElement
