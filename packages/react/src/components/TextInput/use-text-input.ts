import { useMemo } from 'react'
import {
	renderTextInputValue,
	renderTextInputPlaceholder,
} from '@wolfie/shared'
import { useInput } from '../../hooks/use-input'
import type { TextInputState } from './use-text-input-state'

//#region Types
export type UseTextInputProps = {
	/**
	 * When disabled, user input is ignored.
	 *
	 * @default false
	 */
	isDisabled?: boolean

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
	inputValue: string
}
//#endregion Types

//#region Hook
export const useTextInput = ({
	isDisabled = false,
	state,
	placeholder = '',
}: UseTextInputProps): UseTextInputResult => {
	const renderedPlaceholder = useMemo(
		() => renderTextInputPlaceholder({ placeholder, isDisabled }),
		[isDisabled, placeholder]
	)

	const renderedValue = useMemo(
		() =>
			renderTextInputValue({
				value: state.value,
				cursorOffset: state.cursorOffset,
				suggestion: state.suggestion,
				isDisabled,
			}),
		[isDisabled, state.value, state.cursorOffset, state.suggestion]
	)

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

	return {
		inputValue: state.value.length > 0 ? renderedValue : renderedPlaceholder,
	}
}
//#endregion Hook
