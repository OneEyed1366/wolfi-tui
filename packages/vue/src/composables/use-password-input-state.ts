import { ref, watch, type Ref } from 'vue'

//#region Hook Types
export type UsePasswordInputStateProps = {
	/**
	 * Callback when value updates.
	 */
	onChange?: (value: string) => void

	/**
	 * Callback when `Enter` is pressed. First argument is a value of the input.
	 */
	onSubmit?: (value: string) => void
}

export type PasswordInputState = {
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
export const usePasswordInputState = ({
	onChange,
	onSubmit,
}: UsePasswordInputStateProps = {}): PasswordInputState => {
	const previousValue = ref('')
	const value = ref('')
	const cursorOffset = ref(0)

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
		moveCursorLeft,
		moveCursorRight,
		insert,
		delete: deleteCharacter,
		submit,
	}
}
//#endregion Composable
