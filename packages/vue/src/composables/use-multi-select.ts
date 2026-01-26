import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useInput } from './use-input'
import type { MultiSelectState } from './use-multi-select-state'

//#region Types
export type UseMultiSelectProps = {
	/**
	 * When disabled, user input is ignored.
	 * Can be a boolean or a ref for reactivity.
	 *
	 * @default false
	 */
	isDisabled?: MaybeRefOrGetter<boolean | undefined>

	/**
	 * Select state.
	 */
	state: MultiSelectState
}
//#endregion Types

//#region Composable
export const useMultiSelect = ({
	isDisabled = false,
	state,
}: UseMultiSelectProps) => {
	// Create computed for reactive isActive
	const isActive = computed(() => !toValue(isDisabled))

	useInput(
		(input, key) => {
			if (key.downArrow) {
				state.focusNextOption()
			}

			if (key.upArrow) {
				state.focusPreviousOption()
			}

			if (input === ' ') {
				state.toggleFocusedOption()
			}

			if (key.return) {
				state.submit()
			}
		},
		{ isActive }
	)
}
//#endregion Composable
