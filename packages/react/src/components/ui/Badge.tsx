import { type Styles } from '@wolfie/core'
import { type ReactNode } from 'react'
import Text, { type Props as TextProps } from '../Text'
import { useComponentTheme, type ComponentTheme } from '../../theme/theme'

//#region Types
export type BadgeProps = {
	/**
	 * Label.
	 */
	readonly children: ReactNode

	/**
	 * Color.
	 *
	 * @default "magenta"
	 */
	readonly color?: Styles['color']
}

type BadgeTheme = {
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
} satisfies ComponentTheme
//#endregion Theme

//#region Component
export function Badge({ children, color = 'magenta' }: BadgeProps) {
	const { styles } = useComponentTheme<BadgeTheme>('Badge')

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
