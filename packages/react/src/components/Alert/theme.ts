import figures from 'figures'
import type { IProps as BoxProps } from '../Box/types'
import type { IProps as TextProps } from '../Text/types'
import type { IAlertVariant } from './types'

const colorByVariant: Record<IAlertVariant, string> = {
	info: 'blue',
	success: 'green',
	error: 'red',
	warning: 'yellow',
}

const iconByVariant: Record<IAlertVariant, string> = {
	info: figures.info,
	success: figures.tick,
	error: figures.cross,
	warning: figures.warning,
}

export const alertTheme = {
	styles: {
		container: ({
			variant,
		}: {
			variant: IAlertVariant
		}): Partial<BoxProps> => ({
			style: {
				flexGrow: 1,
				borderStyle: 'round',
				borderColor: colorByVariant[variant],
				gap: 1,
				paddingX: 1,
			},
		}),
		iconContainer: (): Partial<BoxProps> => ({
			style: {
				flexShrink: 0,
			},
		}),
		icon: ({ variant }: { variant: IAlertVariant }): Partial<TextProps> => ({
			style: {
				color: colorByVariant[variant],
			},
		}),
		content: (): Partial<BoxProps> => ({
			style: {
				flexShrink: 1,
				flexGrow: 1,
				minWidth: 0,
				flexDirection: 'column',
				gap: 1,
			},
		}),
		title: (): Partial<TextProps> => ({
			style: {
				fontWeight: 'bold',
			},
		}),
		message: (): Partial<TextProps> => ({}),
	},
	config({ variant }: { variant: IAlertVariant }) {
		return { icon: iconByVariant[variant] }
	},
}
