import { type ReactNode } from 'react'
import { type IProps as BoxProps, Box } from '../Box'
import { type IProps as TextProps, Text } from '../Text'
import { useComponentTheme, type IComponentTheme } from '../../theme/theme'
import figures from 'figures'

//#region Types
export type IStatusMessageVariant = 'info' | 'success' | 'error' | 'warning'

export type IStatusMessageProps = {
	/**
	 * Message.
	 */
	children: ReactNode

	/**
	 * Variant, which determines the color used in the status message.
	 */
	variant: IStatusMessageVariant
}

type IStatusMessageTheme = {
	styles: {
		container: () => Partial<BoxProps>
		iconContainer: () => Partial<BoxProps>
		icon: (props: { variant: IStatusMessageVariant }) => Partial<TextProps>
		message: () => Partial<TextProps>
	}
	config: (props: { variant: IStatusMessageVariant }) => {
		icon: string
	}
}
//#endregion Types

//#region Theme
const colorByVariant: Record<IStatusMessageVariant, string> = {
	success: 'green',
	error: 'red',
	warning: 'yellow',
	info: 'blue',
}

const iconByVariant: Record<IStatusMessageVariant, string> = {
	success: figures.tick,
	error: figures.cross,
	warning: figures.warning,
	info: figures.info,
}

export const statusMessageTheme = {
	styles: {
		container: (): Partial<BoxProps> => ({
			style: {
				gap: 1,
			},
		}),
		iconContainer: (): Partial<BoxProps> => ({
			style: {
				flexShrink: 0,
			},
		}),
		icon: ({
			variant,
		}: {
			variant: IStatusMessageVariant
		}): Partial<TextProps> => ({
			style: {
				color: colorByVariant[variant],
			},
		}),
		message: (): Partial<TextProps> => ({}),
	},
	config: ({ variant }: { variant: IStatusMessageVariant }) => ({
		icon: iconByVariant[variant],
	}),
} satisfies IComponentTheme
//#endregion Theme

//#region Component
export function StatusMessage({ children, variant }: IStatusMessageProps) {
	const { styles, config } =
		useComponentTheme<IStatusMessageTheme>('StatusMessage')

	return (
		<Box {...styles.container()}>
			<Box {...styles.iconContainer()}>
				<Text {...styles.icon({ variant })}>{config({ variant }).icon}</Text>
			</Box>

			<Text {...styles.message()}>{children}</Text>
		</Box>
	)
}
//#endregion Component
