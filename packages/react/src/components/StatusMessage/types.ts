import { type ReactNode } from 'react'
import type { IProps as BoxProps } from '../Box'
import type { IProps as TextProps } from '../Text'

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
