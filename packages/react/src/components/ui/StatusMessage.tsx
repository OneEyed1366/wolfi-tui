import { type ReactNode } from 'react'
import Box, { type Props as BoxProps } from '../Box'
import Text, { type Props as TextProps } from '../Text'
import { useComponentTheme, type ComponentTheme } from '../../theme/theme'
import figures from 'figures'

//#region Types
export type StatusMessageVariant = 'info' | 'success' | 'error' | 'warning'

export type StatusMessageProps = {
	/**
	 * Message.
	 */
	readonly children: ReactNode

	/**
	 * Variant, which determines the color used in the status message.
	 */
	readonly variant: StatusMessageVariant
}

type StatusMessageTheme = {
	styles: {
		container: () => Partial<BoxProps>
		iconContainer: () => Partial<BoxProps>
		icon: (props: { variant: StatusMessageVariant }) => Partial<TextProps>
		message: () => Partial<TextProps>
	}
	config: (props: { variant: StatusMessageVariant }) => {
		icon: string
	}
}
//#endregion Types

//#region Theme
const colorByVariant: Record<StatusMessageVariant, string> = {
	success: 'green',
	error: 'red',
	warning: 'yellow',
	info: 'blue',
}

const iconByVariant: Record<StatusMessageVariant, string> = {
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
			variant: StatusMessageVariant
		}): Partial<TextProps> => ({
			style: {
				color: colorByVariant[variant],
			},
		}),
		message: (): Partial<TextProps> => ({}),
	},
	config: ({ variant }: { variant: StatusMessageVariant }) => ({
		icon: iconByVariant[variant],
	}),
} satisfies ComponentTheme
//#endregion Theme

//#region Component
export function StatusMessage({ children, variant }: StatusMessageProps) {
	const { styles, config } =
		useComponentTheme<StatusMessageTheme>('StatusMessage')

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
