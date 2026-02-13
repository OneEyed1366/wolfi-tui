import { defineComponent, type PropType, type DefineComponent } from 'vue'
import { Text, type TextProps } from './Text'
import { useComponentTheme, type IComponentTheme } from '../theme'
import { useTextInputState } from '../composables/use-text-input-state'
import { useTextInput } from '../composables/use-text-input'

//#region Types
export interface TextInputProps {
	/**
	 * When disabled, user input is ignored.
	 *
	 * @default false
	 */
	isDisabled?: boolean

	/**
	 * Text to display when input is empty.
	 */
	placeholder?: string

	/**
	 * Default input value.
	 */
	defaultValue?: string

	/**
	 * Suggestions to autocomplete the input value.
	 */
	suggestions?: string[]

	/**
	 * Callback when input value changes.
	 */
	onChange?: (value: string) => void

	/**
	 * Callback when enter is pressed. First argument is input value.
	 */
	onSubmit?: (value: string) => void
}

export type TextInputTheme = IComponentTheme & {
	styles: {
		value: () => Partial<TextProps>
	}
}
//#endregion Types

//#region Theme
export const textInputTheme: TextInputTheme = {
	styles: {
		value: (): Partial<TextProps> => ({}),
	},
}
//#endregion Theme

//#region Component
export const TextInput: DefineComponent<TextInputProps> = defineComponent({
	name: 'TextInput',
	props: {
		isDisabled: {
			type: Boolean,
			default: false,
		},
		placeholder: {
			type: String,
			default: '',
		},
		defaultValue: {
			type: String,
			default: undefined,
		},
		suggestions: {
			type: Array as PropType<string[]>,
			default: undefined,
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
		const state = useTextInputState({
			defaultValue: props.defaultValue,
			suggestions: props.suggestions,
			onChange: props.onChange,
			onSubmit: props.onSubmit,
		})

		const { inputValue } = useTextInput({
			isDisabled: props.isDisabled,
			placeholder: props.placeholder,
			state,
		})

		const theme = useComponentTheme<TextInputTheme>('TextInput')
		const { styles } = theme ?? textInputTheme

		return () => {
			return <Text {...styles.value()}>{inputValue.value}</Text>
		}
	},
})
//#endregion Component

export type { TextInputProps as Props, TextInputProps as IProps }
