import { type JSX, splitProps } from 'solid-js'
import { Text, type TextProps } from './Text'
import { useComponentTheme, type IComponentTheme } from '../theme'
import { useTextInputState } from '../composables/use-text-input-state'
import { useTextInput } from '../composables/use-text-input'

//#region Types
export interface ITextInputProps {
	isDisabled?: boolean
	placeholder?: string
	defaultValue?: string
	suggestions?: string[]
	onChange?: (value: string) => void
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
export function TextInput(props: ITextInputProps): JSX.Element {
	const [local] = splitProps(props, [
		'isDisabled',
		'placeholder',
		'defaultValue',
		'suggestions',
		'onChange',
		'onSubmit',
	])

	const state = useTextInputState({
		defaultValue: local.defaultValue,
		suggestions: local.suggestions,
		onChange: local.onChange,
		onSubmit: local.onSubmit,
	})

	const { inputValue } = useTextInput({
		isDisabled: () => local.isDisabled,
		placeholder: local.placeholder,
		state,
	})

	const theme = useComponentTheme<TextInputTheme>('TextInput')
	const { styles } = theme ?? textInputTheme

	return <Text {...styles.value()}>{inputValue()}</Text>
}
//#endregion Component
