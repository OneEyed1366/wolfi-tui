// Taffy-based max width calculation
// Yoga has been removed - Taffy is now the only layout engine

import type { ComputedLayout } from './layout-types'

/**
 * Get the maximum content width for a node (width minus padding and border).
 *
 * @param computedLayout - The computed layout from Taffy
 * @returns The maximum content width, or 0 if no layout available
 */
const getMaxWidth = (computedLayout?: ComputedLayout): number => {
	if (computedLayout) {
		return (
			computedLayout.width -
			computedLayout.paddingLeft -
			computedLayout.paddingRight -
			computedLayout.borderLeft -
			computedLayout.borderRight
		)
	}

	return 0
}

export default getMaxWidth
