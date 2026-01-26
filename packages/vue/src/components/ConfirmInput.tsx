import {
	defineComponent,
	computed,
	type PropType,
	type DefineComponent,
} from 'vue'
import { Text, type TextProps } from './Text'
import { useInput } from '../composables/use-input'
import { useComponentTheme, type IComponentTheme } from '../theme'

//#region Types
export interface ConfirmInputProps {
	/**
	 * When disabled, user input is ignored.
	 *
	 * @default false
	 */
	isDisabled?: boolean

	/**
	 * Default choice.
	 *
	 * @default "confirm"
	 */
	defaultChoice?: 'confirm' | 'cancel'

	/**
	 * Confirm or cancel when user presses enter, depending on the `defaultChoice` value.
	 * Can be useful to disable when an explicit confirmation is required, such as pressing "Y" key.
	 *
	 * @default true
	 */
	submitOnEnter?: boolean

	/**
	 * Callback to trigger on confirmation.
	 */
	onConfirm: () => void

	/**
	 * Callback to trigger on cancellation.
	 */
	onCancel: () => void
}

export type ConfirmInputTheme = IComponentTheme & {
	styles: {
		input: (props: { isFocused: boolean }) => Partial<TextProps>
	}
}
//#endregion Types

//#region Theme
export const confirmInputTheme: ConfirmInputTheme = {
	styles: {
		input: ({ isFocused }: { isFocused: boolean }): Partial<TextProps> => ({
			style: {
				color: isFocused ? undefined : 'gray',
			},
		}),
	},
}
//#endregion Theme

//#region Component
export const ConfirmInput: DefineComponent<ConfirmInputProps> = defineComponent(
	{
		name: 'ConfirmInput',
		props: {
			isDisabled: {
				type: Boolean,
				default: false,
			},
			defaultChoice: {
				type: String as PropType<'confirm' | 'cancel'>,
				default: 'confirm',
			},
			submitOnEnter: {
				type: Boolean,
				default: true,
			},
			onConfirm: {
				type: Function as PropType<() => void>,
				required: true,
			},
			onCancel: {
				type: Function as PropType<() => void>,
				required: true,
			},
		},
		setup(props) {
			const isActive = computed(() => !props.isDisabled)

			useInput(
				(input: string, key: { return?: boolean }) => {
					if (input.toLowerCase() === 'y') {
						props.onConfirm()
					}

					if (input.toLowerCase() === 'n') {
						props.onCancel()
					}

					if (key.return && props.submitOnEnter) {
						if (props.defaultChoice === 'confirm') {
							props.onConfirm()
						} else {
							props.onCancel()
						}
					}
				},
				{ isActive }
			)

			const theme = useComponentTheme<ConfirmInputTheme>('ConfirmInput')
			const { styles } = theme ?? confirmInputTheme

			return () => (
				<Text {...styles.input({ isFocused: !props.isDisabled })}>
					{props.defaultChoice === 'confirm' ? 'Y/n' : 'y/N'}
				</Text>
			)
		},
	}
)
//#endregion Component

export type { ConfirmInputProps as Props, ConfirmInputProps as IProps }
