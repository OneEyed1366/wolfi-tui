import { type Styles } from '@wolfie/core'
import { type ReactNode } from 'react'
import type { IProps as TextProps } from '../Text'

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
