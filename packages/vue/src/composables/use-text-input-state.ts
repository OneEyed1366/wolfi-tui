import { ref, computed, watch, type Ref, type ComputedRef } from 'vue'

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

export type TextInputState = {
	/**
	 * Previous value.
	 */
	previousValue: Ref<string>

	/**
	 * Current input value.
	 */
	value: Ref<string>

	/**
	 * Current cursor position.
	 */
	cursorOffset: Ref<number>

	/**
	 * Suggested auto completion.
	 */
	suggestion: ComputedRef<string | undefined>

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

//#region Composable
export const useTextInputState = ({
	defaultValue = '',
	suggestions,
	onChange,
	onSubmit,
}: UseTextInputStateProps = {}): TextInputState => {
	const previousValue = ref(defaultValue)
	const value = ref(defaultValue)
	const cursorOffset = ref(defaultValue.length)

	const suggestion = computed(() => {
		if (value.value.length === 0) {
			return undefined
		}

		return suggestions
			?.find((s) => s.startsWith(value.value))
			?.replace(value.value, '')
	})

	const moveCursorLeft = () => {
		cursorOffset.value = Math.max(0, cursorOffset.value - 1)
	}

	const moveCursorRight = () => {
		cursorOffset.value = Math.min(value.value.length, cursorOffset.value + 1)
	}

	const insert = (text: string) => {
		previousValue.value = value.value
		value.value =
			value.value.slice(0, cursorOffset.value) +
			text +
			value.value.slice(cursorOffset.value)
		cursorOffset.value = cursorOffset.value + text.length
	}

	const deleteCharacter = () => {
		const newCursorOffset = Math.max(0, cursorOffset.value - 1)
		previousValue.value = value.value
		value.value =
			value.value.slice(0, newCursorOffset) +
			value.value.slice(newCursorOffset + 1)
		cursorOffset.value = newCursorOffset
	}

	const submit = () => {
		if (suggestion.value) {
			insert(suggestion.value)
			onSubmit?.(value.value)
			return
		}

		onSubmit?.(value.value)
	}

	watch(value, (newValue, oldValue) => {
		if (newValue !== oldValue) {
			onChange?.(newValue)
		}
	})

	return {
		previousValue,
		value,
		cursorOffset,
		suggestion,
		moveCursorLeft,
		moveCursorRight,
		insert,
		delete: deleteCharacter,
		submit,
	}
}
//#endregion Composable
