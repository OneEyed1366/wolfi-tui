import type { Styles } from '@wolf-tui/core'
import type { ClassNameValue } from '@wolf-tui/shared'
import { describeTextContract, type TextRenderResult } from '@wolf-tui/spec'
import { Text, backgroundContext } from '@wolf-tui/react'
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
