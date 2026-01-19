// Phase 2: Migrate from Yoga to Taffy
// NOTE: This file now supports both layout engines via getComputedLayout helper

import widestLine from 'widest-line'
import indentString from 'indent-string'
import Yoga from 'yoga-layout'
import wrapText from './wrap-text'
import getMaxWidth from './get-max-width'
import squashTextNodes from './squash-text-nodes'
import renderBorder from './render-border'
import renderBackground from './render-background'
import { type DOMElement } from './dom'
import type Output from './output'
import { getComputedLayout, isDisplayNone } from './get-computed-layout'
import type { LayoutTree } from './layout-types'

// If parent container is `<Box>`, text nodes will be treated as separate nodes in
// the tree and will have their own coordinates in the layout.
// To ensure text nodes are aligned correctly, take X and Y of the first text node
// and use it as offset for the rest of the nodes
// Only first node is taken into account, because other text nodes can't have margin or padding,
// so their coordinates will be relative to the first node anyway
const applyPaddingToText = (
	node: DOMElement,
	text: string,
	layoutTree?: LayoutTree
): string => {
	const firstChild = node.childNodes[0]
	if (!firstChild) return text

	// Phase 2: Use Taffy computed layout if available, fallback to Yoga
	const childLayout = getComputedLayout(firstChild, layoutTree)

	if (childLayout) {
		const offsetX = childLayout.x
		const offsetY = childLayout.y
		text = '\n'.repeat(offsetY) + indentString(text, offsetX)
	} else if (firstChild.yogaNode) {
		// Yoga fallback
		const offsetX = firstChild.yogaNode.getComputedLeft()
		const offsetY = firstChild.yogaNode.getComputedTop()
		text = '\n'.repeat(offsetY) + indentString(text, offsetX)
	}

	return text
}

export type OutputTransformer = (s: string, index: number) => string

export const renderNodeToScreenReaderOutput = (
	node: DOMElement,
	options: {
		parentRole?: string
		skipStaticElements?: boolean
		layoutTree?: LayoutTree
	} = {}
): string => {
	if (options.skipStaticElements && node.internal_static) {
		return ''
	}

	// Phase 2: Use isDisplayNone helper for both Taffy and Yoga
	if (isDisplayNone(node, options.layoutTree)) {
		return ''
	}

	let output = ''

	if (node.nodeName === 'ink-text') {
		output = squashTextNodes(node)
	} else if (node.nodeName === 'ink-box' || node.nodeName === 'ink-root') {
		const separator =
			node.style.flexDirection === 'row' ||
			node.style.flexDirection === 'row-reverse'
				? ' '
				: '\n'

		const childNodes =
			node.style.flexDirection === 'row-reverse' ||
			node.style.flexDirection === 'column-reverse'
				? [...node.childNodes].reverse()
				: [...node.childNodes]

		output = childNodes
			.map((childNode) => {
				const screenReaderOutput = renderNodeToScreenReaderOutput(
					childNode as DOMElement,
					{
						parentRole: node.internal_accessibility?.role,
						skipStaticElements: options.skipStaticElements,
						layoutTree: options.layoutTree,
					}
				)
				return screenReaderOutput
			})
			.filter(Boolean)
			.join(separator)
	}

	if (node.internal_accessibility) {
		const { role, state } = node.internal_accessibility

		if (state) {
			const stateKeys = Object.keys(state) as Array<keyof typeof state>
			const stateDescription = stateKeys.filter((key) => state[key]).join(', ')

			if (stateDescription) {
				output = `(${stateDescription}) ${output}`
			}
		}

		if (role && role !== options.parentRole) {
			output = `${role}: ${output}`
		}
	}

	return output
}

