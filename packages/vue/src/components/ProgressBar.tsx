import { defineComponent, ref, type PropType } from 'vue'
import figures from 'figures'
import { measureElement, type DOMElement } from '@wolfie/core'
import { Box, type BoxProps } from './Box'
import { Text, type TextProps } from './Text'

//#region Types
export interface ProgressBarProps {
	/**
	 * Progress.
	 * Must be between 0 and 100.
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
export const ProgressBar = defineComponent({
	name: 'ProgressBar',
	props: {
		value: {
			type: Number as PropType<number>,
			required: true,
		},
	},
	setup(props) {
		const width = ref(0)
		const containerRef = ref<DOMElement | null>(null)

		// Use type-safe ref callback
		const setRef = (el: unknown) => {
			// In Wolfie's custom renderer, the ref receives a DOMElement
			const domEl = el as DOMElement | null
			containerRef.value = domEl
			if (domEl) {
				const dimensions = measureElement(domEl)
				if (dimensions.width !== width.value) {
					width.value = dimensions.width
				}
			}
		}

		return () => {
			const { styles, config } = progressBarTheme

			const progress = Math.min(100, Math.max(0, props.value))
			const complete = Math.round((progress / 100) * width.value)
			const remaining = width.value - complete

			const result = (
				<Box ref={setRef as never} {...styles.container()}>
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
			return result
		}
	},
})
//#endregion Component

export type { ProgressBarProps as Props, ProgressBarProps as IProps }
