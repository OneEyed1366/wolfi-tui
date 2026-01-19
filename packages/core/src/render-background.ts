// Phase 2: Migrate from Yoga to Taffy
// NOTE: This file now supports both layout engines

import colorize from './colorize'
import { type DOMNode } from './dom'
import type Output from './output'
import type { ComputedLayout } from './layout-types'

/**
 * Render background color for a node.
 * Uses Taffy computed layout if available, falls back to Yoga.
 *
 * @param x - X position
 * @param y - Y position
 * @param node - The DOM node
 * @param output - The output buffer
 * @param computedLayout - Optional computed layout from Taffy
 */
const renderBackground = (
	x: number,
	y: number,
	node: DOMNode,
	output: Output,
	computedLayout?: ComputedLayout
): void => {
	if (!node.style.backgroundColor) {
		return
	}

	// Phase 2: Use Taffy computed layout if available, fallback to Yoga
	const width =
		computedLayout?.width ?? node.yogaNode?.getComputedWidth() ?? 0
	const height =
		computedLayout?.height ?? node.yogaNode?.getComputedHeight() ?? 0

	// Calculate the actual content area considering borders
	const leftBorderWidth =
		node.style.borderStyle && node.style.borderLeft !== false ? 1 : 0
	const rightBorderWidth =
		node.style.borderStyle && node.style.borderRight !== false ? 1 : 0
	const topBorderHeight =
		node.style.borderStyle && node.style.borderTop !== false ? 1 : 0
	const bottomBorderHeight =
		node.style.borderStyle && node.style.borderBottom !== false ? 1 : 0

	const contentWidth = width - leftBorderWidth - rightBorderWidth
	const contentHeight = height - topBorderHeight - bottomBorderHeight

	if (!(contentWidth > 0 && contentHeight > 0)) {
		return
	}

	// Create background fill for each row
	const backgroundLine = colorize(
		' '.repeat(contentWidth),
		node.style.backgroundColor,
		'background'
	)

	for (let row = 0; row < contentHeight; row++) {
		output.write(
			x + leftBorderWidth,
			y + topBorderHeight + row,
			backgroundLine,
			{ transformers: [] }
		)
	}
}

export default renderBackground
