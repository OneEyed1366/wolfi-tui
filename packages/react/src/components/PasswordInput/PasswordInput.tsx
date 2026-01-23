import { Text } from '../Text'
import { useComponentTheme } from '../../theme/theme'
import { usePasswordInputState } from './use-password-input-state'
import { usePasswordInput } from './use-password-input'
import type { Theme } from './theme'

export type IPasswordInputProps = {
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

export function PasswordInput({
	isDisabled = false,
	placeholder = '',
	onChange,
	onSubmit,
}: IPasswordInputProps) {
	const state = usePasswordInputState({
		onChange,
		onSubmit,
	})

	const { inputValue } = usePasswordInput({
		isDisabled,
		placeholder,
		state,
	})

	const { styles } = useComponentTheme<Theme>('PasswordInput')

	return <Text {...styles.value()}>{inputValue}</Text>
}
