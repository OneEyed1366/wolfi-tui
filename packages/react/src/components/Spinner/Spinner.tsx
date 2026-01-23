import { type IProps as BoxProps, Box } from '../Box'
import { type IProps as TextProps, Text } from '../Text'
import { useComponentTheme, type IComponentTheme } from '../../theme/theme'
import { useSpinner, type UseSpinnerProps } from '../use-spinner'

//#region Types
export type ISpinnerProps = UseSpinnerProps & {
	/**
	 * Label to show near the spinner.
	 */
	label?: string
}

type ISpinnerTheme = {
	styles: {
		container: () => Partial<BoxProps>
		frame: () => Partial<TextProps>
		label: () => Partial<TextProps>
	}
}
//#endregion Types

//#region Theme
export const spinnerTheme = {
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
} satisfies IComponentTheme
//#endregion Theme

//#region Component
export function Spinner({ label, type }: ISpinnerProps) {
	const { frame } = useSpinner({ type })
	const { styles } = useComponentTheme<ISpinnerTheme>('Spinner')

	return (
		<Box {...styles.container()}>
			<Text {...styles.frame()}>{frame}</Text>
			{label && <Text {...styles.label()}>{label}</Text>}
		</Box>
	)
}
//#endregion Component
