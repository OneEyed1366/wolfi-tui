import type { Styles } from '@wolfie/core'
import type { ClassNameValue } from '@wolfie/shared'
import { describeTextContract, type TextRenderResult } from '@wolfie/spec'
import { Text, backgroundContext } from '@wolfie/react'
import { renderToString } from '../helpers/render-to-string'

function reactTextRenderer(
	props: {
		children: string
		className?: ClassNameValue
		style?: Partial<Styles>
	},
	options?: { parentBg?: string }
): TextRenderResult {
	const node = (
		<Text className={props.className as any} style={props.style as Styles}>
			{props.children}
		</Text>
	)
	const output = renderToString(
		options?.parentBg ? (
			<backgroundContext.Provider value={options.parentBg}>
				{node}
			</backgroundContext.Provider>
		) : (
			node
		)
	)
	return { output }
}

describeTextContract(reactTextRenderer)
