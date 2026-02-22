import { type JSX, splitProps } from 'solid-js'
import { Text, type TextProps } from './Text'
import { useComponentTheme, type IComponentTheme } from '../theme'
import { usePasswordInputState } from '../composables/use-password-input-state'
import { usePasswordInput } from '../composables/use-password-input'

//#region Types
export interface IPasswordInputProps {
	isDisabled?: boolean
	placeholder?: string
	onChange?: (value: string) => void
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
export function PasswordInput(props: IPasswordInputProps): JSX.Element {
	const [local] = splitProps(props, [
		'isDisabled',
		'placeholder',
		'onChange',
		'onSubmit',
	])

	const state = usePasswordInputState({
		onChange: local.onChange,
		onSubmit: local.onSubmit,
	})

	const { inputValue } = usePasswordInput({
		isDisabled: () => local.isDisabled,
		placeholder: local.placeholder,
		state,
	})

	const theme = useComponentTheme<PasswordInputTheme>('PasswordInput')
	const { styles } = theme ?? passwordInputTheme

	return <Text {...styles.value()}>{inputValue()}</Text>
}
//#endregion Component
