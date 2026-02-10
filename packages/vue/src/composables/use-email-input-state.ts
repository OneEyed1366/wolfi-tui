import { ref, computed, watch, type Ref, type ComputedRef } from 'vue'
import { DEFAULT_DOMAINS } from '@wolfie/shared'

//#region Hook Types
export type UseEmailInputStateProps = {
	/**
	 * Initial value to display in a text input.
	 */
	defaultValue?: string

	/**
	 * Domains of email providers to auto complete.
	 *
	 * @default ["aol.com", "gmail.com", "yahoo.com", "hotmail.com", "live.com", "outlook.com", "icloud.com", "hey.com"]
	 */
	domains?: string[]

	/**
	 * Callback when value updates.
	 */
	onChange?: (value: string) => void

	/**
	 * Callback when `Enter` is pressed. First argument is a value of the input.
	 */
	onSubmit?: (value: string) => void
}

export type EmailInputState = {
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
export const useEmailInputState = ({
	defaultValue = '',
	domains = DEFAULT_DOMAINS,
	onChange,
	onSubmit,
}: UseEmailInputStateProps = {}): EmailInputState => {
	const previousValue = ref(defaultValue)
	const value = ref(defaultValue)
	const cursorOffset = ref(defaultValue.length)

	const suggestion = computed(() => {
		if (value.value.length === 0 || !value.value.includes('@')) {
			return undefined
		}

		const atIndex = value.value.indexOf('@')
		const enteredDomain = value.value.slice(atIndex + 1)

		return domains
			?.find((domain) => domain.startsWith(enteredDomain))
			?.replace(enteredDomain, '')
	})

	const moveCursorLeft = () => {
		cursorOffset.value = Math.max(0, cursorOffset.value - 1)
	}

	const moveCursorRight = () => {
		cursorOffset.value = Math.min(value.value.length, cursorOffset.value + 1)
	}

	const insert = (text: string) => {
		// Prevent multiple @ symbols
		if (value.value.includes('@') && text.includes('@')) {
			return
		}

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
