import React, { useContext } from 'react'
import type { Styles } from '@wolfie/core'
import { computeBoxStyle, type ClassNameValue } from '@wolfie/shared'
import { describeBoxContract, type BoxRenderResult } from '@wolfie/spec'
import { Box, backgroundContext } from '@wolfie/react'
import { renderToString } from '../helpers/render-to-string'

function reactBoxRenderer(
	props: {
		className?: ClassNameValue
		style?: Partial<Styles>
		children?: string
	},
	options?: { parentBg?: string }
): BoxRenderResult {
	let capturedBg: string | undefined = undefined

	// Child component that reads from backgroundContext (what Box provides to its children)
	function BgCapture() {
		capturedBg = useContext(backgroundContext) as string | undefined
		return null
	}

	// Wrapper that simulates a parent Box with parentBg
	function Wrapper({ children }: { children: React.ReactNode }) {
		return options?.parentBg ? (
			<backgroundContext.Provider value={options.parentBg}>
				{children}
			</backgroundContext.Provider>
		) : (
			<>{children}</>
		)
	}

	const output = renderToString(
		<Wrapper>
			<Box className={props.className as any} style={props.style as Styles}>
				<BgCapture />
				{props.children ?? 'test'}
			</Box>
		</Wrapper>
	)

	// appliedStyle derived from computeBoxStyle — the component delegates to it internally
	const appliedStyle = computeBoxStyle({
		className: props.className,
		style: props.style,
	})

	return { appliedStyle, providedBg: capturedBg, output }
}

describeBoxContract(reactBoxRenderer)
