import { defineComponent, type PropType } from 'vue'
import type { SpinnerName } from 'cli-spinners'
import { Box, type BoxProps } from './Box'
import { Text, type TextProps } from './Text'
import { useSpinner, type UseSpinnerProps } from '../composables/use-spinner'

//#region Types
export interface SpinnerProps extends UseSpinnerProps {
	/**
	 * Label to show near the spinner.
	 */
	label?: string
}

export type SpinnerTheme = {
	styles: {
		container: () => Partial<BoxProps>
		frame: () => Partial<TextProps>
		label: () => Partial<TextProps>
	}
}
//#endregion Types

//#region Theme
export const spinnerTheme: SpinnerTheme = {
	styles: {
		container: (): Partial<BoxProps> => ({
			style: {
				gap: 1,
			},
		}),
		frame: (): Partial<TextProps> => ({
			style: {
				color: 'blue',
			},
		}),
		label: (): Partial<TextProps> => ({}),
	},
}
//#endregion Theme

//#region Component
export const Spinner = defineComponent({
	name: 'Spinner',
	props: {
		type: {
			type: String as PropType<SpinnerName>,
			default: 'dots',
		},
		label: {
			type: String,
			default: undefined,
		},
	},
	setup(props) {
		const spinnerResult = useSpinner({ type: props.type })

		return () => {
			const { label } = props
			const { styles } = spinnerTheme

			const result = (
				<Box {...styles.container()}>
					<Text {...styles.frame()}>{spinnerResult.frame}</Text>
					{label && <Text {...styles.label()}>{label}</Text>}
				</Box>
			)
			return result
		}
	},
})
//#endregion Component

export type { SpinnerProps as Props, SpinnerProps as IProps }
