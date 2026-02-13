// Taffy-based render node to output
// Yoga has been removed - Taffy is now the only layout engine

import widestLine from 'widest-line'
import indentString from 'indent-string'
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

	const childLayout = getComputedLayout(firstChild, layoutTree)

	if (childLayout) {
		const offsetX = childLayout.x
		const offsetY = childLayout.y
		text = '\n'.repeat(offsetY) + indentString(text, offsetX)
	}

	return text
}

export type IOutputTransformer = (s: string, index: number) => string

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

	if (isDisplayNone(node, options.layoutTree)) {
		return ''
	}

	let output = ''

	if (node.nodeName === 'wolfie-text') {
		output = squashTextNodes(node)
	} else if (
		node.nodeName === 'wolfie-box' ||
		node.nodeName === 'wolfie-root'
	) {
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
		transformers?: IOutputTransformer[]
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

	if (isDisplayNone(node, layoutTree)) {
		return
	}

	const computedLayout = getComputedLayout(node, layoutTree)

	// Apply transform even for transparent/host element nodes
	let newTransformers = transformers
	if (typeof node.internal_transform === 'function') {
		newTransformers = [node.internal_transform, ...transformers]
	}

	// Need computed layout from Taffy
	if (!computedLayout) {
		// Pass-through for transparent nodes (e.g., Angular host elements):
		// recurse into children using parent's offsets
		if (node.nodeName === 'wolfie-box' || node.nodeName === 'wolfie-root') {
			for (const childNode of node.childNodes) {
				renderNodeToOutput(childNode as DOMElement, output, {
					offsetX,
					offsetY,
					transformers: newTransformers,
					skipStaticElements,
					layoutTree,
				})
			}
		}
		return
	}

	// Left and top positions are relative to parent node
	const x = offsetX + computedLayout.x
	const y = offsetY + computedLayout.y

	if (node.nodeName === 'wolfie-text') {
		let text = squashTextNodes(node)

		if (text.length > 0) {
			const currentWidth = widestLine(text)
			const maxWidth = getMaxWidth(computedLayout)

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

	if (node.nodeName === 'wolfie-box') {
		renderBackground(x, y, node, output, computedLayout)
		renderBorder(x, y, node, output, computedLayout)

		const clipHorizontally =
			node.style.overflowX === 'hidden' || node.style.overflow === 'hidden'
		const clipVertically =
			node.style.overflowY === 'hidden' || node.style.overflow === 'hidden'

		if (clipHorizontally || clipVertically) {
			const {
				borderLeft,
				borderRight,
				borderTop,
				borderBottom,
				width,
				height,
			} = computedLayout

			const x1 = clipHorizontally ? x + borderLeft : undefined
			const x2 = clipHorizontally ? x + width - borderRight : undefined
			const y1 = clipVertically ? y + borderTop : undefined
			const y2 = clipVertically ? y + height - borderBottom : undefined

			output.clip({ x1, x2, y1, y2 })
			clipped = true
		}
	}

	if (node.nodeName === 'wolfie-root' || node.nodeName === 'wolfie-box') {
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