// After nodes are laid out, render each to output object, which later gets rendered to terminal
const renderNodeToOutput = (
	node: DOMElement,
	output: Output,
	options: {
		offsetX?: number
		offsetY?: number
		transformers?: OutputTransformer[]
		skipStaticElements: boolean
		layoutTree?: LayoutTree
	}
) => {
	const {
		offsetX = 0,
		offsetY = 0,
		transformers = [],
		skipStaticElements,
		layoutTree,
	} = options

	if (skipStaticElements && node.internal_static) {
		return
	}

	// Phase 2: Use isDisplayNone helper for both Taffy and Yoga
	if (isDisplayNone(node, layoutTree)) {
		return
	}

	// Phase 2: Get computed layout from either Taffy or Yoga
	const computedLayout = getComputedLayout(node, layoutTree)
	const { yogaNode } = node

	// Need either computed layout (from Taffy) or yogaNode (from Yoga)
	if (!computedLayout && !yogaNode) {
		return
	}

	// Left and top positions are relative to parent node
	// Phase 2: Use Taffy computed layout if available, fallback to Yoga
	const x = offsetX + (computedLayout?.x ?? yogaNode?.getComputedLeft() ?? 0)
	const y = offsetY + (computedLayout?.y ?? yogaNode?.getComputedTop() ?? 0)

	// Transformers are functions that transform final text output of each component
	// See Output class for logic that applies transformers
	let newTransformers = transformers

	if (typeof node.internal_transform === 'function') {
		newTransformers = [node.internal_transform, ...transformers]
	}

	if (node.nodeName === 'ink-text') {
		let text = squashTextNodes(node)

		if (text.length > 0) {
			const currentWidth = widestLine(text)
			// Phase 2: Pass layout info to getMaxWidth
			const maxWidth = getMaxWidth(yogaNode, computedLayout)

			if (currentWidth > maxWidth) {
				const textWrap = node.style.textWrap ?? 'wrap'
				text = wrapText(text, maxWidth, textWrap)
			}

			text = applyPaddingToText(node, text, layoutTree)

			output.write(x, y, text, { transformers: newTransformers })
		}

		return
	}

	let clipped = false

	if (node.nodeName === 'ink-box') {
		// Phase 2: Pass layout info to render helpers
		renderBackground(x, y, node, output, computedLayout)
		renderBorder(x, y, node, output, computedLayout)

		const clipHorizontally =
			node.style.overflowX === 'hidden' || node.style.overflow === 'hidden'
		const clipVertically =
			node.style.overflowY === 'hidden' || node.style.overflow === 'hidden'

		if (clipHorizontally || clipVertically) {
			// Phase 2: Use Taffy computed layout if available, fallback to Yoga
			const borderLeft =
				computedLayout?.borderLeft ??
				yogaNode?.getComputedBorder(Yoga.EDGE_LEFT) ??
				0
			const borderRight =
				computedLayout?.borderRight ??
				yogaNode?.getComputedBorder(Yoga.EDGE_RIGHT) ??
				0
			const borderTop =
				computedLayout?.borderTop ??
				yogaNode?.getComputedBorder(Yoga.EDGE_TOP) ??
				0
			const borderBottom =
				computedLayout?.borderBottom ??
				yogaNode?.getComputedBorder(Yoga.EDGE_BOTTOM) ??
				0
			const width =
				computedLayout?.width ?? yogaNode?.getComputedWidth() ?? 0
			const height =
				computedLayout?.height ?? yogaNode?.getComputedHeight() ?? 0

			const x1 = clipHorizontally ? x + borderLeft : undefined

			const x2 = clipHorizontally ? x + width - borderRight : undefined

			const y1 = clipVertically ? y + borderTop : undefined

			const y2 = clipVertically ? y + height - borderBottom : undefined

			output.clip({ x1, x2, y1, y2 })
			clipped = true
		}
	}

	if (node.nodeName === 'ink-root' || node.nodeName === 'ink-box') {
		for (const childNode of node.childNodes) {
			renderNodeToOutput(childNode as DOMElement, output, {
				offsetX: x,
				offsetY: y,
				transformers: newTransformers,
				skipStaticElements,
				layoutTree,
			})
		}

		if (clipped) {
			output.unclip()
		}
	}
}

export default renderNodeToOutput
