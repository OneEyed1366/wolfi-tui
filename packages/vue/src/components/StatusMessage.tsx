import { defineComponent, type PropType, type VNode } from 'vue'
import figures from 'figures'
import { Box, type BoxProps } from './Box'
import { Text, type TextProps } from './Text'

//#region Types
export type StatusMessageVariant = 'info' | 'success' | 'error' | 'warning'

export interface StatusMessageProps {
	/**
	 * Message content.
	 */
	children?: VNode | VNode[]

	/**
	 * Variant, which determines the color used in the status message.
	 */
	variant: StatusMessageVariant
}

export type StatusMessageTheme = {
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

export const statusMessageTheme: StatusMessageTheme = {
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
		icon: ({ variant }): Partial<TextProps> => ({
			style: {
				color: colorByVariant[variant],
			},
		}),
		message: (): Partial<TextProps> => ({}),
	},
	config: ({ variant }) => ({
		icon: iconByVariant[variant],
	}),
}
//#endregion Theme

//#region Component
export const StatusMessage = defineComponent({
	name: 'StatusMessage',
	props: {
		variant: {
			type: String as PropType<StatusMessageVariant>,
			required: true,
		},
	},
	setup(props, { slots }) {
		return () => {
			const { variant } = props
			const { styles, config } = statusMessageTheme

			return (
				<Box {...styles.container()}>
					<Box {...styles.iconContainer()}>
						<Text {...styles.icon({ variant })}>
							{config({ variant }).icon}
						</Text>
					</Box>

					<Text {...styles.message()}>{slots.default?.()}</Text>
				</Box>
			)
		}
	},
})
//#endregion Component

export type { StatusMessageProps as Props, StatusMessageProps as IProps }
