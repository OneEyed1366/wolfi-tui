import { createMemo } from 'solid-js'
import { useInput } from './use-input'
import type { MultiSelectState } from './use-multi-select-state'

//#region Types
export type UseMultiSelectProps = {
	/**
	 * When disabled, user input is ignored.
	 *
	 * @default false
	 */
	isDisabled?: () => boolean | undefined

	/**
	 * Multi-select state.
	 */
	state: MultiSelectState
}
//#endregion Types

//#region Composable
export const useMultiSelect = ({ isDisabled, state }: UseMultiSelectProps) => {
	// Create memo for reactive isActive
	const isActive = createMemo(() => !(isDisabled?.() ?? false))

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
