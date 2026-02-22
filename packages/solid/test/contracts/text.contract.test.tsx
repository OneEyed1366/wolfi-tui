import type { Styles } from '@wolfie/core'
import type { ClassNameValue } from '@wolfie/shared'
import { describeTextContract, type TextRenderResult } from '@wolfie/spec'
import { Text } from '../../src/components/Text'
import { BackgroundCtx } from '../../src/context/symbols'
import { renderToString } from '../helpers/render-to-string'

function solidTextRenderer(
	props: {
		children: string
		className?: ClassNameValue
		style?: Partial<Styles>
	},
	options?: { parentBg?: string }
): TextRenderResult {
	const output = renderToString(() =>
		options?.parentBg ? (
			<BackgroundCtx.Provider
				value={() => options.parentBg as string | undefined}
			>
				<Text className={props.className} style={props.style as Styles}>
					{props.children}
				</Text>
			</BackgroundCtx.Provider>
		) : (
			<Text className={props.className} style={props.style as Styles}>
				{props.children}
			</Text>
		)
	)
	return { output }
}

describeTextContract(solidTextRenderer)
