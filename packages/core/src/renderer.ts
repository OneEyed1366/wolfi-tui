// Taffy-based renderer
// Yoga has been removed - Taffy is now the only layout engine

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
	const rootLayout = getComputedLayout(node, layoutTree)
	if (!rootLayout) {
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

	const width = rootLayout.width
	const height = rootLayout.height

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

	if (staticNodeLayout) {
		const staticWidth = staticNodeLayout.width
		const staticHeight = staticNodeLayout.height

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
