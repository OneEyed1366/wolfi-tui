import { createMemo } from 'solid-js'
import { useInput } from './use-input'
import type { SelectState } from './use-select-state'

//#region Types
export type UseSelectProps = {
	/**
	 * When disabled, user input is ignored.
	 *
	 * @default false
	 */
	isDisabled?: () => boolean | undefined

	/**
	 * Select state.
	 */
	state: SelectState
}
//#endregion Types

//#region Composable
export const useSelect = ({ isDisabled, state }: UseSelectProps) => {
	// Create memo for reactive isActive
	const isActive = createMemo(() => !(isDisabled?.() ?? false))

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
