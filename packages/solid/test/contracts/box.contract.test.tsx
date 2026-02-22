import { useContext } from 'solid-js'
import type { Styles } from '@wolfie/core'
import { computeBoxStyle, type ClassNameValue } from '@wolfie/shared'
import { describeBoxContract, type BoxRenderResult } from '@wolfie/spec'
import { Box } from '../../src/components/Box'
import { BackgroundCtx } from '../../src/context/symbols'
import { renderToString } from '../helpers/render-to-string'

function solidBoxRenderer(
	props: {
		className?: ClassNameValue
		style?: Partial<Styles>
		children?: string
	},
	options?: { parentBg?: string }
): BoxRenderResult {
	let capturedBg: string | undefined = undefined

	// Child component that reads the background accessor provided by Box
	function BgCapture() {
		// BackgroundCtx value is Accessor<string | undefined> — call it to get current value
		capturedBg = useContext(BackgroundCtx)()
		return null
	}

	const output = renderToString(() =>
		options?.parentBg ? (
			<BackgroundCtx.Provider
				value={() => options.parentBg as string | undefined}
			>
				<Box className={props.className} style={props.style as Styles}>
					<BgCapture />
					{props.children ?? 'test'}
				</Box>
			</BackgroundCtx.Provider>
		) : (
			<Box className={props.className} style={props.style as Styles}>
				<BgCapture />
				{props.children ?? 'test'}
			</Box>
		)
	)

	return {
		appliedStyle: computeBoxStyle({
			className: props.className,
			style: props.style,
		}),
		providedBg: capturedBg,
		output,
	}
}

describeBoxContract(solidBoxRenderer)
