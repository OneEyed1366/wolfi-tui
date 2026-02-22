import { type JSX, createSignal } from 'solid-js'
import figures from 'figures'
import { measureElement } from '@wolfie/core'
import { Box, type BoxProps } from './Box'
import { Text, type TextProps } from './Text'

//#region Types
export interface IProgressBarProps {
	/**
	 * Progress value between 0 and 100.
	 *
	 * @default 0
	 */
	value: number
}

export type ProgressBarTheme = {
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
export const progressBarTheme: ProgressBarTheme = {
	styles: {
		container: (): Partial<BoxProps> => ({
			style: {
				flexGrow: 1,
				minWidth: 0,
			},
		}),
		completed: (): Partial<TextProps> => ({
			style: {
				color: 'magenta',
			},
		}),
		remaining: (): Partial<TextProps> => ({
			style: {
				color: 'gray',
			},
		}),
	},
	config: () => ({
		// Character for rendering a completed bar
		completedCharacter: figures.square,

		// Character for rendering a remaining bar
		remainingCharacter: figures.squareLightShade,
	}),
}
//#endregion Theme

//#region Component
export function ProgressBar(props: IProgressBarProps): JSX.Element {
	const [width, setWidth] = createSignal(0)

	const { styles, config } = progressBarTheme

	return (
		<Box
			ref={(el: any) => {
				if (el) setWidth(measureElement(el).width)
			}}
			{...styles.container()}
		>
			{(() => {
				const progress = Math.min(100, Math.max(0, props.value))
				const complete = Math.round((progress / 100) * width())
				const remaining = width() - complete

				return (
					<>
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
					</>
				)
			})()}
		</Box>
	)
}
//#endregion Component

export type { IProgressBarProps as Props, IProgressBarProps as IProps }
