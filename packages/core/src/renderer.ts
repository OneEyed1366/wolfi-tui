// Phase 2: Migrate from Yoga to Taffy
// NOTE: This file now supports both layout engines via getComputedLayout helper

import renderNodeToOutput, {
	renderNodeToScreenReaderOutput,
} from './render-node-to-output'
import Output from './output'
import { type DOMElement } from './dom'
import { getComputedLayout } from './get-computed-layout'
import type { LayoutTree } from './layout-types'

type Result = {
	output: string
	outputHeight: number
	staticOutput: string
}

const renderer = (
	node: DOMElement,
	isScreenReaderEnabled: boolean,
	layoutTree?: LayoutTree
): Result => {
	// Phase 2: Check for either layout engine
	const rootLayout = getComputedLayout(node, layoutTree)
	if (!rootLayout && !node.yogaNode) {
		return {
			output: '',
			outputHeight: 0,
			staticOutput: '',
		}
	}

	if (isScreenReaderEnabled) {
		const output = renderNodeToScreenReaderOutput(node, {
			skipStaticElements: true,
			layoutTree,
		})

		const outputHeight = output === '' ? 0 : output.split('\n').length

		let staticOutput = ''

		if (node.staticNode) {
			staticOutput = renderNodeToScreenReaderOutput(node.staticNode, {
				skipStaticElements: false,
				layoutTree,
			})
		}

		return {
			output,
			outputHeight,
			staticOutput: staticOutput ? `${staticOutput}\n` : '',
		}
	}

	// Phase 2: Use Taffy computed layout if available, fallback to Yoga
	const width = rootLayout?.width ?? node.yogaNode?.getComputedWidth() ?? 0
	const height = rootLayout?.height ?? node.yogaNode?.getComputedHeight() ?? 0

	const output = new Output({
		width,
		height,
	})

	renderNodeToOutput(node, output, {
		skipStaticElements: true,
		layoutTree,
	})

	let staticOutput

	const staticNodeLayout = node.staticNode
		? getComputedLayout(node.staticNode, layoutTree)
		: undefined

	if (staticNodeLayout || node.staticNode?.yogaNode) {
		const staticWidth =
			staticNodeLayout?.width ??
			node.staticNode?.yogaNode?.getComputedWidth() ??
			0
		const staticHeight =
			staticNodeLayout?.height ??
			node.staticNode?.yogaNode?.getComputedHeight() ??
			0

		staticOutput = new Output({
			width: staticWidth,
			height: staticHeight,
		})

		renderNodeToOutput(node.staticNode!, staticOutput, {
			skipStaticElements: false,
			layoutTree,
		})
	}

	const { output: generatedOutput, height: outputHeight } = output.get()

	return {
		output: generatedOutput,
		outputHeight,
		// Newline at the end is needed, because static output doesn't have one, so
		// interactive output will override last line of static output
		staticOutput: staticOutput ? `${staticOutput.get().output}\n` : '',
	}
}

export default renderer
