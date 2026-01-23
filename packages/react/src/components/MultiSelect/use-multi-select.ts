import { useInput } from '../../hooks/use-input'
import type { MultiSelectState } from './use-multi-select-state'

//#region Types
export type UseMultiSelectProps = {
	/**
	 * When disabled, user input is ignored.
	 *
	 * @default false
	 */
	isDisabled?: boolean

	/**
	 * Select state.
	 */
	state: MultiSelectState
}
//#endregion Types

//#region Hook
export const useMultiSelect = ({
	isDisabled = false,
	state,
}: UseMultiSelectProps) => {
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
		{ isActive: !isDisabled }
	)
}
//#endregion Hook
