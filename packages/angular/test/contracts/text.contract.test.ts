import type { Styles } from '@wolfie/core'
import { computeTextTransform, type ClassNameValue } from '@wolfie/shared'
import { describeTextContract, type TextRenderResult } from '@wolfie/spec'

/**
 * Angular Text contract adapter.
 *
 * TextComponent delegates styling to computeTextTransform() internally —
 * the function returns a transform applied to each text node before render.
 * We call it directly here instead of bootstrapping the full Angular renderer,
 * mirroring the approach used in box.contract.test.ts (unit-test style).
 */
function angularTextRenderer(
	props: {
		children: string
		className?: ClassNameValue
		style?: Partial<Styles>
	},
	options?: { parentBg?: string }
): TextRenderResult {
	const transform = computeTextTransform(
		{ className: props.className, style: props.style },
		options?.parentBg
	)
	return { output: transform(props.children) }
}

describeTextContract(angularTextRenderer)
