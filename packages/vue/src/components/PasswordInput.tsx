import { defineComponent, type PropType, type DefineComponent } from 'vue'
import { Text, type TextProps } from './Text'
import { useComponentTheme, type IComponentTheme } from '../theme'
import { usePasswordInputState } from '../composables/use-password-input-state'
import { usePasswordInput } from '../composables/use-password-input'

//#region Types
export interface PasswordInputProps {
	/**
	 * When disabled, user input is ignored.
	 *
	 * @default false
	 */
	isDisabled?: boolean

	/**
	 * Text to display when `value` is empty.
	 */
	placeholder?: string

	/**
	 * Callback when value updates.
	 */
	onChange?: (value: string) => void

	/**
	 * Callback when `Enter` is pressed. First argument is a value of the input.
	 */
	onSubmit?: (value: string) => void
}

export type PasswordInputTheme = IComponentTheme & {
	styles: {
		value: () => Partial<TextProps>
	}
}
//#endregion Types

//#region Theme
export const passwordInputTheme: PasswordInputTheme = {
	styles: {
		value: (): Partial<TextProps> => ({}),
	},
}
//#endregion Theme

//#region Component
export const PasswordInput: DefineComponent<PasswordInputProps> =
	defineComponent({
		name: 'PasswordInput',
		props: {
			isDisabled: {
				type: Boolean,
				default: false,
			},
			placeholder: {
				type: String,
				default: '',
			},
			onChange: {
				type: Function as PropType<(value: string) => void>,
				default: undefined,
			},
			onSubmit: {
				type: Function as PropType<(value: string) => void>,
				default: undefined,
			},
		},
		setup(props) {
			const state = usePasswordInputState({
				onChange: props.onChange,
				onSubmit: props.onSubmit,
			})

			const { inputValue } = usePasswordInput({
				isDisabled: props.isDisabled,
				placeholder: props.placeholder,
				state,
			})

			const theme = useComponentTheme<PasswordInputTheme>('PasswordInput')
			const { styles } = theme ?? passwordInputTheme

			return () => <Text {...styles.value()}>{inputValue.value}</Text>
		},
	})
//#endregion Component

export type { PasswordInputProps as Props, PasswordInputProps as IProps }
