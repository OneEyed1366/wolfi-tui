import { type JSX, splitProps } from 'solid-js'
import { Text, type TextProps } from './Text'
import { useComponentTheme, type IComponentTheme } from '../theme'
import { useEmailInputState } from '../composables/use-email-input-state'
import { useEmailInput } from '../composables/use-email-input'

//#region Types
export interface IEmailInputProps {
	isDisabled?: boolean
	placeholder?: string
	defaultValue?: string
	domains?: string[]
	onChange?: (value: string) => void
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
export function EmailInput(props: IEmailInputProps): JSX.Element {
	const [local] = splitProps(props, [
		'isDisabled',
		'placeholder',
		'defaultValue',
		'domains',
		'onChange',
		'onSubmit',
	])

	const state = useEmailInputState({
		defaultValue: local.defaultValue,
		domains: local.domains,
		onChange: local.onChange,
		onSubmit: local.onSubmit,
	})

	const { inputValue } = useEmailInput({
		isDisabled: () => local.isDisabled,
		placeholder: local.placeholder,
		state,
	})

	const theme = useComponentTheme<EmailInputTheme>('EmailInput')
	const { styles } = theme ?? emailInputTheme

	return <Text {...styles.value()}>{inputValue()}</Text>
}
//#endregion Component
