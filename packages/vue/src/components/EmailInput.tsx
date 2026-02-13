import { defineComponent, type PropType, type DefineComponent } from 'vue'
import { Text, type TextProps } from './Text'
import { useComponentTheme, type IComponentTheme } from '../theme'
import { useEmailInputState } from '../composables/use-email-input-state'
import { useEmailInput } from '../composables/use-email-input'

//#region Types
export interface EmailInputProps {
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
	 * Domains of email providers to autocomplete.
	 *
	 * @default ["aol.com", "gmail.com", "yahoo.com", "hotmail.com", "live.com", "outlook.com", "icloud.com", "hey.com"]
	 */
	domains?: string[]

	/**
	 * Callback when input value changes.
	 */
	onChange?: (value: string) => void

	/**
	 * Callback when enter is pressed. First argument is input value.
	 */
	onSubmit?: (value: string) => void
}

export type EmailInputTheme = IComponentTheme & {
	styles: {
		value: () => Partial<TextProps>
	}
}
//#endregion Types

//#region Theme
export const emailInputTheme: EmailInputTheme = {
	styles: {
		value: (): Partial<TextProps> => ({}),
	},
}
//#endregion Theme

//#region Component
export const EmailInput: DefineComponent<EmailInputProps> = defineComponent({
	name: 'EmailInput',
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
		domains: {
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
		const state = useEmailInputState({
			defaultValue: props.defaultValue,
			domains: props.domains,
			onChange: props.onChange,
			onSubmit: props.onSubmit,
		})

		const { inputValue } = useEmailInput({
			isDisabled: props.isDisabled,
			placeholder: props.placeholder,
			state,
		})

		const theme = useComponentTheme<EmailInputTheme>('EmailInput')
		const { styles } = theme ?? emailInputTheme

		return () => {
			return <Text {...styles.value()}>{inputValue.value}</Text>
		}
	},
})
//#endregion Component

export type { EmailInputProps as Props, EmailInputProps as IProps }
