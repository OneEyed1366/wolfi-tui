import { computed, toValue, type ComputedRef, type MaybeRefOrGetter } from 'vue'
import chalk from 'chalk'
import { useInput } from './use-input'
import type { TextInputState } from './use-text-input-state'

//#region Types
export type UseTextInputProps = {
	/**
	 * When disabled, user input is ignored.
	 *
	 * @default false
	 */
	isDisabled?: MaybeRefOrGetter<boolean | undefined>

	/**
	 * Text input state.
	 */
	state: TextInputState

	/**
	 * Text to display when input is empty.
	 */
	placeholder?: string
}

export type UseTextInputResult = {
	/**
	 * Input value.
	 */
	inputValue: ComputedRef<string>
}
//#endregion Types

//#region Composable
const cursor = chalk.inverse(' ')

export const useTextInput = ({
	isDisabled = false,
	state,
	placeholder = '',
}: UseTextInputProps): UseTextInputResult => {
	const isActive = computed(() => !toValue(isDisabled))

	const renderedPlaceholder = computed(() => {
		if (toValue(isDisabled)) {
			return placeholder ? chalk.dim(placeholder) : ''
		}

		return placeholder && placeholder.length > 0
			? chalk.inverse(placeholder[0]!) + chalk.dim(placeholder.slice(1))
			: cursor
	})

	const renderedValue = computed(() => {
		if (toValue(isDisabled)) {
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
		{ isActive }
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
