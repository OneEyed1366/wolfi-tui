import { type ReactNode } from 'react'
import Box, { type Props as BoxProps } from '../Box'
import Text, { type Props as TextProps } from '../Text'
import { useComponentTheme, type ComponentTheme } from '../../theme/theme'
import figures from 'figures'

//#region Types
export type AlertVariant = 'info' | 'success' | 'error' | 'warning'

export type AlertProps = {
	/**
	 * Message.
	 */
	readonly children: ReactNode

	/**
	 * Variant, which determines the color of the alert.
	 */
	readonly variant: AlertVariant

	/**
	 * Title to show above the message.
	 */
	readonly title?: string
}

type AlertTheme = {
	styles: {
		container: (props: { variant: AlertVariant }) => Partial<BoxProps>
		iconContainer: () => Partial<BoxProps>
		icon: (props: { variant: AlertVariant }) => Partial<TextProps>
		content: () => Partial<BoxProps>
		title: () => Partial<TextProps>
		message: () => Partial<TextProps>
	}
	config: (props: { variant: AlertVariant }) => {
		icon: string
	}
}
//#endregion Types

//#region Theme
const colorByVariant: Record<AlertVariant, string> = {
	info: 'blue',
	success: 'green',
	error: 'red',
	warning: 'yellow',
}

const iconByVariant: Record<AlertVariant, string> = {
	info: figures.info,
	success: figures.tick,
	error: figures.cross,
	warning: figures.warning,
}

export const alertTheme = {
	styles: {
		container: ({ variant }: { variant: AlertVariant }): Partial<BoxProps> => ({
			flexGrow: 1,
			borderStyle: 'round',
			borderColor: colorByVariant[variant],
			gap: 1,
			paddingX: 1,
		}),
		iconContainer: (): Partial<BoxProps> => ({
			flexShrink: 0,
		}),
		icon: ({ variant }: { variant: AlertVariant }): Partial<TextProps> => ({
			color: colorByVariant[variant],
		}),
		content: (): Partial<BoxProps> => ({
			flexShrink: 1,
			flexGrow: 1,
			minWidth: 0,
			flexDirection: 'column',
			gap: 1,
		}),
		title: (): Partial<TextProps> => ({
			bold: true,
		}),
		message: (): Partial<TextProps> => ({}),
	},
	config({ variant }: { variant: AlertVariant }) {
		return { icon: iconByVariant[variant] }
	},
} satisfies ComponentTheme
//#endregion Theme

//#region Component
export function Alert({ children, variant, title }: AlertProps) {
	const { styles, config } = useComponentTheme<AlertTheme>('Alert')

	return (
		<Box {...styles.container({ variant })}>
			<Box {...styles.iconContainer()}>
				<Text {...styles.icon({ variant })}>{config({ variant }).icon}</Text>
			</Box>

			<Box {...styles.content()}>
				{title && <Text {...styles.title()}>{title}</Text>}
				<Text {...styles.message()}>{children}</Text>
			</Box>
		</Box>
	)
}
//#endregion Component
