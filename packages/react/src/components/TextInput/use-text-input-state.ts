import { useReducer, useCallback, useEffect, useMemo } from 'react'
import {
	textInputReducer,
	createInitialTextInputState,
	findSuggestion,
	type TextInputState as SharedTextInputState,
} from '@wolfie/shared'

//#region Hook Types
export type UseTextInputStateProps = {
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

export type TextInputState = SharedTextInputState & {
	/**
	 * Suggested auto completion.
	 */
	suggestion: string | undefined

	/**
	 * Move cursor to the left.
	 */
	moveCursorLeft: () => void

	/**
	 * Move cursor to the right.
	 */
	moveCursorRight: () => void

	/**
	 * Insert text.
	 */
	insert: (text: string) => void

	/**
	 * Delete character.
	 */
	delete: () => void

	/**
	 * Submit input value.
	 */
	submit: () => void
}
//#endregion Hook Types

//#region Hook
export const useTextInputState = ({
	defaultValue = '',
	suggestions,
	onChange,
	onSubmit,
}: UseTextInputStateProps): TextInputState => {
	const [state, dispatch] = useReducer(
		textInputReducer,
		defaultValue,
		createInitialTextInputState
	)

	const suggestion = useMemo(
		() => findSuggestion(state.value, suggestions),
		[state.value, suggestions]
	)

	const moveCursorLeft = useCallback(() => {
		dispatch({
			type: 'move-cursor-left',
		})
	}, [])

	const moveCursorRight = useCallback(() => {
		dispatch({
			type: 'move-cursor-right',
		})
	}, [])

	const insert = useCallback((text: string) => {
		dispatch({
			type: 'insert',
			text,
		})
	}, [])

	const deleteCharacter = useCallback(() => {
		dispatch({
			type: 'delete',
		})
	}, [])

	const submit = useCallback(() => {
		if (suggestion) {
			insert(suggestion)
			onSubmit?.(state.value + suggestion)
			return
		}

		onSubmit?.(state.value)
	}, [state.value, suggestion, insert, onSubmit])

	useEffect(() => {
		if (state.value !== state.previousValue) {
			onChange?.(state.value)
		}
	}, [state.previousValue, state.value, onChange])

	return {
		...state,
		suggestion,
		moveCursorLeft,
		moveCursorRight,
		insert,
		delete: deleteCharacter,
		submit,
	}
}
//#endregion Hook
