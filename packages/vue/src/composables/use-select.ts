import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useInput } from './use-input'
import type { SelectState } from './use-select-state'

//#region Types
export type UseSelectProps = {
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
	state: SelectState
}
//#endregion Types

//#region Composable
export const useSelect = ({ isDisabled = false, state }: UseSelectProps) => {
	// Create computed for reactive isActive
	const isActive = computed(() => !toValue(isDisabled))

	useInput(
		(_input, key) => {
			if (key.downArrow) {
				state.focusNextOption()
			}

			if (key.upArrow) {
				state.focusPreviousOption()
			}

			if (key.return) {
				state.selectFocusedOption()
			}
		},
		{ isActive }
	)
}
//#endregion Composable
