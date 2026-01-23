import { type Styles } from '@wolfie/core'
import { type ReactNode } from 'react'
import { type IProps as TextProps, Text } from '../Text'
import { useComponentTheme, type IComponentTheme } from '../../theme/theme'

//#region Types
export type IBadgeProps = {
	/**
	 * Label.
	 */
	children: ReactNode

	/**
	 * Color.
	 *
	 * @default "magenta"
	 */
	color?: Styles['color']
}

type IBadgeTheme = {
	styles: {
		container: (props: { color?: Styles['color'] }) => Partial<TextProps>
		label: () => Partial<TextProps>
	}
}
//#endregion Types

//#region Theme
export const badgeTheme = {
	styles: {
		container: ({
			color,
		}: {
			color?: Styles['color']
		}): Partial<TextProps> => ({
			style: {
				backgroundColor: color,
			},
		}),
		label: (): Partial<TextProps> => ({
			style: {
				color: 'black',
			},
		}),
	},
} satisfies IComponentTheme
//#endregion Theme

//#region Component
export function Badge({ children, color = 'magenta' }: IBadgeProps) {
	const { styles } = useComponentTheme<IBadgeTheme>('Badge')

	let formattedChildren = children

	if (typeof children === 'string') {
		formattedChildren = children.toUpperCase()
	}

	return (
		<Text {...styles.container({ color })}>
			{' '}
			<Text {...styles.label()}>{formattedChildren}</Text>{' '}
		</Text>
	)
}
//#endregion Component
