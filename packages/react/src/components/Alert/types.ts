import { type ReactNode } from 'react'
import type { IProps as BoxProps } from '../Box'
import type { IProps as TextProps } from '../Text'

//#region Types
export type IAlertVariant = 'info' | 'success' | 'error' | 'warning'

export type IAlertProps = {
	/**
	 * Message.
	 */
	children: ReactNode

	/**
	 * Variant, which determines the color of the alert.
	 */
	variant: IAlertVariant

	/**
	 * Title to show above the message.
	 */
	title?: string
}

export type IAlertTheme = {
	styles: {
		container: (props: { variant: IAlertVariant }) => Partial<BoxProps>
		iconContainer: () => Partial<BoxProps>
		icon: (props: { variant: IAlertVariant }) => Partial<TextProps>
		content: () => Partial<BoxProps>
		title: () => Partial<TextProps>
		message: () => Partial<TextProps>
	}
	config: (props: { variant: IAlertVariant }) => {
		icon: string
	}
}
//#endregion Types
