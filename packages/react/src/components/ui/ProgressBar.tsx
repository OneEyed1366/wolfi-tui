import { useState } from 'react'
import Box, { type Props as BoxProps } from '../Box'
import Text, { type Props as TextProps } from '../Text'
import { useComponentTheme, type ComponentTheme } from '../../theme/theme'
import { measureElement, type DOMElement } from '@wolfie/core'
import figures from 'figures'

//#region Types
export type ProgressBarProps = {
	/**
	 * Progress.
	 * Must be between 0 and 100.
	 *
	 * @default 0
	 */
	readonly value: number
}

type ProgressBarTheme = {
	styles: {
		container: () => Partial<BoxProps>
		completed: () => Partial<TextProps>
		remaining: () => Partial<TextProps>
	}
	config: () => {
		completedCharacter: string
		remainingCharacter: string
	}
}
//#endregion Types

//#region Theme
export const progressBarTheme = {
	styles: {
		container: (): Partial<BoxProps> => ({
			flexGrow: 1,
			minWidth: 0,
		}),
		completed: (): Partial<TextProps> => ({
			color: 'magenta',
		}),
		remaining: (): Partial<TextProps> => ({
			dimColor: true,
		}),
	},
	config: () => ({
		// Character for rendering a completed bar
		completedCharacter: figures.square,

		// Character for rendering a remaining bar
		remainingCharacter: figures.squareLightShade,
	}),
} satisfies ComponentTheme
//#endregion Theme

//#region Component
export function ProgressBar({ value }: ProgressBarProps) {
	const [width, setWidth] = useState(0)

	const [ref, setRef] = useState<DOMElement | null>(null)

	if (ref) {
		const dimensions = measureElement(ref)

		if (dimensions.width !== width) {
			setWidth(dimensions.width)
		}
	}

	const progress = Math.min(100, Math.max(0, value))
	const complete = Math.round((progress / 100) * width)
	const remaining = width - complete

	const { styles, config } = useComponentTheme<ProgressBarTheme>('ProgressBar')

	return (
		<Box ref={setRef} {...styles.container()}>
			{complete > 0 && (
				<Text {...styles.completed()}>
					{config().completedCharacter.repeat(complete)}
				</Text>
			)}

			{remaining > 0 && (
				<Text {...styles.remaining()}>
					{config().remainingCharacter.repeat(remaining)}
				</Text>
			)}
		</Box>
	)
}
//#endregion Component
