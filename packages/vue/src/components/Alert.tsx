import { defineComponent, type PropType, type VNode } from 'vue'
import figures from 'figures'
import { Box, type BoxProps } from './Box'
import { Text, type TextProps } from './Text'

//#region Types
export type AlertVariant = 'info' | 'success' | 'error' | 'warning'

export interface AlertProps {
	/**
	 * Message content.
	 */
	children?: VNode | VNode[]

	/**
	 * Variant, which determines the color of the alert.
	 */
	variant: AlertVariant

	/**
	 * Title to show above the message.
	 */
	title?: string
}

export type AlertTheme = {
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

export const alertTheme: AlertTheme = {
	styles: {
		container: ({ variant }): Partial<BoxProps> => ({
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
		icon: ({ variant }): Partial<TextProps> => ({
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
	config({ variant }) {
		return { icon: iconByVariant[variant] }
	},
}
//#endregion Theme

//#region Component
export const Alert = defineComponent({
	name: 'Alert',
	props: {
		variant: {
			type: String as PropType<AlertVariant>,
			required: true,
		},
		title: {
			type: String,
			default: undefined,
		},
	},
	setup(props, { slots }) {
		return () => {
			const { variant, title } = props
			const { styles, config } = alertTheme

			const result = (
				<Box {...styles.container({ variant })}>
					<Box {...styles.iconContainer()}>
						<Text {...styles.icon({ variant })}>
							{config({ variant }).icon}
						</Text>
					</Box>

					<Box {...styles.content()}>
						{title && <Text {...styles.title()}>{title}</Text>}
						<Text {...styles.message()}>{slots.default?.()}</Text>
					</Box>
				</Box>
			)
			return result
		}
	},
})
//#endregion Component

export type { AlertProps as Props, AlertProps as IProps }
