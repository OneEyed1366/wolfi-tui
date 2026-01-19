// Phase 2: Migrate from Yoga to Taffy
// NOTE: This file now supports both layout engines

import Yoga, { type Node as YogaNode } from 'yoga-layout'
import type { ComputedLayout } from './layout-types'

/**
 * Get the maximum content width for a node (width minus padding and border).
 * Uses Taffy computed layout if available, falls back to Yoga.
 *
 * @param yogaNode - The Yoga node (legacy, may be undefined)
 * @param computedLayout - The computed layout from Taffy (new, may be undefined)
 * @returns The maximum content width
 */
const getMaxWidth = (
	yogaNode?: YogaNode,
	computedLayout?: ComputedLayout
): number => {
	// Phase 2: Use Taffy computed layout if available
	if (computedLayout) {
		return (
			computedLayout.width -
			computedLayout.paddingLeft -
			computedLayout.paddingRight -
			computedLayout.borderLeft -
			computedLayout.borderRight
		)
	}

	// Yoga (legacy) fallback
	if (yogaNode) {
		return (
			yogaNode.getComputedWidth() -
			yogaNode.getComputedPadding(Yoga.EDGE_LEFT) -
			yogaNode.getComputedPadding(Yoga.EDGE_RIGHT) -
			yogaNode.getComputedBorder(Yoga.EDGE_LEFT) -
			yogaNode.getComputedBorder(Yoga.EDGE_RIGHT)
		)
	}

	return 0
}

export default getMaxWidth
