import { Text } from '../Text'
import { useComponentTheme } from '../../theme/theme'
import { useTextInputState } from './use-text-input-state'
import { useTextInput } from './use-text-input'
import type { Theme } from './theme'

export type ITextInputProps = {
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

export function TextInput({
	isDisabled = false,
	defaultValue,
	placeholder = '',
	suggestions,
	onChange,
	onSubmit,
}: ITextInputProps) {
	const state = useTextInputState({
		defaultValue,
		suggestions,
		onChange,
		onSubmit,
	})

	const { inputValue } = useTextInput({
		isDisabled,
		placeholder,
		state,
	})

	const { styles } = useComponentTheme<Theme>('TextInput')

	return <Text {...styles.value()}>{inputValue}</Text>
}
