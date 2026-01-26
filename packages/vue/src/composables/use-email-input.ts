import { computed, type ComputedRef } from 'vue'
import chalk from 'chalk'
import { useInput } from './use-input'
import type { EmailInputState } from './use-email-input-state'

//#region Types
export type UseEmailInputProps = {
	/**
	 * When disabled, user input is ignored.
	 *
	 * @default false
	 */
	isDisabled?: boolean

	/**
	 * Text input state.
	 */
	state: EmailInputState

	/**
	 * Text to display when `value` is empty.
	 *
	 * @default ""
	 */
	placeholder?: string
}

export type UseEmailInputResult = {
	/**
	 * Value to render inside the input.
	 */
	inputValue: ComputedRef<string>
}
//#endregion Types

//#region Composable
const cursor = chalk.inverse(' ')

export const useEmailInput = ({
	isDisabled = false,
	state,
	placeholder = '',
}: UseEmailInputProps): UseEmailInputResult => {
	const renderedPlaceholder = computed(() => {
		if (isDisabled) {
			return placeholder ? chalk.dim(placeholder) : ''
		}

		return placeholder && placeholder.length > 0
			? chalk.inverse(placeholder[0]!) + chalk.dim(placeholder.slice(1))
			: cursor
	})

	const renderedValue = computed(() => {
		if (isDisabled) {
			return state.value.value
		}

		let index = 0
		let result = state.value.value.length > 0 ? '' : cursor

		for (const char of state.value.value) {
			result += index === state.cursorOffset.value ? chalk.inverse(char) : char
			index++
		}

		if (state.suggestion.value) {
			if (state.cursorOffset.value === state.value.value.length) {
				result +=
					chalk.inverse(state.suggestion.value[0]!) +
					chalk.dim(state.suggestion.value.slice(1))
			} else {
				result += chalk.dim(state.suggestion.value)
			}

			return result
		}

		if (
			state.value.value.length > 0 &&
			state.cursorOffset.value === state.value.value.length
		) {
			result += cursor
		}

		return result
	})

	useInput(
		(input, key) => {
			if (
				key.upArrow ||
				key.downArrow ||
				(key.ctrl && input === 'c') ||
				key.tab ||
				(key.shift && key.tab)
			) {
				return
			}

			if (key.return) {
				state.submit()
				return
			}

			if (key.leftArrow) {
				state.moveCursorLeft()
			} else if (key.rightArrow) {
				state.moveCursorRight()
			} else if (key.backspace || key.delete) {
				state.delete()
			} else {
				state.insert(input)
			}
		},
		{ isActive: !isDisabled }
	)

	const inputValue = computed(() =>
		state.value.value.length > 0
			? renderedValue.value
			: renderedPlaceholder.value
	)

	return {
		inputValue,
	}
}
//#endregion Composable
