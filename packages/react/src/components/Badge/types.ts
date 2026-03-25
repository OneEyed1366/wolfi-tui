import { type Styles } from '@wolf-tui/core'
import { type ReactNode } from 'react'

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
//#endregion Types
